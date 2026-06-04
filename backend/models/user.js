/**
 * @file user.js
 * @description ProcureAI — User Schema with Multi-Tenant RBAC Support
 *
 * Schema Design:
 *  - role: RBAC enforcement at the data layer. Enum matches authMiddleware ACL.
 *  - companyId: Multi-tenant isolation key. Owner users are their own companyId.
 *    All Manager/Validator users share the companyId of their provisioning Owner.
 *    This allows a single MongoDB collection to support multiple isolated tenants.
 *  - companyName: Display-only field for UI breadcrumb and header labels.
 *
 * Multi-Tenant Logic:
 *  On registration, if role === 'Owner', companyId is set to the user's own _id
 *  after document creation (see authController.js). For Manager/Validator roles,
 *  companyId must be supplied by the provisioning Owner.
 */

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    /** Display name for UI and audit log identification */
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },

    /** Unique login identifier — used for JWT subject */
    email: {
      type: String,
      unique: true,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
    },

    /** bcrypt-hashed password. Plain text is never stored. */
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false, // Never return password field in queries by default
    },

    /**
     * RBAC Role — determines route-level access permissions.
     * Owner     → Full system admin + multi-tenant RBAC management
     * Manager   → Inventory + Vendor + Purchase Order operations
     * Validator → Read-only telemetry + AI document audit verification
     */
    role: {
      type: String,
      enum: {
        values: ['Owner', 'Manager', 'Validator'],
        message: 'Role must be one of: Owner, Manager, Validator',
      },
      default: 'Manager',
    },

    /**
     * Multi-Tenant Company Isolation Key.
     * References the Owner user's _id. All documents in Inventory,
     * PurchaseOrder, and Vendor collections use this companyId to
     * scope queries to a single tenant's data only.
     *
     * For Owner role: companyId === user._id (self-referential)
     * For Manager/Validator: companyId === their Owner's _id
     */
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null, // Set post-creation for Owner; supplied for sub-roles
    },

    /** Human-readable company label. Used in dashboard header and reports. */
    companyName: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true, // createdAt, updatedAt — auto-managed by Mongoose
  }
);

/**
 * Virtual: fullTenant
 * Returns a combined string for audit log formatting.
 * Usage: user.fullTenant → "Zenith Manufacturing (Owner: 64abc...)"
 */
userSchema.virtual('fullTenant').get(function () {
  return `${this.companyName || 'Unknown Company'} (${this.role}: ${this._id})`;
});

module.exports = mongoose.model('User', userSchema);