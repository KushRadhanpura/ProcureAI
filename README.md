# ProcureAI - Production-Ready B2B SaaS

Complete MERN stack procurement automation system with FastAPI AI agent for intelligent vendor negotiation.

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- Python 3.9+
- MongoDB (running locally on port 27017)
- 3 terminal windows

### Option 1: Using Startup Scripts

```bash
# Terminal 1 - Backend (Node.js on port 5000)
bash /home/kushsoni/Desktop/Procure_AI/start-backend.sh

# Terminal 2 - AI Service (FastAPI on port 8000)
bash /home/kushsoni/Desktop/Procure_AI/start-ai.sh

# Terminal 3 - Frontend (React on port 3000)
bash /home/kushsoni/Desktop/Procure_AI/start-frontend.sh
```

### Option 2: Manual Setup

**Backend:**
```bash
cd /home/kushsoni/Desktop/Procure_AI/backend
npm install
node server.js
```

**AI Service:**
```bash
cd /home/kushsoni/Desktop/Procure_AI/ai-service
pip install fastapi uvicorn pydantic python-dotenv
uvicorn main:app --reload --port 8000
```

**Frontend:**
```bash
cd /home/kushsoni/Desktop/Procure_AI/frontend
npm install --legacy-peer-deps
npm start
```

## 📝 Test User Credentials

After registration, create a user:
- **Email:** owner@company.com
- **Password:** password123
- **Role:** Owner
- **Company:** Acme Corp

Or register new users through the app's register form.

## 🧪 Running Tests

```bash
cd /home/kushsoni/Desktop/Procure_AI/backend
node smokeTest.js
```

## 📊 Architecture

```
┌─────────────────┐
│  React Frontend │ (Port 3000)
│   - Login       │
│   - Dashboard   │
└────────┬────────┘
         │
    ┌────▼────────────────┐
    │  Express Backend    │ (Port 5000)
    │  - Auth + JWT       │
    │  - Inventory CRUD   │
    │  - Vendor Mgmt      │
    │  - Purchase Orders  │
    └────┬────────────┬───┘
         │            │
         │       ┌────▼──────────┐
         │       │  FastAPI AI   │ (Port 8000)
         │       │  - Negotiation│
         │       │  - Drafting   │
         │       └───────────────┘
         │
    ┌────▼────────────────┐
    │    MongoDB          │ (Port 27017)
    │  - Users            │
    │  - Inventory        │
    │  - Vendors          │
    │  - Orders           │
    └─────────────────────┘
```

## 🔐 Authentication & Authorization

**JWT Flow:**
1. User registers/logs in at `/api/auth/register` or `/api/auth/login`
2. Backend returns JWT token (valid 24 hours)
3. Frontend stores token in localStorage
4. All API calls include `Authorization: Bearer <token>` header

**Role-Based Access Control:**
- **Owner:** Can register company, manage all inventory, create vendors, approve orders
- **Manager:** Can consume inventory, create purchase orders (requires Owner approval)
- **Validator:** Can view inventory only (read-only access)

## 📋 API Endpoints

### Authentication
```
POST /api/auth/register
POST /api/auth/login
```

### Inventory (Protected)
```
GET  /api/inventory                    # Get all items
POST /api/inventory/consume            # Consume item (Owner/Manager only)
```

### Vendors (Protected)
```
GET  /api/vendors                      # List vendors
POST /api/vendors                      # Create vendor (Owner/Manager)
```

### Purchase Orders (Protected)
```
GET  /api/purchase-orders              # List orders
POST /api/purchase-orders              # Create order
PUT  /api/purchase-orders/:id          # Update order status
```

## 🤖 AI Service

When inventory drops below threshold:
1. Backend detects low stock
2. Calls `POST /predict-restock` to FastAPI
3. FastAPI generates negotiation draft
4. Draft stored in MongoDB
5. Manager notified to finalize PO

## 🛠️ Development

**Frontend Components:**
- `App.js` - Main app router, auth state
- `Login.jsx` - Register/Login forms
- `InventoryDashboard.jsx` - Inventory table & consume
- `VendorManagement.jsx` - Vendor CRUD
- `PurchaseOrders.jsx` - Order tracking

**Backend Middleware:**
- `errorHandler.js` - Global error catching
- `authMiddleware.js` - JWT validation & RBAC
- `validation.js` - Joi schema validation

**Backend Controllers:**
- `authController.js` - Register/login logic
- `inventoryController.js` - Inventory CRUD + AI trigger
- `vendorController.js` - Vendor management
- `purchaseOrderController.js` - Order management

## 📦 Database Collections

**Users**
```javascript
{ _id, name, email, password (hashed), role, companyName, createdAt, updatedAt }
```

**Inventory**
```javascript
{ _id, itemName, currentStock, thresholdLimit, createdAt, updatedAt }
```

**Vendors**
```javascript
{ _id, name, email, phone, address, averagePrice, companyId, createdAt, updatedAt }
```

**Purchase Orders**
```javascript
{ _id, itemId, vendorId, quantity, quotedPrice, status, aiDraft, companyId, createdAt, updatedAt }
```

## ✅ Task Checklist

- [x] Backend authentication (JWT + bcrypt)
- [x] RBAC implementation (3 roles)
- [x] Inventory management
- [x] Vendor management
- [x] Purchase order workflow
- [x] Frontend login/register
- [x] Frontend dashboard with tabs
- [x] API integration with Bearer tokens
- [x] Error handling & validation
- [x] FastAPI AI service integration
- [x] Automated testing (smokeTest.js)

## 🔗 Environment Variables

**Backend (.env)**
```
MONGODB_URI=mongodb://localhost:27017/procure_ai
JWT_SECRET=your_secret_key_here
PORT=5000
```

**Frontend (.env)**
```
REACT_APP_API_BASE_URL=http://localhost:5000
```

**AI Service (.env)**
```
# No required vars, uses FastAPI defaults
```

## 📞 Support

For issues, check:
1. MongoDB is running: `mongosh`
2. All services started in correct order
3. Token validity (24-hour expiry)
4. CORS enabled on all services
5. Check browser console for API errors

## 🎯 Interview Talking Points

1. **Architecture:** Microservices design - separate concerns for auth, business logic, and AI
2. **Security:** JWT tokens, role-based middleware, password hashing with bcrypt
3. **Scalability:** Decoupled services can scale independently, async webhooks
4. **Error Handling:** Global middleware catches all errors, consistent response format
5. **Database Design:** Proper refs & relationships between collections
6. **Frontend State:** Auth persistence via localStorage, API integration with headers
