import { Visitor } from '@les-desesperes/ensto-db';
import { IService } from '@/shared/interfaces';
import logger from '@/shared/logger';

export interface CreateVisitorInput {
    fullName: string;
    company: string;
    arrivalTime: string | Date;
}

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

    async createVisitor(input: CreateVisitorInput): Promise<any> {
        const { fullName, company, arrivalTime } = input;

        if (!fullName || !company || !arrivalTime) {
            throw {
                statusCode: 400,
                message: 'fullName, company, and arrivalTime are required fields.',
            };
        }

        const parsedArrivalTime =
            typeof arrivalTime === 'string' ? new Date(arrivalTime) : arrivalTime;

        if (Number.isNaN(parsedArrivalTime.getTime())) {
            throw {
                statusCode: 400,
                message: 'arrivalTime must be a valid ISO date string or Date.',
            };
        }

        try {
            return await Visitor.create({
                fullName,
                company,
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
}

