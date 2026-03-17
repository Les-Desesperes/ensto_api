import { Router } from 'express';
import { DeliveryDriverRoute } from './DeliveryDriverRoute';
import { VehicleRoute } from './VehicleRoute';
import { EmployeeRoute } from './EmployeeRoute';
import { VisitorRoute } from './VisitorRoute';
import { HistoryLogRoute } from './HistoryLogRoute';

/**
 * Main API Router
 * Aggregates all route classes and mounts them to the main router.
 * This is the entry point for all API routes.
 */
const router = Router();

// Instantiate route classes
const driverRoute = new DeliveryDriverRoute();
const vehicleRoute = new VehicleRoute();
const employeeRoute = new EmployeeRoute();
const visitorRoute = new VisitorRoute();
const historyLogRoute = new HistoryLogRoute();

// Welcome route
router.get('/', (req, res) => {
    res.json({ message: 'Welcome to the API' });
});

// Mount the routers
router.use('/driver', driverRoute.getRouter());
router.use('/vehicle', vehicleRoute.getRouter());
router.use('/employee', employeeRoute.getRouter());
router.use('/visitor', visitorRoute.getRouter());
router.use('/history-log', historyLogRoute.getRouter());

export default router;