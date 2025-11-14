import { app, SERVER_PORT, SERVER_HOST } from "./app";
import { logger } from "./services/logger.service";
import { AppDataSource } from "./database/datasource";
import { rpcServer } from "./ocpp/ocppServer";
import { ensureSystemWallets } from "./services/bootstrap.service";
import {bootstrapKafka, bootstrapProducers, disconnectProducers} from "./kafka/bootstrap";

// Import and start workers
import { cronWorker, vehicleWorker, sessionWorker } from "./utils/workers";

let server: ReturnType<typeof app.listen>;

AppDataSource.initialize()
    .then(async () => {
        try {
            await ensureSystemWallets();
            logger.info("System wallets initialized");

            server = app.listen(SERVER_PORT, SERVER_HOST, () => {
                logger.info(`Server started on port ${SERVER_PORT}`);
            });

            server.on("upgrade", rpcServer.handleUpgrade);

        } catch (err) {
            logger.error(`Error during database setup: ${err}`);
            process.exit(1);
        }
    })
    .catch((err) => {
        logger.error(`Database initialization failed: ${err}`);
        process.exit(1);
    });

// Start Kafka and other services
bootstrapKafka()
    .then(async () => {
        await bootstrapProducers();
        logger.info("Kafka bootstrap completed");
    })
    .catch((err) => {
        logger.error(`Kafka initialization failed: ${err}`);
        process.exit(1);
    });

/**
 * Gracefully shutdown the server
 * * Close the server to stop accepting new connections
 * * Wait for existing connections to finish
 * * Send shutdown message to workers
 * * Disconnect Kafka producers
 * * Close database connection
 * * Exit the process
 */
const onCloseSignal = () => {
    logger.info("SIGINT/SIGTERM received, shutting down...");
    server.close(async () => {
    logger.info("Server closed");
    try {
        // Send a shutdown message to a worker and wait for it to exit
        cronWorker.postMessage({ action: "shutdown" });
        vehicleWorker.postMessage({ action: "shutdown" });
        sessionWorker.postMessage({ action: "shutdown" });

        await disconnectProducers();
        logger.info("Kafka producers disconnected");

        await AppDataSource.destroy();
        logger.info("Database connection closed");

        process.exit(0);
    } catch (error) {
        logger.error(`Error during shutdown: ${error}`);
        process.exit(1);
    }
    });
    setTimeout(() => {
        logger.error("Forcefully shutting down after timeout");
        process.exit(1);
    }, 10000).unref();
};

process.on("SIGINT", onCloseSignal);
process.on("SIGTERM", onCloseSignal);
