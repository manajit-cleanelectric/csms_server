import {logger} from "../services/logger.service";
import {Chargers, ChargerStatus} from "../models/charger.model";
import {createRPCError} from "ocpp-rpc";
import {Vehicles, VehicleStatus} from "../models/vehicle.model";
import {Heartbeats} from "../models/heartbeat.model";
import {addMeterValue} from "./meterValue.controller";
import {addSession, endSession} from "./session.controller";
import {addStatusLog} from "./statusLog.controller";
import {updateChargerStatus} from "./charger.controller";
import {ResourceAlreadyExistsError} from "../errors/customErrors";

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
        await Chargers.update({id: client.identity!}, {
            status: ChargerStatus.AVAILABLE,
            lastHeartBeat: new Date().toISOString()
        });
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
    let minBalanceCheck = true
    try {
        const vehicle = await Vehicles.findOne({
            where: {bin: params.idTag},
            relations: ['user.wallet']
        })
        user = vehicle?.user;

        // TODO: IMPLEMENT: Send push notification to user to recharge wallet if balance is low
        if (parseFloat(user?.wallet?.balance!) < parseInt(process.env.WALLET_MIN_BALANCE!, 10)) {
            minBalanceCheck = false
        }
        if (vehicle?.status==VehicleStatus.APPROVED && minBalanceCheck) {
            return {
                idTagInfo: {
                    status: "Accepted"
                }
            };
        } else if(!minBalanceCheck) {
            return {
                idTagInfo: {
                    status: "Blocked",
                }
            };
        } else {
            return {
                idTagInfo: {
                    status: "Invalid"
                }
            }
        }
    } catch (err) {
        logger.error(`Failed to read vehicle VIN from DB: ${err}`);
        throw createRPCError("InternalError", "Database read failed.");
    }
};

const handleMeterValues = async ({client, params}: { client: any; params: any }) => {
    logger.info(`Received MeterValues from ${client.identity}`);
    let chargerId = client.identity!;
    try {
        await addMeterValue(chargerId, params);
        return {};
    } catch (err) {
        logger.error(`Failed to add meterValues: ${err}`);
        throw createRPCError("InternalError", "Database update failed.");
    }
};

const handleStatusNotification = async ({client, params}: { client: any; params: any }) => {
    logger.info(`Received StatusNotification from ${client.identity}: ${JSON.stringify(params)}`);
    let chargerId = client.identity!;
    try {
        const statusLog = await addStatusLog(chargerId, params);
        await updateChargerStatus(chargerId, statusLog);
    } catch (err) {
        logger.error(`Failed to update charger status: ${err}`);
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
            idTagInfo: {
                status: "Accepted"
            },
            transactionId: chargingSession.id
        };
    } catch (err) {
        if (err instanceof ResourceAlreadyExistsError){
            return {
                idTagInfo: {
                    status: "ConcurrentTx"
                }
            }
        } else {
            logger.error(`Failed to update charger status: ${err}`);
            throw createRPCError("InternalError", "Database update failed.");
        }
    }

};

const handleStopTransaction = async ({client, params}: { client: any; params: any }) => {
    logger.info(`Received Stop Transaction from ${client.identity}: ${JSON.stringify(params)}`);
    const transactionId = params.transactionId;
    try {
        await endSession(transactionId, params);
    } catch (err) {
        logger.error(`Failed to stop Transaction: ${err}`);
        throw createRPCError("InternalError", "Database update failed.");
    }
    return {
        idTagInfo: {
            status: "Accepted"
        }
    };
};

export {
    handleBootNotification,
    handleHeartbeat,
    handleAuthorize,
    handleMeterValues,
    handleStatusNotification,
    handleStopTransaction,
    handleStartTransaction,
}