import {Request, Response, Router} from 'express';
import {
    addVehicle, approveVehicle,
    deleteImageFromDisk,
    getVehicleById,
    getVehiclesByUserId, listUnapprovedVehicles, removeVehicle,
    replaceVehicle, updateBinOfVehicle,
    updateVehicle
} from "../controllers/vehicle.controller";
import {authenticate, authorize} from "../middleware/auth.middleware";
import {uploadRcImage} from "../middleware/image.middleware";
import {logger} from "../services/logger.service";
import {handleError} from "../errors/customErrors";
import {UserRoles} from "../models/user.model";

const router: Router = Router();

router.get('/api/users/:userId/vehicles', authenticate, authorize(UserRoles.CUSTOMER), async (req: Request, res: Response) => {
    try {
        const userId = req.params.userId;
        const vehicles = await getVehiclesByUserId(userId);
        logger.info(`Vehicles for user with ID ${userId} retrieved successfully`);
        res.status(200).send({status: true, message: "Vehicles retrieved successfully", data: vehicles});
    } catch (error: any) {
        handleError(error, res, logger);
    }
});

router.post('/api/users/:userId/vehicles', authenticate, authorize(UserRoles.CUSTOMER), uploadRcImage, async (req: Request, res: Response) => {
    try {
        const userId = req.params.userId;
        const data = req.body;
        const vehicle = await addVehicle(userId, data);
        logger.info(`Vehicle added for user with ID ${userId}`);
        res.status(201).send({status: true, message: "Vehicle added successfully", data: vehicle});
    } catch (error: any) {
        deleteImageFromDisk(req.body.rcImageUrl);
        handleError(error, res, logger);
    }
});

router.get('/api/vehicles/:vehicleId', authenticate, authorize(UserRoles.CUSTOMER), async (req: Request, res: Response) => {
    try {
        const vehicleId = req.params.vehicleId;
        const vehicle = await getVehicleById(vehicleId);
        res.status(200).send({status: true, message: "Vehicle retrieved successfully", data: vehicle});
        logger.info(`Vehicle with ID ${vehicleId} retrieved successfully`);
    } catch (error: any) {
        handleError(error, res, logger);
    }
});

router.put('/api/vehicles/:vehicleId', authenticate, authorize(UserRoles.CUSTOMER), uploadRcImage, async (req: Request, res: Response) => {
    try {
        const vehicleId = req.params.vehicleId;
        const data = req.body;
        const vehicle = await replaceVehicle(vehicleId, data);
        logger.info(`Vehicle with ID ${vehicle.id} updated successfully`);
        res.status(200).send({status: true, message: "Vehicle updated successfully", data: vehicle});
    } catch (error: any) {
        deleteImageFromDisk(req.body.rcImageUrl);
        handleError(error, res, logger);
    }
});

router.patch('/api/vehicles/:vehicleId', authenticate, authorize(UserRoles.CUSTOMER), async (req: Request, res: Response) => {
    try {
        const vehicleId = req.params.vehicleId;
        const data = req.body;
        const vehicle = await updateVehicle(vehicleId, data);
        logger.info(`Vehicle with ID ${vehicleId} updated successfully`);
        res.status(200).send({status: true, message: "Vehicle updated successfully", data: vehicle});
    } catch (error: any) {
        handleError(error, res, logger);
    }
});

router.put('/api/vehicles/update-bin-number', authenticate, authorize(UserRoles.SUPERVISOR), async (req: Request, res: Response) => {
    try {
        const {vin, bin} = req.body;
        await updateBinOfVehicle(vin, bin);
        res.status(200).send({status: true, message: "Vehicle updated successfully", data: null});
    } catch (error: any) {
        handleError(error, res, logger);
    }
});

router.delete('/api/vehicles/:vehicleId', authenticate, authorize(UserRoles.SUPERVISOR), async (req: Request, res: Response) => {
    try {
        const vehicleId = req.params.vehicleId;
        const result = await removeVehicle(vehicleId);
        logger.info(`Vehicle with ID ${vehicleId} removed successfully`);
        res.status(200).send({status: true, message: "Vehicle removed successfully", data: null});
    } catch (error: any) {
        handleError(error, res, logger);
    }
});

router.get('/api/vehicles/unapproved-vehicles', authenticate, authorize(UserRoles.SUPERVISOR), async (req: Request, res: Response) => {
    try {
        const unapprovedVehicles = await listUnapprovedVehicles()
        logger.info(`Unapproved vehicles retrieved successfully`);
        res.status(200).send({status: true, message: "Unapproved vehicles retrieved successfully", data: unapprovedVehicles});
    } catch (error: any) {
        handleError(error, res, logger);
    }
});

router.post('/api/vehicles/:vehicleId/approve', authenticate, authorize(UserRoles.SUPERVISOR), async (req: Request, res: Response) => {
    try {
        const vehicleId = req.params.vehicleId;
        const vehicle = await approveVehicle(vehicleId)
        logger.info(`Vehicle with ID ${vehicleId} approved successfully`);
        res.status(200).send({status: true, message: "Vehicle approved successfully", data: vehicle});
    } catch (error: any) {
        handleError(error, res, logger);
    }
});


export {
    router,
};