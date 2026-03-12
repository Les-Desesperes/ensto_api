import { Router, Request, Response } from 'express';
import vehicleRouter from "@/routes/vehicle";

const router = Router();

router.get('/', (req: Request, res: Response) => {
    res.json({ message: 'Welcome to the API' });
});

router.use('/vehicle', vehicleRouter)

export default router;