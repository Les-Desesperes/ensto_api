import { Router } from 'express';
import { IRoute } from '@/shared/interfaces';
import { DeliveryDriverController } from '@/controllers';
import { DeliveryDriverService } from '@/services';

/**
 * @openapi
 * /api/v1/driver:
 *   get:
 *     tags: [Driver]
 *     summary: Get all delivery drivers
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Drivers fetched successfully
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
 *     tags: [Driver]
 *     summary: Create a delivery driver
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
 *               companyId:
 *                 type: string
 *               ppeCharterValid:
 *                 type: boolean
 *               ppeSignatureDate:
 *                 type: string
 *                 format: date-time
 *             required: [firstName, lastName, companyId]
 *     responses:
 *       201:
 *         description: Driver created successfully
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

/**
 * DeliveryDriverRoute
 * Responsible for initializing the controller and binding Express router endpoints.
 * This class handles all driver-related routes.
 * 
 * SOLID Principles:
 * - Single Responsibility: Only manages routing for driver endpoints
 * - Dependency Inversion: Creates and injects dependencies in a controlled manner
 */
export class DeliveryDriverRoute implements IRoute {
    private router: Router;
    private controller: DeliveryDriverController;

    /**
     * Constructor
     * Creates a new service instance, passes it to the controller via dependency injection,
     * and binds all routes.
     */
    constructor() {
        this.router = Router();
        
        // Dependency Injection: Create service and pass to controller
        const service = new DeliveryDriverService();
        this.controller = new DeliveryDriverController(service);

        // Initialize routes
        this.initializeRoutes();
    }

    /**
     * Initializes all driver-related routes
     */
    private initializeRoutes(): void {
        const handlers = this.controller.getHandlers();

        // GET /api/v1/driver/ - Fetch all drivers
        this.router.get('/', handlers.getAllDrivers);

        // POST /api/v1/driver/ - Create a new driver
        this.router.post('/', handlers.createDriver);
    }

    /**
     * IRoute interface implementation
     * @returns The configured Express router
     */
    getRouter(): Router {
        return this.router;
    }
}

