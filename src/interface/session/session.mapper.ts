import {Sessions} from "../../models/session.model";
import {ISession, ISessionCompact} from "./session.interface";
import {chargerToIChargerCompact} from "../charger";
import {connectorToIConnector} from "../connector";
import {userToIUserCompact} from "../user";

export function sessionTOISessionCompact(session: Sessions): ISessionCompact {
    return {
        id: session.id,
        charger: chargerToIChargerCompact(session.charger),
        startTime: session.startTime,
        endTime: session.endTime,
        energyUsed: session.energyUsed,
        status: session.status,
        totalAmount: session.totalAmount || undefined,
    };
}

export function sessionToISession(session: Sessions): ISession {
    return {
        id: session.id,
        charger: chargerToIChargerCompact(session.charger),
        connector: connectorToIConnector(session.connector),
        vehicleNo: session.vehicleNo || undefined,
        vehicleVendor: session.vehicleVendor || undefined,
        vehicleModel: session.vehicleModel || undefined,
        user: userToIUserCompact(session.user!),
        startTime: session.startTime,
        endTime: session.endTime,
        meterStart: session.meterStart || undefined,
        meterStop: session.meterStop || undefined,
        energyUsed: session.energyUsed,
        location: session.location || undefined,
        socStart: session.socStart || undefined,
        socLast: session.socLast || undefined,
        reason: session.reason || undefined,
        status: session.status as ISession['status'],
        baseAmount: session.baseAmount || undefined,
        netCGST: session.netCGST || undefined,
        netSGST: session.netSGST || undefined,
        netIGST: session.netIGST || undefined,
        totalAmount: session.totalAmount || undefined,
        transaction: session.transaction?.id || undefined,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
    };
}