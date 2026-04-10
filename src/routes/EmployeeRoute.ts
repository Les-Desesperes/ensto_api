import {Router} from 'express';
import {IRoute} from '@/shared/interfaces';
import {EmployeeController} from '@/controllers';
import {EmployeeService} from '@/services/EmployeeService';
import { roleMiddleware } from '@/shared/middleware';

/**
 * @openapi
 * /api/v1/employee:
 *   get:
 *     tags: [Employee]
 *     summary: Get all employees
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Employees fetched successfully
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
 *     tags: [Employee]
 *     summary: Create an employee
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               badgeUuid:
 *                 type: string
 *               passwordHash:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [Admin, Magasinier, Personnel]
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *             required: [username, badgeUuid, passwordHash, role, firstName, lastName]
 *     responses:
 *       201:
 *         description: Employee created successfully
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
 *
 * /api/v1/employee/rfid/{id}:
 *   get:
 *     tags: [Employee]
 *     summary: Get employee by RFID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Employee badge UUID
 *     responses:
 *       200:
 *         description: Employee fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       404:
 *         description: Employee not found
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
 * /api/v1/employees:
 *   get:
 *     tags: [Employee]
 *     summary: Get all employees (alias)
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Employees fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *   post:
 *     tags: [Employee]
 *     summary: Create employee (alias)
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *
 * /api/v1/employees/rfid/{id}:
 *   get:
 *     tags: [Employee]
 *     summary: Get employee by RFID (alias)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *
 * /api/v1/employees/{id}:
 *   get:
 *     tags: [Employee]
 *     summary: Get employee by id for edit page
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Employee primary key
 *     responses:
 *       200:
 *         description: Employee fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       404:
 *         description: Employee not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   patch:
 *     tags: [Employee]
 *     summary: Update employee by id
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               badgeUuid:
 *                 type: string
 *               passwordHash:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [Admin, Magasinier, Personnel]
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *     responses:
 *       200:
 *         description: Employee updated successfully
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
 *       404:
 *         description: Employee not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

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

        // GET /api/v1/employee/rfid/:id - Fetch one employee by RFID
        this.router.get('/rfid/:id', handlers.getByRFID)

        // GET /api/v1/employees/:id - Fetch one employee for edit page
        this.router.get('/:id', roleMiddleware('Admin'), handlers.getById);

        // PATCH /api/v1/employees/:id - Update an employee
        this.router.patch('/:id', roleMiddleware('Admin'), handlers.patchEmployee);

        // POST /api/v1/employee/ - Create a new employee
        this.router.post('/', roleMiddleware('Admin'), handlers.createEmployee);
    }

    getRouter(): Router {
        return this.router;
    }
}
