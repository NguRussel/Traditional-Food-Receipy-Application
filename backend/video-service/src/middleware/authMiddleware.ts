import { Request, Response, NextFunction } from 'express';

// Extend Express Request interface to include user information
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: 'user' | 'chef' | 'admin';
      };
    }
  }
}

// Middleware to check if user is authenticated
export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  // In a real application, this would verify a JWT token or session
  // For now, we'll assume the authentication is handled by an API Gateway
  // and user information is passed in headers
  
  const userId = req.headers['x-user-id'] as string;
  const userRole = req.headers['x-user-role'] as 'user' | 'chef' | 'admin';
  
  if (!userId || !userRole) {
    return res.status(401).json({ message: 'Unauthorized: Authentication required' });
  }
  
  // Attach user info to request object
  req.user = {
    id: userId,
    role: userRole
  };
  
  next();
};

// Middleware to check if user is a chef
export const isChef = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized: Authentication required' });
  }
  
  if (req.user.role !== 'chef') {
    return res.status(403).json({ message: 'Forbidden: Chef access required' });
  }
  
  next();
};

// Middleware to check if user is an admin
export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized: Authentication required' });
  }
  
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden: Admin access required' });
  }
  
  next();
};

// Middleware to check if user is either a chef or an admin
export const isChefOrAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized: Authentication required' });
  }
  
  if (req.user.role !== 'chef' && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden: Chef or Admin access required' });
  }
  
  next();
};