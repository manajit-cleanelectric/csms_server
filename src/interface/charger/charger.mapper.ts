import {Chargers} from "../../models/charger.model";
import {ICharger, IChargerCompact} from "./charger.interface";
import {tariffToITariff} from "../tariff";
import {connectorToIConnector} from "../connector";
import {addressToIAddress} from "../address";

export function chargerToIChargerCompact(charger: Chargers): IChargerCompact {
    return {
        id: charger.id,
        model: charger.model,
        vendor: charger.vendor,
        serialNumber: charger.serialNumber,
        city: charger.city,
        alias: charger.alias || undefined,
        maxPower: charger.maxPower,
        noOfConnector: charger.noOfConnector,
        tariff: tariffToITariff(charger.tariff),
        connectors: charger.connectors.map(connector => connectorToIConnector(connector)),
    };
}

export function chargerToICharger(charger: Chargers): ICharger {
    return {
        id: charger.id,
        model: charger.model,
        vendor: charger.vendor,
        serialNumber: charger.serialNumber,
        maxPower: charger.maxPower,
        alias: charger.alias || undefined,
        city: charger.city,
        address: addressToIAddress(charger.address),
        noOfConnector: charger.noOfConnector,
        latitude: charger.latitude.toString(7),
        longitude: charger.longitude.toString(7),
        status: charger.status as ICharger['status'],
        tariff: tariffToITariff(charger.tariff),
        lastHeartBeat: charger.lastHeartBeat || undefined,
        createdAt: charger.createdAt,
        updatedAt: charger.updatedAt,
    };
}