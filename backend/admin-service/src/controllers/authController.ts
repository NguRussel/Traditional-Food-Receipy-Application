import { Request, Response } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import { Admin, IAdmin } from '../models/Admin';
import asyncHandler from '../utils/asyncHandler';
import { AuthError, IAuthRequest } from '../middleware/authMiddleware';

/**
 * @desc    Authenticate admin & get token (Login)
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
export const loginAdmin = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const jwtSecret = process.env.ADMIN_JWT_SECRET;
    const jwtExpiresIn = process.env.ADMIN_JWT_EXPIRES_IN || '1d'; // Default to 1 day

    if (!email || !password) {
        throw new AuthError('Please provide email and password', 400);
    }

    if (!jwtSecret) {
        console.error('ADMIN_JWT_SECRET is not defined in .env file for token generation.');
        throw new AuthError('Server configuration error - cannot generate token', 500);
    }

    const admin = await Admin.findOne({ email }).select('+password'); // Explicitly select password for comparison

    if (!admin) {
        throw new AuthError('Invalid credentials - admin not found', 401);
    }

    // Ensure admin has a password (might not if using ClerkId only for some admins)
    if (!admin.password) {
        throw new AuthError('Login not permitted for this admin account (no password set)', 401);
    }

    const isMatch = await admin.comparePassword(password);

    if (!isMatch) {
        throw new AuthError('Invalid credentials - password incorrect', 401);
    }

    if (!admin.isActive) {
        throw new AuthError('Admin account is not active. Please contact support.', 403);
    }

    // Update lastLogin timestamp
    admin.lastLogin = new Date();
    await admin.save();

    const payload = { id: admin._id, roles: admin.roles };
    const options: SignOptions = { expiresIn: jwtExpiresIn as any };

    const token = jwt.sign(
        payload, 
        jwtSecret, 
        options
    );

    res.status(200).json({
        success: true,
        message: 'Admin logged in successfully',
        token,
        admin: {
            id: admin._id,
            name: admin.name,
            email: admin.email,
            roles: admin.roles,
            avatar: admin.avatar,
            lastLogin: admin.lastLogin
        },
    });
});

/**
 * @desc    Get current logged-in admin profile
 * @route   GET /api/v1/auth/me
 * @access  Private (Protected by protectAdmin)
 */
export const getMe = asyncHandler(async (req: IAuthRequest, res: Response) => {
    // req.admin is populated by the protectAdmin middleware
    const admin = req.admin;

    if (!admin) {
        // This case should ideally be caught by protectAdmin, but as a safeguard:
        throw new AuthError('Admin profile not found in request. Ensure route is protected.', 404);
    }

    res.status(200).json({
        success: true,
        data: {
            id: admin._id,
            name: admin.name,
            email: admin.email,
            roles: admin.roles,
            permissions: admin.permissions,
            avatar: admin.avatar,
            status: admin.status,
            isActive: admin.isActive,
            lastLogin: admin.lastLogin,
            createdAt: admin.createdAt,
            updatedAt: admin.updatedAt
        },
    });
});

// Optional: Admin registration - consider if this is needed or if admins are created differently (e.g., seeded, super-admin only)
// For now, we will assume admins are created through a different mechanism. 