/**
 * @file server.js
 * @description ProcureAI — Express Application Entry Point
 *
 * Service Architecture:
 *  ┌─────────────────────────────────────────────────────────────────┐
 *  │  React Frontend (Vercel)  →  port 3000 (dev) / CDN (prod)      │
 *  │  Node.js + Express (Render) → port 5000                         │
 *  │  FastAPI Python (Render)  → port 8000                           │
 *  └─────────────────────────────────────────────────────────────────┘
 *
 * Middleware Stack (applied in order):
 *  1. dotenv         → Load .env variables before anything else
 *  2. cors           → Cross-origin requests from React frontend
 *  3. express.json   → Parse JSON request bodies
 *  4. Route handlers → authRoutes, inventoryRoutes, vendorRoutes, purchaseOrderRoutes
 *  5. globalErrorHandler → Catch-all async error handler (must be last)
 */

require('dotenv').config();

const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
const { globalErrorHandler } = require('./middleware/errorHandler');

const app = express();

// ── Database Connection ───────────────────────────────────────────────────────
connectDB();

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json({ limit: '10mb' })); // 10MB limit supports base64 PDF payloads

// ── API Routes ────────────────────────────────────────────────────────────────
app.use('/api/auth',            require('./routes/authRoutes'));
app.use('/api/inventory',       require('./routes/inventoryRoutes'));
app.use('/api/vendors',         require('./routes/vendorRoutes'));
app.use('/api/purchase-orders', require('./routes/purchaseOrderRoutes'));

// ── Health & Root Endpoints ───────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ service: 'ProcureAI API', status: 'running', version: '2.0.0' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// ── Global Error Handler (must be last middleware) ────────────────────────────
app.use(globalErrorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`[SERVER] ProcureAI API is LIVE on port ${PORT}`);
  console.log(`[SERVER] Environment: ${process.env.NODE_ENV || 'development'}`);
});


/* ════════════════════════════════════════════════════════════════════════════
   INTEGRATION TEST PROTOCOL — ProcureAI Full-Stack Evaluation Suite
   ════════════════════════════════════════════════════════════════════════════

   PURPOSE:
   These commands validate the complete Node.js → FastAPI handshake pipeline
   and document the expected MongoDB state after each operation.
   Execute in order: Authentication → Inventory → AI Pipeline → PO Verification.

   PREREQUISITES:
   - Node.js backend running:  cd backend && node server.js          (port 5000)
   - FastAPI service running:  cd ai-service && uvicorn main:app     (port 8000)
   - MongoDB connected:        Verify via /health endpoint
   - Database seeded:          cd backend && node seed.js

   ════════════════════════════════════════════════════════════════════════════

   ──────────────────────────────────────────────────────────────────────────
   TEST 1: Health Check — Verify all services are online
   ──────────────────────────────────────────────────────────────────────────

   curl http://localhost:5000/health
   curl http://localhost:8000/

   Expected responses:
     Backend:    { "status": "OK", "timestamp": "<ISO-8601>" }
     FastAPI:    { "message": "AI Agent Online" }

   ──────────────────────────────────────────────────────────────────────────
   TEST 2: Register Owner User — Creates tenant root with self-assigned companyId
   ──────────────────────────────────────────────────────────────────────────

   curl -X POST http://localhost:5000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Alex Owner",
       "email": "owner@procureai-test.com",
       "password": "test1234",
       "role": "Owner",
       "companyName": "Zenith Manufacturing"
     }'

   Expected: { success: true, token: "<jwt>", user: { role: "Owner", companyId: "<same-as-id>" } }
   Validation: user.companyId === user.id (Owner self-assignment logic verified)

   ──────────────────────────────────────────────────────────────────────────
   TEST 3: Login — Acquire JWT for subsequent authenticated requests
   ──────────────────────────────────────────────────────────────────────────

   curl -X POST http://localhost:5000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email": "owner@procureai-test.com", "password": "test1234"}'

   Expected: { success: true, token: "<jwt>", user: { role: "Owner" } }
   Action: Export token → export TOKEN="<jwt_value>"

   ──────────────────────────────────────────────────────────────────────────
   TEST 4: RBAC Role Violation — Validator attempting restricted route
   ──────────────────────────────────────────────────────────────────────────

   # Register a Validator user first, then login and capture their token
   curl -X POST http://localhost:5000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"name":"Val User","email":"validator@test.com","password":"test1234","role":"Validator"}'

   # Attempt consume with Validator token — must be rejected
   curl -X POST http://localhost:5000/api/inventory/consume \
     -H "Authorization: Bearer $VALIDATOR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"itemId": "<any_valid_id>", "quantityUsed": 1}'

   Expected: 403 { success: false, code: "INSUFFICIENT_ROLE", required: ["Owner","Manager"] }
   Console: [RBAC VIOLATION] log line with user ID, role, route, and timestamp

   ──────────────────────────────────────────────────────────────────────────
   TEST 5: Low-Stock Threshold Trigger — Node.js → FastAPI handshake validation
   ──────────────────────────────────────────────────────────────────────────

   # Step A: Get inventory item list and identify a low-threshold item
   curl http://localhost:5000/api/inventory \
     -H "Authorization: Bearer $TOKEN"

   # Step B: Find an item with thresholdLimit ~10 and consume to breach it
   # Replace <ITEM_ID> with an actual MongoDB ObjectId from Step A
   curl -X POST http://localhost:5000/api/inventory/consume \
     -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"itemId": "<ITEM_ID>", "quantityUsed": 15}'

   Expected Response:
     { success: true, item: { thresholdBreached: true, currentStock: <n> } }

   Expected Console Output (Backend):
     [INVENTORY] Consumption recorded: <ItemName> | Used: 15 | Remaining: <n> | Threshold: <t>
     [INVENTORY] ⚠ THRESHOLD BREACH: <ItemName>. Initiating AI replenishment pipeline...
     [AI SERVICE] Triggering predict-restock for item: <ItemName> (ID: <id>)
     [AI SERVICE] ✓ Response received: status="alert"
     [INVENTORY] ✓ Draft PO created: <PO_ID> | Vendor: <vendor> | Qty: <qty>

   Expected MongoDB State (PurchaseOrder):
     { status: "Draft", aiDraft: "Auto Draft: Low stock...", companyId: "..." }

   ──────────────────────────────────────────────────────────────────────────
   TEST 6: AI Fail-Safe Path — Manual_Review_Required PO creation
   ──────────────────────────────────────────────────────────────────────────

   # SETUP: Stop the FastAPI service to simulate AI outage
   # Then trigger another threshold breach:

   curl -X POST http://localhost:5000/api/inventory/consume \
     -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"itemId": "<ANOTHER_ITEM_ID>", "quantityUsed": 20}'

   Expected Response: { success: true }  ← Backend MUST still succeed

   Expected Console Output (Backend):
     [AI SERVICE] ✗ FAIL-SAFE ACTIVATED: AI service connection refused at http://localhost:8000
     [INVENTORY] ⚠ FAIL-SAFE PO CREATED: <PO_ID> | Status: Manual_Review_Required

   Expected MongoDB State (PurchaseOrder):
     {
       status: "Manual_Review_Required",
       aiDraft: null,
       fallbackReason: "AI service connection refused at http://localhost:8000...",
       inventorySnapshot: { currentStock: <n>, thresholdLimit: <t>, itemName: "<name>" }
     }

   Validation: The Node.js pipeline continued and returned 200 despite FastAPI being down.
   Zero data loss. Zero pipeline break. ✓

   ──────────────────────────────────────────────────────────────────────────
   TEST 7: Invoice String Simulation — FastAPI /parse-pdf Vector Extraction
   ──────────────────────────────────────────────────────────────────────────

   # Encode a mock invoice text string as base64 and POST to parse-pdf
   MOCK_INVOICE="Vendor: Dell Inc\nItem: Latitude Laptop\nQuantity: 40\nPrice: \$780.00"
   ENCODED=$(echo "$MOCK_INVOICE" | base64)

   # Direct FastAPI endpoint test (bypasses Node.js auth for isolated testing)
   curl -X POST http://localhost:8000/parse-pdf \
     -H "Content-Type: application/json" \
     -d "{\"base64_data\": \"$ENCODED\", \"file_name\": \"mock_invoice.txt\"}"

   Expected Response:
     {
       "success": true,
       "vendorName": "Dell Inc",
       "itemName": "Latitude Laptop",
       "quantity": 40,
       "quotedPrice": 780.0,
       "extractedText": "Vendor: Dell Inc\nItem: ..."
     }

   Validation: Regex extraction correctly parses all four fields. ✓

   # Via authenticated Node.js route (full integration):
   curl -X POST http://localhost:5000/api/purchase-orders/parse-pdf \
     -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     -d "{\"base64Data\": \"$ENCODED\", \"fileName\": \"mock_invoice.txt\"}"

   ──────────────────────────────────────────────────────────────────────────
   TEST 8: Purchase Order Status Verification
   ──────────────────────────────────────────────────────────────────────────

   # Retrieve all POs for the authenticated company
   curl http://localhost:5000/api/purchase-orders \
     -H "Authorization: Bearer $TOKEN"

   Expected: Array containing both:
     - PO with status: "Draft" (from Test 5, AI online)
     - PO with status: "Manual_Review_Required" (from Test 6, AI offline)

   Validation Summary:
     ✓ JWT authentication working
     ✓ RBAC role enforcement working
     ✓ AI pipeline handshake working (Node → FastAPI)
     ✓ AI fail-safe boundary working (Manual_Review_Required on failure)
     ✓ Invoice parsing working (regex field extraction)
     ✓ MongoDB document state consistent across all paths

   ════════════════════════════════════════════════════════════════════════════
   END INTEGRATION TEST PROTOCOL
   ════════════════════════════════════════════════════════════════════════════ */
