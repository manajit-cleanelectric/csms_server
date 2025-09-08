import {LocalConsumer} from "./consumer";
import {DefaultConsumerConfig, SessionConsumerConfig} from "../config/consumer.config";
import {sessionMessageProcessor} from "../messageProcessors/session.processor";

class SessionConsumer extends LocalConsumer{
    private static instance: SessionConsumer;

    /**
     * Private constructor to prevent direct instantiation.
     * Initializes the SessionConsumer with the specified configuration.
     */
    private constructor() {
        super(SessionConsumerConfig);
    }

    /**
     * Gets the singleton instance of the SessionConsumer.
     * @returns The singleton instance of SessionConsumer.
     */
    public static getInstance(): SessionConsumer {
        if (!SessionConsumer.instance) {
            SessionConsumer.instance = new SessionConsumer();
        }
        return SessionConsumer.instance;
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
                'session_completion',
            ],
            fromBeginning: false,
        });
        await this.run({
            eachMessage: sessionMessageProcessor,
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
    SessionConsumer,
};