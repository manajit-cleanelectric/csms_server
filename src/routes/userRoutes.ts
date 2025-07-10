import {Router, Request, Response} from 'express';
import {
    getUserById,
    login as userLogin,
    logout as userLogout,
    generateAccessTokenViaRefreshToken
} from '../controllers/userController';
import {sendOtpToPhoneNumber} from '../controllers/userController'
import {authenticate} from "../middleware/auth.middleware";
import {UserPayload} from "../middleware/auth.middleware";


const router: Router = Router();

router.post('/api/auth/send-otp', async (req: Request, res: Response) => {
    const {phoneNumber} = req.body;
    try {
        await sendOtpToPhoneNumber(phoneNumber);
        res.status(200).send({success: true, message: "OTP Sent Successfully", data: null});
    } catch (error: any) {
        res.status(500).send({success: false, message: error.message, data: null});
    }
});

router.post('/api/auth/login', async (req: Request, res: Response) => {
    const {phoneNumber, otp} = req.body;
    try {
        const {accessToken, refreshToken} = await userLogin(phoneNumber, otp);
        res.status(200).json({accessToken: accessToken, refreshToken: refreshToken});
    } catch (error: any) {
        res.status(500).send({error: error.message});
    }
});

router.post('/api/auth/logout', authenticate, async (req: Request, res: Response) => {
    const {refreshToken} = req.body;
    try {
        await userLogout(refreshToken);
        res.status(200).send({success: true, message: "Successfully logged out", data: null});
    } catch (error: any) {
        res.status(500).send({error: error.message});
    }
});

router.post('/api/auth/refresh', async (req: Request, res: Response) => {
    const {token} = req.body;
    try {
        const accessToken = await generateAccessTokenViaRefreshToken(token);
        res.status(200).json({accessToken: accessToken});
    } catch (error: any) {
        res.status(500).send({error: error.message});
    }
});
router.get('/api/users/me', authenticate, async (req: Request, res: Response) => {
    const user = req.user as UserPayload | undefined;
    try {
        const myUser = await getUserById(Number(user?.id));
        res.status(200).send({success: true, message: "OTP Sent Successfully", data: myUser});
    } catch (error: any) {
        res.status(500).send({success: false, message: error.message, data: null});
    }
});

export {
    router,
};
