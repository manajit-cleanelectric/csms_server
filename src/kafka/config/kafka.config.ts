import {ITopicConfig, KafkaConfig, logLevel} from "kafkajs";

/**
 * Kafka client configuration used to initialize the Kafka instance.
 * @readonly {KafkaConfig} kafkaConfig - Configuration for Kafka client
 */
const kafkaConfig: KafkaConfig = {
    clientId: 'charge-clean',
    brokers: ['localhost:29092'], // update as needed
    ssl: false,
    sasl: undefined,
    retry: {
        initialRetryTime: 300,
        retries: 10,
        restartOnFailure: async () => {
            return true;
        },
    },
    logLevel: logLevel.WARN
};

// TODO: Partition and replication factor should be configured based on the deployment environment and topics usage
/**
 * Topic configurations to be created during Kafka bootstrap.
 * @readonly {ITopicConfig[]} topics - Array of topic configurations
 */
const topics: ITopicConfig[] = [
    {
        topic: 'session_completion',
        numPartitions: parseInt(process.env.KAFKA_TOPICS_NUMBER ?? '4', 10),
        replicationFactor: parseInt(process.env.KAFKA_REPLICATION_PARAMS ?? '1', 10),
    },
    {
        topic: 'email_verification',
        numPartitions: parseInt(process.env.KAFKA_TOPICS_NUMBER ?? '4', 10),
        replicationFactor: parseInt(process.env.KAFKA_REPLICATION_PARAMS ?? '1', 10),
    },
    {
        topic: 'new_vehicle_registration',
        numPartitions: parseInt(process.env.KAFKA_TOPICS_NUMBER ?? '4', 10),
        replicationFactor: parseInt(process.env.KAFKA_REPLICATION_PARAMS ?? '1', 10),
    },
    {
        topic: 'top_up_mail',
        numPartitions: parseInt(process.env.KAFKA_TOPICS_NUMBER ?? '4', 10),
        replicationFactor: parseInt(process.env.KAFKA_REPLICATION_PARAMS ?? '1', 10),
    },
    // {
    //     topic: 'vehicle-update',
    //     numPartitions: parseInt(process..env.KAFKA_TOPICS_NUMBER ?? '4', 10),
    //     replicationFactor: parseInt(process..env.KAFKA_REPLICATION_PARAMS ?? '1', 10),
    // },
    // {
    //     topic: 'heartbeat',
    //     numPartitions: 4,
    //     replicationFactor: 2,
    // },
];


export {
    kafkaConfig,
    topics,
}