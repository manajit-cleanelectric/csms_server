import Razorpay from "razorpay";
import {RAZORPAY_API_KEY_ID, RAZORPAY_API_KEY_SECRET} from "../app";


class PaymentGatewayService {
    private static instance: PaymentGatewayService;
    private readonly razorpay: Razorpay;

    // private constructor ensures no external `new`
    private constructor() {
        this.razorpay = new Razorpay({
            key_id: RAZORPAY_API_KEY_ID,
            key_secret: RAZORPAY_API_KEY_SECRET,
        });
        console.log("PaymentGatewayService initialized");
    }

    // this always returns the single shared instance
    public static getInstance(): PaymentGatewayService {
        if (!PaymentGatewayService.instance) {
            PaymentGatewayService.instance = new PaymentGatewayService();
        }
        return PaymentGatewayService.instance;
    }

    public static async createOrder(amount: number, currency = "INR") {
        return await PaymentGatewayService.getInstance().razorpay.orders.create({
            amount: amount * 100, // Razorpay expects amount in paise
            currency,
        });
    }
}

export default PaymentGatewayService;