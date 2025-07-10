import {Request, Response, Router} from 'express';
import {
    generateAccessTokenViaRefreshToken,
    getUserById,
    login as userLogin,
    logout as userLogout,
    sendOtpToPhoneNumber
} from '../controllers/userController';
import {authenticate, UserPayload} from "../middleware/auth.middleware";


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
router.post('/api/users/me', authenticate, async (req: Request, res: Response) => {
    const user = req.user as UserPayload | undefined;
    try {
        if (user?.id){
            const myUser = await getUserById(user?.id);
            res.status(200).send({success: true, message: "OTP Sent Successfully", data: myUser});
        } else {
            res.status(400).send({success: false, message: "User not found", data: null});
        }
    } catch (error: any) {
        res.status(500).send({success: false, message: error.message, data: null});
    }
});

export {
    router,
};
