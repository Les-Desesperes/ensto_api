import { HistoryLog } from '@les-desesperes/ensto-db';
import { IService } from '@/shared/interfaces';
import logger from '@/shared/logger';

export type ActionType = 'Entry' | 'Exit' | 'Refusal';

export interface CreateHistoryLogInput {
    actionType: ActionType;
    details?: string;
    dateTime?: string | Date;
}

export class HistoryLogService implements IService {
    async getAllHistoryLogs(): Promise<any[]> {
        try {
            return await HistoryLog.findAll();
        } catch (error) {
            logger.error({ err: error }, 'Failed to fetch history logs from database');
            throw {
                statusCode: 500,
                message: 'Failed to fetch history logs',
            };
        }
    }

    async createHistoryLog(input: CreateHistoryLogInput): Promise<any> {
        const { actionType, details, dateTime } = input;

        if (!actionType) {
            throw {
                statusCode: 400,
                message: 'actionType is required.',
            };
        }

        if (!['Entry', 'Exit', 'Refusal'].includes(actionType)) {
            throw {
                statusCode: 400,
                message: 'actionType must be one of Entry, Exit, Refusal.',
            };
        }

        const parsedDateTime =
            dateTime == null ? undefined : typeof dateTime === 'string' ? new Date(dateTime) : dateTime;

        if (parsedDateTime && Number.isNaN(parsedDateTime.getTime())) {
            throw {
                statusCode: 400,
                message: 'dateTime must be a valid ISO date string or Date.',
            };
        }

        try {
            return await HistoryLog.create({
                actionType,
                details: typeof details === 'string' ? details : '',
                dateTime: parsedDateTime ?? new Date(),
            });
        } catch (error) {
            logger.error({ err: error, actionType }, 'Failed to create history log in database');
            throw {
                statusCode: 500,
                message: 'Failed to create history log',
            };
        }
    }
}
