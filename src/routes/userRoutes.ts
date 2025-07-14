import {Request, Response, Router} from 'express';
import {
    generateAccessTokenViaRefreshToken,
    getUserById,
    login as userLogin,
    logout as userLogout,
    sendOtpToPhoneNumber
} from '../controllers/userController';
import {authenticate, UserPayload} from "../middleware/auth.middleware";
import {logger} from "../app";
import {handleError} from "../errors/customErrors";


const router: Router = Router();

router.post('/api/auth/send-otp', async (req: Request, res: Response) => {
    const {phoneNumber} = req.body;
    try {
        await sendOtpToPhoneNumber(phoneNumber);
        res.status(200).send({success: true, message: "OTP Sent Successfully", data: null});
        logger.info(`OTP sent successfully to ${phoneNumber}`);
    } catch (error: any) {
        handleError(error, res, logger);
    }
});

router.post('/api/auth/login', async (req: Request, res: Response) => {
    const {phoneNumber, otp} = req.body;
    try {
        const {accessToken, refreshToken, user} = await userLogin(phoneNumber, otp);
        res.status(200).json({success: true, message: "Logged user successfully", accessToken: accessToken, refreshToken: refreshToken, data: [user]});
        logger.info(`User with phone number ${phoneNumber} logged in successfully`);
    } catch (error: any) {
        handleError(error, res, logger);
    }
});

router.post('/api/auth/logout', authenticate, async (req: Request, res: Response) => {
    const {refreshToken} = req.body;
    try {
        await userLogout(refreshToken);
        res.status(200).send({success: true, message: "Successfully logged out", data: null});
        logger.info(`User with ID ${req.user?.id} logged out successfully`);
    } catch (error: any) {
        handleError(error, res, logger);
    }
});

router.post('/api/auth/refresh', async (req: Request, res: Response) => {
    const {token} = req.body;
    try {
        const accessToken = await generateAccessTokenViaRefreshToken(token);
        res.status(200).json({success: true, message: "Access token generated successfully", accessToken: accessToken, data: null});
        logger.info(`Access token generated successfully using refresh token`);
    } catch (error: any) {
        handleError(error, res, logger);
    }
});
router.get('/api/users/me', authenticate, async (req: Request, res: Response) => {
    const user = req.user as UserPayload | undefined;
    try {
        if (user?.id){
            const myUser = await getUserById(user?.id);
            res.status(200).send({success: true, message: "OTP Sent Successfully", data: myUser});
            logger.info(`User with ID ${user.id} retrieved successfully`);
        } else {
            res.status(400).send({success: false, message: "User not found", data: null});
            logger.error(`User with ID ${user?.id} not found`);
        }
    } catch (error: any) {
        res.status(500).send({success: false, message: error.message, data: null});
        logger.error(`Error retrieving user with ID ${user?.id}: ${error.message}`);
    }
});

export {
    router,
};
