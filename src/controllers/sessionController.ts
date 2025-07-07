import {Sessions} from "../models/sessions";
import {Chargers} from "../models/charger";
import {Vehicles} from "../models/vehicle";

async function addSession(data: any) {
    try {
        // Validate required fields
        if (!data.ChargerId || !data.connectorId || !data.VEN || !data.startTime || !data.meterStart) {
            throw new Error("Missing required fields");
        }
        // Create a new session
        const session = new Sessions();
        const charger = await Chargers.findOneBy({ id: data.ChargerId });
        if (!charger) {
            throw new Error("Charger not found");
        }
        session.charger = charger;
        const connector = charger.connectors.find(conn => conn.chargerConnectorId === data.connectorId);
        if (!connector) {
            throw new Error("Connector not found");
        }
        session.connector = connector;
        const vehicle = await Vehicles.findOneBy({ id: data.VEN });
        if (!vehicle) {
            throw new Error("Vehicle not found");
        }
        session.vehicle = vehicle;
        session.startTime = data.startTime;
        session.meterStart = data.meterStart;
        await session.save();
        return session;
    } catch (error: any) {
        throw new Error(error.message);
    }
}

async function updateSession(sessionId: number, data: any) {
    try {
        const session = await Sessions.findOneBy({ id: sessionId });
        if (!session) {
            throw new Error("Session not found");
        }
        session.status = data.status;
        session.energyUsed = data.energyUsed;
        await session.save();
        return session;
    } catch (error: any) {
        throw new Error(error.message);
    }
}

async function endSession(sessionId: number, data: any) {
    try {
        const session = await Sessions.findOneBy({id: sessionId});
        if (!session) {
            throw new Error("Session not found");
        }
        session.endTime = data.endTime;
        session.meterStop = data.meterStop;
        session.energyUsed = data.energyUsed;
        session.status = data.status
        await session.save();
        return session;
    } catch (error: any) {
        throw new Error(error.message);
    }
}

async function getSession(sessionId: number) {
    try {
        const session = await Sessions.findOneBy({ id: sessionId });
        if (!session) {
            throw new Error("Session not found");
        }
        return session;
    } catch (error: any) {
        throw new Error(error.message);
    }
}

async function listAllUserSessions(userId: number) {
    try {
        return await Sessions.find({
            select: ["id", "charger", "startTime", "endTime", "energyUsed"],
            where: { },
            order: { startTime: "DESC" }
        });
    } catch (error: any) {
        throw new Error(error.message);
    }
}

export {
    addSession,
    updateSession,
    endSession,
    getSession,
    listAllUserSessions
}