import { Request, Response, Router } from 'express';
import { z } from 'zod';
import { IController } from '@/shared/interfaces';
import { AuthService } from '@/services/AuthService';
import { asyncHandler, successResponse } from '@/shared/utils';

const loginSchema = z.object({
    username: z.string().min(1, 'username is required'),
    password: z.string().min(1, 'password is required'),
});

export class AuthController implements IController {
    private readonly authService: AuthService;

    constructor(authService: AuthService) {
        this.authService = authService;
        this.login = this.login.bind(this);
    }

    private async login(req: Request, res: Response): Promise<void> {
        const parsed = loginSchema.safeParse(req.body);

        if (!parsed.success) {
            throw {
                statusCode: 400,
                message: parsed.error.issues.map((issue) => issue.message).join(', '),
            };
        }

        const { username, password } = parsed.data;
        const result = await this.authService.login(username, password);

        res.cookie('access_token', result.accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: result.expiresInMs,
        });

        successResponse(res, 200, {
            token: result.accessToken,
            tokenType: result.tokenType,
            expiresInMs: result.expiresInMs,
            user: result.user,
        }, 'Login successful');
    }

    public getHandlers() {
        return {
            login: asyncHandler(this.login),
        };
    }

    getRouter(): Router {
        return {} as Router;
    }
}

