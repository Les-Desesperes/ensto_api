import { Router } from 'express';
import { IRoute } from '@/shared/interfaces';
import { VisitorController } from '@/controllers';
import { VisitorService } from '@/services/VisitorService';

export class VisitorRoute implements IRoute {
    private router: Router;
    private controller: VisitorController;

    constructor() {
        this.router = Router();
        const service = new VisitorService();
        this.controller = new VisitorController(service);
        this.initializeRoutes();
    }

    private initializeRoutes(): void {
        const handlers = this.controller.getHandlers();

        // GET /api/v1/visitor/
        this.router.get('/', handlers.getAllVisitors);

        // POST /api/v1/visitor/
        this.router.post('/', handlers.createVisitor);
    }

    getRouter(): Router {
        return this.router;
    }
}

