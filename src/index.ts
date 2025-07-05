import { app, logger } from './app';
import { AppDataSource } from './database/datasource';

let server: ReturnType<typeof app.listen>;

AppDataSource.initialize()
    .then(() => {
      server = app.listen(3000, () => {
        logger.info('Server started on port 3000');
      });
    })
    .catch((err) => {
      logger.error('Database initialization failed', err);
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
















// require('dotenv').config();
// const http = require('http');
// const app = require('./app');
// const { createOcppServer } = require('./ocpp/server');
//
// const httpServer = http.createServer(app);
// const rpcServer = createOcppServer(httpServer);
//
// httpServer.listen(3000, () => {
//   console.log('HTTP Server with Express running on port 3000');
// });
