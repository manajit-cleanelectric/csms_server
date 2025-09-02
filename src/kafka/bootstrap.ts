import {kafkaClient} from "./client";
import {logger} from "../app";
import {topics} from "./config/kafka.config";
import {VehicleProducer} from "./producers/vehicle.producer";
import {SessionProducer} from "./producers/session.producer";

async function bootstrapKafka() {
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

async function bootstrapProducers(){
    try {
        // Setup Vehicle Producer instance
        const vehicleProducer = VehicleProducer.getInstance();
        await vehicleProducer.connect();
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

async function disconnectProducers(){
    try {
        const vehicleProducer = VehicleProducer.getInstance();
        await vehicleProducer.disconnect();
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