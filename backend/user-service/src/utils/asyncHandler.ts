import { Request, Response, NextFunction } from 'express';

/**
 * Wraps an async function to catch any errors and pass them to the next error-handling middleware.
 * @param fn The async function to wrap.
 * @returns A new function that handles errors.
 */
const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => 
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

export default asyncHandler; 