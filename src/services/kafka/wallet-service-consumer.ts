import { kafkaClients } from './kafkaClients';

const walletServiceConsumer = kafkaClients.consumer({ groupId: 'wallet-service-group' });

export const startConsumer = async () => {
    await walletServiceConsumer.connect();
    await walletServiceConsumer.subscribe({ topic: 'charging-session-completed', fromBeginning: false });

    await walletServiceConsumer.run({
        eachMessage: async ({ message }) => {
            const value = message.value?.toString();
            if (value) {
                const session = JSON.parse(value);
                console.log('🔔 Charging session completed:', session);
                // Handle wallet deduction or DB logic here
            }
        },
    });
};
