import {Request, Response, Router} from 'express';
import {
    addCharger,
    getCharger,
    getChargerByCity,
    getCities,
    listAllCharger,
    updateCharger
} from '../controllers/chargerController';
import {authenticate, authorize} from "../middleware/auth.middleware";
import {UserRoles} from "../models/users";
import {logger} from "../app";
import {handleError} from "../errors/customErrors";

const router: Router = Router();

router.get('/api/chargers', authenticate, async (req: Request, res: Response) => {
    try {
        const chargers = await listAllCharger();
        res.status(200).send({success: true, message: "All charger found", data: chargers});
        logger.info(`All chargers retrieved successfully`);
    } catch (error: any) {
        handleError(error, req, res);
    }
});

router.post('/api/chargers', authenticate, authorize(UserRoles.ADMINISTRATOR), async (req: Request, res: Response) => {
    try {
        const charger = await addCharger(req.body);
        res.status(201).send({success: true, message: "New Charger Added", data: charger});
        logger.info(`Charger with ID ${charger.id} added successfully`);
    } catch (error: any) {
        handleError(error, res, logger);
    }
});

router.put('/api/chargers/:chargerId', authenticate, authorize(UserRoles.ADMINISTRATOR), async (req: Request, res: Response) => {
    try {
        const {chargerId} = req.params;
        const updatedCharger  = await updateCharger(chargerId, req.body);
        res.status(200).send({success: true, message: "Charger Updated", data: updatedCharger});
        logger.info(`Charger with ID ${chargerId} updated successfully`);
    } catch (error: any) {
        handleError(error, res, logger);
    }
});

router.get('/api/chargers/:chargerId', authenticate, async (req: Request, res: Response) => {
    try {
        const {chargerId} = req.params;
        const charger = await getCharger(chargerId);
        res.status(200).send({success: true, message: "Charger Details", data: charger});
        logger.info(`Charger with ID ${chargerId} retrieved successfully`);
    } catch (error: any) {
        handleError(error, res, logger);
    }
});

router.get('/api/chargers/city/:city', authenticate, async (req: Request, res: Response) => {
    try {
        const {city} = req.params;
        const chargers = await getChargerByCity(city);
        res.status(200).send({success: true, message: "Charger Details by Location", data: chargers});
        logger.info(`Chargers in location ${city} retrieved successfully`);
    } catch (error: any) {
        handleError(error, res, logger);
    }
});

router.get('/api/cities', authenticate, async (req: Request, res: Response) => {
   try {
        const cities = await getCities();
        res.status(200).send({success: true, message: "Cities with Chargers", data: cities});
        logger.info(`Cities with chargers retrieved successfully`);
   } catch (error: any) {
         handleError(error, res, logger);
   }
});

export {
    router,
};
