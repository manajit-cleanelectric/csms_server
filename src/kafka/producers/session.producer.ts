import {LocalProducer} from "./producer";
import {DefaultProducerConfig} from "../config/producer.config";

class SessionProducer extends LocalProducer{
    private static instance: SessionProducer;

    // Private constructor to prevent direct instantiation.
    private constructor() {
        super(DefaultProducerConfig);
    }

    // Returns the singleton instance of LocalProducer, creating it if it doesn't exist.
    // Do not use the constructor directly; use getInstance instead.
    public static getInstance(): SessionProducer {
        if (!SessionProducer.instance) {
            SessionProducer.instance = new SessionProducer();
        }
        return SessionProducer.instance;
    }

    public async sendSessionCompleteMessage(sessionId: string, userId: string, ): Promise<void> {
        const message = {
            key: sessionId,
            value: JSON.stringify({
                sessionId,
                userId,
            }),
        };
        await this.sendMessage({
            topic: "charge-completions",
            messages: [message],
        });
    }
}

export {
    SessionProducer,
}