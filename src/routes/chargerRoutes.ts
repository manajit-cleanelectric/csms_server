import {Request, Response, Router} from 'express';
import {
    addCharger,
    getCharger,
    getChargerByCity,
    listAllCharger,
    updateCharger
} from '../controllers/chargerController';
import {authenticate, authorize} from "../middleware/auth.middleware";
import {UserRoles} from "../models/users";

const router: Router = Router();

router.get('/api/chargers', authenticate, async (req: Request, res: Response) => {
    try {
        const chargers = await listAllCharger();
        res.status(200).send({success: true, message: "All charger found", data: chargers});
    } catch (error: any) {
        res.status(500).send({error: error.message});
    }
});

router.post('/api/chargers', authenticate, authorize(UserRoles.ADMINISTRATOR), async (req: Request, res: Response) => {
    try {
        const chargers = await addCharger(req.body);
        res.status(201).send({success: true, message: "New Charger Added", data: chargers});
    } catch (error: any) {
        res.status(500).send({error: error.message});
    }
});

router.put('/api/chargers/:chargerId', authenticate, authorize(UserRoles.ADMINISTRATOR), async (req: Request, res: Response) => {
    try {
        const {chargerId} = req.params;
        const charger = await getCharger(chargerId);
        if (charger) {
            const updatedCharger  = await updateCharger(charger, req.body);
            res.status(200).send({success: true, message: "Charger Updated", data: updatedCharger});
        }else {
            res.status(404).send({success: false, message: "Charger not found"});
        }
    } catch (error: any) {
        res.status(500).send({error: error.message});
    }
});

router.get('/api/chargers/:chargerId', authenticate, async (req: Request, res: Response) => {
    try {
        const {chargerId} = req.params;
        const chargers = await getCharger(chargerId);
        res.status(200).send({success: true, message: "Charger Details", data: chargers});
    } catch (error: any) {
        res.status(500).send({error: error.message});
    }
});

router.get('/api/chargers/location/:location', authenticate, async (req: Request, res: Response) => {
    try {
        const {location} = req.params;
        const chargers = await getChargerByCity(location);
        res.status(200).send({success: true, message: "Charger Details by Location", data: chargers});
    } catch (error: any) {
        res.status(500).send({error: error.message});
    }
})

export {
    router,
};
