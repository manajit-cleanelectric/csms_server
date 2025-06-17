require('dotenv').config();
const http = require('http');
const app = require('./app');
const { createOcppServer } = require('./ocpp/server');

const httpServer = http.createServer(app);
const rpcServer = createOcppServer(httpServer);

httpServer.listen(3000, () => {
  console.log('HTTP Server with Express running on port 3000');
});
