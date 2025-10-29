import {Request, Response, Router} from 'express';
import {
    addCharger,
    getCharger,
    getChargerByCity, getChargersNearLocation,
    getCities,
    listAllCharger,
    updateCharger, updateChargerAddress, updateChargerData, updateChargerTariff, updateConnectorType
} from '../controllers/charger.controller';
import {authenticate, authorize} from "../middleware/auth.middleware";
import {UserRoles} from "../models/user.model";
import {logger} from "../services/logger.service";
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

router.patch('/api/chargers/:chargerId/address', authenticate, authorize(UserRoles.ADMINISTRATOR), async (req: Request, res: Response) => {
    try {
        const {chargerId} = req.params;
        const updatedCharger = await updateChargerAddress(chargerId, req.body);
        res.status(200).send({success: true, message: "Charger Address Updated", data: updatedCharger});
        logger.info(`Charger with ID ${chargerId} address updated successfully`);
    } catch (error: any) {
        handleError(error, res, logger);
    }
});

router.patch('/api/chargers/:chargerId/tariff', authenticate, authorize(UserRoles.ADMINISTRATOR), async (req: Request, res: Response) => {
    try {
        const {chargerId} = req.params;
        const updatedCharger = await updateChargerTariff(chargerId, req.body);
        res.status(200).send({success: true, message: "Charger Tariff Updated", data: updatedCharger});
        logger.info(`Charger with ID ${chargerId} tariff updated successfully`);
    } catch (error: any) {
        handleError(error, res, logger);
    }
});

router.patch('/api/chargers/:chargerId/data', authenticate, authorize(UserRoles.ADMINISTRATOR), async (req: Request, res: Response) => {
    try {
        const {chargerId} = req.params;
        const updatedCharger = await updateChargerData(chargerId, req.body);
        res.status(200).send({success: true, message: "Charger Data Updated", data: updatedCharger});
        logger.info(`Charger with ID ${chargerId} data updated successfully`);
    } catch (error: any) {
        handleError(error, res, logger);
    }
});

router.patch('/api/chargers/:chargerId/connector', authenticate, authorize(UserRoles.ADMINISTRATOR), async (req: Request, res: Response) => {
    try {
        const {chargerId} = req.params;
        const {connectorId, connectorType} = req.body;
        const updatedCharger = await updateConnectorType(chargerId, connectorId, connectorType);
        res.status(200).send({success: true, message: "Charger Connector Type Updated", data: updatedCharger});
        logger.info(`Charger with ID ${chargerId} connector type updated successfully`);
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

router.get('/api/chargers/nearby/me', authenticate, async (req: Request, res: Response) => {
    try {
        const {longitude, latitude, radius=40} = req.query;
        const chargers = await getChargersNearLocation(
            parseFloat(longitude as string),
            parseFloat(latitude as string),
            parseInt(radius as string)
        );
        res.status(200).send({success: true, message: "Nearby Chargers", data: chargers});
        logger.info(`Nearby chargers retrieved successfully`);
    } catch (error: any) {
        handleError(error, res, logger);
    }
});

export {
    router,
};
