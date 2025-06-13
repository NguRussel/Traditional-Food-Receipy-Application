import { Request, Response, NextFunction } from 'express';
import asyncHandler from './asyncHandler';

// Custom Error class for Auth related errors
export class AuthError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, AuthError.prototype); // Ensure instanceof works
  }
}

// Interface for adding user to request object
export interface IAuthRequest extends Request {
  user?: {
    id: string;
    roles: string[];
  };
}

/**
 * Middleware to protect routes. Requires x-user-id and x-user-roles headers.
 * Populates req.user with id and roles.
 */
export const protect = asyncHandler(async (req: IAuthRequest, res: Response, next: NextFunction) => {
  const userId = req.headers['x-user-id'] as string;
  const userRolesHeader = req.headers['x-user-roles'] as string;

  if (userId && userRolesHeader !== undefined) { // userRolesHeader can be an empty string if no roles
    const roles = userRolesHeader ? userRolesHeader.split(',').map(role => role.trim()).filter(role => role.length > 0) : [];
    req.user = {
      id: userId,
      roles: roles,
    };
    next();
  } else {
    // This warning is for service-level debugging. The API Gateway should enforce primary auth.
    console.warn('[Analytics Service] Auth headers x-user-id or x-user-roles not found/invalid. Ensure API Gateway is configured.');
    return next(new AuthError('Not authorized, essential headers missing', 401));
  }
});

/**
 * Middleware to authorize users based on roles.
 * Must be used after the 'protect' middleware.
 * @param {...string[]} roles - The roles allowed to access the route.
 */
export const authorize = (...roles: string[]) => {
  return (req: IAuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !req.user.roles) {
      // This should ideally not happen if 'protect' middleware is used correctly.
      return next(new AuthError('Not authorized, user data not found in request', 403));
    }

    const hasRequiredRole = roles.some(role => req.user!.roles.includes(role));

    if (!hasRequiredRole) {
      return next(new AuthError(`User role(s) '${req.user.roles.join(', ')}' not authorized to access this route. Required: ${roles.join(' or ')}`, 403));
    }
    next();
  };
}; 