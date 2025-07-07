import {Router, Request, Response} from 'express';
import {addVehicle} from "../controllers/vehicleController";

const router: Router = Router();


router.post('/api/users/:userId/vehicles', async (req: Request, res: Response) => {
    const userId = req.params.userId;
    const data = req.body;
    try {
        const vehicles = await addVehicle(userId, data);
        res.json(vehicles);
    } catch (error: any) {
        res.status(500).send({error: error.message});
    }
});

export {router};