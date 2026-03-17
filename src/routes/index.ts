import { Router } from 'express';
import { DeliveryDriverRoute } from './DeliveryDriverRoute';
import { VehicleRoute } from './VehicleRoute';

/**
 * Main API Router
 * Aggregates all route classes and mounts them to the main router.
 * This is the entry point for all API routes.
 */
const router = Router();

// Instantiate route classes
const driverRoute = new DeliveryDriverRoute();
const vehicleRoute = new VehicleRoute();

// Welcome route
router.get('/', (req, res) => {
    res.json({ message: 'Welcome to the API' });
});

// Mount the routers
router.use('/driver', driverRoute.getRouter());
router.use('/vehicle', vehicleRoute.getRouter());

export default router;