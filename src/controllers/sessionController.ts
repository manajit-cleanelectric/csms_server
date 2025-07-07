import {Sessions} from "../models/sessions";
import {Users} from "../models/users";

async function addSession(data: any) {
    try {
        const session = new Sessions();
        session.ChargerId = data.ChargerId;
        session.connectorId = data.connectorId;
        session.vin = data.vin;
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
            select: ["id", "ChargerId", "startTime", "endTime", "energyUsed"],
            where: { userId: userId },
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