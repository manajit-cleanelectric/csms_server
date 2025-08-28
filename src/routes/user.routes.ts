import {Request, Response, Router} from 'express';
import {
    addMoney,
    addUserInfo,
    approveUser,
    changeUserRole,
    generateAccessTokenViaRefreshToken,
    getUserByIdWithVehicles,
    isPhoneNoAvailable,
    login as userLogin,
    logout as userLogout,
    sendOtpToPhoneNumber,
    updateUser,
    updateUserPhoneNo,
    listCustomers
} from '../controllers/user.controller';
import {authenticate, authorize} from "../middleware/auth.middleware";
import {apiLimiter, logger} from "../app";
import {handleError} from "../errors/customErrors";
import {UserRoles} from "../models/user.model";


const router: Router = Router();

router.post('/api/auth/send-otp', apiLimiter);
router.post('/api/auth/send-otp', async (req: Request, res: Response) => {
    try {
        const {phoneNumber} = req.body;
        await sendOtpToPhoneNumber(phoneNumber);
        res.status(200).send({success: true, message: "OTP Sent Successfully", data: null});
        logger.info(`OTP sent successfully to ${phoneNumber}`);
    } catch (error: any) {
        handleError(error, res, logger);
    }
});

router.post('/api/auth/login', async (req: Request, res: Response) => {
    try {
        const {phoneNumber, otp} = req.body;
        const {accessToken, refreshToken, user} = await userLogin(phoneNumber, otp);
        res.status(200).json({
            success: true,
            message: "OTP verified successfully",
            accessToken: accessToken,
            refreshToken: refreshToken,
            data: user
        });
        logger.info(`User with phone number ${phoneNumber} logged in successfully`);
    } catch (error: any) {
        handleError(error, res, logger);
    }
});

router.post('/api/auth/logout', authenticate, async (req: Request, res: Response) => {
    try {
        const {refreshToken} = req.body;
        await userLogout(refreshToken);
        res.status(200).send({success: true, message: "Successfully logged out", data: null});
        logger.info(`User with ID ${req.user?.id} logged out successfully`);
    } catch (error: any) {
        handleError(error, res, logger);
    }
});

router.post('/api/auth/refresh', async (req: Request, res: Response) => {
    try {
        const {refreshToken} = req.body;
        const accessToken = await generateAccessTokenViaRefreshToken(refreshToken);
        res.status(200).json({
            success: true,
            message: "Access token generated successfully",
            accessToken: accessToken,
            data: null
        });
        logger.info(`Access token generated successfully using refresh token`);
    } catch (error: any) {
        handleError(error, res, logger);
    }
});

router.get('/api/users/me', authenticate, async (req: Request, res: Response) => {
    const user = req.user;
    try {
        if (user?.id) {
            const myUser = await getUserByIdWithVehicles(user?.id);
            res.status(200).send({success: true, message: "User details fetched.", data: myUser});
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

router.post('/api/users/me', authenticate, async (req: Request, res: Response) => {
    const user = req.user;
    try {
        const updatedUser = await addUserInfo(user!.id, req.body);
        res.status(200).send({success: true, message: "User information added successfully", data: updatedUser});
        logger.info(`UserInfo for ID ${user?.id} added successfully`);
    } catch (error: any) {
        handleError(error, res, logger);
    }
});

router.put('/api/users/me', authenticate, async (req: Request, res: Response) => {
    const user = req.user;
    try {
        const updatedUser = await updateUser(user!.id, req.body);
        res.status(200).send({success: true, message: "User information updated successfully", data: updatedUser});
        logger.info(`User with ID ${user?.id} updated successfully`);
    } catch (error: any) {
        handleError(error, res, logger);
    }
});

router.get('/api/users/is-phone-available', authenticate, async (req: Request, res: Response) => {
    try {
        const {phoneNumber} = req.body;
        const isAvailable = await isPhoneNoAvailable(phoneNumber);
        if (isAvailable) {
            res.status(200).send({success: true, message: "Phone number is available", data: null});
            logger.info(`User with phone number ${phoneNumber} is available`);
        } else {
            res.status(400).send({success: false, message: "Phone number is already in use", data: null});
            logger.warn(`Phone number ${phoneNumber} is already in use`);
        }
    } catch (error: any) {
        return handleError(error, res, logger);
    }
});

router.put('/api/users/me/update-phone', authenticate, async (req: Request, res: Response) => {
    const user = req.user;
    try {
        const {phoneNumber, otp} = req.body;
        const userWithUpdatedPhone = await updateUserPhoneNo(user!.id, phoneNumber, otp);
        res.status(200).send({success: true, message: "Phone number updated successfully", data: userWithUpdatedPhone});
        logger.info(`Phone number for user with ID ${user?.id} updated successfully`);
    } catch (error: any) {
        handleError(error, res, logger);
    }
});

router.get('/api/users/:userId/approve', authenticate, authorize(UserRoles.SUPERVISOR), async (req: Request, res: Response) => {
    try {
        const userId = req.params.userId;
        await approveUser(userId);
        res.status(200).send({success: true, message: "User approved successfully", data: null});
        logger.info(`User with ID ${userId} approved successfully`);
    } catch (error: any) {
        handleError(error, res, logger);
    }
})

router.get('/api/users', authenticate, authorize(UserRoles.SUPERVISOR, UserRoles.ADMINISTRATOR), async (req: Request, res: Response) => {
    try {
        const customers = await listCustomers()
        res.status(200).send({success: true, message: "User approved successfully", data: customers});
    } catch (error: any) {
        handleError(error, res, logger);
    }
})

router.post('/api/upgrade-user-to-supervisor', authenticate, authorize(UserRoles.ADMINISTRATOR), async (req: Request, res: Response) => {
    try {
        const {userId} = req.body;
        await changeUserRole(userId, UserRoles.SUPERVISOR)
        res.status(200).send({success: true, message: "Upgraded user to Supervisor", data: null});
    } catch (error: any) {
        handleError(error, res, logger);
    }
})

router.post('/api/add-money', authenticate, authorize(UserRoles.SUPERVISOR), async (req: Request, res: Response) => {
    try {
        const {userId, amount, transactionId, upiId} = req.body;
        await addMoney(userId, amount, transactionId, upiId);
        res.status(200).send({success: true, message: "Money Added Successfully", data: null});
    } catch (error: any) {
        handleError(error, res, logger);
    }
})


export {
    router,
};
