import { Router } from 'express';
import { IRoute } from '@/shared/interfaces';
import { CompanyController } from '@/controllers';
import { CompanyService } from '@/services';

/**
 * @openapi
 * /api/v1/company:
 *   get:
 *     tags: [Company]
 *     summary: Get all companies
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Companies fetched successfully
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
 *
 * /api/v1/company/{name}:
 *   get:
 *     tags: [Company]
 *     summary: Get a company by name
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *         description: Company name
 *     responses:
 *       200:
 *         description: Company fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       404:
 *         description: Company not found
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

export class CompanyRoute implements IRoute {
    private router: Router;
    private controller: CompanyController;

    constructor() {
        this.router = Router();
        const service = new CompanyService();
        this.controller = new CompanyController(service);
        this.initializeRoutes();
    }

    private initializeRoutes(): void {
        const handlers = this.controller.getHandlers();

        // GET /api/v1/company/ - Fetch all companies
        this.router.get('/', handlers.getAllCompanies);

        // GET /api/v1/company/:name - Fetch one company summary by name
        this.router.get('/:name', handlers.getCompanyByName);
    }

    getRouter(): Router {
        return this.router;
    }
}

