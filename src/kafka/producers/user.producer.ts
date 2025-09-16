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
}

export {
    UserProducer,
}