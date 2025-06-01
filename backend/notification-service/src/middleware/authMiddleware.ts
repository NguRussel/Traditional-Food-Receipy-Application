import { Request, Response, NextFunction } from 'express';
import CustomError from '../utils/CustomError';

export interface IAuthRequest extends Request {
    user?: {
        id: string;
        roles: string[];
    };
}

export class AuthError extends CustomError {
    constructor(message: string) {
        super(message, 401);
        this.name = 'AuthError';
    }
}

export const protect = (req: IAuthRequest, res: Response, next: NextFunction) => {
    const userId = req.headers['x-user-id'] as string;
    const userRoles = req.headers['x-user-roles'] as string;

    if (!userId) {
        return next(new AuthError('User ID not provided. Authentication required.'));
    }

    req.user = {
        id: userId,
        roles: userRoles ? userRoles.split(',').map(role => role.trim()) : [],
    };

    next();
};

export const authorize = (roles: string[]) => {
    return (req: IAuthRequest, res: Response, next: NextFunction) => {
        if (!req.user || !req.user.roles) {
            return next(new AuthError('User not authenticated.'));
        }
        const hasRequiredRole = roles.some(role => req.user!.roles.includes(role));
        if (!hasRequiredRole) {
            return next(new CustomError('You do not have permission to perform this action', 403));
        }
        next();
    };
}; 