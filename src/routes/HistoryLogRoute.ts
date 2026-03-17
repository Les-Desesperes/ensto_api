import { Router } from 'express';
import { IRoute } from '@/shared/interfaces';
import { HistoryLogController } from '@/controllers';
import { HistoryLogService } from '@/services/HistoryLogService';

export class HistoryLogRoute implements IRoute {
    private router: Router;
    private controller: HistoryLogController;

    constructor() {
        this.router = Router();
        const service = new HistoryLogService();
        this.controller = new HistoryLogController(service);
        this.initializeRoutes();
    }

    private initializeRoutes(): void {
        const handlers = this.controller.getHandlers();

        // GET /api/v1/history-log/
        this.router.get('/', handlers.getAllHistoryLogs);

        // POST /api/v1/history-log/
        this.router.post('/', handlers.createHistoryLog);
    }

    getRouter(): Router {
        return this.router;
    }
}

