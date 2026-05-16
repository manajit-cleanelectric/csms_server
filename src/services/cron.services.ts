import {AppDataSource} from "../database/datasource";
import {Chargers, ChargerStatus} from "../models/charger.model";
import cron from "node-cron";
import {Reason, Sessions, SessionStatus} from "../models/session.model";
import {parentPort} from "worker_threads";
import {In, LessThan} from "typeorm";
import {ConnectorStatus} from "../models/connector.model";
import {SessionProducer} from "../kafka/producers/session.producer";

const sessionProducer = SessionProducer.getInstance();

async function handleExpiredSession(session: Sessions) {
    session.status = SessionStatus.FAULTED;
    session.endTime = session.updatedAt;
    session.reason = Reason.LOCAL;
    if (session.connector.currentSession?.id === session.id) {
        session.connector.currentSession = null;
    }
    await session.save();
    await sessionProducer.sendSessionCompleteMessage(session.id);
    parentPort?.postMessage(`Expired session with ID ${session.id} marked as FAULTED and sent to Kafka`);
}

async function handleExpiredSessionId(sessionId: number) {
    const session = await Sessions.findOne({
        where: {id: sessionId},
        relations: ['connector.currentSession'],
    });
    if (session) {
        await handleExpiredSession(session);
    } else {
        parentPort?.postMessage(`Session with ID ${sessionId} not found during cleanup`);
    }
}

const scheduleHeartbeatJob = () => {
    AppDataSource.initialize()
        .then(() => {
            parentPort?.postMessage("Data Source has been initialized in Cron worker!");
        })
        .catch((err) => {
            parentPort?.postMessage( `Error during Data Source initialization in Cron worker: ${err}`);
            process.exit(1);
        });

    sessionProducer.connect()
        .then(() => {
            parentPort?.postMessage("Kafka Producer connected in cronWorker");
        })
        .catch((err) => {
            parentPort?.postMessage(`Kafka Producer connection failed in cronWorker: ${err}`);
            process.exit(1);
        });

    cron.schedule('* * * * *', async () => {
        parentPort?.postMessage(`Starting cleanup job`);
        const minutes = 5;
        const cutOffTime = new Date(Date.now() - minutes * 60 * 1000);

        const unavailableChargers = await Chargers.find({
            where: {
                lastHeartBeat: LessThan(cutOffTime),
            },
            relations: ['connectors'],
        })

        const expiredSessions = await Sessions.find({
            where: {
                updatedAt: LessThan(cutOffTime),
                status: In([SessionStatus.CHARGING, SessionStatus.PREPARING, SessionStatus.FINISHING, SessionStatus.IDLE, SessionStatus.SUSPENDED, SessionStatus.UNAVAILABLE]),
            },
            relations: ['connector.currentSession',],
        });

        for (const charger of unavailableChargers) {
            charger.status = ChargerStatus.UNAVAILABLE;
            if (charger.connectors) {
                for (const connector of charger.connectors) {
                    connector.status = ConnectorStatus.UNAVAILABLE;
                }
            }
            await charger.save();
        }

        for (const session of expiredSessions) {
            await handleExpiredSession(session);
        }
        parentPort?.postMessage('Cleanup job completed');
    });
};

const cleanup = () => {
    try {
        AppDataSource.destroy().then(() => {
            parentPort?.postMessage('Database connection closed successfully in worker thread');
        });
        sessionProducer.disconnect().then(() => {
            parentPort?.postMessage('Kafka Producer disconnected successfully in worker thread');
        });
        process.exit(0);
    } catch (err) {
        parentPort?.postMessage(`Error during cleanup in worker thread: ${err}`);
        process.exit(1);
    }
};

parentPort?.on('message', async  (msg) => {
    if (msg?.action === 'shutdown') {
        cleanup();
    }
    if (msg?.action === 'handleExpiredSessionId' && msg?.sessionId) {
        parentPort?.postMessage(`Received request to handle expired session with ID ${msg.sessionId}`);
        await handleExpiredSessionId(msg.sessionId);
    }
});

scheduleHeartbeatJob();

export {
    handleExpiredSession,
}