import {LocalConsumer} from "./consumer";
import {VehicleConsumerConfig} from "../config/consumer.config";
import {vehicleMessageProcessor} from "../messageProcessors/vehicle.processor";

class VehicleConsumer extends LocalConsumer{
    private static instance: VehicleConsumer;

    /**
     * Private constructor to prevent direct instantiation.
     * Initializes the VehicleConsumer with the specified configuration.
     */
    private constructor() {
        super(VehicleConsumerConfig);
    }

    /**
     * Gets the singleton instance of the VehicleConsumer.
     * @returns The singleton instance of VehicleConsumer.
     */
    public static getInstance(): VehicleConsumer {
        if (!VehicleConsumer.instance) {
            VehicleConsumer.instance = new VehicleConsumer();
        }
        return VehicleConsumer.instance;
    }

    /**
     * Starts the consumer with the specified message handler and configuration options.
     * @param autoCommit - Whether to enable auto-commit of offsets.
     * @param autoCommitInterval - Interval in milliseconds for auto-commit.
     * @param autoCommitThreshold - Number of messages to process before auto-commit.
     * @param partitionsConsumedConcurrently - Number of partitions to consume concurrently.
     * @returns Promise that resolves when the consumer is started.
     */
    public async startConsumer(
        autoCommit = true,
        autoCommitInterval = 5000,
        autoCommitThreshold = 20,
        partitionsConsumedConcurrently = 1,
    ): Promise<void> {
        await this.connect();
        await this.subscribe({
            topics: [
                'new_vehicle_registration',
            ],
            fromBeginning: false,
        });
        await this.run({
            eachMessage: vehicleMessageProcessor,
            autoCommit,
            autoCommitInterval,
            autoCommitThreshold,
            partitionsConsumedConcurrently,
        });
    }

    public async stopConsumer(): Promise<void> {
        await this.shutdown();
    }

}

export {
    VehicleConsumer,
}