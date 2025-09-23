import {Kafka} from 'kafkajs';
import {kafkaConfig} from "./config/kafka.config";

/**
 * Kafka client instance used to create producers, consumers, and admin clients.
 * @readonly {Kafka} kafkaClient - Instance of the Kafka client
 */
const kafkaClient = new Kafka(kafkaConfig);

export {
    kafkaClient,
}