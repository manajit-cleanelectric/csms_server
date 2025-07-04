import { StatusLogs } from "../models/statusLogs";

async function addStatusLog(data: any) {
    try {
        const statusLog = new StatusLogs();
        statusLog.chargerId = data.ChargerId;
        statusLog.connectorId = data.connectorId;
        statusLog.errorCode = data.errorCode
        statusLog.status = data.status;
        await statusLog.save();
        return statusLog;
    } catch (error: any) {
        throw new Error(error.message);
    }
}

async function getStatusLogsByChargerId(chargerId: number) {
    try {
        return await StatusLogs.find({ where: { chargerId } });
    } catch (error: any) {
        throw new Error(error.message);
    }
}

async function getStatusLogsByChargerIdAndConnectorId(chargerId: number, connectorId: number) {
    try {
        return await StatusLogs.find({ where: { chargerId, connectorId } });
    } catch (error: any) {
        throw new Error(error.message);
    }
}

export {
    addStatusLog,
    getStatusLogsByChargerId,
    getStatusLogsByChargerIdAndConnectorId
};