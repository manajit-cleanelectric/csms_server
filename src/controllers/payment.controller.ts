import {MissingParameterError} from "../errors/customErrors";
import {PaymentRequest, PaymentRequestStatus} from "../models/paymentOrders.model";
import PaymentGatewayService from "../services/razorpay.services";
import {Users} from "../models/user.model";

async function createOrder(userId: string, amount: number) {
    if (!userId) {
        throw new MissingParameterError("Missing required user information");
    }
    try {
        const user = await Users.findOneBy({ id: userId });
        if (!user) {
            throw new MissingParameterError("Missing required user.");
        }
        const order = await PaymentGatewayService.createOrder(amount)
        const paymentRequest = new PaymentRequest();
        paymentRequest.orderId = order.id;
        paymentRequest.user = user;
        paymentRequest.amount = amount.toString();
        paymentRequest.status = PaymentRequestStatus.PENDING;
        await paymentRequest.save();
        return paymentRequest;
    } catch (error: any) {
        throw new Error(error.message);
    }
}


export {
    createOrder,
}