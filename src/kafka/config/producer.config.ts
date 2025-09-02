import {ProducerConfig} from "kafkajs";
import {VehicleProducer} from "../producers/vehicle.producer";
import {zipMap} from "ioredis/built/utils";

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
const VehicleProducerConfig: ProducerConfig = {
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
    VehicleProducerConfig,
}