import { app, logger } from './app';
import { AppDataSource } from './database/datasource';
import { rpcServer } from "./ocpp/ocppServer";

let server: ReturnType<typeof app.listen>;

AppDataSource.initialize()
    .then(() => {
      server = app.listen(3000, () => {
        logger.info('Server started on port 3000');
      });
      server.on('upgrade', rpcServer.handleUpgrade);
    })
    .catch((err) => {
      logger.error('Database initialization failed', err.message);
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
