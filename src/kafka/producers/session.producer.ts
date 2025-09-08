import {LocalProducer} from "./producer";
import {DefaultProducerConfig} from "../config/producer.config";
import {Message} from "kafkajs";

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

    public async sendSessionCompleteMessage(sessionId: number): Promise<void> {
        const message: Message = {
            key: sessionId.toString(),
            value: JSON.stringify({
                sessionId,
            }),
        };
        await this.sendMessage({
            topic: "session_completion",
            messages: [message],
        });
    }
}

export {
    SessionProducer,
}