import { Request, Response, NextFunction } from 'express';
import asyncHandler from './asyncHandler';

// Custom Error Class for Authentication
export class AuthError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number = 401) {
    super(message);
    this.name = 'AuthError';
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, AuthError.prototype);
  }
}

// Define a custom request interface that includes the user property
export interface IAuthRequest extends Request {
  user?: { 
    id: string; 
    roles: string[]; 
  };
}

/**
 * Middleware to protect routes by checking for user identification headers.
 */
export const protect = asyncHandler(async (req: IAuthRequest, res: Response, next: NextFunction) => {
  const userId = req.headers['x-user-id'] as string;
  const userRolesHeader = req.headers['x-user-roles'];

  if (userId && typeof userRolesHeader === 'string') {
    const roles = (userRolesHeader as string)
                        .split(',')
                        .map(role => role.trim())
                        .filter(role => role.length > 0);
    req.user = {
      id: userId,
      roles: roles,
    };
    next();
  } else {
    console.warn('[AI Assistant Service] Auth headers x-user-id or x-user-roles not found/invalid. Ensure API Gateway is configured.');
    return next(new AuthError('Not authorized, token failed or headers missing', 401));
  }
});

/**
 * Middleware to authorize users based on roles.
 * @param roles - An array of roles that are allowed to access the route.
 */
export const authorize = (...roles: string[]) => {
  return (req: IAuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !req.user.roles) {
      return next(new AuthError('Not authorized to access this route (no user data after protect middleware)', 403));
    }

    const hasRequiredRole = roles.some(role => req.user!.roles.includes(role));

    if (!hasRequiredRole) {
      return next(new AuthError(`User role(s) (${req.user.roles.join(', ')}) not authorized. Required: ${roles.join(', ')}`, 403));
    }
    next();
  };
}; 