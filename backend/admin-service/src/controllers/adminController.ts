import { Request, Response } from 'express';
import { Admin, IAdmin, AdminRole, AdminStatus } from '../models/Admin';
import asyncHandler from '../utils/asyncHandler';
import { AuthError, IAuthRequest } from '../middleware/authMiddleware';
import mongoose from 'mongoose';

// Helper to check for valid ObjectId
const isValidObjectId = (id: string) => mongoose.Types.ObjectId.isValid(id);

/**
 * @desc    Create a new admin account
 * @route   POST /api/v1/admins
 * @access  Private (Super Admin only)
 */
export const createAdmin = asyncHandler(async (req: IAuthRequest, res: Response) => {
    const { name, email, password, roles, permissions, status, clerkId, avatar } = req.body;

    // Basic validation (more detailed validation should be in middleware)
    if (!name || !email || !roles || !Array.isArray(roles) || roles.length === 0) {
        throw new AuthError('Name, email, and at least one role are required.', 400);
    }
    // If not using Clerk for this new admin, password is required
    if (!clerkId && !password) {
        throw new AuthError('Password is required if Clerk ID is not provided.', 400);
    }

    const emailExists = await Admin.findOne({ email });
    if (emailExists) {
        throw new AuthError('Admin with this email already exists.', 400);
    }
    if (clerkId) {
        const clerkIdExists = await Admin.findOne({ clerkId });
        if (clerkIdExists) {
            throw new AuthError('Admin with this Clerk ID already exists.', 400);
        }
    }

    const adminData: Partial<IAdmin> = {
        name,
        email,
        roles: roles as AdminRole[], // Cast assuming validation is done
        permissions: permissions || [],
        status: status || AdminStatus.ACTIVE,
    };
    if (password) adminData.password = password;
    if (clerkId) adminData.clerkId = clerkId;
    if (avatar) adminData.avatar = avatar;

    const newAdmin = await Admin.create(adminData);

    // Exclude password from response even if it was just set (it's hashed in DB)
    const adminResponse = newAdmin.toObject();
    delete adminResponse.password;

    res.status(201).json({
        success: true,
        message: 'Admin account created successfully.',
        data: adminResponse
    });
});

/**
 * @desc    Get all admin accounts
 * @route   GET /api/v1/admins
 * @access  Private (Admin roles with permission to view other admins, e.g., Super Admin)
 */
export const getAllAdmins = asyncHandler(async (req: IAuthRequest, res: Response) => {
    const { page = 1, limit = 10, role, status, sortBy = 'createdAt', order = 'desc' } = req.query;
    const query: any = {};

    if (role) query.roles = role as string;
    if (status) query.status = status as AdminStatus;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const sortOrder = order === 'asc' ? 1 : -1;
    const sortOptions: any = { [sortBy as string]: sortOrder };

    const admins = await Admin.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum)
        .select('-password'); // Exclude passwords

    const totalAdmins = await Admin.countDocuments(query);

    res.status(200).json({
        success: true,
        count: admins.length,
        totalPages: Math.ceil(totalAdmins / limitNum),
        currentPage: pageNum,
        data: admins
    });
});

/**
 * @desc    Get a single admin account by ID
 * @route   GET /api/v1/admins/:id
 * @access  Private (Admin roles with permission or self)
 */
export const getAdminById = asyncHandler(async (req: IAuthRequest, res: Response) => {
    const adminId = req.params.id;
    if (!isValidObjectId(adminId)) {
        throw new AuthError('Invalid admin ID format.', 400);
    }

    const admin = await Admin.findById(adminId).select('-password');

    if (!admin) {
        throw new AuthError('Admin not found.', 404);
    }

    // Optional: Add check if the requesting admin has permission to view this profile
    // or if they are viewing their own profile (already handled by /auth/me for self)

    res.status(200).json({ success: true, data: admin });
});

/**
 * @desc    Update an admin account
 * @route   PUT /api/v1/admins/:id
 * @access  Private (Super Admin or admin updating self with limitations)
 */
export const updateAdmin = asyncHandler(async (req: IAuthRequest, res: Response) => {
    const adminIdToUpdate = req.params.id;
    const updates = req.body;
    const requestingAdmin = req.admin; // Admin performing the update

    if (!isValidObjectId(adminIdToUpdate)) {
        throw new AuthError('Invalid admin ID format for update.', 400);
    }

    const adminToUpdate = await Admin.findById(adminIdToUpdate);
    if (!adminToUpdate) {
        throw new AuthError('Admin to update not found.', 404);
    }

    // Define fields that can be updated and by whom
    // Super Admins can update more fields than an admin updating their own limited profile
    const allowedUpdates: (keyof IAdmin)[] = [];
    const isSuperAdmin = requestingAdmin?.roles.includes(AdminRole.SUPER_ADMIN);
    const isSelfUpdate = requestingAdmin?._id.toString() === adminIdToUpdate;

    if (isSuperAdmin) {
        allowedUpdates.push('name', 'email', 'roles', 'permissions', 'status', 'avatar', 'clerkId');
        // Super admin can also reset password by providing a new 'password' field in body
        if (updates.password) allowedUpdates.push('password');
    } else if (isSelfUpdate) {
        // Admins can update their own name, avatar, and potentially password
        allowedUpdates.push('name', 'avatar');
        if (updates.oldPassword && updates.newPassword) {
            // Special handling for self password update
        } else if (updates.password && !updates.oldPassword) {
            throw new AuthError('To change your password, provide old and new password.', 400);
        }
    } else {
        throw new AuthError('You are not authorized to update this admin profile.', 403);
    }

    const filteredUpdates: Partial<IAdmin> = {};
    for (const key of Object.keys(updates)) {
        if (allowedUpdates.includes(key as keyof IAdmin)) {
            (filteredUpdates as any)[key] = updates[key];
        }
    }

    // Special handling for self password update
    if (isSelfUpdate && updates.oldPassword && updates.newPassword) {
        if (!adminToUpdate.password) throw new AuthError('Password cannot be changed for this account (no password set).',400);
        const isMatch = await adminToUpdate.comparePassword(updates.oldPassword);
        if (!isMatch) {
            throw new AuthError('Incorrect old password.', 401);
        }
        adminToUpdate.password = updates.newPassword; // Password will be hashed by pre-save hook
    }

    // Apply other filtered updates
    Object.assign(adminToUpdate, filteredUpdates);
    
    // If roles are updated, ensure they are valid AdminRole enum values
    if (filteredUpdates.roles && Array.isArray(filteredUpdates.roles)) {
        if (!filteredUpdates.roles.every(role => Object.values(AdminRole).includes(role as AdminRole))){
            throw new AuthError('Invalid admin role specified in update.', 400);
        }
    }
    // If status is updated, ensure it is a valid AdminStatus enum value
    if (filteredUpdates.status && !Object.values(AdminStatus).includes(filteredUpdates.status as AdminStatus)) {
        throw new AuthError('Invalid admin status specified in update.', 400);
    }

    const updatedAdmin = await adminToUpdate.save();

    const adminResponse = updatedAdmin.toObject();
    delete adminResponse.password; // Ensure password is not in the response

    res.status(200).json({ success: true, data: adminResponse });
});

/**
 * @desc    Delete an admin account
 * @route   DELETE /api/v1/admins/:id
 * @access  Private (Super Admin only)
 */
export const deleteAdmin = asyncHandler(async (req: IAuthRequest, res: Response) => {
    const adminIdToDelete = req.params.id;
    const requestingAdminId = req.admin?._id;

    if (!isValidObjectId(adminIdToDelete)) {
        throw new AuthError('Invalid admin ID format for deletion.', 400);
    }

    if (adminIdToDelete === requestingAdminId?.toString()) {
        throw new AuthError('Super admins cannot delete their own account via this route.', 400);
    }

    const admin = await Admin.findByIdAndDelete(adminIdToDelete);

    if (!admin) {
        throw new AuthError('Admin not found for deletion.', 404);
    }

    res.status(200).json({ success: true, message: 'Admin account deleted successfully.', data: {} });
}); 