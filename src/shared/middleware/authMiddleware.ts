import { Request, Response, NextFunction } from 'express';
import { errorResponse } from '@/shared/utils/errorResponse';
import { verifyAccessToken } from '@/utils/jwt';

const PUBLIC_API_PATHS = new Set(['/auth/login']);

const PUBLIC_API_PREFIXES = ['/employee/rfid/', '/portail/'];

const isPublicPath = (path: string): boolean => {
    if (PUBLIC_API_PATHS.has(path)) {
        return true;
    }

    return PUBLIC_API_PREFIXES.some((prefix) => path.startsWith(prefix));
};

/**
 * Bearer token authentication middleware.
 * Validates that the request contains a valid Bearer token in the Authorization header.
 */
export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    if (req.method === 'OPTIONS') {
        next();
        return;
    }

    if (isPublicPath(req.path)) {
        next();
        return;
    }

    const authHeader = req.headers.authorization;
    const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7).trim() : '';
    const cookieToken = req.cookies?.access_token ? String(req.cookies.access_token) : '';
    const token = bearerToken || cookieToken;

    if (!token) {
        errorResponse(res, 401, 'Unauthorized: Missing access token');
        return;
    }

    try {
        const payload = verifyAccessToken(token);
        req.authUser = payload;
        next();
    } catch (_err) {
        errorResponse(res, 401, 'Unauthorized: Invalid or expired token');
        return;
    }
};

