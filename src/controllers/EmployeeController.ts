import { Request, Response, Router } from 'express';
import { IController } from '@/shared/interfaces';
import { EmployeeService, EmployeeRole } from '@/services/EmployeeService';
import { asyncHandler, successResponse } from '@/shared/utils';

export class EmployeeController implements IController {
    private employeeService: EmployeeService;

    constructor(employeeService: EmployeeService) {
        this.employeeService = employeeService;
        this.getAllEmployees = this.getAllEmployees.bind(this);
        this.createEmployee = this.createEmployee.bind(this);
        this.getByRFID = this.getByRFID.bind(this);
        this.getById = this.getById.bind(this);
        this.patchEmployee = this.patchEmployee.bind(this);
    }

    private async getAllEmployees(req: Request, res: Response): Promise<void> {
        const employees = await this.employeeService.getAllEmployees();
        successResponse(res, 200, employees);
    }

    private async createEmployee(req: Request, res: Response): Promise<void> {
        const { username, badgeUuid, passwordHash, role, firstName, lastName } = req.body;

        const employee = await this.employeeService.createEmployee({
            username,
            badgeUuid,
            passwordHash,
            role: role as EmployeeRole,
            firstName: firstName ?? '',
            lastName: lastName ?? '',
        });

        successResponse(res, 201, employee, 'Employee created successfully');
    }
    
    private async getByRFID(req: Request, res: Response): Promise<void> {
        const id = req.params.id as string;
        const employee = await this.employeeService.getEmployeeByBadgeUuid(id);

        if (!employee) {
            throw {
                statusCode: 404,
                message: 'Employee not found',
            };
        }

        successResponse(res, 200, employee);
    }

    private async getById(req: Request, res: Response): Promise<void> {
        const id = req.params.id as string;
        const employee = await this.employeeService.getEmployeeById(id);

        successResponse(res, 200, employee);
    }

    private async patchEmployee(req: Request, res: Response): Promise<void> {
        const id = req.params.id as string;
        const { username, badgeUuid, passwordHash, role, firstName, lastName } = req.body;

        const employee = await this.employeeService.updateEmployee(id, {
            username,
            badgeUuid,
            passwordHash,
            role: role as EmployeeRole | undefined,
            firstName,
            lastName,
        });

        successResponse(res, 200, employee, 'Employee updated successfully');
    }

    public getHandlers() {
        return {
            getAllEmployees: asyncHandler(this.getAllEmployees),
            createEmployee: asyncHandler(this.createEmployee),
            getByRFID: asyncHandler(this.getByRFID),
            getById: asyncHandler(this.getById),
            patchEmployee: asyncHandler(this.patchEmployee),
        };
    }

    getRouter(): Router {
        return {} as Router;
    }
}
