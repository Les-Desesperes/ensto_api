import { Request, Response, Router } from 'express';
import { IController } from '@/shared/interfaces';
import { VehicleService } from '@/services';
import { asyncHandler, successResponse } from '@/shared/utils';

/**
 * VehicleController
 * Handles HTTP requests for vehicle operations.
 * Uses Dependency Injection to receive the service instance via constructor.
 * 
 * SOLID Principles:
 * - Single Responsibility: Only handles HTTP request/response for vehicle operations
 * - Open/Closed: Open for extension (can add new methods), closed for modification
 * - Dependency Inversion: Depends on injected VehicleService, not concrete implementations
 * - Interface Segregation: Implements only IController interface
 */
export class VehicleController implements IController {
    private vehicleService: VehicleService;

    /**
     * Constructor with Dependency Injection
     * @param vehicleService - The VehicleService instance
     */
    constructor(vehicleService: VehicleService) {
        this.vehicleService = vehicleService;
        // Bind methods to ensure 'this' context is preserved in Express routes
        this.getVehicleByPlate = this.getVehicleByPlate.bind(this);
        this.getAllVehicles = this.getAllVehicles.bind(this);
        this.storeTempPlate = this.storeTempPlate.bind(this);
        this.getTempPlate = this.getTempPlate.bind(this);
    }

    /**
     * GET handler: Fetch vehicle by license plate
     * Route: GET /api/v1/vehicle/plate/:licensePlate
     * @param req - Express request object with licensePlate parameter
     * @param res - Express response object
     */
    private async getVehicleByPlate(req: Request, res: Response): Promise<void> {
        const licensePlate = req.params.licensePlate as string;
        const vehicle = await this.vehicleService.getVehicleByPlate(licensePlate);
        successResponse(res, 200, vehicle);
    }

    /**
     * GET handler: Fetch all vehicles
     * Route: GET /api/v1/vehicle/
     * @param req - Express request object
     * @param res - Express response object
     */
    private async getAllVehicles(req: Request, res: Response): Promise<void> {
        const vehicles = await this.vehicleService.getAllVehicles();
        successResponse(res, 200, vehicles);
    }

    private async storeTempPlate(req: Request, res: Response): Promise<void> {
        const licensePlate = req.body?.licensePlate as string;
        const tempPlate = await this.vehicleService.storeTempPlate(licensePlate);
        successResponse(res, 200, tempPlate, 'Temporary plate stored successfully');
    }

    private async getTempPlate(req: Request, res: Response): Promise<void> {
        const tempPlate = await this.vehicleService.getTempPlate();
        successResponse(res, 200, tempPlate ?? null);
    }

    /**
     * Public method to get wrapped handlers
     * Returns the handlers wrapped with asyncHandler to catch errors
     */
    public getHandlers() {
        return {
            getVehicleByPlate: asyncHandler(this.getVehicleByPlate),
            getAllVehicles: asyncHandler(this.getAllVehicles),
            storeTempPlate: asyncHandler(this.storeTempPlate),
            getTempPlate: asyncHandler(this.getTempPlate),
        };
    }

    /**
     * IController interface implementation
     * Returns a dummy router (actual routing is done in Route class)
     */
    getRouter(): Router {
        return {} as Router;
    }
}
