import { Request, Response, Router } from 'express';
import { IController } from '@/shared/interfaces';
import { HistoryLogService, ActionType } from '@/services/HistoryLogService';
import { asyncHandler, successResponse } from '@/shared/utils';

export class HistoryLogController implements IController {
    private historyLogService: HistoryLogService;

    constructor(historyLogService: HistoryLogService) {
        this.historyLogService = historyLogService;
        this.getAllHistoryLogs = this.getAllHistoryLogs.bind(this);
        this.createHistoryLog = this.createHistoryLog.bind(this);
    }

    private async getAllHistoryLogs(req: Request, res: Response): Promise<void> {
        const logs = await this.historyLogService.getAllHistoryLogs();
        successResponse(res, 200, logs);
    }

    private async createHistoryLog(req: Request, res: Response): Promise<void> {
        const { actionType, details, dateTime } = req.body;

        const log = await this.historyLogService.createHistoryLog({
            actionType: actionType as ActionType,
            details,
            dateTime,
        });

        successResponse(res, 201, log, 'History log created successfully');
    }

    public getHandlers() {
        return {
            getAllHistoryLogs: asyncHandler(this.getAllHistoryLogs),
            createHistoryLog: asyncHandler(this.createHistoryLog),
        };
    }

    getRouter(): Router {
        return {} as Router;
    }
}

