import {AppDataSource} from "../../database/datasource";
import {logger} from "../../services/logger.service";
import {parentPort} from "worker_threads";
import {SessionConsumer} from "../consumers/session.consumer";

AppDataSource.initialize()
.then(() => {
    logger.info("Data Source has been initialized in session worker!");
    })
.catch((err) => {
    logger.error("Error during Data Source initialization in session worker:", err);
    });

const initializeWorker = () => {
    // Add any initialization logic here
    const sessionConsumer = SessionConsumer.getInstance();
    sessionConsumer.startConsumer().then(() => {
        parentPort?.postMessage('Session Consumer started successfully');
    }).catch((err) => {
        parentPort?.postMessage(`Error starting Session Consumer: ${err}`);
        process.exit(1);
    });
}

const cleanup = () => {
    parentPort?.postMessage('Shutting down worker thread');
    const sessionConsumer = SessionConsumer.getInstance();
    sessionConsumer.stopConsumer().then(
        () => parentPort?.postMessage('Session Consumer stopped successfully')
    ).catch((err) => {
        parentPort?.postMessage(`Error stopping Session Consumer: ${err}`);
    }).finally(() => {
        parentPort?.postMessage('Worker thread exiting');
        process.exit(0);
    });
    process.exit(0);
}

parentPort?.on('message', (msg) => {
    if (msg?.action === 'shutdown') {
        cleanup();
    }
});

initializeWorker();