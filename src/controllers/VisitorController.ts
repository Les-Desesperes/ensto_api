import { Request, Response, Router } from 'express';
import { z } from 'zod';
import { IController } from '@/shared/interfaces';
import { VisitorService } from '@/services/VisitorService';
import { asyncHandler, successResponse } from '@/shared/utils';

const idParamSchema = z.object({
    id: z.coerce.number().int().positive(),
});

const createVisitorSchema = z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    company: z.string().min(1),
    employee: z.string().min(1),
    arrivalTime: z.union([z.string().datetime(), z.date()]),
});

const updateVisitorSchema = z
    .object({
        firstName: z.string().min(1).optional(),
        lastName: z.string().min(1).optional(),
        company: z.string().min(1).optional(),
        employee: z.string().min(1).optional(),
        arrivalTime: z.union([z.string().datetime(), z.date()]).optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
        message: 'At least one field is required.',
    });

export class VisitorController implements IController {
    private visitorService: VisitorService;

    constructor(visitorService: VisitorService) {
        this.visitorService = visitorService;
        this.getAllVisitors = this.getAllVisitors.bind(this);
        this.getVisitorById = this.getVisitorById.bind(this);
        this.createVisitor = this.createVisitor.bind(this);
        this.patchVisitor = this.patchVisitor.bind(this);
        this.deleteVisitor = this.deleteVisitor.bind(this);
    }

    private async getAllVisitors(_req: Request, res: Response): Promise<void> {
        const visitors = await this.visitorService.getAllVisitors();
        successResponse(res, 200, visitors);
    }

    private async getVisitorById(req: Request, res: Response): Promise<void> {
        const parsedParams = idParamSchema.safeParse(req.params);
        if (!parsedParams.success) {
            throw {
                statusCode: 400,
                message: 'Visitor id must be a positive integer.',
            };
        }

        const visitor = await this.visitorService.getVisitorById(String(parsedParams.data.id));
        successResponse(res, 200, visitor);
    }

    private async createVisitor(req: Request, res: Response): Promise<void> {
        const parsedBody = createVisitorSchema.safeParse(req.body);
        if (!parsedBody.success) {
            throw {
                statusCode: 400,
                message: parsedBody.error.issues[0]?.message || 'Invalid visitor payload.',
            };
        }

        const visitor = await this.visitorService.createVisitor(parsedBody.data);
        successResponse(res, 201, visitor, 'Visitor created successfully');
    }

    private async patchVisitor(req: Request, res: Response): Promise<void> {
        const parsedParams = idParamSchema.safeParse(req.params);
        if (!parsedParams.success) {
            throw {
                statusCode: 400,
                message: 'Visitor id must be a positive integer.',
            };
        }

        const parsedBody = updateVisitorSchema.safeParse(req.body);
        if (!parsedBody.success) {
            throw {
                statusCode: 400,
                message: parsedBody.error.issues[0]?.message || 'Invalid visitor payload.',
            };
        }

        const visitor = await this.visitorService.updateVisitor(String(parsedParams.data.id), parsedBody.data);
        successResponse(res, 200, visitor, 'Visitor updated successfully');
    }

    private async deleteVisitor(req: Request, res: Response): Promise<void> {
        const parsedParams = idParamSchema.safeParse(req.params);
        if (!parsedParams.success) {
            throw {
                statusCode: 400,
                message: 'Visitor id must be a positive integer.',
            };
        }

        await this.visitorService.deleteVisitor(String(parsedParams.data.id));
        successResponse(res, 200, { deleted: true }, 'Visitor deleted successfully');
    }

    public getHandlers() {
        return {
            getAllVisitors: asyncHandler(this.getAllVisitors),
            getVisitorById: asyncHandler(this.getVisitorById),
            createVisitor: asyncHandler(this.createVisitor),
            patchVisitor: asyncHandler(this.patchVisitor),
            deleteVisitor: asyncHandler(this.deleteVisitor),
        };
    }

    getRouter(): Router {
        return {} as Router;
    }
}
