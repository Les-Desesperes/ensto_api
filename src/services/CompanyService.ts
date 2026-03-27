import { Company } from '@les-desesperes/ensto-db';
import { IService } from '@/shared/interfaces';
import logger from '@/shared/logger';

export interface CreateCompanyInput {
    name: string;
    type?: string;
    contactEmail?: string | null;
    contactPhone?: string | null;
}

export class CompanyService implements IService {
    async createCompany(data: CreateCompanyInput): Promise<any> {
        if (!data || !data.name) {
            throw {
                statusCode: 400,
                message: 'Company name is required.'
            };
        }
        try {
            // Company model requires type, contactEmail, contactPhone fields according to d.ts
            const company = await Company.create({
                name: data.name,
                type: data.type ?? 'unknown',
                contactEmail: data.contactEmail ?? null,
                contactPhone: data.contactPhone ?? null,
            } as any);
            return company;
        } catch (err) {
            const error = err as any;
            logger.error({ err: error }, 'Error creating company');
            throw {
                statusCode: 500,
                message: 'Failed to create company',
            };
        }
    }
    
    async getAllCompanies(): Promise<any[]> {
        try {
            return await Company.findAll();
        } catch (err) {
            const error = err as any;
            logger.error({ err: error }, 'Error fetching companies');
            throw {
                statusCode: 500,
                message: 'Failed to fetch companies',
            };
        }
    }

    async getCompanyByName(name: string): Promise<any> {
        if (!name) {
            throw {
                statusCode: 400,
                message: 'Company name is required.'
            };
        }
        try {
            const company = await Company.findOne({ where: { name } });
            if (!company) {
                throw {
                    statusCode: 404,
                    message: 'Company not found',
                };
            }
            return company;
        } catch (err) {
            const error = err as any;
            if (error?.statusCode) throw error;
            logger.error({ err: error }, 'Error fetching company by name');
            throw {
                statusCode: 500,
                message: 'Failed to fetch company by name',
            };
        }
    }
    
    async getCompanyById(id: string): Promise<any> {
        if (!id) {
            throw {
                statusCode: 400,
                message: 'Company id is required.'
            };
        }
        try {
            const company = await Company.findByPk(id);
            if (!company) {
                throw {
                    statusCode: 404,
                    message: 'Company not found',
                };
            }
            return company;
        } catch (err) {
            const error = err as any;
            if (error?.statusCode) throw error;
            logger.error({ err: error }, 'Error fetching company by id');
            throw {
                statusCode: 500,
                message: 'Failed to fetch company by id',
            };
        }
    }
}
