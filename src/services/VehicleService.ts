import {Vehicle, DeliveryDriver, sequelize, TempPlate} from '@les-desesperes/ensto-db';
import { IService } from '@/shared/interfaces';

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
    private async ensureTempPlateTable(): Promise<void> {
        await TempPlate.sync();
    }

    /**
     * Retrieves a vehicle by its license plate.
     * Includes associated driver information.
     * @param licensePlate - The license plate of the vehicle
     * @returns The vehicle with its associated driver, or null if not found
     */
    async getVehicleByPlate(licensePlate: string): Promise<any> {
        try {
            await sequelize.authenticate();

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
            console.error('Error fetching vehicle by plate:', error);

            // Re-throw custom errors with statusCode
            if (error.statusCode) {
                throw error;
            }

            throw {
                statusCode: 500,
                message: 'Failed to fetch vehicle',
            };
        } finally {
            await sequelize.close();
        }
    }

    /**
     * Retrieves all vehicles from the database.
     * @returns Array of all vehicles
     */
    async getAllVehicles(): Promise<any[]> {
        try {
            await sequelize.authenticate();

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
            console.error('Error fetching all vehicles:', error);
            throw {
                statusCode: 500,
                message: 'Failed to fetch vehicles',
            };
        } finally {
            await sequelize.close();
        }
    }

    async storeTempPlate(licensePlate: string): Promise<{ licensePlate: string }> {
        if (!licensePlate || !licensePlate.trim()) {
            throw {
                statusCode: 400,
                message: 'licensePlate is required.',
            };
        }

        const normalizedPlate = licensePlate.trim().toUpperCase();

        try {
            await sequelize.authenticate();
            await this.ensureTempPlateTable();

            await TempPlate.upsert({
                singletonId: 1,
                licensePlate: normalizedPlate,
            });

            return { licensePlate: normalizedPlate };
        } catch (error) {
            console.error('Error storing temp plate:', error);
            throw {
                statusCode: 500,
                message: 'Failed to store temporary license plate',
            };
        } finally {
            await sequelize.close();
        }
    }

    async getTempPlate(): Promise<{ licensePlate: string } | null> {
        try {
            await sequelize.authenticate();
            await this.ensureTempPlateTable();

            const record = await TempPlate.findByPk(1);
            if (!record) {
                return null;
            }

            return { licensePlate: record.licensePlate };
        } catch (error) {
            console.error('Error fetching temp plate:', error);
            throw {
                statusCode: 500,
                message: 'Failed to fetch temporary license plate',
            };
        } finally {
            await sequelize.close();
        }
    }
}

