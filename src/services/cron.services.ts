import {AppDataSource} from "../database/datasource";
import {Chargers, ChargerStatus} from "../models/charger";
import {logger} from "../app";
import cron from "node-cron";
import {SessionStatus} from "../models/sessions";
import {parentPort} from "worker_threads";
import {LessThan} from "typeorm";


const scheduleHeartbeatJob = () => {
    AppDataSource.initialize().then(() => {
        logger.info("Database Connection initialized in worker thread");
    })
    .catch((err) => {
        logger.error(`Database Connection initialization failed in worker thread: ${err}`);
        process.exit(1);
    });
    cron.schedule('* * * * *', async () => {
        logger.info(`Starting cleanup job`);
        const minutes = 5;
        const currentTime = new Date(new Date().getTime() - minutes * 60 * 1000);

        const unavailableChargers = await Chargers.find({
            select: ['id'],
            where: {
                lastHeartBeat: LessThan(currentTime),
            }
        })

        if (unavailableChargers?.length !== 0) {
            logger.info(`Found ${unavailableChargers.length} unavailable charger(s)`);

            await AppDataSource
                .getRepository(Chargers)
                .createQueryBuilder()
                .update(Chargers)
                .set({ status: ChargerStatus.UNKNOWN })
                .where(`id IN (:...ids)`, { ids: unavailableChargers.map(c => c.id) })
                .execute();

            await AppDataSource
                .getRepository('sessions')
                .createQueryBuilder()
                .update()
                .set({ status: SessionStatus.FAULTED })
                .where(
                    `chargerId IN (:...ids)`, { ids: unavailableChargers.map(c => c.id) }
                )
                .andWhere(
                    "status IN (:...status)",
                    { status: [SessionStatus.FINISHING, SessionStatus.CHARGING, SessionStatus.PREPARING] }
                )
                .setParameters({ currentTime })
                .execute();
        }
        parentPort?.postMessage('Cleanup job completed');
    });
};

const cleanup = () => {
    try {
        AppDataSource.destroy().then(() => {
            logger.info('Database connection closed successfully in worker thread');
        });
        process.exit(0);
    } catch (err) {
        logger.error(`Error during cleanup in worker thread: ${err}`);
        process.exit(1);
    }
};

parentPort?.on('message', (msg) => {
    if (msg?.action === 'shutdown') {
        logger.info('Shutdown signal received in worker thread');
        cleanup();
    }
});

scheduleHeartbeatJob();