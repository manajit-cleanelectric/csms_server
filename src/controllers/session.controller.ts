import {Reason, Sessions, SessionStatus} from "../models/session.model";
import {Chargers} from "../models/charger.model";
import {Vehicles} from "../models/vehicle.model";
import {ChargerWebsocketMap} from "../ocpp/ocppServer";
import {validate as uuidValidate} from "uuid";
import {Users} from "../models/user.model";
import {
    InvalidUUIDError,
    MissingParameterError,
    NoContentError,
    ResourceNotFoundError
} from "../errors/customErrors";
import {logger} from "../services/logger.service";
import {In, LessThanOrEqual, MoreThanOrEqual} from "typeorm";
import {SessionProducer} from "../kafka/producers/session.producer";
import {cronWorker} from "../utils/workers";
import {sessionToIOngoingSession} from "../interface";

async function addSession(chargerId: string, connectorId: number, bin: string, meterStart: number, timestamp: any) {
    // Create a new session
    const session = new Sessions();
    const charger = await Chargers.findOne({
        where: {id: chargerId},
        relations: ["connectors.currentSession", "address"]
    });
    if (!charger) {
        logger.error(`Charger with ID ${chargerId} not found`);
        throw new ResourceNotFoundError(`Charger with ID ${chargerId} not found`);
    }
    session.charger = charger;
    const connector = charger.connectors.find(conn => conn.chargerConnectorId === connectorId);
    if (!connector) {
        logger.error(`Connector with ID ${connectorId} not found in charger ${chargerId}`);
        throw new ResourceNotFoundError(`Connector with ID ${connectorId} not found`);
    } else {
        if (connector.currentSession) {
            logger.warn(`Connector with ID ${connectorId} has an ongoing faulty session`);
            cronWorker.postMessage({ action: "handleExpiredSessionId", sessionId: connector.currentSession.id });
        }
        connector.currentSession = session;
    }
    session.connector = connector;
    const vehicle = await Vehicles.findOne({
        where: {bin: bin},
        relations: ['user.wallet']
    });
    if (!vehicle) {
        logger.error(`Vehicle with battery ID ${bin} not found`);
        throw new ResourceNotFoundError(`Vehicle with battery ID ${bin} not found`);
    }
    // const runningSession = await Sessions.findOne({
    //     where: {
    //         vehicleNo: vehicle.vehicleNo,
    //         status: In([SessionStatus.PREPARING, SessionStatus.CHARGING, SessionStatus.FINISHING])
    //     }
    // })
    // if (runningSession) {
    //     throw new ResourceAlreadyExistsError("An active session already exists for this vehicle");
    // }
    session.vehicleNo = vehicle.vehicleNo;
    session.vehicleVendor = vehicle.vendor;
    session.vehicleModel = vehicle.model;
    session.user = vehicle.user;
    session.startTime = timestamp;
    session.meterStart = meterStart;
    session.location = charger.address?.location;
    await session.save();
    return session;
}

async function endSession(sessionId: number, data: any) {
    const chargingSession = await Sessions.findOne({
        where: {id: sessionId},
        relations: ['user', 'connector'],
    });
    if (!Object.values(Reason).includes(data.reason)) {
        data.reason = Reason.OTHER
    }
    if (chargingSession) {
        chargingSession.connector.currentSession = null;
        await chargingSession.connector.save();
        chargingSession.meterStop = data.meterStop;
        chargingSession.endTime = data.timestamp;
        chargingSession.reason = data.reason;
        chargingSession.status = SessionStatus.FINISHED;
        chargingSession.energyUsed = chargingSession.meterStop - chargingSession.meterStart;
        await chargingSession.save();
        const sessionProducer: SessionProducer = SessionProducer.getInstance();
        await sessionProducer.sendSessionCompleteMessage(sessionId);
    } else {
        logger.error(`Session with ID ${sessionId} not found`);
        throw new Error(`Session with ID ${sessionId} not found`);
    }
}

async function getSession(sessionId: number) {
    if (!sessionId) {
        throw new MissingParameterError(`Session ID is required`);
    }
    // TODO: OPTIMIZE: Use query builder to partially fetch session data
    const session = await Sessions.findOne({
        where: {id: sessionId},
        relations: ["charger", "connector"]
    });
    if (!session) {
        logger.error(`Session with ID ${sessionId} not found`);
        throw new ResourceNotFoundError(`Session with ID ${sessionId} not found`);
    }
    return session;
}

async function listAllUserSessions(userId: string, page: number, limit: number, startDate: Date, endDate: Date) {
    if (!userId) {
        throw new MissingParameterError(`Charger ID is required`);
    }
    if (!uuidValidate(userId)) {
        throw new InvalidUUIDError(`Charger ID ${userId} is not a valid UUID`);
    }
    const user = await Users.findOne({
        where: {id: userId},
    });
    if (!user) {
        logger.error(`User with ID ${userId} not found`);
        throw new ResourceNotFoundError(`User with ID ${userId} not found`);
    }
    const sessions = await Sessions.find({
        where: [
            {
                user: {id: userId},
                endTime: MoreThanOrEqual(startDate),
            },
            {
                user: {id: userId},
                endTime: LessThanOrEqual(endDate),
            }
        ],
        relations: ['charger', 'connector'],
        order: {
            endTime: 'ASC',
        },
        skip: (page - 1) * limit,
        take: limit,
    });
    if (sessions.length === 0) {
        logger.info(`No sessions found for user with ID ${userId}`);
        return [];
        // throw new NoContentError(`No sessions found for user with ID ${userId}`);
    }
    return sessions.map(session => ({
        id: session.id,
        startTime: session.startTime,
        endTime: session.endTime,
        meterStart: session.meterStart,
        meterStop: session.meterStop,
        energyUsed: session.energyUsed,
        status: session.status,
        location: session.location,
        user: {
            id: session.user?.id,
            name: session.user?.fullName
        },
        vehicle: {
            vehicleNo: session.vehicleNo,
            vendor: session.vehicleVendor,
            model: session.vehicleModel,
        },
        charger: {
            id: session.charger?.id,
            model: session.charger?.model
        },
        connectorId: session.connector?.chargerConnectorId,
        totalAmount: session.totalAmount,
    }));
}

async function getOngoingSession(userId: string) {
    if (!userId) {
        throw new MissingParameterError(`User ID is required`);
    }
    if (!uuidValidate(userId)) {
        throw new InvalidUUIDError(`User ID ${userId} is not a valid UUID`);
    }
    const user = await Users.findOne({
        where: {id: userId},
    });
    if (!user) {
        throw new ResourceNotFoundError(`User with ID ${userId} not found`);
    }
    const session = await Sessions.findOne({
        where: {
            user: {id: userId},
            status: In([SessionStatus.PREPARING, SessionStatus.CHARGING, SessionStatus.FINISHING])
        },
        relations: ['charger.tariff', 'charger.address', 'connector']
    });
    if (!session) {
        throw new NoContentError(`No ongoing session found for user with ID ${userId}`);
    }
    const { pricePerKWh = 0, CGST = 0, SGST = 0, IGST = 0 } = session.charger.tariff || {};
    const taxFraction = (CGST / 100) + (SGST / 100) + (IGST / 100);
    const totalCostSoFar = (((session.energyUsed / 1000) * pricePerKWh) * (1 + taxFraction)).toFixed(2);
    return {
        id: session.id,
        startTime: session.startTime,
        energyUsed: session.energyUsed,
        totalCostSoFar: totalCostSoFar,
        charger: session.charger,
        address: session.charger.address,
        socLast: session.socLast,
        status: session.status,
        location: session.location
    };
}

async function getOngoingSessionV2(userId: string) {
    if (!userId) {
        throw new MissingParameterError(`User ID is required`);
    }
    if (!uuidValidate(userId)) {
        throw new InvalidUUIDError(`User ID ${userId} is not a valid UUID`);
    }
    const user = await Users.findOne({
        where: {id: userId},
    });
    if (!user) {
        throw new ResourceNotFoundError(`User with ID ${userId} not found`);
    }
    const sessions = await Sessions.find({
        where: {
            user: {id: userId},
            status: In([SessionStatus.PREPARING, SessionStatus.CHARGING, SessionStatus.FINISHING])
        },
        relations: ['charger.tariff', 'connector']
    });
    if (sessions.length == 0) {
        throw new NoContentError(`No ongoing session found for user with ID ${userId}`);
    }
    return sessions.map(session => {
        return sessionToIOngoingSession(session);
    });
}

async function listAllChargerSessions(chargerId: string) {
    if (!chargerId) {
        throw new MissingParameterError(`Charger ID is required`);
    }
    if (!uuidValidate(chargerId)) {
        throw new InvalidUUIDError(`Charger ID ${chargerId} is not a valid UUID`);
    }
    const charger = await Chargers.findOneBy({id: chargerId});
    if (!charger) {
        logger.error(`Charger with ID ${chargerId} not found`);
        throw new ResourceNotFoundError(`Charger with ID ${chargerId} not found`);
    }
    const sessions = await Sessions.find({
        where: {charger: {id: chargerId}},
        relations: ["vehicle", "user", "connector"]
    });
    if (sessions.length === 0) {
        logger.error(`No sessions found for charger with ID ${chargerId}`);
        throw new NoContentError(`No sessions found for charger with ID ${chargerId}`);
    }
    return sessions.map(session => ({
        id: session.id,
        startTime: session.startTime,
        endTime: session.endTime,
        meterStart: session.meterStart,
        meterStop: session.meterStop,
        energyUsed: session.energyUsed,
        status: session.status,
        vehicle: {
            vehicleNo: session.vehicleNo,
            vendor: session.vehicleVendor,
            model: session.vehicleModel,
        },
        user: {
            id: session.user?.id,
            name: session.user?.fullName
        },
        connectorId: session.connector?.chargerConnectorId
    }));
}

async function sendRemoteStopTransaction(chargerId: string, transactionId: number) {
    const rpcClient = ChargerWebsocketMap.get(String(chargerId));

    if (!rpcClient) {
        logger.error(`Charger with ID ${chargerId} not connected`);
        throw new ResourceNotFoundError(`Charger with ID ${chargerId} not connected`);
    }

    const response: any = await rpcClient.call("RemoteStopTransaction", {
        transactionId: transactionId
    });

    if (response?.status !== "Accepted") {
        logger.error(`Failed to Stop Transaction Remotely to charger ${chargerId}: ${response.status}`);
        return false;
    }

    return true;
}

export {
    addSession,
    endSession,
    getSession,
    listAllUserSessions,
    getOngoingSession,
    getOngoingSessionV2,
    sendRemoteStopTransaction,
    listAllChargerSessions,
}