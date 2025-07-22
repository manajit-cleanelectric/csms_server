import {MeterValues} from "../models/meterValues";

async function addMeterValue(data: any) {
    try {
        const meterValue = new MeterValues();
        meterValue.chargerId = data.ChargerId;
        meterValue.connectorId = data.connectorId;
        meterValue.timestamp = data.timestamp;
        meterValue.sessionId = data.sessionId;
        meterValue.currentImport = data.currentImport;
        meterValue.energyActiveImportRegister = data.energyActiveImportRegister;
        meterValue.powerActiveImport = data.powerActiveImport;
        meterValue.soc = data.soc ?? 0; // Default to 0 if not provided
        meterValue.voltage = data.voltage;
        meterValue.temperature = data.temperature;
        await meterValue.save();
        return meterValue;
    } catch (error: any) {
        throw new Error(error.message);
    }
}

async function getMeterValuesBySessionId(sessionId: number) {
    try {
        return await MeterValues.find({where: {sessionId}});
    } catch (error: any) {
        throw new Error(error.message);
    }
}

export {
    addMeterValue,
    getMeterValuesBySessionId
};