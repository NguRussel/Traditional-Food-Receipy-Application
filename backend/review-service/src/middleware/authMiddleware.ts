import { Request, Response, NextFunction } from 'express';

// Interface for adding user to request object
export interface IAuthRequest extends Request {
  user?: {
    id: string;
    roles: string[];
  };
}

// Custom Error for Auth related issues
export class AuthError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, AuthError.prototype);
  }
}

// Middleware to protect routes by checking for user ID and roles in headers
export const protect = (req: IAuthRequest, res: Response, next: NextFunction) => {
  const userId = req.headers['x-user-id'] as string;
  const userRoles = req.headers['x-user-roles'] as string;

  if (!userId) {
    return next(new AuthError('User ID not provided. Access denied.', 401));
  }

  req.user = {
    id: userId,
    roles: userRoles ? userRoles.split(',').map(role => role.trim()) : [],
  };

  next();
};

// Middleware to authorize based on roles
export const authorize = (allowedRoles: string[]) => {
  return (req: IAuthRequest, res: Response, next: NextFunction) => {
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