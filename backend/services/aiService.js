/**
 * @file aiService.js
 * @description ProcureAI — AI Microservice Bridge: Node.js → FastAPI Integration
 *
 * Responsibilities:
 *  1. POST inventory item metadata to FastAPI /predict-restock
 *  2. Return structured response with aiDraft or fallback flag
 *  3. NEVER throw unhandled exceptions — always return a structured object
 *
 * Fail-Safe Contract:
 *  This module guarantees it will ALWAYS return a structured object.
 *  Callers must check { fallback: true } and route accordingly.
 *
 * Return Shape (success):
 *  { status: 'alert', action: '...', aiDraft: '...', fallback: false }
 *
 * Return Shape (failure / AI service unavailable):
 *  { aiDraft: null, fallback: true, error: '<error_message>', itemId: '...' }
 *
 * The fallback: true shape triggers Manual_Review_Required PO creation
 * in inventoryController.js — ensuring zero data loss even when FastAPI
 * is unreachable (e.g., during Render cold starts or service restarts).
 */

const axios = require('axios');

/** FastAPI service base URL — overridable via environment variable */
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

/** Axios timeout: 10 seconds. FastAPI should respond well within this window. */
const AI_REQUEST_TIMEOUT_MS = 10000;

/**
 * triggerAIAgent — POST item metadata to FastAPI /predict-restock
 *
 * Dispatches inventory telemetry to the Python AI microservice for
 * negotiation draft generation. Implements a full error boundary that
 * returns structured fallback data instead of throwing on failure.
 *
 * @param {Object} itemData         - Mongoose Inventory document
 * @param {string} itemData._id     - MongoDB ObjectId
 * @param {number} itemData.currentStock  - Current units in stock
 * @param {number} itemData.thresholdLimit - Safety reorder threshold
 * @param {string} itemData.itemName - Human-readable item name
 *
 * @returns {Promise<Object>} Structured response or fallback error object
 */
const triggerAIAgent = async (itemData) => {
  // Build the POST payload matching FastAPI InventoryData Pydantic model
  const payload = {
    item_id:        itemData._id.toString(),
    currentStock:   itemData.currentStock,
    thresholdLimit: itemData.thresholdLimit,
  };

  console.log(
    `[AI SERVICE] Triggering predict-restock for item: ${itemData.itemName} ` +
    `(ID: ${itemData._id}) | Stock: ${itemData.currentStock}/${itemData.thresholdLimit}`
  );

  try {
    // ── Dispatch to FastAPI /predict-restock ─────────────────────────────
    const response = await axios.post(
      `${AI_SERVICE_URL}/predict-restock`,
      payload,
      {
        timeout: AI_REQUEST_TIMEOUT_MS,
        headers: { 'Content-Type': 'application/json' },
      }
    );

    const data = response.data;

    console.log(`[AI SERVICE] ✓ Response received for item ${itemData._id}: status="${data.status}"`);

    // Attach fallback: false to signal successful AI response to caller
    return { ...data, fallback: false };

  } catch (error) {
    // ── Structured Error Boundary — never let this throw ─────────────────
    //
    // Possible failure modes:
    //  - ECONNREFUSED: FastAPI not running (Render cold start, deployment gap)
    //  - ETIMEDOUT:    AI service overloaded or network partition
    //  - 4xx/5xx:      FastAPI returned an HTTP error response
    //  - JSON error:   Malformed response body

    let errorMessage = error.message || 'Unknown AI service error';

    if (error.code === 'ECONNREFUSED') {
      errorMessage = `AI service connection refused at ${AI_SERVICE_URL}. Service may be starting up.`;
    } else if (error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED') {
      errorMessage = `AI service request timed out after ${AI_REQUEST_TIMEOUT_MS}ms.`;
    } else if (error.response) {
      // FastAPI returned a non-2xx HTTP status
      errorMessage = `AI service returned HTTP ${error.response.status}: ${JSON.stringify(error.response.data)}`;
    }

    // Log full error context for operator debugging
    console.error(
      `[AI SERVICE] ✗ FAIL-SAFE ACTIVATED for item ${itemData._id} (${itemData.itemName}): ` +
      `${errorMessage}`
    );

    // ── Return structured fallback object — NEVER return null ─────────────
    // Callers check fallback: true to trigger Manual_Review_Required PO path
    return {
      aiDraft:  null,           // No draft generated — AI was unavailable
      fallback: true,           // Signal to inventoryController.js: use fail-safe path
      error:    errorMessage,   // Human-readable error for MongoDB storage
      itemId:   itemData._id.toString(),
    };
  }
};

/**
 * generateNegotiationDraft — Local fallback draft generator
 *
 * Used as a secondary fallback when the AI service is completely unavailable
 * AND the operator wants a basic template rather than Manual_Review_Required.
 * Not used in the primary pipeline — exists for potential manual override use.
 *
 * @param {Object} item   - Inventory item document
 * @param {Object} vendor - Vendor document
 * @returns {string}      - Basic negotiation draft string
 */
const generateNegotiationDraft = (item, vendor) => {
  const reorderQty = item.thresholdLimit * 2;
  const estimatedPrice = vendor.averagePrice || 100;

  return (
    `Subject: Urgent Restock Request — ${item.itemName}\n\n` +
    `Dear ${vendor.name || 'Vendor'} Team,\n\n` +
    `Our inventory of ${item.itemName} has reached a critical low (current: ${item.currentStock} units, ` +
    `safety threshold: ${item.thresholdLimit} units). We require an immediate restock of ${reorderQty} units.\n\n` +
    `Based on our procurement benchmarks, we propose a unit price of $${estimatedPrice.toFixed(2)}.\n\n` +
    `Please confirm availability and revised pricing at your earliest convenience.\n\n` +
    `Best regards,\nProcureAI Automated Procurement`
  );
};

module.exports = { triggerAIAgent, generateNegotiationDraft };
