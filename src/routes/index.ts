import { Router, Request, Response } from 'express';
import vehicleRoute from "@/routes/vehicleRoute";

const router = Router();

router.get('/', (req: Request, res: Response) => {
    res.json({ message: 'Welcome to the API' });
});

router.use('/vehicle', vehicleRoute)

export default router;