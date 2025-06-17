const { RPCServer, createRPCError } = require('ocpp-rpc');
const { handleOcppClient } = require('../controllers/chargepointController');

function createOcppServer(httpServer) {
  const rpcServer = new RPCServer({
    protocols: ['ocpp1.6'],
    strictMode: true,
    respondWithDetailedErrors: false,
    callConcurrency: 10
  });

  httpServer.on('upgrade', rpcServer.handleUpgrade);
  console.log('OCPP Server listening for upgrades');
  
  rpcServer.auth((accept, reject, handshake) => {
    // Authentication logic here
  });

  rpcServer.on('client', handleOcppClient);

  return rpcServer;
}

module.exports = { createOcppServer };
