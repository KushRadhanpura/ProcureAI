/**
 * @file inventoryController.js
 * @description ProcureAI — Inventory Operations with AI Agent Fail-Safe Pipeline
 *
 * Core Responsibilities:
 *  1. GET /api/inventory        → Return all inventory items for authenticated company
 *  2. POST /api/inventory/consume → Record stock consumption event
 *     ├─ Validate item exists and stock is sufficient
 *     ├─ Deduct consumed quantity from currentStock
 *     ├─ If stock breaches threshold → trigger AI replenishment pipeline
 *     │   ├─ [SUCCESS PATH] AI returns aiDraft → create Draft PO with AI text
 *     │   └─ [FAIL-SAFE PATH] AI unavailable  → create Manual_Review_Required PO
 *     │       ├─ Log failure with full item state context
 *     │       └─ Store inventorySnapshot for operator audit review
 *     └─ Return updated item to client — pipeline state never breaks
 *
 * AI Fail-Safe Design Principle:
 *  The aiService.triggerAIAgent() call is wrapped in a conditional that checks
 *  the returned { fallback: true } flag. If the FastAPI microservice is down,
 *  we NEVER drop the restock request — instead, we create a PO with
 *  status: 'Manual_Review_Required' so operations teams can action it manually.
 *
 * This guarantees: No stock crisis is silently dropped due to an AI service outage.
 */

const mongoose = require('mongoose');
const Inventory = require('../models/inventory');
const Vendor = require('../models/vendor');
const PurchaseOrder = require('../models/purchaseOrder');
const { triggerAIAgent } = require('../services/aiService');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * getInventory — Fetch all inventory items
 *
 * GET /api/inventory
 * Access: All authenticated roles (Owner, Manager, Validator)
 *
 * Returns all inventory items sorted by itemName ascending.
 * Future enhancement: filter by companyId for multi-tenant isolation.
 */
const getInventory = asyncHandler(async (req, res) => {
  const inventory = await Inventory.find({}).sort({ itemName: 1 });

  res.status(200).json({
    success: true,
    count: inventory.length,
    data: inventory,
  });
});

/**
 * consumeInventory — Record a stock consumption event
 *
 * POST /api/inventory/consume
 * Access: Owner, Manager only (Validators are read-only)
 * Body: { itemId: string, quantityUsed: number }
 *
 * Pipeline Flow:
 *  1. Validate itemId format (must be valid MongoDB ObjectId)
 *  2. Validate quantityUsed (must be positive finite number)
 *  3. Find inventory item — 404 if not found
 *  4. Check sufficient stock — 400 if insufficent
 *  5. Deduct quantity and persist to MongoDB
 *  6. If stock <= threshold:
 *     a. Call AI agent → check for fallback flag
 *     b. SUCCESS: create Draft PO with AI-generated negotiation text
 *     c. FAIL-SAFE: create Manual_Review_Required PO with audit snapshot
 *  7. Return success response with updated item
 */
const consumeInventory = asyncHandler(async (req, res) => {
  const { itemId, quantityUsed } = req.body;

  // ── Step 1: Validate itemId is a parseable MongoDB ObjectId ─────────────
  if (!itemId || !mongoose.Types.ObjectId.isValid(itemId)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid itemId format. Must be a valid MongoDB ObjectId.',
      code: 'INVALID_ITEM_ID',
    });
  }

  // ── Step 2: Validate quantityUsed is a positive finite number ────────────
  const qty = Number(quantityUsed);
  if (!Number.isFinite(qty) || qty <= 0) {
    return res.status(400).json({
      success: false,
      message: 'quantityUsed must be a positive finite number greater than zero.',
      code: 'INVALID_QUANTITY',
    });
  }

  // ── Step 3: Fetch inventory item from database ───────────────────────────
  const item = await Inventory.findById(itemId);
  if (!item) {
    return res.status(404).json({
      success: false,
      message: `Inventory item with ID '${itemId}' was not found.`,
      code: 'ITEM_NOT_FOUND',
    });
  }

  // ── Step 4: Check that sufficient stock exists for this consumption ───────
  if (item.currentStock < qty) {
    return res.status(400).json({
      success: false,
      message: `Insufficient stock. Requested: ${qty}, Available: ${item.currentStock}`,
      code: 'INSUFFICIENT_STOCK',
      currentStock: item.currentStock,
      requested: qty,
    });
  }

  // ── Step 5: Deduct consumed quantity and persist ─────────────────────────
  item.currentStock -= qty;
  await item.save();

  console.log(
    `[INVENTORY] Consumption recorded: ${item.itemName} | Used: ${qty} | ` +
    `Remaining: ${item.currentStock} | Threshold: ${item.thresholdLimit}`
  );

  // ── Step 6: Threshold breach check → trigger AI replenishment pipeline ───
  if (item.currentStock <= item.thresholdLimit) {
    console.log(
      `[INVENTORY] ⚠ THRESHOLD BREACH: ${item.itemName} (${item.currentStock}/${item.thresholdLimit}). ` +
      `Initiating AI replenishment pipeline...`
    );

    // Call AI microservice — always returns structured object (never throws)
    const aiRes = await triggerAIAgent(item);

    // Resolve best-match vendor for this company's purchase orders
    let vendor = await Vendor.findOne({ companyId: req.user.companyId });
    if (!vendor) {
      // Fallback: use any available vendor if no company-specific vendor exists
      vendor = await Vendor.findOne({});
    }

    if (!vendor) {
      // No vendor in system — log and skip PO creation
      console.warn(`[INVENTORY] No vendor found for PO creation. Item: ${item.itemName}`);
    } else {

      // ── Branch A: AI SUCCESS PATH ──────────────────────────────────────
      // aiRes.fallback === false: FastAPI responded with a negotiation draft
      if (!aiRes.fallback && aiRes.aiDraft) {
        const po = await PurchaseOrder.create({
          itemId:      item._id,
          vendorId:    vendor._id,
          quantity:    item.thresholdLimit * 2,       // Standard reorder: 2× threshold
          quotedPrice: vendor.averagePrice || 100,
          status:      'Draft',                       // Ready for Manager review
          aiDraft:     aiRes.aiDraft,                 // AI-generated negotiation text
          companyId:   req.user.companyId || req.user.id,
          inventorySnapshot: {
            currentStock:   item.currentStock,
            thresholdLimit: item.thresholdLimit,
            itemName:       item.itemName,
          },
        });

        console.log(
          `[INVENTORY] ✓ Draft PO created: ${po._id} | Item: ${item.itemName} | ` +
          `Vendor: ${vendor.name || vendor._id} | Qty: ${po.quantity}`
        );
      }

      // ── Branch B: AI FAIL-SAFE PATH ────────────────────────────────────
      // aiRes.fallback === true: FastAPI was unavailable or returned an error
      // Action: Create PO with Manual_Review_Required status to ensure zero data loss
      else if (aiRes.fallback) {
        const po = await PurchaseOrder.create({
          itemId:      item._id,
          vendorId:    vendor._id,
          quantity:    item.thresholdLimit * 2,                 // Best-guess reorder quantity
          quotedPrice: vendor.averagePrice || 100,              // Last known vendor price
          status:      'Manual_Review_Required',                // Flag for operator action
          aiDraft:     null,                                    // No AI draft available
          fallbackReason: aiRes.error || 'AI service unavailable', // Store failure reason
          companyId:   req.user.companyId || req.user.id,
          inventorySnapshot: {
            currentStock:   item.currentStock,                  // State at time of trigger
            thresholdLimit: item.thresholdLimit,
            itemName:       item.itemName,
          },
        });

        // Critical log: operators must be alerted to manual review requirement
        console.error(
          `[INVENTORY] ⚠ FAIL-SAFE PO CREATED: ${po._id} | Status: Manual_Review_Required | ` +
          `Item: ${item.itemName} | Stock: ${item.currentStock}/${item.thresholdLimit} | ` +
          `AI Error: ${aiRes.error} | Vendor: ${vendor.name || vendor._id}`
        );
      }
    }
  }

  // ── Step 7: Return success response — pipeline state never breaks ─────────
  res.status(200).json({
    success: true,
    message: `Consumption of ${qty} units recorded successfully.`,
    item: {
      id:             item._id,
      itemName:       item.itemName,
      currentStock:   item.currentStock,
      thresholdLimit: item.thresholdLimit,
      thresholdBreached: item.currentStock <= item.thresholdLimit,
    },
  });
});

module.exports = { getInventory, consumeInventory };
