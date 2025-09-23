import {parentPort} from "worker_threads";
import {UserConsumer} from "../consumers/user.consumer";
import {AppDataSource} from "../../database/datasource";

AppDataSource.initialize()
    .then(() => {
        parentPort?.postMessage("Data Source has been initialized in User worker!");
    })
    .catch((err) => {
        parentPort?.postMessage(`Error during Data Source initialization in User worker: ${err}`);
    });

const initializeWorker = () => {
    // Add any initialization logic here
    const vehicleConsumer = UserConsumer.getInstance();
    vehicleConsumer.startConsumer().then(() => {
        parentPort?.postMessage('User Consumer started successfully');
    }).catch((err) => {
        parentPort?.postMessage(`Error starting Vehicle Consumer: ${err}`);
        process.exit(1);
    });
};

const cleanup = () => {
    parentPort?.postMessage('Shutting down worker thread');
    const vehicleConsumer = UserConsumer.getInstance();
    vehicleConsumer.stopConsumer().then(
        () => parentPort?.postMessage('User Consumer stopped successfully')
    ).catch((err) => {
        parentPort?.postMessage(`Error stopping User Consumer: ${err}`);
    }).finally(() => {
        parentPort?.postMessage('Worker thread exiting');
        process.exit(0);
    });
    process.exit(0);
};

parentPort?.on('message', (msg) => {
    if (msg?.action === 'shutdown') {
        cleanup();
    }
});

initializeWorker();