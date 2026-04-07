import { Router } from 'express';
import { IRoute } from '@/shared/interfaces';
import { AuthController } from '@/controllers/AuthController';
import { AuthService } from '@/services/AuthService';

/**
 * @openapi
 * /api/v1/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Authenticate employee
 *     description: Returns a JWT token and sets it as secure httpOnly cookie.
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login success
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
export class AuthRoute implements IRoute {
    private readonly router: Router;
    private readonly controller: AuthController;

    constructor() {
        this.router = Router();
        const service = new AuthService();
        this.controller = new AuthController(service);
        this.initializeRoutes();
    }

    private initializeRoutes(): void {
        const handlers = this.controller.getHandlers();
        this.router.post('/login', handlers.login);
    }

    getRouter(): Router {
        return this.router;
    }
}

