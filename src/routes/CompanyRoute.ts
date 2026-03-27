import { Router } from 'express';
import { IRoute } from '@/shared/interfaces';
import { CompanyController } from '@/controllers';
import { CompanyService } from '@/services';

export class CompanyRoute implements IRoute {
    private router: Router;
    private controller: CompanyController;

    constructor() {
        this.router = Router();
        const service = new CompanyService();
        this.controller = new CompanyController(service);
        this.initializeRoutes();
    }

    private initializeRoutes(): void {
        const handlers = this.controller.getHandlers();

        // GET /api/v1/company/ - Fetch all companies
        this.router.get('/', handlers.getAllCompanies);

        // GET /api/v1/company/:name - Fetch one company summary by name
        this.router.get('/:name', handlers.getCompanyByName);
    }

    getRouter(): Router {
        return this.router;
    }
}

