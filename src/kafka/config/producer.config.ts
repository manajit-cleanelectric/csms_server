import {ProducerConfig} from "kafkajs";

/**
 * Default Producer Config
 * @readonly {ProducerConfig} DefaultProducerConfig - Default configuration for Kafka producer
 */
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
/**
 * User Producer Config
 * @readonly {ProducerConfig} UserProducerConfig - Configuration for Kafka producer handling user-related topics
 */
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