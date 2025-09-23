import {ConsumerConfig} from "kafkajs";

/**
 * Default Kafka consumer configuration.
 * @readonly {ConsumerConfig} DefaultConsumerConfig - Default configuration for Kafka consumer
 */
const DefaultConsumerConfig: ConsumerConfig = {
    groupId: "default-consumer-group",
    allowAutoTopicCreation: false,
    maxWaitTimeInMs: 1000,
    sessionTimeout: 30000,
}

/**
 * Kafka consumer configuration for session-related topics.
 * @readonly {ConsumerConfig} SessionConsumerConfig - Configuration for Kafka consumer handling session-related topics
 */
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

/**
 * Kafka consumer configuration for user-related topics.
 * @readonly {ConsumerConfig} UserConsumerConfig - Configuration for Kafka consumer handling user-related topics
 */
const UserConsumerConfig: ConsumerConfig = {
    groupId: "user-consumer-group",
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
    UserConsumerConfig,
    SessionConsumerConfig,
}