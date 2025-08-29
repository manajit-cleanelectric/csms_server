import {Kafka} from 'kafkajs';

export const kafkaClients = new Kafka({
    clientId: 'charging-app',
    brokers: ['localhost:29092', 'localhost:29093', 'localhost:29094'], // update as needed
});
