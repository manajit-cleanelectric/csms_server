import { RPCServer, RPCClient, createRPCError } from "ocpp-rpc";
import { logger } from "../app";
import { handleHeartbeat, handleBootNotification, handleAuthorize, handleMeterValues, handleStatusNotification, handleStopTransaction, handleStartTransaction, handleRemoteStopTransaction } from "../controllers/ocppHandler"

export const rpcServer = new RPCServer({});

rpcServer.on("client", async (client: RPCClient) => {
    client.handle("BootNotification", async ({params}) => {
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
