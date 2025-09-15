import {LocalProducer} from "./producer";
import {UserProducerConfig} from "../config/producer.config";

class UserProducer extends LocalProducer{
    private static instance: UserProducer;

    // Private constructor to prevent direct instantiation.
    private constructor() {
        super(UserProducerConfig);
    }

    // Returns the singleton instance of LocalProducer, creating it if it doesn't exist.
    // Do not use the constructor directly; use getInstance instead.
    public static getInstance(): UserProducer {
        if (!UserProducer.instance) {
            UserProducer.instance = new UserProducer();
        }
        return UserProducer.instance;
    }

    public async sendVehicleRegistrationMessage(userName: string, phoneNo: string, email: string | undefined, vehicleCompanyAndModel: string, rcNumber: string, timeStamp: string): Promise<void> {
        const message = {
            key: phoneNo,
            value: JSON.stringify({
                userName,
                phoneNo,
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
}

export {
    UserProducer,
}