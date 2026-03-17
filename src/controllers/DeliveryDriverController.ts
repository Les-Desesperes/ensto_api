import { Request, Response, Router } from 'express';
import { IController } from '@/shared/interfaces';
import { DeliveryDriverService } from '@/services';
import { asyncHandler, successResponse } from '@/shared/utils';

/**
 * DeliveryDriverController
 * Handles HTTP requests for delivery driver operations.
 * Uses Dependency Injection to receive the service instance via constructor.
 * 
 * SOLID Principles:
 * - Single Responsibility: Only handles HTTP request/response for driver operations
 * - Open/Closed: Open for extension (can add new methods), closed for modification
 * - Dependency Inversion: Depends on injected DeliveryDriverService, not concrete implementations
 * - Interface Segregation: Implements only IController interface
 */
export class DeliveryDriverController implements IController {
    private driverService: DeliveryDriverService;

    /**
     * Constructor with Dependency Injection
     * @param driverService - The DeliveryDriverService instance
     */
    constructor(driverService: DeliveryDriverService) {
        this.driverService = driverService;
        // Bind methods to ensure 'this' context is preserved in Express routes
        this.getAllDrivers = this.getAllDrivers.bind(this);
        this.createDriver = this.createDriver.bind(this);
    }

    /**
     * GET handler: Fetch all delivery drivers
     * Route: GET /api/v1/driver/
     * @param req - Express request object
     * @param res - Express response object
     */
    private async getAllDrivers(req: Request, res: Response): Promise<void> {
        const drivers = await this.driverService.getAllDrivers();
        successResponse(res, 200, drivers);
    }

    /**
     * POST handler: Create a new delivery driver
     * Route: POST /api/v1/driver/
     * @param req - Express request object
     * @param res - Express response object
     */
    private async createDriver(req: Request, res: Response): Promise<void> {
        const { firstName, lastName, companyId, ppeCharterValid, ppeSignatureDate } = req.body;

        const newDriver = await this.driverService.createDriver(
            firstName,
            lastName,
            companyId,
            ppeCharterValid,
            ppeSignatureDate
        );

        successResponse(res, 201, newDriver, 'Driver created successfully');
    }

    /**
     * Public method to get wrapped handlers
     * Returns the handlers wrapped with asyncHandler to catch errors
     */
    public getHandlers() {
        return {
            getAllDrivers: asyncHandler(this.getAllDrivers),
            createDriver: asyncHandler(this.createDriver),
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
