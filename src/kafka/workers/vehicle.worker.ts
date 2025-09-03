import {parentPort} from "worker_threads";
import {VehicleConsumer} from "../consumers/vehicle.consumer";

const initializeWorker = () => {
    // Add any initialization logic here
    const vehicleConsumer = VehicleConsumer.getInstance();
    vehicleConsumer.startConsumer().then(() => {
        parentPort?.postMessage('Vehicle Consumer started successfully');
    }).catch((err) => {
        parentPort?.postMessage(`Error starting Vehicle Consumer: ${err}`);
        process.exit(1);
    });
};

const cleanup = () => {
    parentPort?.postMessage('Shutting down worker thread');
    const vehicleConsumer = VehicleConsumer.getInstance();
    vehicleConsumer.stopConsumer().then(
        () => parentPort?.postMessage('Vehicle Consumer stopped successfully')
    ).catch((err) => {
        parentPort?.postMessage(`Error stopping Vehicle Consumer: ${err}`);
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