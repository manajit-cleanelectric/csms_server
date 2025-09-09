import {Request, Response, Router} from 'express';
import {authenticate, authorize} from "../middleware/auth.middleware";
import {logger, RAZORPAY_WEBHOOK_SECRET} from "../app";
import {handleError} from "../errors/customErrors";
import {UserRoles} from "../models/user.model";
import {createOrder, processOrder} from "../controllers/payment.controller";
import {validateWebhookSignature} from "razorpay/dist/utils/razorpay-utils";


const router: Router = Router();


router.post('/api/payments/create-order', authenticate, authorize(UserRoles.CUSTOMER), async (req: Request, res: Response) => {
    try {
        const user = req.user;
        const {amount} = req.body;
        if (user?.id) {
            const paymentRequest = await createOrder(user.id, Number(amount));
            res.status(200).send({success: true, message: "Order created.", data: paymentRequest});
            logger.info(`User with ID ${user.id} created a payment request`);
        } else {
            res.status(400).send({success: false, message: "User not found", data: null});
            logger.error(`User with ID ${user?.id} not found`);
        }
    } catch (error: any) {
        handleError(error, res, logger);
    }
});
router.post('/api/payments/razorpay/webhook', async (req: Request, res: Response) => {
    try {
        const webhookBody: any = req.body;
        const webhookSignature: any = req.headers['x-razorpay-signature'];
        const isValid: boolean = validateWebhookSignature(JSON.stringify(webhookBody), webhookSignature, RAZORPAY_WEBHOOK_SECRET)
        if(isValid) {
            const status = await processOrder(webhookBody?.payload?.order?.entity?.id,webhookBody?.payload?.payment?.entity?.status === "captured");
            if (status) {
                res.status(200).send({success: true, message: "Payment Received", data: undefined});
            } else {
                res.status(200).send({success: false, message: "Payment Failed", data: undefined});
            }
        }
        logger.info("Web hook is triggered");
    } catch (error: any) {
        handleError(error, res, logger);
    }
});

export {
    router,
}