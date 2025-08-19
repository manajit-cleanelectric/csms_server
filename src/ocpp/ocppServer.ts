import {createRPCError, RPCServer} from "ocpp-rpc";
import {logger} from "../app";
import {
    handleAuthorize,
    handleBootNotification,
    handleHeartbeat,
    handleMeterValues,
    handleStartTransaction,
    handleStatusNotification,
    handleStopTransaction
} from "../controllers/ocpp.controller"
import RpcServerClient from "ocpp-rpc/lib/server-client";

const ChargerWebsocketMap = new Map<string, RpcServerClient>();

const rpcServer = new RPCServer({
    protocols: ['ocpp1.6'],
    strictMode: false,
    respondWithDetailedErrors: false,
    callConcurrency: 10
});

// TODO test and uncomment next line
// rpcServer.auth(async (accept, reject, handshake) => {
//     const {identity} = handshake;
//     const charger = await Chargers.findOneBy({id: identity});
//     if (!charger) {
//         reject(401,"Unauthorized");
//     } else {
//         accept({
//             // anything passed to accept() will be attached as a 'session' property of the client.
//             sessionId: uuidv7()
//         });
//     }
// });

rpcServer.on("client", async (client: RpcServerClient) => {
    ChargerWebsocketMap.set(String(client.identity), client);
    client.handle("BootNotification", async ({params}) => {
        // TODO remove ChargerWebsocket map from below
        ChargerWebsocketMap.set(String(client.identity), client);
        return await handleBootNotification({client, params});
    });

    client.handle("Heartbeat", async ({params}) => {
        return await handleHeartbeat({client, params});
    });

    client.handle("Authorize", async ({params}) => {
        return await handleAuthorize({client, params});
    });

    client.handle("MeterValues", async ({params}) => {
        return await handleMeterValues({client, params});
    });

    client.handle("StartTransaction", async ({params}) => {
        return await handleStartTransaction({client, params});
    });

    client.handle("StopTransaction", async ({params}) => {
        return await handleStopTransaction({client, params});
    });

    client.handle("StatusNotification", async ({params}) => {
        return await handleStatusNotification({client, params});
    });

    // Fallback handler
    client.handle(async ({method, params}) => {
        logger.warn(`Unhandled RPC method ${method} from ${client.identity}`);
        throw createRPCError("NotImplemented", `Method ${method} not supported.`);
    });
});

export {
    rpcServer,
    ChargerWebsocketMap,
}