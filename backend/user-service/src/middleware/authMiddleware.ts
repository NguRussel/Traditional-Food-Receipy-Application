import { Request, Response, NextFunction } from 'express';

export interface IUserPayload {
  id: string; // Clerk ID, will be mapped to clerkId in User model
  roles: string[];
  // Add other relevant properties from the JWT or gateway header
}

export interface IAuthRequest extends Request {
  user?: IUserPayload;
}

export class AuthError extends Error {
  status: number;
  constructor(message: string, status: number = 401) {
    super(message);
    this.name = 'AuthError';
    this.status = status;
  }
}

export const protect = (req: IAuthRequest, res: Response, next: NextFunction) => {
  const userId = req.headers['x-user-id'] as string;
  const userRoles = req.headers['x-user-roles'] as string;

  if (!userId) {
    return next(new AuthError('User ID not found in headers', 401));
  }

  req.user = {
    id: userId,
    roles: userRoles ? userRoles.split(',').map(role => role.trim()) : [],
  };

  next();
};

export const authorize = (allowedRoles: string[]) => {
  return (req: IAuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !req.user.roles) {
      return next(new AuthError('User not authenticated', 401));
    }

    const hasRequiredRole = req.user.roles.some(role => allowedRoles.includes(role));

    if (!hasRequiredRole) {
      return next(new AuthError('User not authorized for this action', 403));
    }
    next();
  };
}; 