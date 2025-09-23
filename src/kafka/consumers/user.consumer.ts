import {LocalConsumer} from "./consumer";
import {UserConsumerConfig} from "../config/consumer.config";
import {userMessageProcessor} from "../messageProcessors/user.processor";

class UserConsumer extends LocalConsumer{
    private static instance: UserConsumer;

    /**
     * Private constructor to prevent direct instantiation.
     * Initializes the UserConsumer with the specified configuration.
     */
    private constructor() {
        super(UserConsumerConfig);
    }

    /**
     * Gets the singleton instance of the UserConsumer.
     * @returns The singleton instance of UserConsumer.
     */
    public static getInstance(): UserConsumer {
        if (!UserConsumer.instance) {
            UserConsumer.instance = new UserConsumer();
        }
        return UserConsumer.instance;
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
                'email_verification',
                'top_up_mail',
            ],
            fromBeginning: false,
        });
        await this.run({
            eachMessage: userMessageProcessor,
            autoCommit,
            autoCommitInterval,
            autoCommitThreshold,
            partitionsConsumedConcurrently,
        });
    }

    /**
     * Stops the consumer by shutting it down.
     * @returns Promise that resolves when the consumer is stopped.
     */
    public async stopConsumer(): Promise<void> {
        await this.shutdown();
    }

}

export {
    UserConsumer,
}