import {MeterValues} from "../models/meterValues";
import {
    Location,
    Measurand,
    Phase,
    ReadingContext,
    SampledValues,
    UnitOfMeasure,
    ValueFormat
} from "../models/sampledValues";
import {Sessions} from "../models/sessions";
import {logger} from "../app";

function parseSampledValue(sample: any) {
    let parsedSample: any = {};
    parsedSample.stringValue = undefined;
    parsedSample.decimalValue = undefined;
    parsedSample.integerValue = undefined;
    parsedSample.context = sample.context ?? ReadingContext.SAMPLE_PERIODIC;
    parsedSample.format = sample.format ?? ValueFormat.RAW;
    parsedSample.measurand = sample.measurand ?? Measurand.ENERGY_ACTIVE_IMPORT_REGISTER;
    parsedSample.phase = sample.phase ?? Phase.NO_PHASE;
    parsedSample.location = sample.location ?? Location.OUTLET;
    parsedSample.unit = sample.unit ?? UnitOfMeasure.WATT_HOUR;


    if (sample.format == "Raw" || sample.format == undefined) {
        // Try to parse as integer or decimal
        if (/^-?\d+$/.test(sample.value)) {
            parsedSample.integerValue = parseInt(sample.value, 10);
        } else if (/^-?\d+\.\d+$/.test(sample.value)) {
            parsedSample.decimalValue = parseFloat(sample.value);
        } else {
            parsedSample.stringValue = sample.value;
        }
    } else {
        parsedSample.stringValue = sample.value;
    }

    return parsedSample;
}

async function addMeterValue(chargerId: any, params: any) {
    const {connectorId, transactionId, meterValue} = params;
    const session = await Sessions.findOneBy({id: transactionId});
    if (!session) {
        logger.error(`Session with ID ${transactionId} not found.`);
        throw new Error(`Session with ID ${transactionId} not found.`);
    }
    for (const mv of meterValue) {
        const {timestamp, sampledValue} = mv;
        const meterValueEntity = MeterValues.create({
            chargerId,
            connectorId,
            sessionId: transactionId,
            timestamp: timestamp,

        });
        meterValueEntity.sampledValues = sampledValue.map((sample: any) => {
            const parsedSample = parseSampledValue(sample);
            if (parsedSample.measurand == Measurand.ENERGY_ACTIVE_IMPORT_REGISTER) {
                session.meterStop = parsedSample.integerValue ?? parsedSample.decimalValue ?? session.meterStop;
            } else if (parsedSample.measurand == Measurand.SoC){
                session.socLast = parsedSample.integerValue ?? parsedSample.decimalValue ?? session.socLast;
            }
            return SampledValues.create(parsedSample);
        });
        await meterValueEntity.save();
    }
    session.energyUsed = session.meterStop - session.meterStart;
    await session.save();
    logger.info(`Meter values added for session ${transactionId} at connector ${connectorId} for charger ${chargerId}.`);
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