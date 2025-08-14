import {logger} from "../app";
import {Chargers, ChargerStatus} from "../models/charger";
import {createRPCError} from "ocpp-rpc";
import {Sessions, SessionStatus} from "../models/sessions";
import {Vehicles} from "../models/vehicle";
import {Heartbeats} from "../models/heartbeats";
import {MeterValues} from "../models/meterValues";
import {StatusLogs} from "../models/statusLogs";
import {Connectors, ConnectorStatus} from "../models/connector";
import {AppDataSource as dataSource} from "../database/datasource";


const acceptedMeasurands: string[] = [
    "Energy.Active.Import.Register",
    "Power.Active.Import",
    "Current.Import",
    "Voltage",
    "Temperature",
    "SoC",
];

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
    logger.info(`Received Authorize from ${client.identity}:`, params);
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
    logger.info(`Received Meter Values from ${client.identity}:`, params);
    // TODO implement meter values
    let {connectorId, transactionId, meterValue} = params;
    let chargerId = client.identity!;
    try {
        // TODO why updating the charger
        await Chargers.update({id: chargerId}, {status: ChargerStatus.AVAILABLE});
        const chargingSession = await Sessions.findOneBy({id: transactionId});
        if (!chargingSession) {
            throw new Error("Could not find session with ID " + transactionId);
        }
        const currentMeterValue = new MeterValues();
        currentMeterValue.chargerId = chargerId;
        currentMeterValue.connectorId = connectorId;
        currentMeterValue.sessionId = Number(transactionId);
        meterValue.forEach((item: any) => {
            let {timestamp, sampledValue} = item;
            currentMeterValue.timestamp = timestamp;
            sampledValue.forEach((sample: any) => {
                switch (sample.measurand) {
                    case 'Energy.Active.Import.Register':
                        currentMeterValue.energyActiveImportRegister = sample.value;
                        if (chargingSession.meterStart == null) {
                            chargingSession.meterStart = sample.value;
                            chargingSession.meterStop = sample.value;
                        } else {
                            chargingSession.meterStop = sample.value;
                        }
                        break;
                    case 'Power.Active.Import':
                        currentMeterValue.powerActiveImport = sample.value;
                        break;
                    case 'Current.Import':
                        currentMeterValue.currentImport = sample.value;
                        break;
                    case 'Voltage':
                        currentMeterValue.voltage = sample.value;
                        break;
                    case 'Temperature':
                        currentMeterValue.temperature = sample.value;
                        break;
                    case 'SoC':
                        currentMeterValue.soc = sample.value;
                        if (chargingSession.socStart == null) {
                            chargingSession.socLast = sample.value;
                            chargingSession.socStart = sample.value;
                        } else {
                            chargingSession.socStart = sample.value;
                        }
                        break;
                    default:
                        logger.info(`Received Meter Values for measurand ${sample.measurand}`,);
                }
            });

        });
        await currentMeterValue.save();
        await chargingSession.save();
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
    let {connectorId, errorCode, status} = params;
    let chargerId = client.identity!;
    try {
        status = _getConnectorStatus(status);
        const statusNotification = new StatusLogs();
        statusNotification.status = status;
        statusNotification.chargerId = chargerId;
        statusNotification.connectorId = connectorId;
        statusNotification.errorCode = errorCode;
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
    logger.info(`Received Start Transaction from ${client.identity}:`, params);
    let {connectorId, idTag, meterStart, timestamp} = params;
    try {
        const chargingSession = new Sessions();
        const connector = await Connectors.findOne({
            where: {
                chargerConnectorId: connectorId,
                charger: {id: client.identity!}
            },
            relations: ["charger"]
        });
        if (!connector) {
            throw new Error('Connector not found');
        }
        chargingSession.connector = connector;
        const vehicle = await Vehicles.findOne({
            where: {vin: idTag},
            relations: ["user"]
        });
        if (!vehicle) {
            throw new Error('Vehicle not found');
        }
        const charger = await Chargers.findOneBy({id: client.identity!});
        if (!charger) {
            throw new Error('Charger not found');
        }
        chargingSession.vehicleNo = vehicle.vehicleNo;
        chargingSession.vehicleVendor = vehicle.vendor;
        chargingSession.vehicleModel = vehicle.model;
        chargingSession.meterStart = meterStart;
        chargingSession.startTime = timestamp;
        chargingSession.user = vehicle.user;
        chargingSession.charger = charger;
        await chargingSession.save();
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
    logger.info(`Received Stop Transaction from ${client.identity}:`, params);
    let {idTag, meterStop, timestamp, transactionId, reason} = params;
    let chargingSession: Sessions | null = null;
    try {
        chargingSession = await Sessions.findOneBy({id: transactionId});
        if (chargingSession) {
            chargingSession.meterStop = meterStop;
            chargingSession.endTime = timestamp;
            // TODO log reason in sessions
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
    handleRemoteStopTransaction,
    handleStatusNotification,
    handleStopTransaction,
    handleStartTransaction,
}