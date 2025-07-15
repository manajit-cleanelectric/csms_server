import {logger} from "../app";
import {Chargers, ChargerStatus} from "../models/charger";
import {createRPCError} from "ocpp-rpc";
import {Sessions} from "../models/sessions";
import {Vehicles} from "../models/vehicle";
import {Heartbeats} from "../models/heartbeats";
import {MeterValues} from "../models/meterValues";
import {StatusLogs} from "../models/statusLogs";
import {Connectors} from "../models/connector";

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
        await Chargers.update({id: chargerId}, {status: ChargerStatus.AVAILABLE})
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
                        break;
                    default:
                        logger.info(`Received Meter Values for measurand ${sample.measurand}`,);
                }
            });

        });
        await currentMeterValue.save();
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
        const statusNotification = new StatusLogs();
        statusNotification.status = status;
        statusNotification.chargerId = chargerId;
        statusNotification.connectorId = connectorId;
        statusNotification.errorCode = errorCode;
        await statusNotification.save();
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
        chargingSession.vehicleNo = vehicle.vehicleNo;
        chargingSession.vehicleVendor = vehicle.vendor;
        chargingSession.vehicleModel = vehicle.model;
        chargingSession.meterStart = meterStart;
        chargingSession.startTime = timestamp;
        chargingSession.user = vehicle.user;
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
        "idTagInfo": {
            "status": "Accepted"
        }
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