import { Router } from 'express';
import vehicleRoutes from './vehicleRoutes';
import driverRoutes from './driverRoutes';

const router = Router();

router.get('/', (req, res) => {
    res.json({ message: 'Welcome to the API' });
});

// Mount the routes
router.use('/vehicle', vehicleRoutes);
router.use('/driver', driverRoutes);

export default router;