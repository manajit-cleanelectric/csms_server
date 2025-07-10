import {createRPCError, RPCClient, RPCServer} from "ocpp-rpc";
import {logger} from "../app";
import {
    handleAuthorize,
    handleBootNotification,
    handleHeartbeat,
    handleMeterValues,
    handleRemoteStopTransaction,
    handleStartTransaction,
    handleStatusNotification,
    handleStopTransaction
} from "../controllers/ocppHandler"

const ChargerWebsocketMap = new Map<string, RPCClient>();

const rpcServer = new RPCServer({
    protocols: ['ocpp1.6'],
});

rpcServer.on("client", async (client: RPCClient) => {
    client.handle("BootNotification", async ({params}) => {
        ChargerWebsocketMap.set(String(client.identity),client);
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

    client.handle("RemoteStopTransaction", async ({params}) => {
        return await handleRemoteStopTransaction({client, params});
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