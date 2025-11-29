import {Sessions} from "../../models/session.model";
import {IOngoingSession, ISession, ISessionCompact} from "./session.interface";
import {chargerToIChargerCompact} from "../charger";
import {connectorToIConnector} from "../connector";
import {userToIUserCompact} from "../user";
import {Tariffs} from "../../models/tariff.model";

function calculateTotalCostSoFar(tariff: Tariffs, energyUsed: number): string {
    const { pricePerKWh = 0, CGST = 0, SGST = 0, IGST = 0 } = tariff ?? {};
    const taxFraction = (CGST / 100) + (SGST / 100) + (IGST / 100);
    return (((energyUsed ?? 0) / 1000) * pricePerKWh * (1 + taxFraction)).toFixed(2);
}

export function sessionTOISessionCompact(session: Sessions): ISessionCompact {
    return {
        id: session.id,
        endTime: session.endTime,
        energyUsed: session.energyUsed,
        status: session.status,
        totalAmount: session.totalAmount ?? undefined,
    };
}

export function sessionToISession(session: Sessions): ISession {
    return {
        id: session.id,
        charger: chargerToIChargerCompact(session.charger),
        connector: connectorToIConnector(session.connector),
        vehicleNo: session.vehicleNo ?? undefined,
        vehicleVendor: session.vehicleVendor ?? undefined,
        vehicleModel: session.vehicleModel ?? undefined,
        user: userToIUserCompact(session.user!),
        startTime: session.startTime,
        endTime: session.endTime ?? undefined,
        meterStart: session.meterStart ?? undefined,
        meterStop: session.meterStop ?? undefined,
        energyUsed: session.energyUsed,
        location: session.location ?? undefined,
        socStart: session.socStart ?? undefined,
        socLast: session.socLast ?? undefined,
        reason: session.reason ?? undefined,
        status: session.status as ISession['status'],
        baseAmount: session.baseAmount ?? undefined,
        netCGST: session.netCGST ?? undefined,
        netSGST: session.netSGST ?? undefined,
        netIGST: session.netIGST ?? undefined,
        totalAmount: session.totalAmount ?? undefined,
        transactionId: session.transaction?.id ?? undefined,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
    };
}

export function sessionToIOngoingSession(session: Sessions): IOngoingSession {
    return {
        id: session.id,
        charger: chargerToIChargerCompact(session.charger),
        connector: connectorToIConnector(session.connector),
        vehicleNo: session.vehicleNo ?? undefined,
        vehicleVendor: session.vehicleVendor ?? undefined,
        vehicleModel: session.vehicleModel ?? undefined,
        startTime: session.startTime,
        meterStart: session.meterStart ?? undefined,
        energyUsed: session.energyUsed,
        location: session.location ?? undefined,
        socLast: session.socLast ?? undefined,
        status: session.status as IOngoingSession['status'],
        totalCostSoFar: calculateTotalCostSoFar(session.charger.tariff, session.energyUsed),
    }
}