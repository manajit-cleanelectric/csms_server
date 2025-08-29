import { startConsumer } from './NewVehicleRegistrationConsumer';

export async function bootstrapKafka() {
    try {
        await startConsumer();
        console.log('Kafka consumer started successfully.');
    } catch (error) {
        console.error('Error starting Kafka consumer:', error);
        process.exit(1);
    }
}

