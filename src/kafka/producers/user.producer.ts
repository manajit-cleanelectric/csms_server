import {LocalProducer} from "./producer";
import {UserProducerConfig} from "../config/producer.config";
import {Message} from "kafkajs";

class UserProducer extends LocalProducer{
    private static instance: UserProducer;

    /**
     * Private constructor to enforce singleton pattern.
     * @private
     */
    private constructor() {
        super(UserProducerConfig);
    }

    /**
     * Get the singleton instance of UserProducer.
     * @returns {UserProducer} The singleton instance.
     */
    public static getInstance(): UserProducer {
        if (!UserProducer.instance) {
            UserProducer.instance = new UserProducer();
        }
        return UserProducer.instance;
    }

    /**
     * Send a vehicle registration message to the Kafka topic.
     * @param userName
     * @param phoneNo
     * @param email
     * @param vehicleCompanyAndModel
     * @param rcNumber
     * @param timeStamp
     */
    public async sendVehicleRegistrationMessage(userName: string, phoneNo: string, email: string | undefined, vehicleCompanyAndModel: string, rcNumber: string, timeStamp: string): Promise<void> {
        const message: Message = {
            key: phoneNo,
            value: JSON.stringify({
                userName,
                email,
                vehicleCompanyAndModel,
                rcNumber,
                timeStamp,
            }),
        };
        await this.sendMessage({
            topic: "new_vehicle_registration",
            messages: [message],
        });
    }

    /**
     * Send an email verification message to the Kafka topic.
     * @param phoneNo
     * @param email
     */
    public async sendEmailVerificationMessage(phoneNo: string, email: string): Promise<void> {
        const message: Message = {
            key: phoneNo,
            value: JSON.stringify({
                email,
            }),
        }
        await this.sendMessage({
            topic: "email_verification",
            messages: [message],
        });
    }

    /**
     * Send a top-up mail message to the Kafka topic.
     * @param phoneNo
     * @param amount
     * @param orderId
     * @param timeStamp
     */
    public async sendTopUpMailMessage(phoneNo: string, amount: string, orderId: string, timeStamp: string): Promise<void> {
        const message: Message = {
            key: phoneNo,
            value: JSON.stringify({
                amount,
                orderId,
                timeStamp,
            }),
        }
        await this.sendMessage({
            topic: "top_up_mail",
            messages: [message],
        });
    }
}

export {
    UserProducer,
}