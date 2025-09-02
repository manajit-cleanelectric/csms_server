import {Kafka} from 'kafkajs';
import {kafkaConfig} from "./config/kafka.config";

const kafkaClient = new Kafka(kafkaConfig);

export {
    kafkaClient,
}