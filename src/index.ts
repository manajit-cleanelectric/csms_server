import {app, logger, SERVER_PORT} from './app';
import {AppDataSource} from './database/datasource';
import {rpcServer} from "./ocpp/ocppServer";
import {Worker} from "worker_threads";
import path from "path";

let server: ReturnType<typeof app.listen>;

AppDataSource.initialize()
    .then(() => {
        server = app.listen(SERVER_PORT, () => {
            logger.info(`Server started on port ${SERVER_PORT}`);
        });
        server.on('upgrade', rpcServer.handleUpgrade);
    })
    .catch((err) => {
        logger.error(`Database initialization failed ${err}`);
        process.exit(1);
    });

// Start the heartbeat job in a worker thread
// TODO: Implement centralized logging for worker threads
const workerPath = path.resolve(__dirname, 'services', 'cron.services.ts');
// TODO: Change the workerPath to point to the compiled JavaScript file in production
const worker = new Worker(workerPath, {
    execArgv: ['-r', 'ts-node/register'],
});
worker.on('message', (message) => {
    logger.info(`Worker message: ${message}`);
});
worker.on('error', (error) => {
    logger.error(`Worker error: ${error}`);
});
worker.on('exit', (code) => {
    if (code !== 0) {
        logger.error(`Worker stopped with exit code ${code}`);
    } else {
        logger.info('Worker exited successfully');
    }
});

const onCloseSignal = () => {
    logger.info('SIGINT/SIGTERM received, shutting down...');
    server.close(async () => {
        logger.info('Server closed');
        try {
            // Send a shutdown message to a worker and wait for it to exit
            worker.postMessage({ action: 'shutdown' });

            // Wait for the worker to exit before proceeding
            await new Promise<void>((resolve, reject) => {
                worker.once('exit', (code) => {
                    if (code === 0) {
                        logger.info('Worker exited successfully');
                        resolve();
                    } else {
                        logger.error(`Worker stopped with exit code ${code}`);
                        reject(new Error(`Worker stopped with exit code ${code}`));
                    }
                });
            });

            await AppDataSource.destroy();
            logger.info('Database connection closed');

            process.exit(0);
        } catch (error) {
            logger.error(`Error during shutdown: ${error}`);
            process.exit(1);
        }
    });
    setTimeout(() => {
        logger.error('Forcefully shutting down after timeout');
        process.exit(1);
    }, 10000).unref();
};

process.on('SIGINT', onCloseSignal);
process.on('SIGTERM', onCloseSignal);
