import {ProducerConfig} from "kafkajs";

const DefaultProducerConfig: ProducerConfig = {
    allowAutoTopicCreation: false,
    // idempotent: true,
    // transactionalId: 'charge-clean-producer',
    maxInFlightRequests: 1,
    retry: {
        initialRetryTime: 300,
        retries: 10,
    },
}

// TODO: Check for idempotent
// Config specifically for VehicleProducer
const UserProducerConfig: ProducerConfig = {
    allowAutoTopicCreation: false,
    // idempotent: true,
    // transactionalId: 'charge-clean-producer',
    maxInFlightRequests: 1,
    // retry setting not needed for producer as idempotent is true
    retry: {
        initialRetryTime: 300,
        retries: 10
    },
}



export {
    DefaultProducerConfig,
    UserProducerConfig,
}