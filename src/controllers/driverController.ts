import { Request, Response } from 'express';
import {DeliveryDriver} from "@les-desesperes/ensto-db";

// GET: Fetch all delivery drivers
export const getDrivers = async (req: Request, res: Response): Promise<void> => {
    try {
        const drivers = await DeliveryDriver.findAll();

        // Note: The afterFind hook will automatically decrypt the names before sending them to the client
        res.status(200).json({
            success: true,
            data: drivers,
        });
    } catch (error) {
        console.error('Error fetching drivers:', error);
        res.status(500).json({
            success: false,
            message: 'Internal Server Error',
        });
    }
};

// POST: Create a new delivery driver
export const createDriver = async (req: Request, res: Response): Promise<void> => {
    try {
        const { firstName, lastName, company, ppeCharterValid, ppeSignatureDate } = req.body;

        // Basic validation
        if (!firstName || !lastName || !company) {
            res.status(400).json({
                success: false,
                message: 'firstName, lastName, and company are required fields.',
            });
            return;
        }

        // Create the driver
        const newDriver = await DeliveryDriver.create({
            // We pass the raw names to the encrypted fields.
            // The Sequelize beforeSave hook will encrypt them before insertion.
            encryptedFirstName: firstName,
            encryptedLastName: lastName,
            company,
            ppeCharterValid: ppeCharterValid || false,
            ppeSignatureDate: ppeSignatureDate || null,
        });

        res.status(201).json({
            success: true,
            message: 'Driver created successfully',
            data: newDriver,
        });
    } catch (error) {
        console.error('Error creating driver:', error);
        res.status(500).json({
            success: false,
            message: 'Internal Server Error',
        });
    }
};