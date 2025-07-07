import {RPCServer, RPCClient, createRPCError} from "ocpp-rpc";
import { logger } from "../app";
import { Chargers, ChargerStatus } from "../models/charger";

export const rpcServer = new RPCServer({});

rpcServer.on("client", async (client: RPCClient) => {
    logger.info(client.identity);

    client.handle("BootNotification", async ({params}) => {
        logger.info(`Received BootNotification from ${client.identity}:`, params);
        return {
            status: "Accepted",
            interval: 300,
            currentTime: new Date().toISOString(),
        };
    });

    client.handle("Heartbeat", async ({params}) => {
        logger.info(`Received Heartbeat from ${client.identity}:`, params);
        await Chargers.update({id: parseInt(client.identity!,10)}, {status: ChargerStatus.AVAILABLE})
        return {
            currentTime: new Date().toISOString(),
        };
    });

    client.handle("Authorize", async ({params}) => {
        logger.info(`Received Authorize from ${client.identity}:`, params);
        return {
            currentTime: new Date().toISOString(),
        };
    });

    client.handle("MeterValues", async ({params}) => {
        logger.info(`Received MeterValues from ${client.identity}:`, params);
        return {
            currentTime: new Date().toISOString(),
        };
    });

    client.handle("RemoteStopTransaction", async ({params}) => {
        logger.info(`Received RemoteStopTransaction from ${client.identity}:`, params);
        return {
            currentTime: new Date().toISOString(),
        };
    });

    client.handle("StopTransaction", async ({params}) => {
        logger.info(`Received StopTransaction from ${client.identity}:`, params);
        return {};
    });

    client.handle("StatusNotification", async ({params}) => {
        logger.info(`Received StatusNotification from ${client.identity}:`, params);
        return {};
    });

    // Fallback handler
    client.handle(async ({method, params}) => {
        logger.warn(`Unhandled RPC method ${method} from ${client.identity}`);
        throw createRPCError("NotImplemented", `Method ${method} not supported.`);
    });
});
