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
    }

    private async getAllEmployees(req: Request, res: Response): Promise<void> {
        const employees = await this.employeeService.getAllEmployees();
        successResponse(res, 200, employees);
    }

    private async createEmployee(req: Request, res: Response): Promise<void> {
        const { username, badgeUuid, passwordHash, role } = req.body;

        const employee = await this.employeeService.createEmployee({
            username,
            badgeUuid,
            passwordHash,
            role: role as EmployeeRole,
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

    public getHandlers() {
        return {
            getAllEmployees: asyncHandler(this.getAllEmployees),
            createEmployee: asyncHandler(this.createEmployee),
            getByRFID: asyncHandler(this.getByRFID),
        };
    }

    getRouter(): Router {
        return {} as Router;
    }
}
