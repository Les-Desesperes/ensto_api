import {Vehicle, DeliveryDriver, TempPlate, Company} from '@les-desesperes/ensto-db';
import { IService } from '@/shared/interfaces';
import logger from '@/shared/logger';
import { ExternalDriverPayload, IntegrationService } from './IntegrationService';
import { decryptAES } from '@/utils/crypto';

export interface ExistingVehicleTempPlateResult {
    status: 'existing';
    licensePlate: string;
    firstName: string;
    lastName: string;
    companyName: string;
}

export interface NewVehicleTempPlateResult {
    status: 'new';
    licensePlate: string;
}

export type StoreTempPlateResult = ExistingVehicleTempPlateResult | NewVehicleTempPlateResult;

/**
 * VehicleService
 * Handles all business logic related to vehicles.
 * This service interacts with the Vehicle model from the @les-desesperes/ensto-db package.
 * 
 * SOLID Principles:
 * - Single Responsibility: Only handles vehicle-related operations
 * - Dependency Inversion: Depends on abstractions (IService), not concrete implementations
 */
export class VehicleService implements IService {
    private readonly integrationService: IntegrationService;

    constructor(integrationService?: IntegrationService) {
        this.integrationService = integrationService ?? new IntegrationService();
    }

    /**
     * Retrieves a vehicle by its license plate.
     * Includes associated driver information.
     * @param licensePlate - The license plate of the vehicle
     * @returns The vehicle with its associated driver, or null if not found
     */
    async getVehicleByPlate(licensePlate: string): Promise<any> {
        try {
            const vehicle = await Vehicle.findOne({
                where: { licensePlate },
                include: [
                    {
                        model: DeliveryDriver,
                        attributes: ['driverId', 'encryptedFirstName', 'encryptedLastName', 'company'],
                    },
                ],
            });

            if (!vehicle) {
                throw {
                    statusCode: 404,
                    message: `Vehicle with license plate ${licensePlate} not found.`,
                };
            }

            return vehicle;
        } catch (error: any) {
            logger.error({ err: error, licensePlate }, 'Error fetching vehicle by plate');

            // Re-throw custom errors with statusCode
            if (error.statusCode) {
                throw error;
            }

            throw {
                statusCode: 500,
                message: 'Failed to fetch vehicle',
            };
        }
    }

    /**
     * Retrieves all vehicles from the database.
     * @returns Array of all vehicles
     */
    async getAllVehicles(): Promise<any[]> {
        try {
            const vehicles = await Vehicle.findAll({
                include: [
                    {
                        model: DeliveryDriver,
                        attributes: ['driverId', 'encryptedFirstName', 'encryptedLastName', 'company'],
                    },
                ],
            });

            return vehicles;
        } catch (error) {
            logger.error({ err: error }, 'Error fetching all vehicles');
            throw {
                statusCode: 500,
                message: 'Failed to fetch vehicles',
            };
        }
    }

    async storeTempPlate(licensePlate: string): Promise<StoreTempPlateResult> {
        if (!licensePlate || !licensePlate.trim()) {
            throw {
                statusCode: 400,
                message: 'licensePlate is required.',
            };
        }

        const normalizedPlate = licensePlate.trim().toUpperCase();

        try {
            const existingVehicle = await Vehicle.findOne({
                where: { licensePlate: normalizedPlate },
                include: [
                    {
                        model: DeliveryDriver,
                        attributes: ['driverId', 'encryptedFirstName', 'encryptedLastName', 'company'],
                    },
                ],
            });

            if (existingVehicle) {
                const existingPayload = await this.extractExistingVehiclePayload(existingVehicle, normalizedPlate);

                if (existingPayload) {
                    await this.integrationService.dispatchToExternalDisplay({
                        vehicle: existingPayload,
                    });

                    return {
                        status: 'existing',
                        licensePlate: existingPayload.licensePlate,
                        firstName: existingPayload.firstName ?? '',
                        lastName: existingPayload.lastName ?? '',
                        companyName: existingPayload.companyName ?? '',
                    };
                }
            }

            await TempPlate.upsert({
                singletonId: 1,
                licensePlate: normalizedPlate,
            });

            return {
                status: 'new',
                licensePlate: normalizedPlate,
            };
        } catch (error) {
            logger.error({ err: error, licensePlate: normalizedPlate }, 'Error storing temp plate');
            throw {
                statusCode: 500,
                message: 'Failed to store temporary license plate',
            };
        }
    }

    async getTempPlate(): Promise<StoreTempPlateResult | null> {
        try {
            const record = await TempPlate.findByPk(1);
            if (!record) {
                return null;
            }

            const normalizedPlate = record.licensePlate?.trim().toUpperCase();

            if (!normalizedPlate) {
                return null;
            }

            const existingVehicle = await Vehicle.findOne({
                where: { licensePlate: normalizedPlate },
                include: [
                    {
                        model: DeliveryDriver,
                        attributes: ['driverId', 'encryptedFirstName', 'encryptedLastName', 'company'],
                    },
                ],
            });

            if (existingVehicle) {
                const existingPayload = await this.extractExistingVehiclePayload(existingVehicle, normalizedPlate);
                if (existingPayload) {
                    return {
                        status: 'existing',
                        licensePlate: existingPayload.licensePlate,
                        firstName: existingPayload.firstName ?? '',
                        lastName: existingPayload.lastName ?? '',
                        companyName: existingPayload.companyName ?? '',
                    };
                }
            }

            return {
                status: 'new',
                licensePlate: normalizedPlate,
            };
        } catch (error) {
            logger.error({ err: error }, 'Error fetching temp plate');
            throw {
                statusCode: 500,
                message: 'Failed to fetch temporary license plate',
            };
        }
    }

    private async extractExistingVehiclePayload(vehicle: any, licensePlate: string): Promise<ExternalDriverPayload | null> {
        const candidate = this.extractDriverCandidate(vehicle);

        if (!candidate) {
            return null;
        }

        const firstName = this.toPlainText(candidate.encryptedFirstName ?? candidate.firstName ?? '');
        const lastName = this.toPlainText(candidate.encryptedLastName ?? candidate.lastName ?? '');
        const companyName = await this.extractCompanyName(candidate);

        return {
            status: 'existing',
            licensePlate,
            firstName,
            lastName,
            companyName,
        };
    }

    private extractDriverCandidate(vehicle: any): any | null {
        const raw =
            vehicle?.DeliveryDriver ??
            vehicle?.deliveryDriver ??
            vehicle?.driver ??
            vehicle?.DeliveryDrivers ??
            vehicle?.deliveryDrivers ??
            null;

        if (Array.isArray(raw)) {
            return raw[0] ?? null;
        }

        return raw;
    }

    private async extractCompanyName(driver: any): Promise<string> {
        const rawCompany = driver?.company;

        if (rawCompany == null) {
            return '';
        }

        const companyToken = String(rawCompany).trim();
        if (!companyToken) {
            return '';
        }

        try {
            const byPk = await Company.findByPk(companyToken as any);
            if (byPk && typeof (byPk as any).name === 'string') {
                return (byPk as any).name;
            }
        } catch (_err) {
            // Ignore lookup errors and continue fallback strategy.
        }

        try {
            const byName = await Company.findOne({ where: { name: companyToken } });
            if (byName && typeof (byName as any).name === 'string') {
                return (byName as any).name;
            }
        } catch (_err) {
            // Ignore lookup errors and fallback to raw token.
        }

        return companyToken;
    }

    private toPlainText(value: string): string {
        if (!value || typeof value !== 'string') {
            return '';
        }

        try {
            return decryptAES(value);
        } catch (err) {
            logger.warn({ err }, 'Unable to decrypt driver field, returning raw value');
            return value;
        }
    }
}

