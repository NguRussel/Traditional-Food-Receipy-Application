import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserCacheService } from '../services/userCacheService';

// Extend Request interface to include user info
interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    clerkId: string;
    email: string;
    role: string;
  };
}

export const authMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'No token provided' });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
    
    if (!decoded || !decoded.userId) {
      res.status(401).json({ error: 'Invalid token' });
      return;
    }

    // Check if user session exists in cache
    const sessionId = `${decoded.userId}_${Date.now()}`;
    const cachedSession = await UserCacheService.getUserSession(sessionId);
    
    // Attach user info to request
    req.user = {
      userId: decoded.userId,
      clerkId: decoded.clerkId || decoded.sub,
      email: decoded.email,
      role: decoded.role || 'user'
    };

    // Update last login time for active users
    if (decoded.userId) {
      // Don't await this to avoid slowing down requests
      UserCacheService.updateLastLogin(decoded.userId).catch(err => 
        console.error('Failed to update last login:', err)
      );
    }

    next();

  } catch (error) {
    console.error('Auth middleware error:', error);
    
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ error: 'Invalid token' });
      return;
    }
    
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({ error: 'Token expired' });
      return;
    }

    res.status(500).json({ error: 'Authentication failed' });
  }
};

// Optional middleware for admin-only routes
export const adminMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
    res.status(403).json({ error: 'Admin access required' });
    return;
  }

  next();
};

// Optional middleware for chef-only routes
export const chefMiddleware = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  if (req.user.role !== 'chef' && req.user.role !== 'admin' && req.user.role !== 'super_admin') {
    res.status(403).json({ error: 'Chef access required' });
    return;
  }

  next();
};

export default authMiddleware; 