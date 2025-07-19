import {app, logger, SERVER_PORT} from './app';
import {AppDataSource} from './database/datasource';
import {rpcServer} from "./ocpp/ocppServer";
import cron from 'node-cron';
import {Chargers, ChargerStatus} from "./models/charger";

let server: ReturnType<typeof app.listen>;

AppDataSource.initialize()
    .then(() => {
        server = app.listen(SERVER_PORT, () => {
            logger.info(`Server started on port ${SERVER_PORT}`);
            cron.schedule('* * * * *', async () => {
                const minutes = 5;
                const currentTime = new Date(new Date().getTime() - minutes * 60 * 1000);
                logger.info(`Running cron job`);
                await AppDataSource
                    .getRepository(Chargers)
                    .createQueryBuilder()
                    .update(Chargers)
                    .set({ status: ChargerStatus.UNKNOWN })
                    .where("lastHeartBeat < :currentTime", { currentTime })
                    .execute();

            });
        });
        server.on('upgrade', rpcServer.handleUpgrade);
    })
    .catch((err) => {
        logger.error(`Database initialization failed ${err}`);
        process.exit(1);
    });

const onCloseSignal = () => {
    logger.info('SIGINT/SIGTERM received, shutting down...');
    server.close(() => {
        logger.info('Server closed');
        process.exit(0);
    });
    setTimeout(() => {
        logger.error('Forcefully shutting down after timeout');
        process.exit(1);
    }, 10000).unref();
};

process.on('SIGINT', onCloseSignal);
process.on('SIGTERM', onCloseSignal);
