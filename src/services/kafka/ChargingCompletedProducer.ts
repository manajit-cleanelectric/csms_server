// kafka/producer.ts
import { kafkaClients } from './kafkaClients';

const chargingCompletedProducer = kafkaClients.producer();

export const connectProducer = async () => {
    await chargingCompletedProducer.connect();
};

export const sendChargingSessionEvent = async (sessionData: any) => {
    await chargingCompletedProducer.send({
        topic: 'charging-session-completed',
        messages: [
            {
                key: sessionData.sessionId,
                value: JSON.stringify(sessionData),
            },
        ],
    });
};
