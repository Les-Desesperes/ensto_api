import { Router } from 'express';
import { getDrivers, createDriver } from '@/controllers/driverController';

const router = Router();

// GET http://localhost:3000/api/v1/driver/
router.get('/', getDrivers);

// POST http://localhost:3000/api/v1/driver/
router.post('/', createDriver);

export default router;