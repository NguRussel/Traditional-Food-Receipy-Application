import { Request, Response, NextFunction } from 'express';

// Define a custom request interface that includes the user property
export interface IAuthRequest extends Request {
    user?: { // Make user optional as it's added by middleware
        id: string;
        roles: string[];
    };
}

// Custom Error for Authentication
export class AuthError extends Error {
    statusCode: number;
    constructor(message: string, statusCode: number = 401) {
        super(message);
        this.statusCode = statusCode;
        Object.setPrototypeOf(this, AuthError.prototype);
    }
}

/**
 * Middleware to protect routes that require authentication.
 * It checks for x-user-id and x-user-roles headers (simulating API Gateway authentication).
 */
export const protect = (req: IAuthRequest, res: Response, next: NextFunction) => {
    const userId = req.headers['x-user-id'] as string;
    const userRolesHeader = req.headers['x-user-roles'] as string;

    if (!userId || typeof userRolesHeader !== 'string') { // Ensures userRolesHeader is a string, allows empty string
        return next(new AuthError('Not authorized, no user credentials provided', 401));
    }

    try {
        const roles = userRolesHeader.split(',').map(role => role.trim());
        req.user = { id: userId, roles };
        next();
    } catch (error) {
        console.error('Error processing user roles:', error);
        return next(new AuthError('Not authorized, token processing failed', 401));
    }
};

/**
 * Middleware to authorize users based on roles.
 * @param allowedRoles - An array of roles allowed to access the route.
 */
export const authorize = (allowedRoles: string[]) => {
    return (req: IAuthRequest, res: Response, next: NextFunction) => {
        if (!req.user || !req.user.roles) {
            return next(new AuthError('Not authorized, user roles not available', 401));
        }

        const hasRequiredRole = req.user.roles.some(role => allowedRoles.includes(role));

        if (!hasRequiredRole) {
            return next(new AuthError(`User role(s) '${req.user.roles.join(', ')}' not authorized to access this route. Allowed roles: ${allowedRoles.join(', ')}`, 403));
        }
        next();
    };
}; 