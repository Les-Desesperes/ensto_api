import { Router } from 'express';
import { IRoute } from '@/shared/interfaces';
import { VehicleController } from '@/controllers';
import { VehicleService } from '@/services';

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

        // GET /api/v1/vehicle/ - Fetch all vehicles
        this.router.get('/', handlers.getAllVehicles);

        // GET /api/v1/vehicle/plate/:licensePlate - Get vehicle by license plate
        this.router.get('/plate/:licensePlate', handlers.getVehicleByPlate);
    }

    /**
     * IRoute interface implementation
     * @returns The configured Express router
     */
    getRouter(): Router {
        return this.router;
    }
}

