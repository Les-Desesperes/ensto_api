import { Request, Response } from 'express';
import { DeliveryDriver } from "@les-desesperes/ensto-db";
import {broadcastNotification} from "@/websockets";

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
        // Changed 'company' to 'companyId' to match the v2 Database schema
        const { firstName, lastName, companyId, ppeCharterValid, ppeSignatureDate } = req.body;

        // Basic validation
        if (!firstName || !lastName || !companyId) {
            res.status(400).json({
                success: false,
                message: 'firstName, lastName, and companyId are required fields.',
            });
            return;
        }

        // Create the driver
        const newDriver = await DeliveryDriver.create({
            encryptedFirstName: firstName,
            encryptedLastName: lastName,
            company: companyId, // Foreign key linking to the Company table
            ppeCharterValid: ppeCharterValid || false,
            ppeSignatureDate: ppeSignatureDate || null,
        });

        // 🚀 Broadcast the event to all connected WebSocket clients (e.g., Next.js frontend)
        broadcastNotification({
            type: 'NEW_DRIVER',
            message: `New driver ${firstName} ${lastName} has been added to the system.`,
            payload: newDriver
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