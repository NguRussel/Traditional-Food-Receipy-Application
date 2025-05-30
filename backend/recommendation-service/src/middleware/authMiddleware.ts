import { Request, Response, NextFunction } from 'express';

// Define a custom request interface that includes the user property
export interface IAuthRequest extends Request {
  user?: { id: string; roles: string[] }; // Make user optional as it's added by 'protect' middleware
}

// Custom Error class for Authentication/Authorization errors
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
 * Middleware to protect routes by checking for user identification headers.
 * It simulates an authenticated user by reading headers like 'x-user-id' and 'x-user-roles'.
 * In a real microservices setup, these headers would be set by an API Gateway after validating a token.
 */
export const protect = (req: IAuthRequest, res: Response, next: NextFunction): void => {
  const userId = req.headers['x-user-id'] as string;
  const userRolesHeader = req.headers['x-user-roles'] as string;

  if (!userId) {
    return next(new AuthError('User ID not provided. Access denied.', 401));
  }

  let roles: string[] = [];
  if (userRolesHeader) {
    roles = userRolesHeader.split(',').map(role => role.trim());
  }

  // Attach user information to the request object
  req.user = { id: userId, roles };
  next();
};

/**
 * Middleware to authorize users based on their roles.
 * @param allowedRoles - An array of roles that are allowed to access the route.
 */
export const authorize = (allowedRoles: string[]) => {
  return (req: IAuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !req.user.roles) {
      return next(new AuthError('User roles not available. Authorization check failed.', 403));
    }

    const hasRequiredRole = req.user.roles.some(role => allowedRoles.includes(role));

    if (!hasRequiredRole) {
      return next(new AuthError(`Forbidden. User does not have the required roles. Allowed: ${allowedRoles.join(', ')}`, 403));
    }
    next();
  };
}; 