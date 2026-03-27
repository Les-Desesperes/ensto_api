import { Request, Response, Router } from 'express';
import { IController } from '@/shared/interfaces';
import { CompanyService } from '@/services';
import { asyncHandler, successResponse } from '@/shared/utils';

export class CompanyController implements IController {
    private companyService: CompanyService;

    constructor(companyService: CompanyService) {
        this.companyService = companyService;
        this.getAllCompanies = this.getAllCompanies.bind(this);
        this.getCompanyByName = this.getCompanyByName.bind(this);
    }

    private async getAllCompanies(req: Request, res: Response): Promise<void> {
        const companies = await this.companyService.getAllCompanies();
        successResponse(res, 200, companies);
    }

    private async getCompanyByName(req: Request, res: Response): Promise<void> {
        const name = req.params.name as string;
        const company = await this.companyService.getCompanyByName(name);
        successResponse(res, 200, company);
    }

    public getHandlers() {
        return {
            getAllCompanies: asyncHandler(this.getAllCompanies),
            getCompanyByName: asyncHandler(this.getCompanyByName),
        };
    }

    getRouter(): Router {
        return {} as Router;
    }
}

