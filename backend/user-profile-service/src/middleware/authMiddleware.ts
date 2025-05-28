import { Request, Response, NextFunction } from 'express';
import verifySessionToken from '@clerk/clerk-sdk-node';

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.replace('Bearer ', '').trim();
    const session = await verifySessionToken(token);

    if (!session || !session.sub) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    // Attach user info to request
    req.user = { userId: session.sub };
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
};