import { Employee } from '@les-desesperes/ensto-db';
import { IService } from '@/shared/interfaces';
import logger from '@/shared/logger';

export type EmployeeRole = 'Admin' | 'Magasinier' | 'Personnel';

export interface CreateEmployeeInput {
    username: string;
    badgeUuid: string;
    passwordHash: string;
    role: EmployeeRole;
    firstName: string;
    lastName: string;
}

export interface UpdateEmployeeInput {
    username?: string;
    badgeUuid?: string;
    passwordHash?: string;
    role?: EmployeeRole;
    firstName?: string;
    lastName?: string;
}

export class EmployeeService implements IService {
    async getAllEmployees(): Promise<any[]> {
        try {
            return await Employee.findAll();
        } catch (error) {
            logger.error({ err: error }, 'Error fetching employees from database');
            throw {
                statusCode: 500,
                message: 'Failed to fetch employees',
            };
        }
    }

    async getEmployeeById(id: string): Promise<any> {
        if (!id) {
            throw {
                statusCode: 400,
                message: 'Employee id is required.',
            };
        }

        try {
            const employee = await Employee.findByPk(id);

            if (!employee) {
                throw {
                    statusCode: 404,
                    message: 'Employee not found.',
                };
            }

            const plainEmployee = typeof employee.toJSON === 'function' ? employee.toJSON() : (employee as any);
            const { passwordHash, ...safeEmployee } = plainEmployee as Record<string, unknown>;

            return safeEmployee;
        } catch (error) {
            if ((error as any)?.statusCode) {
                throw error;
            }

            logger.error({ err: error }, 'Error fetching employee by id');
            throw {
                statusCode: 500,
                message: 'Failed to fetch employee',
            };
        }
    }

    async updateEmployee(id: string, input: UpdateEmployeeInput): Promise<any> {
        if (!id) {
            throw {
                statusCode: 400,
                message: 'Employee id is required.',
            };
        }

        const hasAtLeastOneField = Object.values(input).some((value) => value !== undefined && value !== '');
        if (!hasAtLeastOneField) {
            throw {
                statusCode: 400,
                message: 'At least one field is required to update the employee.',
            };
        }

        if (input.badgeUuid && !/^[A-F0-9]{8}$/.test(input.badgeUuid)) {
            throw {
                statusCode: 400,
                message: 'badgeUuid must match 8 uppercase hex characters (e.g. A1B2C3D4).',
            };
        }

        if (input.role && input.role !== 'Admin' && input.role !== 'Magasinier' && input.role !== 'Personnel') {
            throw {
                statusCode: 400,
                message: 'role must be one of: Admin, Magasinier, Personnel.',
            };
        }

        try {
            const employee = await Employee.findByPk(id);

            if (!employee) {
                throw {
                    statusCode: 404,
                    message: 'Employee not found.',
                };
            }

            const updatePayload: Record<string, unknown> = {};

            if (input.username !== undefined) updatePayload.username = input.username;
            if (input.badgeUuid !== undefined) updatePayload.badgeUuid = input.badgeUuid;
            if (input.passwordHash !== undefined) updatePayload.passwordHash = input.passwordHash;
            if (input.role !== undefined) updatePayload.role = input.role;
            if (input.firstName !== undefined) updatePayload.firstName = input.firstName;
            if (input.lastName !== undefined) updatePayload.lastName = input.lastName;

            await employee.update(updatePayload as any);

            const plainEmployee = typeof employee.toJSON === 'function' ? employee.toJSON() : (employee as any);
            const { passwordHash, ...safeEmployee } = plainEmployee as Record<string, unknown>;

            return safeEmployee;
        } catch (error) {
            if ((error as any)?.statusCode) {
                throw error;
            }

            logger.error({ err: error }, 'Error updating employee in database');
            throw {
                statusCode: 500,
                message: 'Failed to update employee',
            };
        }
    }

    async createEmployee(input: CreateEmployeeInput): Promise<any> {
        const { username, badgeUuid, passwordHash, role, firstName, lastName } = input;

        if (!username || !badgeUuid || !passwordHash || !role || !firstName || !lastName) {
            throw {
                statusCode: 400,
                message: 'username, badgeUuid, passwordHash, role, firstName and lastName are required fields.',
            };
        }

        if (!/^[A-F0-9]{8}$/.test(badgeUuid)) {
            throw {
                statusCode: 400,
                message: 'badgeUuid must match 8 uppercase hex characters (e.g. A1B2C3D4).',
            };
        }

        if (role !== 'Admin' && role !== 'Magasinier' && role !== 'Personnel') {
            throw {
                statusCode: 400,
                message: 'role must be one of: Admin, Magasinier, Personnel.',
            };
        }

        try {
            return await Employee.create({
                username,
                badgeUuid,
                passwordHash,
                role,
                firstName,
                lastName
            });
        } catch (error) {
            logger.error({ err: error }, 'Error creating employee in database');
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
            const user = await Employee.findOne({ where: { badgeUuid: id } });

            if(!user) return {
                statusCode: 404,
                message: 'User not found.',
            };

            return  { id: user.employeeId, badgeUuid: user.badgeUuid }
        } catch (error) {
            logger.error({ err: error }, 'Error fetching employee by RFID');
            throw {
                statusCode: 500,
                message: 'Failed to fetch employee by RFID',
            };
        }
    }
}
