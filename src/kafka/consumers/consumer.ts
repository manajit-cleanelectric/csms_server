import {Consumer, ConsumerConfig, ConsumerRunConfig, ConsumerSubscribeTopics} from "kafkajs";
import {kafkaClient} from "../client";

/**
 * LocalConsumer class encapsulates the functionality of a Kafka consumer using the kafkajs library.
 * It provides methods to connect, subscribe to topics, run the consumer, and gracefully shut it down.
 */
class LocalConsumer {
    private readonly consumer: Consumer;

    /**
     * Initializes a new instance of the LocalConsumer class with the specified configuration.
     * @param {ConsumerConfig} consumerConfig - Configuration object for the Kafka consumer.
     */
    public constructor(consumerConfig: ConsumerConfig) {
        this.consumer = kafkaClient.consumer(consumerConfig);
    }

    /**
     * Connects the consumer to the Kafka broker.
     * @returns Promise that resolves when the connection is successful.
     */
    public async connect(): Promise<void> {
        await this.consumer.connect();
    }

    /**
     * Subscribes the consumer to the specified topics.
     * @param {ConsumerSubscribeTopics} subscription - Object defining the topics to subscribe to and options.
     * @returns {Promise<void>} Promise that resolves when the subscription is successful.
     */
    public async subscribe(subscription: ConsumerSubscribeTopics): Promise<void> {
        await this.consumer.subscribe(subscription)
    }

    /**
     * Starts the Kafka consumer with the specified run configuration.
     * @param {ConsumerRunConfig} runConfig - Configuration object for running the consumer, including message handlers and options.
     * @returns {Promise<void>} Promise that resolves when the consumer is running.
     */
    public async run(runConfig: ConsumerRunConfig): Promise<void> {
        await this.consumer.run(runConfig);
    }

    /**
     * Gracefully disconnects the consumer from the Kafka broker.
     * @return {Promise<void>} Promise that resolves when the consumer is disconnected.
     */
    public async shutdown(): Promise<void> {
        await this.consumer.disconnect();
    }

}

export {
    LocalConsumer,
}