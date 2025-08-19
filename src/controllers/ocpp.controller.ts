import {logger} from "../app";
import {Chargers, ChargerStatus} from "../models/charger.model";
import {createRPCError} from "ocpp-rpc";
import {Sessions, SessionStatus} from "../models/session.model";
import {Vehicles} from "../models/vehicle.model";
import {Heartbeats} from "../models/heartbeat.model";
import {StatusLogsModel} from "../models/statusLog.model";
import {Connectors, ConnectorStatus} from "../models/connector.model";
import {AppDataSource as dataSource} from "../database/datasource";
import {addMeterValue} from "./meterValue.controller";
import {addSession} from "./session.controller";


const handleBootNotification = async ({client, params}: { client: any; params: any }) => {
    logger.info(`Received BootNotification from ${client.identity}`);
    return {
        status: "Accepted",
        interval: 5,
        currentTime: new Date().toISOString(),
    };
};

const handleHeartbeat = async ({client, params}: { client: any; params: any }) => {
    logger.info(`Received Heartbeat from ${client.identity}`);
    try {
        await Chargers.update({id: client.identity!}, {status: ChargerStatus.AVAILABLE, lastHeartBeat: new Date().toISOString()});
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
    logger.info(`Received Authorize from ${client.identity}: ${JSON.stringify(params)}`);
    let user = null;
    try {
        // TODO: Confirm 'vehicle' field is correct for VIN
        const vehicle = await Vehicles.findOne({
            where: {vin: params.idTag},
            relations: ["user"]
        })
        user = vehicle?.user;
    } catch (err) {
        logger.error(`Failed to read vehicle VIN from DB:`, err);
        throw createRPCError("InternalError", "Database read failed.");
    }
    //TODO add wallet validation
    if (user) {
        return {
            "idTagInfo": {
                "status": "Accepted"
            }
        };
    } else {
        return {
            "idTagInfo": {
                "status": "Invalid"
            }
        };
    }
};

const handleMeterValues = async ({client, params}: { client: any; params: any }) => {
    logger.info(`Received MeterValues from ${client.identity}`);
    let chargerId = client.identity!;
    try {
        await addMeterValue(chargerId, params);
        return {};
    } catch (err) {
        logger.error(`Failed to add meterValues: ${err}` );
        throw createRPCError("InternalError", "Database update failed.");
    }
};

const handleStatusNotification = async ({client, params}: { client: any; params: any }) => {
    logger.info(`Received StatusNotification from ${client.identity}: ${JSON.stringify(params)}`);
    // TODO handle status notification
    let {connectorId, errorCode, status, info, vendorId, vendorErrorCode} = params;
    let chargerId = client.identity!;
    try {
        status = _getConnectorStatus(status);
        const statusNotification = new StatusLogsModel();
        statusNotification.status = status;
        statusNotification.chargerId = chargerId;
        statusNotification.connectorId = connectorId;
        statusNotification.errorCode = errorCode;
        statusNotification.info = info;
        statusNotification.vendorId = vendorId;
        statusNotification.vendorErrorCode = vendorErrorCode;
        await statusNotification.save();
        if (status === ConnectorStatus.AVAILABLE) {
            const connector = await dataSource
                .getRepository(Connectors)
                .createQueryBuilder("connector")
                .where("connector.chargerId = :chargerId", {chargerId})
                .andWhere("connector.chargerConnectorId = :connectorId", {connectorId})
                .getOne();
            if (connector) {
                connector.status = ConnectorStatus.AVAILABLE;
            }
        } else {
            const chargingSession = await dataSource
                .getRepository(Sessions)
                .createQueryBuilder("session")
                .leftJoinAndSelect("session.connector", "connector")
                .leftJoinAndSelect("session.charger", "charger")
                .where("connector.chargerConnectorId = :connectorId", {connectorId})
                .andWhere("charger.id = :chargerId", {chargerId})
                .andWhere("session.status NOT IN (:...statuses)", {
                    statuses: [SessionStatus.FAULTED, SessionStatus.FINISHED],
                })
                .getOne();

            if (chargingSession) {
                if (status === ConnectorStatus.PREPARING || status === ConnectorStatus.CHARGING || status === ConnectorStatus.FAULTED || status === ConnectorStatus.FINISHING) {
                    chargingSession.status = status;
                } else if (status === ConnectorStatus.SUSPENDED_EV || status === ConnectorStatus.SUSPENDED_EVSE || status === ConnectorStatus.UNAVAILABLE) {
                    chargingSession.status = SessionStatus.FAULTED;
                }
                await chargingSession.save();
            }
        }
    } catch (err) {
        logger.error(`Failed to update charger status:`, err);
        throw createRPCError("InternalError", "Database update failed.");
    }
    return {
        currentTime: new Date().toISOString(),
    };
};

const handleStartTransaction = async ({client, params}: { client: any; params: any }) => {
    logger.info(`Received Start Transaction from ${client.identity}: ${JSON.stringify(params)}`);
    let {connectorId, idTag, meterStart, timestamp} = params;
    let chargerId = client.identity!;
    try {
        const chargingSession = await addSession(chargerId, connectorId, idTag, meterStart, timestamp);
        // TODO: Add Session to Redis cache
        return {
            "idTagInfo": {
                "status": "Accepted"
            },
            "transactionId": chargingSession.id
        };
    } catch (err) {
        logger.error(`Failed to update charger status:`, err);
        throw createRPCError("InternalError", "Database update failed.");
    }

};

const handleStopTransaction = async ({client, params}: { client: any; params: any }) => {
    logger.info(`Received Stop Transaction from ${client.identity}: ${JSON.stringify(params)}`);
    let {idTag, meterStop, timestamp, transactionId, reason} = params;
    let chargingSession: Sessions | null = null;
    try {
        chargingSession = await Sessions.findOneBy({id: transactionId});
        if (chargingSession) {
            chargingSession.meterStop = meterStop;
            chargingSession.endTime = timestamp;
            chargingSession.reason = reason;
            chargingSession.status = SessionStatus.FINISHED;
            await chargingSession.save();
        } else {
            throw new Error("No such session was found.");
        }
    } catch (err) {
        logger.error(`Failed to update charger status:`, err);
        throw createRPCError("InternalError", "Database update failed.");
    }
    return {
        "idTagInfo": {
            "status": "Accepted"
        }
    };
};

function _getConnectorStatus(status: string) {
    switch (status) {
        case ConnectorStatus.AVAILABLE:
            return ConnectorStatus.AVAILABLE;
        case ConnectorStatus.PREPARING:
            return ConnectorStatus.PREPARING;
        case ConnectorStatus.CHARGING:
            return ConnectorStatus.CHARGING;
        case ConnectorStatus.FAULTED:
            return ConnectorStatus.FAULTED;
        case ConnectorStatus.FINISHING:
            return ConnectorStatus.FINISHING;
        case ConnectorStatus.SUSPENDED_EV:
            return ConnectorStatus.SUSPENDED_EV;
        case ConnectorStatus.UNAVAILABLE:
            return ConnectorStatus.UNAVAILABLE;
        case ConnectorStatus.RESERVED:
            return ConnectorStatus.RESERVED;
        case ConnectorStatus.SUSPENDED_EVSE:
            return ConnectorStatus.SUSPENDED_EVSE;
    }
    return ConnectorStatus.UNAVAILABLE;
}

export {
    handleBootNotification,
    handleHeartbeat,
    handleAuthorize,
    handleMeterValues,
    handleStatusNotification,
    handleStopTransaction,
    handleStartTransaction,
}