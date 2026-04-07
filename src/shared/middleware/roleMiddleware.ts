import { NextFunction, Request, Response } from 'express';
import { errorResponse } from '@/shared/utils/errorResponse';
import { EmployeeRole } from '@/utils/jwt';

export const roleMiddleware = (...allowedRoles: EmployeeRole[]) => {
    return (req: Request, res: Response, next: NextFunction): void => {
        const user = req.authUser;

        if (!user) {
            errorResponse(res, 401, 'Unauthorized');
            return;
        }

        if (!allowedRoles.includes(user.role)) {
            errorResponse(res, 403, 'Forbidden: insufficient permissions');
            return;
        }

        next();
    };
};

