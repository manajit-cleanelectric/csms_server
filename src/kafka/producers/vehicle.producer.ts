import {LocalProducer} from "./producer";
import {VehicleProducerConfig} from "../config/producer.config";

class VehicleProducer extends LocalProducer{
    private static instance: VehicleProducer;

    // Private constructor to prevent direct instantiation.
    private constructor() {
        super(VehicleProducerConfig);
    }

    // Returns the singleton instance of LocalProducer, creating it if it doesn't exist.
    // Do not use the constructor directly; use getInstance instead.
    public static getInstance(): VehicleProducer {
        if (!VehicleProducer.instance) {
            VehicleProducer.instance = new VehicleProducer();
        }
        return VehicleProducer.instance;
    }

    public async sendVehicleRegistrationMessage(userName: string, phoneNo: string, email: string | undefined, vehicleCompanyAndModel: string, rcNumber: string, timeStamp: string): Promise<void> {
        const message = {
            key: phoneNo.toString(),
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
            topic: "new-vehicle-registration",
            messages: [message],
        });
    }
}

export {
    VehicleProducer,
}