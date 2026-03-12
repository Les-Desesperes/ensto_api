import { Router } from "express";

const vehicleRouter = Router();

vehicleRouter.get("/immat", (req, res) => {
    const plaque = req.query;

    if(!plaque) {
        return res.status(400).json({ status: 400, error: "Missing plaque parameter" });
    }

    console.log(plaque);

    return res.json({ status: 200, data: "immat" });
})

export default vehicleRouter;