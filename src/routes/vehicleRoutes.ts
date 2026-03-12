import { Router } from 'express';
import { getVehicleByPlate } from '@/controllers/vehicleController';

const router = Router();

// GET http://http://localhost:3000/api/v1/vehicle/plate/:licensePlate
router.get('/plate/:licensePlate', getVehicleByPlate);

export default router;