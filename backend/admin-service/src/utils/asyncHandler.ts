import { Request, Response, NextFunction } from 'express';

/**
 * A higher-order function to wrap asynchronous route handlers and catch errors.
 * @param fn The asynchronous function to execute.
 * @returns A function that executes the handler and catches any errors, passing them to the next middleware.
 */
const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => {
    return (req: Request, res: Response, next: NextFunction) => {
        fn(req, res, next).catch(next);
    };
};

export default asyncHandler; 