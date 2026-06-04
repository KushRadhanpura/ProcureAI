/**
 * @file authController.js
 * @description ProcureAI — Authentication Controller: Register & Login
 *
 * JWT Payload Architecture:
 *  All issued tokens contain: { id, role, companyId, name }
 *  - id:        MongoDB user ObjectId (used for document ownership queries)
 *  - role:      RBAC role (validated against ACL matrix in authMiddleware.js)
 *  - companyId: Multi-tenant isolation key (scopes all data queries)
 *  - name:      Display name (for audit log context in role violation warnings)
 *
 * Multi-Tenant Registration Logic:
 *  - If registering as 'Owner': companyId is set to the user's own _id after
 *    document creation (self-referential). This user becomes the tenant root.
 *  - If registering as 'Manager' or 'Validator': companyId must be supplied
 *    in the request body (provisioned by their Owner). This scopes them to
 *    an existing tenant's data namespace.
 */

const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * Helper: Issue a signed JWT with the full credential payload.
 * Token expiry: 7 days (suitable for B2B SaaS session duration).
 *
 * @param {Object} user - Mongoose User document
 * @returns {string}    - Signed JWT string
 */
const signToken = (user) => {
  return jwt.sign(
    {
      id:        user._id,            // MongoDB ObjectId for DB lookups
      role:      user.role,           // RBAC: Owner | Manager | Validator
      companyId: user.companyId,      // Multi-tenant scope key
      name:      user.name,           // Audit log context
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

/**
 * register — Create a new user account
 *
 * POST /api/auth/register
 * Body: { name, email, password, role?, companyName?, companyId? }
 *
 * Owner Registration Flow:
 *  1. Create user with companyId: null
 *  2. Set companyId = user._id (self-referential tenant root)
 *  3. Save updated document
 *  4. Issue JWT with companyId populated
 *
 * Sub-Role Registration Flow:
 *  Manager/Validator must supply companyId of their Owner in the request body.
 *  This is typically handled via an Owner-provisioned invite link in production.
 */
const register = asyncHandler(async (req, res) => {
  const { name, email, password, role, companyName, companyId } = req.body;

  // ── Duplicate email check ────────────────────────────────────────────────
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: 'An account with this email address already exists.',
      code: 'EMAIL_ALREADY_REGISTERED',
    });
  }

  // ── Hash password before storage — never store plaintext ────────────────
  const hashedPassword = await bcrypt.hash(password, 12); // Cost factor: 12

  // ── Determine effective role — default to Manager if not supplied ────────
  const effectiveRole = role || 'Manager';

  // ── Create user document ─────────────────────────────────────────────────
  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role: effectiveRole,
    companyName: companyName || '',
    // For sub-roles: companyId from request; for Owner: set after creation
    companyId: effectiveRole !== 'Owner' ? (companyId || null) : null,
  });

  // ── Owner: self-assign companyId for tenant root scoping ─────────────────
  if (effectiveRole === 'Owner') {
    user.companyId = user._id; // Owner is the root of their own tenant
    await user.save();
  }

  // ── Issue JWT with fully populated credential payload ────────────────────
  const token = signToken(user);

  console.log(`[AUTH] New ${effectiveRole} registered: ${email} | Company: ${companyName || 'N/A'} | Tenant: ${user.companyId}`);

  res.status(201).json({
    success: true,
    token,
    user: {
      id:          user._id,
      name:        user.name,
      email:       user.email,
      role:        user.role,
      companyId:   user.companyId,
      companyName: user.companyName,
    },
  });
});

/**
 * login — Authenticate existing user credentials
 *
 * POST /api/auth/login
 * Body: { email, password }
 *
 * Note: password field uses select: false in User schema.
 * We must explicitly select it here for bcrypt comparison.
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // ── Find user and explicitly include password for comparison ─────────────
  const user = await User.findOne({ email }).select('+password');

  // Guard: user not found — return generic message to prevent user enumeration
  if (!user) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password.',
      code: 'INVALID_CREDENTIALS',
    });
  }

  // ── Bcrypt comparison — constant-time comparison prevents timing attacks ──
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password.',
      code: 'INVALID_CREDENTIALS',
    });
  }

  // ── Issue JWT with full credential payload ───────────────────────────────
  const token = signToken(user);

  console.log(`[AUTH] Login successful: ${email} (${user.role}) | Tenant: ${user.companyId}`);

  res.status(200).json({
    success: true,
    token,
    user: {
      id:          user._id,
      name:        user.name,
      email:       user.email,
      role:        user.role,
      companyId:   user.companyId,
      companyName: user.companyName,
    },
  });
});

module.exports = { register, login };
