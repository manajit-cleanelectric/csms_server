import {Router, Request, Response} from 'express';
import {login as userLogin} from '../controllers/userController';

const router: Router = Router();

router.post('/api/auth/send-otp', async (req: Request, res: Response) => {
    res.json({message: 'Get all users'});
});

router.post('/api/auth/login', async (req: Request, res: Response) => {
    const {phoneNumber, otp} = req.body;
    try {
        const {accessToken, refreshToken} = await userLogin(phoneNumber, otp);
        res.json({accessToken: accessToken, refreshToken: refreshToken});
    } catch (error: any) {
        res.status(500).send({error: error.message});
    }
});

export {router};
