import { Router } from 'express';
import { getVehicleByPlate } from '@/controllers/vehicleController';

const router = Router();

// Define the route with the URL parameter :licensePlate
router.get('/plate/:licensePlate', getVehicleByPlate);

export default router;