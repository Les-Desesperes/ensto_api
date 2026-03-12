import { Request, Response } from 'express';
import {DeliveryDriver, sequelize, Vehicle} from "@les-desesperes/ensto-db";

export const getVehicleByPlate = async (req: Request, res: Response): Promise<void> => {
    try {
        await sequelize.authenticate();
        const { licensePlate } = req.params;

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
        await sequelize.close();
    } catch (error) {
        console.error('Error fetching vehicle by plate:', error);
        await sequelize.close();
        res.status(500).json({
            success: false,
            message: 'Internal Server Error',
        });
    }
};