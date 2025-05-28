import { Request, Response, NextFunction } from 'express';
import { ClerkExpressWithAuth } from '@clerk/clerk-sdk-node';

export const clerkAuth = ClerkExpressWithAuth({
  // Optionally, you can add custom logic here
});

export const requireClerkAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!req.auth || !req.auth.userId) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  next();
};