import {Request, Response, Router} from 'express';
import {addVehicle, getVehicleById} from "../controllers/vehicleController";
import {authenticate} from "../middleware/auth.middleware";

const router: Router = Router();


router.post('/api/users/:userId/vehicles', authenticate, async (req: Request, res: Response) => {
    const userId = req.params.userId;
    const data = req.body;
    try {
        const vehicles = await addVehicle(userId, data);
        res.json(vehicles);
    } catch (error: any) {
        res.status(500).send({error: error.message});
    }
});

router.get('/api/vehicles/:vehicleId', authenticate, async (req: Request, res: Response) => {
    const vehicleId = req.params.vehicleId;
    try {
        const vehicle = await getVehicleById(vehicleId);
        if (!vehicle) {
            res.status(404).send({error: "Vehicle not found"});
        }
        res.status(200).send({vehicle});
    } catch (error: any) {
        res.status(500).send({error: error.message});
    }
})


export {router};