import { Request, Response, Router } from 'express';
import { IController } from '@/shared/interfaces';
import { VisitorService } from '@/services/VisitorService';
import { asyncHandler, successResponse } from '@/shared/utils';

export class VisitorController implements IController {
    private visitorService: VisitorService;

    constructor(visitorService: VisitorService) {
        this.visitorService = visitorService;
        this.getAllVisitors = this.getAllVisitors.bind(this);
        this.createVisitor = this.createVisitor.bind(this);
    }

    private async getAllVisitors(req: Request, res: Response): Promise<void> {
        const visitors = await this.visitorService.getAllVisitors();
        successResponse(res, 200, visitors);
    }

    private async createVisitor(req: Request, res: Response): Promise<void> {
        const { fullName, company, arrivalTime } = req.body;

        const visitor = await this.visitorService.createVisitor({
            fullName,
            company,
            arrivalTime,
        });

        successResponse(res, 201, visitor, 'Visitor created successfully');
    }

    public getHandlers() {
        return {
            getAllVisitors: asyncHandler(this.getAllVisitors),
            createVisitor: asyncHandler(this.createVisitor),
        };
    }

    getRouter(): Router {
        return {} as Router;
    }
}

