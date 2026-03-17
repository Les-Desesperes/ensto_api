import { Request, Response, NextFunction } from 'express';

/**
 * Async handler wrapper to catch errors in async route handlers.
 * Prevents the need for try-catch in every controller method.
 * @param fn The async handler function to wrap
 * @returns A wrapped handler that catches errors and passes them to Express error handler
 */
export const asyncHandler = (
    fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) => {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

