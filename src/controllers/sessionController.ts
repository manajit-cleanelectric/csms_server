import {Sessions, SessionStatus} from "../models/sessions";
import {Chargers} from "../models/charger";
import {Vehicles} from "../models/vehicle";
import {ChargerWebsocketMap} from "../ocpp/ocppServer";
import {v7 as uuidv7, validate as uuidValidate} from "uuid";
import {Users} from "../models/users";
import {InvalidUUIDError, MissingParameterError, NoContentError, ResourceNotFoundError} from "../errors/customErrors";
import {logger} from "../app";
import WebSocket from 'ws';
import {In} from "typeorm";

async function addSession(data: any) {
    // Validate required fields
    if (!data.chargerId || !data.connectorId || !data.vin || !data.startTime || !data.meterStart) {
        switch (true) {
            case !data.chargerId:
                throw new MissingParameterError("Charger ID is required to create a session");
            case !data.connectorId:
                throw new MissingParameterError("Connector ID is required to create a session");
            case !data.vin:
                throw new MissingParameterError("Vehicle VIN is required to create a session");
            case !data.startTime:
                throw new MissingParameterError("Start time is required to create a session");
            case !data.meterStart:
                throw new MissingParameterError("Meter start value is required to create a session");
            default:
                throw new MissingParameterError("Missing required parameters to create a session");
        }
    }
    // Create a new session
    const session = new Sessions();
    const charger = await Chargers.findOneBy({ id: data.chargerId });
    if (!charger) {
        logger.error(`Charger with ID ${data.chargerId} not found`);
        throw new ResourceNotFoundError(`Charger with ID ${data.chargerId} not found`);
    }
    session.charger = charger;
    const connector = charger.connectors.find(conn => conn.chargerConnectorId === data.connectorId);
    if (!connector) {
        logger.error(`Connector with ID ${data.connectorId} not found in charger ${data.chargerId}`);
        throw new ResourceNotFoundError(`Connector with ID ${data.connectorId} not found`);
    }
    session.connector = connector;
    const vehicle = await Vehicles.findOneBy({ id: data.vin });
    if (!vehicle) {
        logger.error(`Vehicle with ID ${data.vin} not found`);
        throw new ResourceNotFoundError(`Vehicle with ID ${data.vin} not found`);
    }
    session.vehicleNo = vehicle.vehicleNo;
    session.vehicleVendor = vehicle.vendor;
    session.vehicleModel = vehicle.model;
    session.user = vehicle.user;
    session.startTime = data.startTime;
    session.meterStart = data.meterStart;
    await session.save();
    return session;
}

async function updateSession(sessionId: number, data: any) {
    const session = await Sessions.findOneBy({ id: sessionId });
    if (!session) {
        logger.error(`Session with ID ${sessionId} not found`);
        throw new ResourceNotFoundError(`Session with ID ${sessionId} not found`);
    }
    session.status = data.status || session.status;
    session.energyUsed = data.energyUsed || session.energyUsed;
    session.socLast = data.soc || session.socLast;
    await session.save();
    return session;
}

async function endSession(sessionId: number, data: any) {
    if (!sessionId) {
        throw new MissingParameterError(`Session ID is required`);
    }
    const session = await Sessions.findOneBy({id: sessionId});
    if (!session) {
        logger.error(`Session with ID ${sessionId} not found`);
        throw new ResourceNotFoundError(`Session with ID ${sessionId} not found`);
    }
    session.endTime = data.endTime;
    session.meterStop = data.meterStop;
    session.energyUsed = data.energyUsed;
    session.status = SessionStatus.FINISHED;
    await session.save();
    return session;
}

async function getSession(sessionId: number) {
    if (!sessionId) {
        throw new MissingParameterError(`Session ID is required`);
    }
    // TODO: OPTIMIZE: Use query builder to partially fetch session data
    const session = await Sessions.findOne({
        where: { id: sessionId },
        relations: ["charger", "connector", "user"]
    });
    if (!session) {
        logger.error(`Session with ID ${sessionId} not found`);
        throw new ResourceNotFoundError(`Session with ID ${sessionId} not found`);
    }
    return session;
}

async function listAllUserSessions(userId: string) {
    if (!userId) {
        throw new MissingParameterError(`Charger ID is required`);
    }
    if (!uuidValidate(userId)) {
        throw new InvalidUUIDError(`Charger ID ${userId} is not a valid UUID`);
    }
    const user = await Users.findOne({
        where: { id: userId },
    });
    if (!user) {
        logger.error(`User with ID ${userId} not found`);
        throw new ResourceNotFoundError(`User with ID ${userId} not found`);
    }
    const sessions = await Sessions.find({
        where: { user: { id: userId } },
        relations: ["charger", "connector"]
    });
    if (sessions.length === 0) {
        logger.error(`No sessions found for user with ID ${userId}`);
        throw new NoContentError(`No sessions found for user with ID ${userId}`);
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
        connectorId: session.connector?.chargerConnectorId
    }));
}

// TODO: OPTIMIZE: Save ongoing session in cache to avoid multiple DB calls
async function getOngoingSession(userId: string){
    if (!userId) {
        throw new MissingParameterError(`User ID is required`);
    }
    if (!uuidValidate(userId)) {
        throw new InvalidUUIDError(`User ID ${userId} is not a valid UUID`);
    }
    const user = await Users.findOne({
        where: { id: userId },
    });
    if (!user) {
        throw new ResourceNotFoundError(`User with ID ${userId} not found`);
    }
    const session = await Sessions.findOne({
        where: { user: { id: userId }, status: In([SessionStatus.PREPARING, SessionStatus.CHARGING, SessionStatus.FINISHING]) },
        relations: ["vehicle", "charger", "connector", "user"]
    });
    if (!session) {
        throw new NoContentError(`No ongoing session found for user with ID ${userId}`);
    }
    return session;
}

async function listAllChargerSessions(chargerId: string) {
    if (!chargerId) {
        throw new MissingParameterError(`Charger ID is required`);
    }
    if (!uuidValidate(chargerId)) {
        throw new InvalidUUIDError(`Charger ID ${chargerId} is not a valid UUID`);
    }
    const charger = await Chargers.findOneBy({ id: chargerId });
    if (!charger) {
        logger.error(`Charger with ID ${chargerId} not found`);
        throw new ResourceNotFoundError(`Charger with ID ${chargerId} not found`);
    }
    const sessions = await Sessions.find({
        where: { charger: { id: chargerId } },
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

    // @ts-ignore
    if (!rpcClient || rpcClient._ws.readyState !== WebSocket.OPEN) {
        logger.error(`WebSocket not open for charger ${chargerId}`);
        return false;
    }

    const messageId = uuidv7(); // Unique ID for tracking
    const message = [
        2, // CALL message
        messageId,
        "RemoteStopTransaction",
        {
            transactionId: transactionId
        }
    ];
    rpcClient.sendRaw(JSON.stringify(message));
    logger.info(`Sent RemoteStopTransaction to charger ${chargerId}`);
    return true;
}

export {
    addSession,
    updateSession,
    endSession,
    getSession,
    listAllUserSessions,
    getOngoingSession,
    sendRemoteStopTransaction,
    listAllChargerSessions,
}