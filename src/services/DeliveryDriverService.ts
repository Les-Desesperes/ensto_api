import { Company, DeliveryDriver } from '@les-desesperes/ensto-db';
import { IService } from '@/shared/interfaces';
import { broadcastNotification } from '@/websockets';
import logger from '@/shared/logger';

/**
 * DeliveryDriverService
 * Handles all business logic related to delivery drivers.
 * This service interacts with the DeliveryDriver model from the @les-desesperes/ensto-db package.
 * 
 * SOLID Principles:
 * - Single Responsibility: Only handles driver-related operations
 * - Dependency Inversion: Depends on abstractions (IService), not concrete implementations
 */
export class DeliveryDriverService implements IService {
    /**
     * Retrieves all delivery drivers from the database.
     * The afterFind hook will automatically decrypt the names.
     * @returns Array of all delivery drivers
     */
    async getAllDrivers(): Promise<any[]> {
        try {
            const drivers = await DeliveryDriver.findAll();
            const companyCache = new Map<string, string>();

            return Promise.all(
                drivers.map(async (driver: any) => {
                    const raw = typeof driver.toJSON === 'function' ? driver.toJSON() : driver;
                    const companyToken = raw?.company == null ? '' : String(raw.company).trim();

                    const companyName = await this.resolveCompanyName(companyToken, companyCache);

                    return {
                        ...raw,
                        companyId: companyToken || null,
                        company: companyName,
                    };
                })
            );
        } catch (error) {
            logger.error({ err: error }, 'Error fetching drivers from database');
            throw {
                statusCode: 500,
                message: 'Failed to fetch drivers',
            };
        }
    }

    /**
     * Creates a new delivery driver with the provided data.
     * Validates required fields and broadcasts a notification via WebSocket.
     * @param firstName - Driver's first name
     * @param lastName - Driver's last name
     * @param companyId - Company ID the driver belongs to
     * @param ppeCharterValid - Whether the PPE charter is valid
     * @param ppeSignatureDate - Date of PPE signature
     * @returns The newly created driver
     */
    async createDriver(
        firstName: string,
        lastName: string,
        companyId: string,
        ppeCharterValid?: boolean,
        ppeSignatureDate?: string | Date
    ): Promise<any> {
        // Validation
        if (!firstName || !lastName || !companyId) {
            throw {
                statusCode: 400,
                message: 'firstName, lastName, and companyId are required fields.',
            };
        }

        try {
            // Create the driver using Sequelize model
            const parsedDate = ppeSignatureDate
                ? typeof ppeSignatureDate === 'string'
                    ? new Date(ppeSignatureDate)
                    : ppeSignatureDate
                : null;

            const newDriver = await DeliveryDriver.create({
                encryptedFirstName: firstName,
                encryptedLastName: lastName,
                company: companyId,
                ppeCharterValid: ppeCharterValid || false,
                ppeSignatureDate: parsedDate,
            });

            // Broadcast the event to all connected WebSocket clients
            broadcastNotification({
                type: 'NEW_DRIVER',
                message: `New driver ${firstName} ${lastName} has been added to the system.`,
                payload: newDriver,
            });

            return newDriver;
        } catch (error) {
            logger.error({ err: error }, 'Error creating driver in database');
            throw {
                statusCode: 500,
                message: 'Failed to create driver',
            };
        }
    }

    /**
     * Retrieves a driver by their ID.
     * @param driverId - The ID of the driver to retrieve
     * @returns The driver if found, null otherwise
     */
    async getDriverById(driverId: string): Promise<any> {
        try {
            const driver = await DeliveryDriver.findOne({
                where: { driverId },
            });
            return driver;
        } catch (error) {
            logger.error({ err: error }, 'Error fetching driver by ID');
            throw {
                statusCode: 500,
                message: 'Failed to fetch driver',
            };
        }
    }

    private async resolveCompanyName(companyToken: string, cache: Map<string, string>): Promise<string> {
        if (!companyToken) {
            return '';
        }

        const cached = cache.get(companyToken);
        if (cached != null) {
            return cached;
        }

        try {
            const byPk = await Company.findByPk(companyToken as any);
            const byPkName = (byPk as any)?.name;
            if (typeof byPkName === 'string' && byPkName.trim()) {
                cache.set(companyToken, byPkName);
                return byPkName;
            }
        } catch (_err) {
            // Ignore and fallback to other lookup strategy.
        }

        try {
            const byName = await Company.findOne({ where: { name: companyToken } });
            const byNameValue = (byName as any)?.name;
            if (typeof byNameValue === 'string' && byNameValue.trim()) {
                cache.set(companyToken, byNameValue);
                return byNameValue;
            }
        } catch (_err) {
            // Ignore and fallback to raw token.
        }

        cache.set(companyToken, companyToken);
        return companyToken;
    }
}

