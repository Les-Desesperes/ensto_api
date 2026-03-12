import { Request, Response } from 'express';
import { Vehicle, DeliveryDriver } from '../models'; // Importing from the models index to include associations

export const getVehicleByPlate = async (req: Request, res: Response): Promise<void> => {
    try {
        const { licensePlate } = req.params;

        // Find the vehicle and optionally include the associated driver
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
            res.status(404).json({
                success: false,
                message: `Vehicle with license plate ${licensePlate} not found.`,
            });
            return;
        }

        res.status(200).json({
            success: true,
            data: vehicle,
        });
    } catch (error) {
        console.error('Error fetching vehicle by plate:', error);
        res.status(500).json({
            success: false,
            message: 'Internal Server Error',
        });
    }
};