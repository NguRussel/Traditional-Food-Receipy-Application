import mongoose, { Schema, Document, Model, model } from 'mongoose';
import bcrypt from 'bcryptjs';

/**
 * @openapi
 * components:
 *   schemas:
 *     AdminRole:
 *       type: string
 *       enum: [super_admin, content_moderator, user_manager, system_admin, support_agent]
 *       description: Role of the admin defining their access level and capabilities.
 *     AdminStatus:
 *       type: string
 *       enum: [active, suspended, pending_verification, deactivated]
 *       description: Current status of the admin account.
 */

// Enum for Admin Roles
export enum AdminRole {
    SUPER_ADMIN = 'super_admin',
    CONTENT_MODERATOR = 'content_moderator',
    USER_MANAGER = 'user_manager',
    SETTINGS_MANAGER = 'settings_manager',
    ANALYTICS_VIEWER = 'analytics_viewer'
}

// Enum for Admin Status
export enum AdminStatus {
    ACTIVE = 'active',
    SUSPENDED = 'suspended',
    DEACTIVATED = 'deactivated'
}

/**
 * @openapi
 * components:
 *   schemas:
 *     Admin:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - roles
 *       properties:
 *         _id:
 *           type: string
 *           description: The auto-generated ID of the admin.
 *           example: 60c72b2f9b1d8c001f8e4c6d
 *         clerkId:
 *           type: string
 *           description: Optional Clerk ID if using Clerk for authentication.
 *           example: user_2a7xK8hD5mN6pYqZ0rJkX3wV
 *         name:
 *           type: string
 *           description: Full name of the admin.
 *           example: John Doe
 *         email:
 *           type: string
 *           format: email
 *           description: Email address of the admin (must be unique).
 *           example: admin@example.com
 *         password:
 *           type: string
 *           format: password
 *           description: Password for the admin (only present if not using Clerk or for direct login).
 *           writeOnly: true
 *         avatar:
 *           type: string
 *           format: url
 *           description: URL of the admin's avatar image.
 *           example: https://example.com/avatar.png
 *         roles:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/AdminRole'
 *           description: Array of roles assigned to the admin.
 *         permissions:
 *           type: array
 *           items:
 *             type: string
 *           description: Specific permissions granted to the admin (e.g., manage_users, moderate_content).
 *           example: ["manage_users", "view_analytics"]
 *         lastLogin:
 *           type: string
 *           format: date-time
 *           description: Timestamp of the admin's last login.
 *         status:
 *           $ref: '#/components/schemas/AdminStatus'
 *         isActive:
 *           type: boolean
 *           description: Whether the admin account is currently active.
 *           default: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp of when the admin account was created.
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Timestamp of when the admin account was last updated.
 *     AdminInput:
 *       type: object
 *       required:
 *         - name
 *         - email
 *         - roles
 *       properties:
 *         clerkId:
 *           type: string
 *         name:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *         password:
 *           type: string
 *           format: password
 *           minLength: 6
 *         avatar:
 *           type: string
 *           format: url
 *         roles:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/AdminRole'
 *           minItems: 1
 *         permissions:
 *           type: array
 *           items:
 *             type: string
 *         status:
 *           $ref: '#/components/schemas/AdminStatus'
 *         isActive:
 *           type: boolean
 *     AdminUpdateInput:
 *       type: object
 *       properties:
 *         clerkId:
 *           type: string
 *         name:
 *           type: string
 *         email:
 *           type: string
 *           format: email
 *         avatar:
 *           type: string
 *           format: url
 *         roles:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/AdminRole'
 *         permissions:
 *           type: array
 *           items:
 *             type: string
 *         status:
 *           $ref: '#/components/schemas/AdminStatus'
 *         isActive:
 *           type: boolean
 *         currentPassword: # For password change by admin themselves
 *           type: string
 *           format: password
 *           description: Required if admin is changing their own password.
 *         newPassword: # For password change by admin themselves
 *           type: string
 *           format: password
 *           minLength: 6
 *           description: New password.
 */

// Interface for Admin document
export interface IAdmin extends Document {
    clerkId?: string; // Optional: if integrating with Clerk for SSO or initial auth
    name: string;
    email: string;
    password?: string; // Password will be set for direct auth, not needed if only Clerk ID
    avatar?: string;
    roles: AdminRole[];
    permissions: string[]; // More granular permissions, e.g., 'delete_user', 'edit_recipe'
    lastLogin?: Date;
    status: AdminStatus;
    isActive: boolean; // Derived from status, for easier querying
    createdAt: Date;
    updatedAt: Date;
    comparePassword(candidatePassword: string): Promise<boolean>;
}

// Schema for Admin
const AdminSchema = new Schema<IAdmin>(
    {
        clerkId: { type: String, unique: true, sparse: true, trim: true, index: true }, // Sparse index if not all admins have clerkId
        name: { type: String, required: true, trim: true },
        email: { 
            type: String, 
            required: true, 
            unique: true, 
            trim: true, 
            lowercase: true, 
            match: [/.+\@.+\..+/, 'Please fill a valid email address'],
            index: true 
        },
        password: { type: String, select: false }, // select: false hides password by default
        avatar: { type: String, trim: true },
        roles: {
            type: [String],
            enum: Object.values(AdminRole),
            required: true,
            default: [AdminRole.CONTENT_MODERATOR] // Default role
        },
        permissions: [{ type: String, trim: true }],
        lastLogin: { type: Date },
        status: {
            type: String,
            enum: Object.values(AdminStatus),
            default: AdminStatus.ACTIVE,
            index: true
        },
        isActive: { type: Boolean, default: true, index: true },
    },
    { timestamps: true } // Adds createdAt and updatedAt automatically
);

// Pre-save hook to hash password if it's modified (and present)
AdminSchema.pre<IAdmin>('save', async function (next) {
    if (!this.isModified('password') || !this.password) {
        return next();
    }
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error: any) {
        next(error);
    }
});

// Method to compare candidate password with the stored hashed password
AdminSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
    if (!this.password) return false; // No password to compare (e.g. Clerk only admin)
    return bcrypt.compare(candidatePassword, this.password);
};

// Update isActive based on status before saving
AdminSchema.pre<IAdmin>('save', function(next) {
    this.isActive = this.status === AdminStatus.ACTIVE;
    next();
});

// Index for searching by name and email
AdminSchema.index({ name: 'text', email: 'text' });

// Use the imported lowercase 'model' function
export const Admin = model<IAdmin>('Admin', AdminSchema); 