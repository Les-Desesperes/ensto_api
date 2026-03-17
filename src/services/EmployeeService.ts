import { Employee } from '@les-desesperes/ensto-db';
import { IService } from '@/shared/interfaces';

export type EmployeeRole = 'Admin' | 'WarehouseWorker';

export interface CreateEmployeeInput {
    username: string;
    badgeUuid: string;
    passwordHash: string;
    role: EmployeeRole;
}

export class EmployeeService implements IService {
    async getAllEmployees(): Promise<any[]> {
        try {
            return await Employee.findAll();
        } catch (error) {
            console.error('Error fetching employees from database:', error);
            throw {
                statusCode: 500,
                message: 'Failed to fetch employees',
            };
        }
    }

    async createEmployee(input: CreateEmployeeInput): Promise<any> {
        const { username, badgeUuid, passwordHash, role } = input;

        if (!username || !badgeUuid || !passwordHash || !role) {
            throw {
                statusCode: 400,
                message: 'username, badgeUuid, passwordHash, and role are required fields.',
            };
        }

        if (!/^[A-F0-9]{8}$/.test(badgeUuid)) {
            throw {
                statusCode: 400,
                message: 'badgeUuid must match 8 uppercase hex characters (e.g. A1B2C3D4).',
            };
        }

        if (role !== 'Admin' && role !== 'WarehouseWorker') {
            throw {
                statusCode: 400,
                message: 'role must be either Admin or WarehouseWorker.',
            };
        }

        try {
            return await Employee.create({
                username,
                badgeUuid,
                passwordHash,
                role,
            });
        } catch (error) {
            console.error('Error creating employee in database:', error);
            throw {
                statusCode: 500,
                message: 'Failed to create employee',
            };
        }
    }

    async getEmployeeByBadgeUuid(id: string): Promise<any | null> {
        if (!id) {
            throw {
                statusCode: 400,
                message: 'RFID id is required.',
            };
        }

        try {
            return await Employee.findOne({
                where: { badgeUuid: id },
            });
        } catch (error) {
            console.error('Error fetching employee by RFID:', error);
            throw {
                statusCode: 500,
                message: 'Failed to fetch employee by RFID',
            };
        }
    }
}
