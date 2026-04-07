import { Router } from 'express';
import { DeliveryDriverRoute } from './DeliveryDriverRoute';
import { VehicleRoute } from './VehicleRoute';
import { EmployeeRoute } from './EmployeeRoute';
import { VisitorRoute } from './VisitorRoute';
import { HistoryLogRoute } from './HistoryLogRoute';
import {CompanyRoute} from "@/routes/CompanyRoute";

/**
 * @openapi
 * /api/v1:
 *   get:
 *     tags: [System]
 *     summary: API welcome endpoint
 *     responses:
 *       200:
 *         description: API welcome message
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Welcome to the API
 */

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
const companyRoute = new CompanyRoute();

// Welcome route
router.get('/', (req, res) => {
    res.json({ message: 'Welcome to the API' });
});

// Mount the routers
router.use('/driver', driverRoute.getRouter());
router.use('/vehicle', vehicleRoute.getRouter());
router.use('/employee', employeeRoute.getRouter());
router.use('/employees', employeeRoute.getRouter());
router.use('/visitor', visitorRoute.getRouter());
router.use('/history-log', historyLogRoute.getRouter());
router.use('/company', companyRoute.getRouter());

export default router;