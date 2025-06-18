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

  rpcServer.on('client', async (client) => {
    console.log(`New OCPP client connected: ${client.identity}`);

    // Handle the new OCPP client connection
    await handleOcppClient(client);

    // Set up event listeners for the client
    client.on('error', (err) => {
      console.error(`Error from client ${client.identity}:`, err);
    });

    client.on('close', () => {
      console.log(`Client ${client.identity} disconnected`);
    });
  }
  );

  return rpcServer;
}

module.exports = { createOcppServer };
