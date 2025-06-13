import { Request, Response, NextFunction } from 'express';

/**
 * Wraps an asynchronous Express route handler to catch any errors and pass them to the next middleware.
 * @param fn The asynchronous function to wrap (req: Request, res: Response, next: NextFunction) => Promise<any>
 * @returns A function that can be used as Express middleware.
 */
const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => 
  (req: Request, res: Response, next: NextFunction): Promise<void> => 
    Promise.resolve(fn(req, res, next)).catch(next);

export default asyncHandler; 