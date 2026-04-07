import { Router } from 'express';
import { IRoute } from '@/shared/interfaces';
import { HistoryLogController } from '@/controllers';
import { HistoryLogService } from '@/services/HistoryLogService';

/**
 * @openapi
 * /api/v1/history-log:
 *   get:
 *     tags: [HistoryLog]
 *     summary: Get all history logs
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: History logs fetched successfully
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
 *     tags: [HistoryLog]
 *     summary: Create a history log
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               actionType:
 *                 type: string
 *                 enum: [Entry, Exit, Refusal]
 *               details:
 *                 type: string
 *               dateTime:
 *                 type: string
 *                 format: date-time
 *             required: [actionType]
 *     responses:
 *       201:
 *         description: History log created successfully
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

export class HistoryLogRoute implements IRoute {
    private router: Router;
    private controller: HistoryLogController;

    constructor() {
        this.router = Router();
        const service = new HistoryLogService();
        this.controller = new HistoryLogController(service);
        this.initializeRoutes();
    }

    private initializeRoutes(): void {
        const handlers = this.controller.getHandlers();

        // GET /api/v1/history-log/
        this.router.get('/', handlers.getAllHistoryLogs);

        // POST /api/v1/history-log/
        this.router.post('/', handlers.createHistoryLog);
    }

    getRouter(): Router {
        return this.router;
    }
}

