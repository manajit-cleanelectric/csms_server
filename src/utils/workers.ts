import {Worker} from "worker_threads";
import {logger} from "../services/logger.service";
import path from "path";

function launchWorker(workerPath: string) {
    // Start the worker thread
    const worker = new Worker(workerPath, {
        execArgv: ["-r", "ts-node/register"],
    });
    worker.on("message", (message) => {
        logger.info(`Worker message: ${message}`);
    });
    worker.on("error", (error) => {
        logger.error(`Worker error: ${error}`);
    });
    worker.on("exit", (code) => {
        if (code !== 0) {
            logger.error(`Worker stopped with exit code ${code}`);
        } else {
            logger.info("Worker exited successfully");
        }
    });
    return worker;
}

// Start worker threads for cron jobs and Kafka consumers
const cronWorkerPath = path.resolve(__dirname, "..", "services", "cron.services.ts");
const cronWorker = launchWorker(cronWorkerPath)

const vehicleWorkerPath = path.resolve(__dirname, "..", "kafka", "workers", "user.worker.ts");
const vehicleWorker = launchWorker(vehicleWorkerPath)

const sessionWorkerPath = path.resolve(__dirname, "..", "kafka", "workers", "session.worker.ts");
const sessionWorker = launchWorker(sessionWorkerPath)

export {
    cronWorker,
    vehicleWorker,
    sessionWorker
};