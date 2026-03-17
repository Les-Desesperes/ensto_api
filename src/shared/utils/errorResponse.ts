import { Response } from 'express';

/**
 * Unified error response structure.
 * All errors should be returned in this format: { success: false, message: string }
 */
export const errorResponse = (res: Response, statusCode: number, message: string): void => {
    res.status(statusCode).json({
        success: false,
        message,
    });
};

/**
 * Unified success response structure.
 * All successful responses should use this format: { success: true, data/message: any }
 */
export const successResponse = (
    res: Response,
    statusCode: number,
    data: any,
    message?: string
): void => {
    const response: any = {
        success: true,
    };

    if (message) {
        response.message = message;
    }

    if (data) {
        response.data = data;
    }

    res.status(statusCode).json(response);
};

