/**
 * @file authMiddleware.js
 * @description ProcureAI — Hardened JWT Authentication & RBAC Authorization Middleware
 *
 * Security Architecture:
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │  protect()   →  Validates JWT Bearer token from Authorization header │
 * │                  Extracts: user.id, user.role, user.companyId        │
 * │                  Guards against null/malformed token strings         │
 * │                                                                      │
 * │  authorize() →  Role-Based Access Control (RBAC) gate               │
 * │                  Enforces: Owner | Manager | Validator ACL matrix    │
 * │                  Audit-logs all role violations before rejection     │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * ACL Matrix:
 *  Owner     → Full system access: metrics, audit, RBAC, multi-tenant config
 *  Manager   → Inventory CRUD, Purchase Order creation, Vendor management
 *  Validator → Read-only telemetry, AI document status verification only
 *
 * @production Decoupled from route logic. All credential extraction occurs
 *             here before any downstream route handler is invoked.
 */

const jwt = require('jsonwebtoken');

/**
 * protect — JWT Bearer token validation middleware
 *
 * Extracts and verifies the JWT from the Authorization header.
 * Populates req.user with { id, role, companyId } for downstream use.
 * All subsequent RBAC checks depend on req.user being set here.
 *
 * @param {Request}  req  - Express request (reads Authorization header)
 * @param {Response} res  - Express response
 * @param {Function} next - Express next middleware
 */
const protect = (req, res, next) => {
  // ── Step 1: Extract Bearer token from Authorization header ──────────────
  const authHeader = req.headers.authorization;

  // Guard: header must exist and follow "Bearer <token>" format
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: No valid Authorization header present.',
      code: 'AUTH_HEADER_MISSING',
    });
  }

  const token = authHeader.split(' ')[1];

  // Guard: token string must be non-empty after split
  if (!token || token.trim() === '') {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Token string is empty.',
      code: 'TOKEN_EMPTY',
    });
  }

  // ── Step 2: Verify token signature and decode payload ───────────────────
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ── Step 3: Populate req.user with all extracted credential fields ───
    // decoded payload shape: { id, role, companyId, iat, exp }
    req.user = {
      id: decoded.id,                   // MongoDB user ObjectId
      role: decoded.role,               // RBAC role: Owner | Manager | Validator
      companyId: decoded.companyId,     // Multi-tenant company isolation key
      name: decoded.name || null,       // Optional display name for audit logs
    };

    next();
  } catch (error) {
    // Handle specific JWT error types for precise client messaging
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Session token has expired. Please sign in again.',
        code: 'TOKEN_EXPIRED',
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Token signature is invalid or malformed.',
        code: 'TOKEN_INVALID',
      });
    }

    // Fallback for all other JWT verification failures
    return res.status(403).json({
      success: false,
      message: 'Forbidden: Token verification failed.',
      code: 'TOKEN_VERIFICATION_FAILED',
    });
  }
};

/**
 * authorize — RBAC role enforcement middleware factory
 *
 * Returns a middleware function that validates the authenticated user's role
 * against the allowedRoles list. Must be called AFTER protect() so that
 * req.user is guaranteed to be populated.
 *
 * Usage on routes:
 *   router.post('/consume', protect, authorize('Owner', 'Manager'), consumeInventory);
 *   router.get('/audit',    protect, authorize('Owner', 'Validator'), getAuditLog);
 *
 * @param  {...string} allowedRoles - Roles permitted to access this route
 * @returns {Function}               Express middleware
 */
const authorize = (...allowedRoles) => (req, res, next) => {
  // Guard: protect() must run first — req.user must exist
  if (!req.user || !req.user.role) {
    // This indicates a middleware ordering error — log for developer visibility
    console.error('[RBAC] CRITICAL: authorize() called without req.user. Ensure protect() runs first.');
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error: Authentication context missing.',
      code: 'AUTH_CONTEXT_MISSING',
    });
  }

  const { role, id, companyId } = req.user;
  const routePath = req.originalUrl;

  // ── Role validation check ────────────────────────────────────────────────
  if (!allowedRoles.includes(role)) {
    // Audit log: record all role violations for security monitoring
    console.warn(
      `[RBAC VIOLATION] User ${id} (Role: ${role}, Company: ${companyId}) ` +
      `attempted to access restricted route: ${req.method} ${routePath}. ` +
      `Required roles: [${allowedRoles.join(', ')}]. ` +
      `Timestamp: ${new Date().toISOString()}`
    );

    return res.status(403).json({
      success: false,
      message: `Forbidden: Role '${role}' is not authorized to access this resource.`,
      code: 'INSUFFICIENT_ROLE',
      required: allowedRoles,
      current: role,
    });
  }

  // Role validated — proceed to route handler
  next();
};

module.exports = { protect, authorize };
