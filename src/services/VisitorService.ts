import { Visitor } from '@les-desesperes/ensto-db';
import { IService } from '@/shared/interfaces';
import logger from '@/shared/logger';

export interface CreateVisitorInput {
    firstName: string;
    lastName: string;
    company: string;
    employee: string;
    arrivalTime: string | Date;
}

export interface UpdateVisitorInput {
    firstName?: string;
    lastName?: string;
    company?: string;
    employee?: string;
    arrivalTime?: string | Date;
}

const parseArrivalTime = (arrivalTime: string | Date): Date => {
    const parsedArrivalTime = typeof arrivalTime === 'string' ? new Date(arrivalTime) : arrivalTime;

    if (Number.isNaN(parsedArrivalTime.getTime())) {
        throw {
            statusCode: 400,
            message: 'arrivalTime must be a valid ISO date string or Date.',
        };
    }

    return parsedArrivalTime;
};

export class VisitorService implements IService {
    async getAllVisitors(): Promise<any[]> {
        try {
            return await Visitor.findAll();
        } catch (error) {
            logger.error({ err: error }, 'Error fetching visitors from database');
            throw {
                statusCode: 500,
                message: 'Failed to fetch visitors',
            };
        }
    }

    async getVisitorById(id: string): Promise<any> {
        if (!id) {
            throw {
                statusCode: 400,
                message: 'Visitor id is required.',
            };
        }

        try {
            const visitor = await Visitor.findByPk(id);

            if (!visitor) {
                throw {
                    statusCode: 404,
                    message: 'Visitor not found.',
                };
            }

            return visitor;
        } catch (error) {
            if ((error as any)?.statusCode) {
                throw error;
            }

            logger.error({ err: error }, 'Error fetching visitor by id');
            throw {
                statusCode: 500,
                message: 'Failed to fetch visitor',
            };
        }
    }

    async createVisitor(input: CreateVisitorInput): Promise<any> {
        const { firstName, lastName, company, employee, arrivalTime } = input;

        if (!firstName || !lastName || !company || !employee || !arrivalTime) {
            throw {
                statusCode: 400,
                message: 'firstName, lastName, company, employee, and arrivalTime are required fields.',
            };
        }

        const parsedArrivalTime = parseArrivalTime(arrivalTime);

        try {
            return await Visitor.create({
                firstName,
                lastName,
                company,
                employee,
                arrivalTime: parsedArrivalTime,
            });
        } catch (error) {
            logger.error({ err: error }, 'Error creating visitor in database');
            throw {
                statusCode: 500,
                message: 'Failed to create visitor',
            };
        }
    }

    async updateVisitor(id: string, input: UpdateVisitorInput): Promise<any> {
        if (!id) {
            throw {
                statusCode: 400,
                message: 'Visitor id is required.',
            };
        }

        const hasAtLeastOneField = Object.values(input).some((value) => value !== undefined && value !== '');
        if (!hasAtLeastOneField) {
            throw {
                statusCode: 400,
                message: 'At least one field is required to update visitor.',
            };
        }

        try {
            const visitor = await Visitor.findByPk(id);

            if (!visitor) {
                throw {
                    statusCode: 404,
                    message: 'Visitor not found.',
                };
            }

            const updatePayload: Record<string, unknown> = {};
            if (input.firstName !== undefined) updatePayload.firstName = input.firstName;
            if (input.lastName !== undefined) updatePayload.lastName = input.lastName;
            if (input.company !== undefined) updatePayload.company = input.company;
            if (input.employee !== undefined) updatePayload.employee = input.employee;
            if (input.arrivalTime !== undefined) {
                updatePayload.arrivalTime = parseArrivalTime(input.arrivalTime);
            }

            await visitor.update(updatePayload as any);
            return visitor;
        } catch (error) {
            if ((error as any)?.statusCode) {
                throw error;
            }

            logger.error({ err: error }, 'Error updating visitor in database');
            throw {
                statusCode: 500,
                message: 'Failed to update visitor',
            };
        }
    }

    async deleteVisitor(id: string): Promise<void> {
        if (!id) {
            throw {
                statusCode: 400,
                message: 'Visitor id is required.',
            };
        }

        try {
            const visitor = await Visitor.findByPk(id);

            if (!visitor) {
                throw {
                    statusCode: 404,
                    message: 'Visitor not found.',
                };
            }

            await visitor.destroy();
        } catch (error) {
            if ((error as any)?.statusCode) {
                throw error;
            }

            logger.error({ err: error }, 'Error deleting visitor in database');
            throw {
                statusCode: 500,
                message: 'Failed to delete visitor',
            };
        }
    }
}
