import {kafkaClients} from './kafkaClients';

const emailNotificationProducer = kafkaClients.producer();

export const connectProducer = async () => {
    await emailNotificationProducer.connect();
};

export const emailNotificationEvent = async (sessionData: any) => {
    await connectProducer();
    await emailNotificationProducer.send({
        topic: 'email-notification',
        messages: [
            {
                key: '1',
                value: 'Hello World!',
            },
        ],
    });
};
