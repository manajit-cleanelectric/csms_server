import {kafkaClient} from "./client";
import {logger} from "../services/logger.service";
import {topics} from "./config/kafka.config";
import {UserProducer} from "./producers/user.producer";
import {SessionProducer} from "./producers/session.producer";

/**
 * Initialize Kafka admin, create topics if missing, and disconnect admin.
 * @function bootstrapKafka
 * @returns {Promise<void>} Resolves when topics are created or already exist.
 */
async function bootstrapKafka(): Promise<void> {
    try {
        // Attempt to connect to the Kafka broker
        const admin = kafkaClient.admin();
        await admin.connect();
        logger.info('Connected to Kafka broker successfully.');

        // Create the topics if they do not exist
        await admin.createTopics({
            topics: topics,
            waitForLeaders: true,
        });

        logger.info('Kafka topics created or already exist.');

        // Disconnect the admin client after setup
        await admin.disconnect();
    } catch (error) {
        logger.error('Error connecting to Kafka broker:', error);
        process.exit(1);
    }
}

/**
 * Connect and initialize all configured producers.
 * @function bootstrapProducers
 * @returns {Promise<void>} Resolves when all producers are connected.
 */
async function bootstrapProducers(): Promise<void>{
    try {
        // Setup Vehicle Producer instance
        const userProducer = UserProducer.getInstance();
        await userProducer.connect();
        logger.info('Vehicle Producer connected successfully.');

        const sessionProducer = SessionProducer.getInstance();
        await sessionProducer.connect();
        logger.info('Session Producer connected successfully.');

        // You can add more producers here following the same pattern

    } catch (error) {
        logger.error('Error connecting Producer:', error);
        process.exit(1);
    }
}

/**
 * Disconnect all configured producers gracefully.
 * @function disconnectProducers
 * @returns {Promise<void>} Resolves when all producers are disconnected.
 */
async function disconnectProducers(): Promise<void>{
    try {
        const userProducer = UserProducer.getInstance();
        await userProducer.disconnect();
        logger.info('Vehicle Producer disconnected successfully.');

        const sessionProducer = SessionProducer.getInstance();
        await sessionProducer.disconnect();
        logger.info('Session Producer disconnected successfully.');

        // You can add more producers here following the same pattern

    } catch (error) {
        logger.error('Error disconnecting Producer:', error);
    }
}

export {
    bootstrapKafka,
    bootstrapProducers,
    disconnectProducers,
}