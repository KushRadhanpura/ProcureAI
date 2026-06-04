/**
 * @file purchaseOrder.js
 * @description ProcureAI — Purchase Order Mongoose Schema
 *
 * Status Lifecycle:
 *  Draft                  → Initial state. Created by automated pipeline or manual entry.
 *  Negotiating            → AI negotiation draft dispatched to vendor. Awaiting quote response.
 *  Confirmed              → Owner/Manager has approved terms. Committed to vendor.
 *  Delivered              → Physical delivery recorded. Inventory stock adjusted.
 *  Manual_Review_Required → AI microservice was unavailable during automated creation.
 *                           A human procurement officer must review and advance this order.
 *                           No pipeline break occurred — document preserves item state.
 *
 * The Manual_Review_Required status is the fail-safe state created by the
 * AI error boundary in inventoryController.js when FastAPI returns an error
 * or times out. This ensures zero data loss and full audit traceability.
 */

const mongoose = require('mongoose');

const purchaseOrderSchema = new mongoose.Schema(
  {
    /** Reference to the inventory item triggering this restock */
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Inventory',
      required: [true, 'itemId is required'],
    },

    /** Reference to the target vendor for this order */
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor',
      required: [true, 'vendorId is required'],
    },

    /** Quantity of items to be ordered in this PO */
    quantity: {
      type: Number,
      required: [true, 'quantity is required'],
      min: [1, 'Quantity must be at least 1'],
    },

    /** Price per unit as quoted by the vendor or estimated from benchmarks */
    quotedPrice: {
      type: Number,
      min: [0, 'Quoted price must be non-negative'],
      default: 0,
    },

    /**
     * PO Status — drives UI display and workflow routing.
     * Manual_Review_Required is the AI fail-safe state (see inventoryController.js).
     */
    status: {
      type: String,
      enum: {
        values: ['Draft', 'Negotiating', 'Confirmed', 'Delivered', 'Manual_Review_Required'],
        message: 'Status must be one of: Draft, Negotiating, Confirmed, Delivered, Manual_Review_Required',
      },
      default: 'Draft',
    },

    /**
     * AI-generated negotiation draft text.
     * Populated by FastAPI /predict-restock endpoint.
     * Null when status is Manual_Review_Required (AI failure path).
     * Human-readable email negotiation copy ready for vendor dispatch.
     */
    aiDraft: {
      type: String,
      default: null,
    },

    /**
     * Fallback reason string — populated only on Manual_Review_Required status.
     * Records the specific AI service error for operator review.
     * Example: "AI service timeout after 10000ms" or "Connection refused: ai-service:8000"
     */
    fallbackReason: {
      type: String,
      default: null,
    },

    /**
     * Snapshot of inventory state at time of PO creation.
     * Critical for Manual_Review_Required audit: records the exact
     * currentStock and thresholdLimit that triggered replenishment.
     */
    inventorySnapshot: {
      currentStock:   { type: Number, default: null },
      thresholdLimit: { type: Number, default: null },
      itemName:       { type: String, default: null },
    },

    /**
     * Multi-tenant company isolation key.
     * All queries must filter by companyId === req.user.companyId
     * to prevent cross-tenant data leakage.
     */
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'companyId is required for tenant isolation'],
    },
  },
  {
    timestamps: true, // createdAt = when PO was initiated, updatedAt = last status change
  }
);

/**
 * Index: Compound index on companyId + status for efficient dashboard queries.
 * Most common query pattern: "get all Draft POs for this company"
 */
purchaseOrderSchema.index({ companyId: 1, status: 1 });

/**
 * Virtual: totalValue
 * Computed total order value = quantity × quotedPrice.
 * Used in spend analytics without storing a derived field.
 */
purchaseOrderSchema.virtual('totalValue').get(function () {
  return this.quantity * this.quotedPrice;
});

module.exports = mongoose.model('PurchaseOrder', purchaseOrderSchema);
