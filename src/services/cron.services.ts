import {AppDataSource} from "../database/datasource";
import {Chargers, ChargerStatus} from "../models/charger.model";
import cron from "node-cron";
import {Sessions, SessionStatus} from "../models/session.model";
import {parentPort} from "worker_threads";
import {LessThan} from "typeorm";

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
            select: ['id'],
            where: {
                lastHeartBeat: LessThan(currentTime),
            }
        })

        const cutOffTime = new Date(Date.now() - 5 * 60 * 1000);

        const expiredSessions = await Sessions.find({
            select: ['id'],
            where: {
                updatedAt: LessThan(cutOffTime)
            }
        });

        if (unavailableChargers?.length !== 0) {
            parentPort?.postMessage(`Found ${unavailableChargers.length} unavailable charger(s)`);

            await AppDataSource
                .getRepository(Chargers)
                .createQueryBuilder()
                .update(Chargers)
                .set({status: ChargerStatus.UNAVAILABLE})
                .where(`id IN (:...ids)`, {ids: unavailableChargers.map(c => c.id)})
                .execute();
        }
        if (expiredSessions?.length !== 0) {
            await AppDataSource
                .getRepository('sessions')
                .createQueryBuilder()
                .update()
                .set({status: SessionStatus.FAULTED})
                .where(
                    `id IN (:...ids)`, {ids: expiredSessions.map(c => c.id)}
                )
                .andWhere(
                    "status IN (:...status)",
                    {status: [SessionStatus.FINISHING, SessionStatus.CHARGING, SessionStatus.PREPARING]}
                )
                .setParameters({currentTime})
                .execute();
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