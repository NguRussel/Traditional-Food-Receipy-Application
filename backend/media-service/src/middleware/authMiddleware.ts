import { Request, Response, NextFunction } from 'express';
import CustomError from '../utils/CustomError';

export interface IAuthRequest extends Request {
  user?: { id: string; roles: string[] };
}

export class AuthError extends CustomError {
  constructor(message: string) {
    super(message, 401); // Unauthorized
    this.name = 'AuthError';
  }
}

export const protect = (req: IAuthRequest, res: Response, next: NextFunction) => {
  const userId = req.headers['x-user-id'] as string;
  const userRoles = req.headers['x-user-roles'] as string;

  if (!userId) {
    return next(new AuthError('User ID not provided. Authentication required.'));
  }

  let rolesArray: string[] = [];
  if (userRoles) {
    try {
      rolesArray = JSON.parse(userRoles);
      if (!Array.isArray(rolesArray)) {
        rolesArray = [userRoles]; // Treat as a single role if not an array string
      }
    } catch (error) {
      // If parsing fails, assume it might be a single role string or comma-separated
      rolesArray = userRoles.split(',').map(role => role.trim()).filter(role => role.length > 0);
    }
  } else {
    // If x-user-roles is not present, assign a default role or handle as an error
    // For now, let's assume a default 'user' role if no roles are provided
    // THIS IS A PLACEHOLDER: In a real scenario, you might require roles or have a default
    rolesArray = ['user']; 
    // Alternatively, you could throw an error:
    // return next(new AuthError('User roles not provided. Authentication required.'));
  }

  req.user = { id: userId, roles: rolesArray };
  next();
};

export const authorize = (allowedRoles: string[]) => {
  return (req: IAuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !req.user.roles) {
      return next(new AuthError('Authentication required. No user roles found.'));
    }

    const hasPermission = req.user.roles.some(role => allowedRoles.includes(role));

    if (!hasPermission) {
      return next(new CustomError('You do not have permission to perform this action', 403)); // Forbidden
    }
    next();
  };
}; 