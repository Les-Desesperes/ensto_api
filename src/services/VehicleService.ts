import { Vehicle, DeliveryDriver, sequelize } from '@les-desesperes/ensto-db';
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
}

