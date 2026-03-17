import { Router } from 'express';
import { IRoute } from '@/shared/interfaces';
import { EmployeeController } from '@/controllers';
import { EmployeeService } from '@/services/EmployeeService';

/**
 * EmployeeRoute
 * Responsible for initializing the controller and binding Express router endpoints.
 * This class handles all employee-related routes.
 */
export class EmployeeRoute implements IRoute {
    private router: Router;
    private controller: EmployeeController;

    constructor() {
        this.router = Router();
        const service = new EmployeeService();
        this.controller = new EmployeeController(service);
        this.initializeRoutes();
    }

    private initializeRoutes(): void {
        const handlers = this.controller.getHandlers();

        // GET /api/v1/employee/ - Fetch all employees
        this.router.get('/', handlers.getAllEmployees);

        // POST /api/v1/employee/ - Create a new employee
        this.router.post('/', handlers.createEmployee);
    }

    getRouter(): Router {
        return this.router;
    }
}
