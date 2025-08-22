import {ErrorCode, StatusLogs} from "../models/statusLog.model";
import {validate as uuidValidate} from "uuid";
import {ConnectorStatus} from "../models/connector.model";

async function addStatusLog(chargerId: string, params: any) {
    if (!chargerId) {
        throw new Error("Charger ID is required");
    }
    const requiredFields = [
        'connectorId',
        'errorCode',
        'status',
    ];
    const missingFields = requiredFields.filter(field => !params[field]);
    if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(", ")}`);
    }
    if (!uuidValidate(chargerId)) {
        throw new Error("Charger ID is invalid");
    }
    if (!Object.values(ConnectorStatus).includes(params.status)) {
        throw new Error("Status is invalid");
    }
    if (!Object.values(ErrorCode).includes(params.errorCode)) {
        throw new Error("Error code is invalid");
    }
    const statusLog = new StatusLogs();
    statusLog.chargerId = chargerId;
    statusLog.connectorId = params.connectorId;
    statusLog.errorCode = params.errorCode;
    statusLog.status = params.status;
    statusLog.info = params.info || null;
    statusLog.vendorId = params.vendorId || null;
    statusLog.vendorErrorCode = params.vendorErrorCode || null;
    await statusLog.save();
    return statusLog;
}

async function getStatusLogsByChargerId(chargerId: string) {
    try {
        return await StatusLogs.find({ where: { chargerId } });
    } catch (error: any) {
        throw new Error(error.message);
    }
}

async function getStatusLogsByChargerIdAndConnectorId(chargerId: string, connectorId: number) {
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