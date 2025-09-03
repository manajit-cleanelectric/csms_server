import {Worker} from "worker_threads";
import {logger} from "../app";

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

export {
    launchWorker,
};