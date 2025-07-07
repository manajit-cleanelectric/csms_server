import {logger} from "../app";
import {Chargers, ChargerStatus} from "../models/charger";
import {createRPCError} from "ocpp-rpc";
import {Sessions} from "../models/sessions";

const handleBootNotification = async ({client, params}: { client: any; params: any }) => {
    logger.info(`Received BootNotification from ${client.identity}:`, params);
    return {
        status: "Accepted",
        interval: 300,
        currentTime: new Date().toISOString(),
    };
};

const handleHeartbeat = async ({client, params}: { client: any; params: any }) => {
    logger.info(`Received Heartbeat from ${client.identity}:`, params);
    try {
        await Chargers.update({id: parseInt(client.identity!, 10)}, {status: ChargerStatus.AVAILABLE})
    } catch (err) {
        logger.error(`Failed to update charger status:`, err);
        throw createRPCError("InternalError", "Database update failed.");
    }
    return {
        currentTime: new Date().toISOString(),
    };
};

const handleAuthorize = async ({client, params}: { client: any; params: any }) => {
    logger.info(`Received Authorize from ${client.identity}:`, params);
    let user = null;
    try {
        // TODO: Confirm 'vehicle' field is correct for VIN
        // user = await Users.findOneBy({vehicle: params.vehicle});
    } catch (err) {
        logger.error(`Failed to read vehicle VIN from DB:`, err);
        throw createRPCError("InternalError", "Database read failed.");
    }
    if (user) {
        return {
            status: "Accepted",
        };
    } else {
        return {
            status: "Invalid",
        };
    }
};

const handleMeterValues = async ({client, params}: { client: any; params: any }) => {
    logger.info(`Received Meter Values from ${client.identity}:`, params);
    // TODO implement meter values
    try {
        await Chargers.update({id: parseInt(client.identity!, 10)}, {status: ChargerStatus.AVAILABLE})
    } catch (err) {
        logger.error(`Failed to update charger status:`, err);
        throw createRPCError("InternalError", "Database update failed.");
    }
    return {
        currentTime: new Date().toISOString(),
    };
};

const handleRemoteStopTransaction = async ({client, params}: { client: any; params: any }) => {
    logger.info(`Received Heartbeat from ${client.identity}:`, params);
    // TODO implement remote stop transactions
    try {
        await Chargers.update({id: parseInt(client.identity!, 10)}, {status: ChargerStatus.AVAILABLE})
    } catch (err) {
        logger.error(`Failed to update charger status:`, err);
        throw createRPCError("InternalError", "Database update failed.");
    }
    return {
        currentTime: new Date().toISOString(),
    };
};

const handleStatusNotification = async ({client, params}: { client: any; params: any }) => {
    logger.info(`Received Heartbeat from ${client.identity}:`, params);
    // TODO handle status notification
    try {
        await Chargers.update({id: parseInt(client.identity!, 10)}, {status: ChargerStatus.AVAILABLE})
    } catch (err) {
        logger.error(`Failed to update charger status:`, err);
        throw createRPCError("InternalError", "Database update failed.");
    }
    return {
        currentTime: new Date().toISOString(),
    };
};

const handleStartTransaction = async ({client, params}: { client: any; params: any }) => {
    logger.info(`Received Start Transaction from ${client.identity}:`, params);
    let {connectorId, idTag, meterStart, timestamp} = params;
    try {
        const chargingSession = new Sessions();
        // chargingSession.connectorId = connectorId;
        // chargingSession.vin = idTag;
        chargingSession.meterStart = meterStart;
        chargingSession.startTime = timestamp;
        await chargingSession.save();
        return {
            transactionId: chargingSession.id,
            status: "Accepted",
        };
    } catch (err) {
        logger.error(`Failed to update charger status:`, err);
        throw createRPCError("InternalError", "Database update failed.");
    }

};

const handleStopTransaction = async ({client, params}: { client: any; params: any }) => {
    logger.info(`Received Stop Transaction from ${client.identity}:`, params);
    let {idTag, meterStop, timestamp, transactionId, reason} = params;
    let chargingSession: Sessions | null = null;
    try {
        chargingSession = await Sessions.findOneBy({id: transactionId});
        if (!chargingSession) {
            chargingSession!.meterStop = meterStop;
            chargingSession!.endTime = timestamp;
            // TODO log reason in sessions
            await chargingSession!.save();
        } else {
            throw new Error("No such session was found.");
        }
    } catch (err) {
        logger.error(`Failed to update charger status:`, err);
        throw createRPCError("InternalError", "Database update failed.");
    }
    return {
        "status": "Accepted",
    };
};


export {
    handleBootNotification,
    handleHeartbeat,
    handleAuthorize,
    handleMeterValues,
    handleRemoteStopTransaction,
    handleStatusNotification,
    handleStopTransaction,
    handleStartTransaction,
}