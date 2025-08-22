import {AppDataSource} from "../database/datasource";
import {Chargers, ChargerStatus} from "../models/charger.model";
import cron from "node-cron";
import {SessionStatus} from "../models/session.model";
import {parentPort} from "worker_threads";
import {LessThan} from "typeorm";
import {ConnectorStatus} from "../models/connector.model";

const scheduleHeartbeatJob = () => {
    AppDataSource.initialize().then(() => {
        parentPort?.postMessage("Database Connection initialized in worker thread");
    })
    .catch((err) => {
        parentPort?.postMessage(`Database Connection initialization failed in worker thread: ${err}`);
        process.exit(1);
    });
    cron.schedule('* * * * *', async () => {
        parentPort?.postMessage(`Starting cleanup job`);
        const minutes = 5;
        const currentTime = new Date(new Date().getTime() - minutes * 60 * 1000);

        const unavailableChargers = await Chargers.find({
            where: { lastHeartBeat: LessThan(currentTime) },
            relations: ["connectors", "connectors.currentSession"],
        })

        if (unavailableChargers?.length !== 0) {
            parentPort?.postMessage(`Found ${unavailableChargers.length} unavailable charger(s)`);
            for (const charger of unavailableChargers) {
                parentPort?.postMessage(`Unavailable charger: ${charger.id}`);
                try {
                    charger.status = ChargerStatus.UNAVAILABLE;
                    for (const connector of charger.connectors) {
                        if (connector.currentSession) {
                            connector.currentSession.status = SessionStatus.FAULTED;
                            await connector.currentSession.save();
                            parentPort?.postMessage(`Updated session ${connector.currentSession.id} status to UNAVAILABLE`);
                            connector.currentSession = null;
                        }
                        connector.status = ConnectorStatus.UNAVAILABLE;
                    }
                    await charger.save();
                    parentPort?.postMessage(`Updated charger ${charger.id} status to UNAVAILABLE`);
                } catch (err) {
                    parentPort?.postMessage(`Error updating charger ${charger.id} status: ${err}`);
                }
            }
        }
        parentPort?.postMessage('Cleanup job completed');
    });
};

const cleanup = () => {
    try {
        AppDataSource.destroy().then(() => {
            parentPort?.postMessage('Database connection closed successfully in worker thread');
        });
        process.exit(0);
    } catch (err) {
        parentPort?.postMessage(`Error during cleanup in worker thread: ${err}`);
        process.exit(1);
    }
};

parentPort?.on('message', (msg) => {
    if (msg?.action === 'shutdown') {
        cleanup();
    }
});

scheduleHeartbeatJob();