import {authenticate, authorize, UserPayload} from "../middleware/auth.middleware";
import {UserRoles} from "../models/users";
import {Request, Response} from "express";
import {logger} from "../app";
import {handleError} from "../errors/customErrors";
import {router} from "./userRoutes";
import {getUserWallet} from "../controllers/walletController";

router.get('/api/wallet/balance', authenticate, authorize(UserRoles.CUSTOMER), async (req: Request, res: Response) => {
    try {
        const user: UserPayload | undefined = req.user;
        if (user?.id) {
            const wallet = await getUserWallet(user?.id);
            res.status(200).send({success: true, message: "Wallet fetched successfully", data: wallet});
        } else {
            res.status(400).send({success: false, message: "User not found", data: null});
        }
    } catch (error: any) {
        handleError(error, res, logger);
    }
})


export {
    router,
};