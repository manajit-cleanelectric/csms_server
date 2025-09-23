import {LocalProducer} from "./producer";
import {DefaultProducerConfig} from "../config/producer.config";
import {Message} from "kafkajs";

/**
 * Producer for session-related events (singleton).
 * Wraps LocalProducer with session-specific helpers.
 */
class SessionProducer extends LocalProducer{
    private static instance: SessionProducer;

    // Private constructor to prevent direct instantiation.
    private constructor() {
        super(DefaultProducerConfig);
    }

    /**
     * Get the singleton instance of SessionProducer.
     * @returns {SessionProducer} The singleton instance.
     */
    public static getInstance(): SessionProducer {
        if (!SessionProducer.instance) {
            SessionProducer.instance = new SessionProducer();
        }
        return SessionProducer.instance;
    }

    /**
     * Send a session completion message to the configured Kafka topic.
     * @param {number} sessionId - Numeric ID of the session to publish.
     * @returns {Promise<void>} Resolves when the message has been sent.
     */
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