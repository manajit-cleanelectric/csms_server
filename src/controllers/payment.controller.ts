import {MissingParameterError} from "../errors/customErrors";
import {PaymentRequest, PaymentRequestStatus} from "../models/paymentOrders.model";
import PaymentGatewayService from "../services/razorpay.services";
import {Users} from "../models/user.model";
import {LedgerService} from "../services/ledger.service";
import {Wallet} from "../models/wallet.model";
import {EntryType, TxnCategory} from "../utils/enums";
import {UserProducer} from "../kafka/producers/user.producer";

async function createOrder(userId: string, amount: number) {
    if (!userId) {
        throw new MissingParameterError("Missing required user information");
    }
    try {
        const user = await Users.findOneBy({id: userId});
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

async function processOrder(orderId: string, status: boolean) {
    if (!orderId) {
        throw new MissingParameterError("Missing required order information");
    }
    try {

        const order = await PaymentRequest.findOne({
            where: {orderId: orderId},
            relations: ["user"]
        });
        if (!order) {
            throw new MissingParameterError("Missing required order.");
        }
        if (status) {
            let razorpayWallet = await Wallet.findOneByOrFail({code: `SYSTEM:RAZORPAY_SETTLEMENT`});
            const userWallet = await Wallet.findOneByOrFail({code: `USER:${order?.user?.id}`});
            let amount = order.amount.toString();
            await LedgerService.postBalancedTransaction({
                externalRef: `TOPUP:${orderId}`,
                category: TxnCategory.TOPUP,
                description: `Money is being added for topup: ${order?.id}`,
                legs: [
                    {wallet: razorpayWallet, type: EntryType.DEBIT, amount: amount, memo: 'User TOP_UP'},
                    {wallet: userWallet, type: EntryType.CREDIT, amount: amount, memo: 'User TOP_UP'}
                ]
            })
            order.status = PaymentRequestStatus.COMPLETED;
            await order.save();
            const userProducer = UserProducer.getInstance();
            await userProducer.sendTopUpMailMessage(order.user.phoneNumber, order.amount, order.orderId, order.updatedAt.toLocaleString());
            return true;
        }
        return false;
    } catch (error: any) {
        throw new Error(error.message);
    }
}

export {
    createOrder,
    processOrder,
}