import { Request, Response, NextFunction } from 'express';
import { errorResponse } from '@/shared/utils/errorResponse';

/**
 * Bearer token authentication middleware.
 * Validates that the request contains a valid Bearer token in the Authorization header.
 */
export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        errorResponse(res, 401, 'Unauthorized: Missing or invalid Bearer token');
        return;
    }

    // TODO: Implement token validation logic (JWT, etc.)
    // For now, just verify the token exists
    const token = authHeader.substring(7);

    if (!token) {
        errorResponse(res, 401, 'Unauthorized: Empty token');
        return;
    }

    // Optionally attach the token to the request for later use
    (req as any).token = token;

    next();
};

