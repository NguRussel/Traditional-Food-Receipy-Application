import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';

// Extend the Express Request interface to include a user property
export interface IAuthRequest extends Request {
  user?: {
    id: string | Types.ObjectId; // User ID from JWT (passed by API Gateway)
    roles: string[];        // User roles from JWT (passed by API Gateway)
    // Add any other user properties you expect from the gateway
  };
}

// Custom Error class for better error handling (optional, but good practice)
export class AuthError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number = 401) {
    super(message);
    this.name = 'AuthError';
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, AuthError.prototype);
  }
}

/**
 * Middleware to protect routes by checking for user information in headers.
 * Assumes API Gateway has validated JWT and passed user info in headers like:
 * X-User-Id, X-User-Roles (comma-separated)
 */
export const protect = (req: IAuthRequest, res: Response, next: NextFunction) => {
  const userId = req.headers['x-user-id'] as string;
  const userRolesHeader = req.headers['x-user-roles'] as string;

  if (!userId) {
    return next(new AuthError('Not authenticated: User ID missing from request headers', 401));
  }

  const roles = userRolesHeader ? userRolesHeader.split(',').map(role => role.trim()) : [];

  req.user = {
    id: userId,
    roles: roles,
  };

  next();
};

/**
 * Middleware to authorize users based on their roles.
 * Must be used AFTER the `protect` middleware.
 * @param {...string} allowedRoles - Roles allowed to access the route.
 */
export const authorize = (...allowedRoles: string[]) => {
  return (req: IAuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !req.user.roles) {
      return next(new AuthError('Not authorized: User roles not found. Ensure `protect` middleware is used first.', 403));
    }

    const hasRequiredRole = req.user.roles.some(role => allowedRoles.includes(role));

    if (!hasRequiredRole) {
      return next(new AuthError(`Not authorized: User role (${req.user.roles.join(', ')}) not permitted for this resource. Allowed: ${allowedRoles.join(', ')}`, 403));
    }
    next();
  };
};

// Example of how it might be used in routes:
// import { protect, authorize } from '../middleware/authMiddleware';
// router.post('/', protect, authorize('chef', 'admin'), createRecipe);
// router.get('/admin/pending', protect, authorize('admin'), getPendingRecipes); 