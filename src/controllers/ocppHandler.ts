import {logger} from "../app";
import {Chargers, ChargerStatus} from "../models/charger";
import {createRPCError} from "ocpp-rpc";
import {Sessions} from "../models/sessions";
import {Vehicles} from "../models/vehicle";
import {Heartbeats} from "../models/heartbeats";

const handleBootNotification = async ({client, params}: { client: any; params: any }) => {
    logger.info(`Received BootNotification from ${client.identity}:`, params);
    return {
        status: "Accepted",
        interval: 5,
        currentTime: new Date().toISOString(),
    };
};

const handleHeartbeat = async ({client, params}: { client: any; params: any }) => {
    logger.info(`Received Heartbeat from ${client.identity}:`, params);
    try {
        await Chargers.update({id: client.identity!}, {status: ChargerStatus.AVAILABLE});
        const heartBeat = new Heartbeats();
        heartBeat.chargerId = client.identity!;
        await heartBeat.save();
        return {
            currentTime: new Date().toISOString(),
        };
    } catch (err) {
        logger.error(`Failed to update charger status: ${err}`);
        throw createRPCError("InternalError", "Database update failed.");
    }
};

const handleAuthorize = async ({client, params}: { client: any; params: any }) => {
    logger.info(`Received Authorize from ${client.identity}:`, params);
    let user = null;
    try {
        // TODO: Confirm 'vehicle' field is correct for VIN
        const vehicle = await Vehicles.findOneBy({vin: params.idTag});
        user = vehicle?.user;
    } catch (err) {
        logger.error(`Failed to read vehicle VIN from DB:`, err);
        throw createRPCError("InternalError", "Database read failed.");
    }
    //TODO add wallet validation
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
        await Chargers.update({id: client.identity!}, {status: ChargerStatus.AVAILABLE})
    } catch (err) {
        logger.error(`Failed to update charger status:`, err);
        throw createRPCError("InternalError", "Database update failed.");
    }
    return {
        currentTime: new Date().toISOString(),
    };
};

const handleRemoteStopTransaction = async ({client, params}: { client: any; params: any }) => {
    logger.info(`Received Remote Stop Transaction from ${client.identity}:`, params);
    // TODO implement remote stop transactions
    try {
        await Chargers.update({id: client.identity!}, {status: ChargerStatus.AVAILABLE})
    } catch (err) {
        logger.error(`Failed to update charger status:`, err);
        throw createRPCError("InternalError", "Database update failed.");
    }
    return {
        currentTime: new Date().toISOString(),
    };
};

const handleStatusNotification = async ({client, params}: { client: any; params: any }) => {
    logger.info(`Received Status Notification from ${client.identity}:`, params);
    // TODO handle status notification
    try {
        await Chargers.update({id: client.identity!}, {status: ChargerStatus.AVAILABLE})
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
        chargingSession.connector = connectorId;
        const vehicle = await Vehicles.findOneBy({vin: idTag});
        if (!vehicle) {
            throw new Error('Vehicle not found');
        }
        chargingSession.vehicle = vehicle;
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