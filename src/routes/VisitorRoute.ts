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
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               company:
 *                 type: string
 *               employee:
 *                 type: string
 *               arrivalTime:
 *                 type: string
 *                 format: date-time
 *             required: [firstName, lastName, company, employee, arrivalTime]
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
 *
 * /api/v1/visitor/{id}:
 *   get:
 *     tags: [Visitor]
 *     summary: Get visitor by id
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Visitor fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       404:
 *         description: Visitor not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   patch:
 *     tags: [Visitor]
 *     summary: Update visitor by id
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               company:
 *                 type: string
 *               employee:
 *                 type: string
 *               arrivalTime:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Visitor updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *   delete:
 *     tags: [Visitor]
 *     summary: Delete visitor by id
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Visitor deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
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

        // GET /api/v1/visitor/:id
        this.router.get('/:id', handlers.getVisitorById);

        // POST /api/v1/visitor/
        this.router.post('/', handlers.createVisitor);

        // PATCH /api/v1/visitor/:id
        this.router.patch('/:id', handlers.patchVisitor);

        // DELETE /api/v1/visitor/:id
        this.router.delete('/:id', handlers.deleteVisitor);
    }

    getRouter(): Router {
        return this.router;
    }
}
