import {StatusLogsModel} from "../models/statusLog.model";

async function addStatusLog(data: any) {
    try {
        const statusLog = new StatusLogsModel();
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

async function getStatusLogsByChargerId(chargerId: string) {
    try {
        return await StatusLogsModel.find({ where: { chargerId } });
    } catch (error: any) {
        throw new Error(error.message);
    }
}

async function getStatusLogsByChargerIdAndConnectorId(chargerId: string, connectorId: number) {
    try {
        return await StatusLogsModel.find({ where: { chargerId, connectorId } });
    } catch (error: any) {
        throw new Error(error.message);
    }
}

export {
    addStatusLog,
    getStatusLogsByChargerId,
    getStatusLogsByChargerIdAndConnectorId
};