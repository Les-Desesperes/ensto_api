import { Request, Response, NextFunction } from 'express';
import { errorResponse } from '@/shared/utils/errorResponse';

/**
 * Global error handling middleware.
 * Catches all errors thrown by route handlers and sends a unified error response.
 */
export const errorHandler = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    console.error('🔴 Error:', err);

    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    errorResponse(res, statusCode, message);
};

