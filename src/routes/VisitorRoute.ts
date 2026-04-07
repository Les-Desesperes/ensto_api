import { Router } from 'express';
import { IRoute } from '@/shared/interfaces';
import { VisitorController } from '@/controllers';
import { VisitorService } from '@/services/VisitorService';

/**
 * @openapi
 * /api/v1/visitor:
 *   get:
 *     tags: [Visitor]
 *     summary: Get all visitors
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Visitors fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   post:
 *     tags: [Visitor]
 *     summary: Create a visitor
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *               company:
 *                 type: string
 *               arrivalTime:
 *                 type: string
 *                 format: date-time
 *             required: [fullName, company, arrivalTime]
 *     responses:
 *       201:
 *         description: Visitor created successfully
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
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

export class VisitorRoute implements IRoute {
    private router: Router;
    private controller: VisitorController;

    constructor() {
        this.router = Router();
        const service = new VisitorService();
        this.controller = new VisitorController(service);
        this.initializeRoutes();
    }

    private initializeRoutes(): void {
        const handlers = this.controller.getHandlers();

        // GET /api/v1/visitor/
        this.router.get('/', handlers.getAllVisitors);

        // POST /api/v1/visitor/
        this.router.post('/', handlers.createVisitor);
    }

    getRouter(): Router {
        return this.router;
    }
}

