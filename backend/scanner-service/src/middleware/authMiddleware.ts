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
  user?: { // Assuming Clerk passes user info this way after validation in API Gateway
    id: string; 
    roles: string[]; 
    // Add other user properties if needed, e.g., permissions
  };
}

/**
 * Middleware to protect routes. 
 * It checks for a user object on the request, which is assumed to be populated 
 * by an upstream authentication service (e.g., API Gateway with Clerk integration).
 */
export const protect = asyncHandler(async (req: IAuthRequest, res: Response, next: NextFunction) => {
  // In a microservice setup, JWT validation might be handled by the API Gateway.
  // This middleware can then check if the gateway has successfully authenticated the user
  // and attached user information to the request.
  
  // Example: Check for x-user-id and x-user-roles headers if set by gateway
  const userId = req.headers['x-user-id'] as string;
  const userRolesHeader = req.headers['x-user-roles'];

  if (userId && typeof userRolesHeader === 'string') {
    const roles = userRolesHeader.split(',').map(role => role.trim()).filter(role => role.length > 0);
    req.user = {
      id: userId,
      roles: roles,
    };
    next();
  } else {
    // If running standalone or for testing, you might implement local JWT validation here
    // For now, we'll assume the gateway handles it. If not present, it's an error.
    console.warn('Auth headers x-user-id or x-user-roles not found or not a string. Ensure API Gateway is configured correctly.');
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
      return next(new AuthError('Not authorized to access this route (no user data)', 403));
    }

    const hasRequiredRole = roles.some(role => req.user!.roles.includes(role));

    if (!hasRequiredRole) {
      return next(new AuthError(`User role(s) (${req.user.roles.join(', ')}) not authorized to access this route. Required: ${roles.join(', ')}`, 403));
    }
    next();
  };
}; 