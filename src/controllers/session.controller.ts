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
import {Between, In, LessThanOrEqual, MoreThanOrEqual} from "typeorm";
import {SessionProducer} from "../kafka/producers/session.producer";
import {cronWorker} from "../utils/workers";
import {sessionToIOngoingSession, sessionTOISessionCompact} from "../interface";
import {
    decodeChargerSerialRandomized,
    decodeSessionIdRandomized,
    encodeSessionIdRandomized
} from "../services/idCodec.service";
import {moneyCheckerService} from "../services/moneyChecker.service";
import {Wallet} from "../models/wallet.model";
import {WALLET_MIN_BALANCE} from "../app";

async function addSession(chargerId: string, connectorId: number, idTag: string, meterStart: number, timestamp: any) {
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
        where: {bin: idTag},
        relations: ['user.wallet']
    });
    if (!vehicle) {
        const user = await Users.findOneByOrFail({id: idTag});
        if (!user) {
            logger.error(`Vehicle with battery ID ${idTag} not found`);
            throw new ResourceNotFoundError(`Vehicle with battery ID ${idTag} not found`);
        }
        session.user = user;
        session.startTime = timestamp;
        session.meterStart = meterStart;
        session.location = charger.address?.location;
        await session.save();
        return session;
    } else {
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
    // const runningSession = await Sessions.findOne({
    //     where: {
    //         vehicleNo: vehicle.vehicleNo,
    //         status: In([SessionStatus.PREPARING, SessionStatus.CHARGING, SessionStatus.FINISHING])
    //     }
    // })
    // if (runningSession) {
    //     throw new ResourceAlreadyExistsError("An active session already exists for this vehicle");
    // }

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
        relations: ["charger.address", "connector"]
    });
    if (!session) {
        logger.error(`Session with ID ${sessionId} not found`);
        throw new ResourceNotFoundError(`Session with ID ${sessionId} not found`);
    }
    session.netCGST = parseFloat(session.netCGST!).toFixed(2);
    session.netIGST = parseFloat(session.netIGST!).toFixed(2);
    session.netSGST = parseFloat(session.netSGST!).toFixed(2);
    session.baseAmount = parseFloat(session.baseAmount!).toFixed(2);
    session.totalAmount = parseFloat(session.totalAmount!).toFixed(2);
    return session;
}

async function getSessionInvoiceDetails(sessionId: number) {
    if (!sessionId) {
        throw new MissingParameterError(`Session ID is required`);
    }
    // TODO: OPTIMIZE: Use query builder to partially fetch session data
    const session = await Sessions.findOne({
        where: {id: sessionId},
        relations: ["charger", "connector", "user"]
    });
    if (!session) {
        logger.error(`Session with ID ${sessionId} not found`);
        throw new ResourceNotFoundError(`Session with ID ${sessionId} not found`);
    }
    const charger = await Chargers.findOne({
        where: {id: session.charger.id},
        relations: ["address", "tariff"]
    });
    if (!charger) {
        logger.error(`Charger not found`);
        throw new ResourceNotFoundError(`Charger not found`);
    }

    return {
        sessionId: session.id,
        vehicleNo: session.vehicleNo,
        vehicleVendor: session.vehicleVendor,
        vehicleModel: session.vehicleModel,
        startTime: session.startTime,
        endTime: session.endTime,
        energyUsed: session.energyUsed,
        location: session.location,
        baseAmount: parseFloat(session.baseAmount!).toFixed(2),
        netCGST: parseFloat(session.netCGST!).toFixed(2),
        netSGST: parseFloat(session.netSGST!).toFixed(2),
        netIGST: parseFloat(session.netIGST!).toFixed(2),
        totalAmount: parseFloat(session.totalAmount!).toFixed(2),
        baseTariffRate: charger.tariff.pricePerKWh,
        CGSTRate: charger.tariff.CGST,
        SGSTRate: charger.tariff.SGST,
        IGSTRate: charger.tariff.IGST,
        chargerSerialNumber: session.charger.serialNumber,
        chargerId: session.charger.id,
        connectorId: session.connector.id,
        chargerConnectorId: session.connector.id,
        placeOfSupplyCity: charger.address.city,
        placeOfSupplyState: charger.address.state,
        customerName: session.user?.fullName,
        customerPhoneNumber: session.user?.phoneNumber
    };
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
                endTime: Between(startDate, endDate),
            }
        ],
        relations: ['charger', 'connector'],
        order: {
            endTime: 'DESC',
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
        totalAmount: parseFloat(session.totalAmount!).toFixed(2),
    }));
}

async function listUserSessionsV2(userId: string, limit: number, cursor: string, startDate: Date, endDate: Date) {
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
        throw new ResourceNotFoundError(`User with ID ${userId} not found`);
    }
    const cursorSessionIdRaw = decodeSessionIdRandomized(cursor, process.env.ID_CODEC_KEY!);
    const cursorSessionId = Number(cursorSessionIdRaw);
    const sessions = await Sessions.find({
        where: {
            user: {id: userId},
            startTime: Between(startDate, endDate),
            status: In([SessionStatus.FINISHED, SessionStatus.FAULTED]),
            id: LessThanOrEqual(cursorSessionId)
        },
        order: {
            id: 'DESC',
        },
        take: limit + 1,
    });
    const data = sessions.map(session => {
        return sessionTOISessionCompact(session)
    });
    const metadata: any = {
        hasMore: data.length > limit,
        nextCursor: data.length > limit ? encodeSessionIdRandomized(data[limit].id, process.env.ID_CODEC_KEY!) : null
    };
    return {
        data: data.slice(0, limit),
        metadata: metadata
    };
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


async function sendRemoteStartTransaction(userId: string ,chargerSerialNumber: string, plugNumber: number) {
    await moneyCheckerService(userId);
    const wallet  = await Wallet.findOne({
        where: {
            user: {id: userId}
        }
    });
    if (!wallet || Number(wallet.balance)<WALLET_MIN_BALANCE) {
        return false;
    }
    chargerSerialNumber = decodeChargerSerialRandomized(chargerSerialNumber, process.env.ID_CODEC_KEY!);
    const charger = await Chargers.findOneByOrFail({serialNumber: chargerSerialNumber})
    if (!charger) {
        return false;
    }
    const chargerId = charger.id;
    const rpcClient = ChargerWebsocketMap.get(String(chargerId));
    if (!rpcClient) {
        logger.info(`Charger with ID ${chargerId} not connected`);
        return false;
        // throw new ResourceNotFoundError(`Charger with ID ${chargerId} not connected`);
    }
    logger.info(`Sending RemoteStartTransaction to Charger with ID ${chargerId}`);
    const response: any = await rpcClient.call("RemoteStartTransaction", {
        connectorId: plugNumber,
        idTag: userId,
    });
    if (response?.status !== "Accepted") {
        logger.info(`RemoteStartTransaction ${response.status} by charger with Charger ID ${chargerId}`);
        return false;
    }
    logger.info(`RemoteStartTransaction ${response.status} by charger with Charger ID ${chargerId}`);
    return true;
}

export {
    addSession,
    endSession,
    getSession,
    listAllUserSessions,
    listUserSessionsV2,
    getOngoingSession,
    getOngoingSessionV2,
    sendRemoteStopTransaction,
    listAllChargerSessions,
    getSessionInvoiceDetails,
    sendRemoteStartTransaction
}