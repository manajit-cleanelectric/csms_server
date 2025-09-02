import {Message, Producer, ProducerBatch, ProducerConfig, ProducerRecord} from "kafkajs";
import {kafkaClient} from "../client";

class LocalProducer{
    // Implementation for vehicle registration producer
    private readonly producer: Producer;

    public constructor(producerConfig: ProducerConfig) {
        this.producer = kafkaClient.producer(producerConfig);
    }

    public async connect(): Promise<void> {
        await this.producer.connect();
    }

    public async disconnect(): Promise<void> {
        await this.producer.disconnect();
    }

    public async sendMessage(record: ProducerRecord): Promise<void> {
        await this.producer.send(record);
    }

    public async sendBatchMessages(batch: ProducerBatch){
        await this.producer.sendBatch(batch);
    }
}

export {
    LocalProducer,
}