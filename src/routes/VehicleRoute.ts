import { Router } from 'express';
import { IRoute } from '@/shared/interfaces';
import { VehicleController } from '@/controllers';
import { VehicleService } from '@/services';

/**
 * @openapi
 * /api/v1/vehicle:
 *   get:
 *     tags: [Vehicle]
 *     summary: Get all vehicles
 *     description: Returns all vehicles with related driver details.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Vehicles fetched successfully
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
 * /api/v1/vehicle/plate/{licensePlate}:
 *   get:
 *     tags: [Vehicle]
 *     summary: Get vehicle by license plate
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: licensePlate
 *         required: true
 *         schema:
 *           type: string
 *         description: Vehicle license plate
 *     responses:
 *       200:
 *         description: Vehicle fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       404:
 *         description: Vehicle not found
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
 *
 * /api/v1/vehicle/temp-plate:
 *   post:
 *     tags: [Vehicle]
 *     summary: Store temporary license plate
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/StoreTempPlateBody'
 *     responses:
 *       200:
 *         description: Temporary plate stored
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Invalid input
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
 *   get:
 *     tags: [Vehicle]
 *     summary: Get temporary license plate
 *     description: Returns the stored temporary plate. If that plate matches an existing vehicle, driver and company details are included.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Temporary plate fetched
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
 */

/**
 * VehicleRoute
 * Responsible for initializing the controller and binding Express router endpoints.
 * This class handles all vehicle-related routes.
 * 
 * SOLID Principles:
 * - Single Responsibility: Only manages routing for vehicle endpoints
 * - Dependency Inversion: Creates and injects dependencies in a controlled manner
 */
export class VehicleRoute implements IRoute {
    private router: Router;
    private controller: VehicleController;

    /**
     * Constructor
     * Creates a new service instance, passes it to the controller via dependency injection,
     * and binds all routes.
     */
    constructor() {
        this.router = Router();
        
        // Dependency Injection: Create service and pass to controller
        const service = new VehicleService();
        this.controller = new VehicleController(service);

        // Initialize routes
        this.initializeRoutes();
    }

    /**
     * Initializes all vehicle-related routes
     */
    private initializeRoutes(): void {
        const handlers = this.controller.getHandlers();
        const storeTempPlateHandler = handlers.storeTempPlate ?? handlers.storeTemporaryPlate;
        const getTempPlateHandler = handlers.getTempPlate ?? handlers.getTemporaryPlate;

        // GET /api/v1/vehicle/ - Fetch all vehicles
        this.router.get('/', handlers.getAllVehicles);

        // GET /api/v1/vehicle/plate/:licensePlate - Get vehicle by license plate
        this.router.get('/plate/:licensePlate', handlers.getVehicleByPlate);

        // POST /api/v1/vehicle/temp-plate - Store a temporary license plate
        this.router.post('/temp-plate', storeTempPlateHandler);

        // GET /api/v1/vehicle/temp-plate - Retrieve the temporary license plate
        this.router.get('/temp-plate', getTempPlateHandler);
    }

    /**
     * IRoute interface implementation
     * @returns The configured Express router
     */
    getRouter(): Router {
        return this.router;
    }
}

