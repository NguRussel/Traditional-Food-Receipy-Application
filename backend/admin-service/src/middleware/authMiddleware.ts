import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Admin, IAdmin, AdminRole } from '../models/Admin'; // Assuming Admin model is in ../models/Admin

export interface IAuthRequest extends Request {
    admin?: IAdmin; // Make admin optional as it's added by middleware
}

// Custom Error for Authentication & Authorization
export class AuthError extends Error {
    statusCode: number;
    constructor(message: string, statusCode: number = 401) {
        super(message);
        this.statusCode = statusCode;
        Object.setPrototypeOf(this, AuthError.prototype);
    }
}

/**
 * Middleware to protect routes that require admin authentication.
 * It checks for a JWT in the Authorization header (Bearer token).
 */
export const protectAdmin = async (req: IAuthRequest, res: Response, next: NextFunction) => {
    let token;
    const jwtSecret = process.env.ADMIN_JWT_SECRET;

    if (!jwtSecret) {
        console.error('ADMIN_JWT_SECRET is not defined in .env file');
        return next(new AuthError('Server configuration error', 500));
    }

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, jwtSecret) as { id: string };
            
            const adminUser = await Admin.findById(decoded.id).select('-password'); // Exclude password

            if (!adminUser) {
                return next(new AuthError('Not authorized, admin not found', 401));
            }
            if (!adminUser.isActive) {
                return next(new AuthError('Not authorized, admin account is not active', 403));
            }

            req.admin = adminUser;
            next();
        } catch (error) {
            console.error('Admin token verification error:', error);
            if (error instanceof jwt.JsonWebTokenError) {
                return next(new AuthError('Not authorized, token failed', 401));
            }
            return next(new AuthError('Not authorized, issue with token processing', 401));
        }
    } else {
        return next(new AuthError('Not authorized, no token provided', 401));
    }
};

/**
 * Middleware to authorize admins based on roles.
 * @param allowedRoles - An array of AdminRole enum values allowed to access the route.
 */
export const authorizeAdminRoles = (allowedRoles: AdminRole[]) => {
    return (req: IAuthRequest, res: Response, next: NextFunction) => {
        if (!req.admin || !req.admin.roles) {
            return next(new AuthError('Not authorized, admin roles not available', 401));
        }

        const hasRequiredRole = req.admin.roles.some(role => allowedRoles.includes(role));

        if (!hasRequiredRole) {
            return next(new AuthError(`Admin role(s) '${req.admin.roles.join(', ')}' not authorized. Required: ${allowedRoles.join(', ')}`, 403));
        }
        next();
    };
};

/**
 * Middleware to authorize admins based on specific permissions.
 * @param requiredPermissions - An array of permission strings required to access the route.
 */
export const authorizeAdminPermissions = (requiredPermissions: string[]) => {
    return (req: IAuthRequest, res: Response, next: NextFunction) => {
        if (!req.admin || !req.admin.permissions) {
            return next(new AuthError('Not authorized, admin permissions not available', 401));
        }

        const hasAllPermissions = requiredPermissions.every(perm => req.admin!.permissions.includes(perm));

        if (!hasAllPermissions) {
            return next(new AuthError(`Admin does not have all required permissions. Required: ${requiredPermissions.join(', ')}`, 403));
        }
        next();
    };
}; 