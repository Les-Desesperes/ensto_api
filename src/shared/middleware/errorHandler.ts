import { Request, Response, NextFunction } from 'express';
import { errorResponse } from '@/shared/utils/errorResponse';
import logger from '@/shared/logger';

/**
 * Global error handling middleware.
 * Catches all errors thrown by route handlers and sends a unified error response.
 */
export const errorHandler = (
    err: any,
    req: Request,
    res: Response,
    _next: NextFunction
): void => {
    logger.error({ err, path: req.originalUrl, method: req.method }, 'Unhandled application error');

    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    errorResponse(res, statusCode, message);
};

