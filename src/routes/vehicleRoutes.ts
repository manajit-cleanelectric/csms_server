import {Request, Response, Router} from 'express';
import {addVehicle, getVehicleById} from "../controllers/vehicleController";
import {authenticate} from "../middleware/auth.middleware";
import {logger} from "../app";
import {handleError} from "../errors/customErrors";

const router: Router = Router();


router.post('/api/users/:userId/vehicles', authenticate, async (req: Request, res: Response) => {
    const userId = req.params.userId;
    const data = req.body;
    try {
        const vehicle = await addVehicle(userId, data);
        res.status(201).send({status: true, message: "Vehicle added successfully", data: [vehicle]});
    } catch (error: any) {
        handleError(error, res, logger);
    }
});

router.get('/api/vehicles/:vehicleId', authenticate, async (req: Request, res: Response) => {
    const vehicleId = req.params.vehicleId;
    try {
        const vehicle = await getVehicleById(vehicleId);
        res.status(200).send({status: true, message: "Vehicle retrieved successfully", data: [vehicle]});
        logger.info(`Vehicle with ID ${vehicleId} retrieved successfully`);
    } catch (error: any) {
        handleError(error, res, logger);
    }
})


export {router};