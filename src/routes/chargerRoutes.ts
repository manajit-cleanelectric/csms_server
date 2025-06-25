import {Router, Request, Response} from 'express';
import {addCharger, listAllCharger} from '../controllers/chargerController';

const router: Router = Router();

router.get('/api/chargers', async (req: Request, res: Response) => {
    try {
        const chargers = await listAllCharger();
        res.status(200).send({success: true, message:"All charger found", data: chargers});
    } catch (error: any) {
        res.status(500).send({error: error.message});
    }
});

router.post('/api/chargers', async (req: Request, res: Response) => {
    try {
        const chargers = await addCharger(req.body);
        res.status(201).send({success: true, message:"New Charger Added", data: chargers});
    } catch (error: any) {
        res.status(500).send({error: error.message});
    }
});

export {router};
