import {Message, Producer, ProducerBatch, ProducerConfig, ProducerRecord} from "kafkajs";
import {kafkaClient} from "../client";

/**
 * LocalProducer wraps a kafkajs Producer providing connect/disconnect and send helpers.
 */
class LocalProducer{
    // Implementation for vehicle registration producer
    private readonly producer: Producer;

    /**
     * Create a LocalProducer instance with the given producer configuration.
     * @param {ProducerConfig} producerConfig - Configuration passed to kafkajs producer factory.
     */
    public constructor(producerConfig: ProducerConfig) {
        this.producer = kafkaClient.producer(producerConfig);
    }

    /**
     * Connect the underlying producer to the Kafka broker.
     * @returns {Promise<void>} Resolves when connection is established.
     */
    public async connect(): Promise<void> {
        await this.producer.connect();
    }

    /**
     * Disconnect the underlying producer from the Kafka broker.
     * @returns {Promise<void>} Resolves when the producer has disconnected.
     */
    public async disconnect(): Promise<void> {
        await this.producer.disconnect();
    }

    /**
     * Send a single ProducerRecord to Kafka.
     * @param {ProducerRecord} record - The record containing topic and messages to send.
     * @returns {Promise<void>} Resolves when the send completes.
     */
    public async sendMessage(record: ProducerRecord): Promise<void> {
        await this.producer.send(record);
    }

    /**
     * Send a batch of messages to Kafka.
     * @param {ProducerBatch} batch - The batch payload to be sent.
     * @returns {Promise<void>} Resolves when the batch send completes.
     */
    public async sendBatchMessages(batch: ProducerBatch){
        await this.producer.sendBatch(batch);
    }
}

export {
    LocalProducer,
}