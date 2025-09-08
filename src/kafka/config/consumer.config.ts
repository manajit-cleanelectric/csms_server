import {ConsumerConfig} from "kafkajs";

const DefaultConsumerConfig: ConsumerConfig = {
    groupId: "default-consumer-group",
    allowAutoTopicCreation: false,
    maxWaitTimeInMs: 1000,
    sessionTimeout: 30000,
}

const SessionConsumerConfig: ConsumerConfig = {
    groupId: "session-consumer-group",
    allowAutoTopicCreation: false,
    maxWaitTimeInMs: 1000,
    sessionTimeout: 30000,
    heartbeatInterval: 3000,
    // autoCommit: false,
    // autoCommitInterval: 5000,
    // autoCommitThreshold: 100,
}

const VehicleConsumerConfig: ConsumerConfig = {
    groupId: "vehicle-consumer-group",
    allowAutoTopicCreation: false,
    maxWaitTimeInMs: 1000,
    sessionTimeout: 30000,
    heartbeatInterval: 3000,
    // autoCommit: false,
    // autoCommitInterval: 5000,
    // autoCommitThreshold: 100,
}

export {
    DefaultConsumerConfig,
    VehicleConsumerConfig,
    SessionConsumerConfig,
}