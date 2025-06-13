import { Request, Response, NextFunction } from 'express';

/**
 * Wraps an asynchronous route handler function to catch any errors and pass them to the next error-handling middleware.
 * @param fn The asynchronous route handler function.
 * @returns A new function that Express can use as a route handler.
 */
const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => 
  (req: Request, res: Response, next: NextFunction): Promise<void> => {
    return Promise.resolve(fn(req, res, next)).catch(next);
  };

export default asyncHandler; 