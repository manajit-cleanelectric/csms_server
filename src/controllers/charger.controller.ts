import {Chargers, ChargerStatus} from "../models/charger.model";
import {Connectors, ConnectorStatus} from "../models/connector.model";
import {
    InvalidUUIDError,
    MissingParameterError,
    NoContentError,
    ResourceAlreadyExistsError,
    ResourceNotFoundError
} from "../errors/customErrors";
import {validate as uuidValidate} from "uuid";
import {Tariffs} from "../models/tariff.model";
import {Addresses} from "../models/address.model";
import {StatusLogs} from "../models/statusLog.model";
import {SessionStatus} from "../models/session.model";
import {redisClient} from "../app";
import {In} from "typeorm";

const validConnectorTransitions: Record<ConnectorStatus, ConnectorStatus[]> = {
    [ConnectorStatus.AVAILABLE]: [
        ConnectorStatus.PREPARING, ConnectorStatus.CHARGING, ConnectorStatus.SUSPENDED_EV,
        ConnectorStatus.SUSPENDED_EVSE, ConnectorStatus.FINISHING, ConnectorStatus.UNAVAILABLE, ConnectorStatus.FAULTED,
    ],
    [ConnectorStatus.PREPARING]: [
        ConnectorStatus.AVAILABLE, ConnectorStatus.CHARGING, ConnectorStatus.SUSPENDED_EV,
        ConnectorStatus.SUSPENDED_EVSE, ConnectorStatus.FINISHING, ConnectorStatus.UNAVAILABLE, ConnectorStatus.FAULTED,
    ],
    [ConnectorStatus.CHARGING]: [
        ConnectorStatus.AVAILABLE, ConnectorStatus.PREPARING, ConnectorStatus.SUSPENDED_EV,
        ConnectorStatus.SUSPENDED_EVSE, ConnectorStatus.FINISHING, ConnectorStatus.UNAVAILABLE, ConnectorStatus.FAULTED,
    ],
    [ConnectorStatus.SUSPENDED_EV]: [
        ConnectorStatus.AVAILABLE, ConnectorStatus.CHARGING, ConnectorStatus.SUSPENDED_EVSE,
        ConnectorStatus.FINISHING, ConnectorStatus.UNAVAILABLE, ConnectorStatus.FAULTED,
    ],
    [ConnectorStatus.SUSPENDED_EVSE]: [
        ConnectorStatus.AVAILABLE, ConnectorStatus.CHARGING, ConnectorStatus.SUSPENDED_EV,
        ConnectorStatus.FINISHING, ConnectorStatus.UNAVAILABLE, ConnectorStatus.FAULTED,
    ],
    [ConnectorStatus.FINISHING]: [
        ConnectorStatus.AVAILABLE, ConnectorStatus.PREPARING, ConnectorStatus.UNAVAILABLE, ConnectorStatus.FAULTED,
    ],
    [ConnectorStatus.UNAVAILABLE]: [
        ConnectorStatus.AVAILABLE, ConnectorStatus.PREPARING, ConnectorStatus.CHARGING,
        ConnectorStatus.SUSPENDED_EV, ConnectorStatus.SUSPENDED_EVSE, ConnectorStatus.FINISHING, ConnectorStatus.FAULTED,
    ],
    [ConnectorStatus.FAULTED]: [
        ConnectorStatus.AVAILABLE, ConnectorStatus.PREPARING, ConnectorStatus.CHARGING,
        ConnectorStatus.SUSPENDED_EV, ConnectorStatus.SUSPENDED_EVSE, ConnectorStatus.FINISHING, ConnectorStatus.UNAVAILABLE,
    ],
    [ConnectorStatus.RESERVED]: [
        ConnectorStatus.AVAILABLE, ConnectorStatus.PREPARING, ConnectorStatus.UNAVAILABLE, ConnectorStatus.FAULTED,
    ],
};

function mapConnectorToSessionStatus(connectorStatus: ConnectorStatus): SessionStatus {
    switch (connectorStatus) {
        case ConnectorStatus.AVAILABLE:
            return SessionStatus.IDLE;
        case ConnectorStatus.PREPARING:
            return SessionStatus.PREPARING;
        case ConnectorStatus.CHARGING:
            return SessionStatus.CHARGING;
        case ConnectorStatus.SUSPENDED_EV:
        case ConnectorStatus.SUSPENDED_EVSE:
            return SessionStatus.SUSPENDED;
        case ConnectorStatus.RESERVED:
            return SessionStatus.FAULTED;
        case ConnectorStatus.FINISHING:
            return SessionStatus.FINISHING;
        case ConnectorStatus.UNAVAILABLE:
            return SessionStatus.UNAVAILABLE;
        case ConnectorStatus.FAULTED:
            return SessionStatus.FAULTED;
        default:
            throw new Error("Unknown connector status");
    }
}

function isConnectorTransitionValid(
    fromStatus: ConnectorStatus,
    toStatus: ConnectorStatus
): boolean {
    return validConnectorTransitions[fromStatus]?.includes(toStatus) ?? false;
}

function getSessionStatusFromConnectorStatus( status: ConnectorStatus ) {
    return mapConnectorToSessionStatus(status);
}

async function addCharger(data: any) {
    const requiredFields = [
        "model",
        "address_line1",
        "address_line2",
        "address_location",
        "address_city",
        "address_state",
        "address_zipCode",
        "address_country",
        "noOfConnector",
        "connectorTypes",
        "vendor",
        "serialNumber",
        "longitude",
        "latitude",
        "pricePerKWh",
    ];
    const missingFields = requiredFields.filter(field => !data[field]);
    if (missingFields.length > 0) {
        throw new MissingParameterError(`Missing required fields: ${missingFields.join(", ")}`);
    }

    const existingCharger = await Chargers.findOne({
        where: {serialNumber: data.serialNumber}
    });
    if (existingCharger) {
        throw new ResourceAlreadyExistsError(`Charger with serial number ${data.serialNumber} already exists`);
    }

    // create address object
    const address = new Addresses();
    address.line1 = data.address_line1;
    address.line2 = data.address_line2;
    address.location = data.address_location;
    address.city = data.address_city;
    address.state = data.address_state;
    address.zipCode = data.address_zipCode;
    address.country = data.address_country;

    // check if tariff already exists
    let tariff = await Tariffs.findOne({
        where: {pricePerKWh: data.pricePerKWh, CGST: data.CGST, SGST: data.SGST, IGST: data.IGST}
    });
    if (!tariff) {
        tariff = new Tariffs();
        tariff.pricePerKWh = data.pricePerKWh;
        tariff.CGST = data.CGST;
        tariff.SGST = data.SGST;
        tariff.IGST = data.IGST;
    }

    // Create connectors list
    const connectors: Connectors[] = [];
    for (let i = 0; i < data.noOfConnector; i++) {
        const connector = new Connectors();
        connector.chargerConnectorId = i + 1; // Assuming connector IDs start from 1
        connector.type = data.connectorTypes[i]; // Default to Type1 if not enough types provided
        connector.status = ConnectorStatus.UNAVAILABLE;
        connectors.push(connector);
    }

    // Create charger object
    const charger = new Chargers();
    charger.model = data.model;
    charger.address = address;
    charger.city = data.address_city;
    charger.noOfConnector = data.noOfConnector;
    charger.vendor = data.vendor;
    charger.serialNumber = data.serialNumber;
    charger.maxPower = data.maxPower;
    charger.alias = data.alias;
    charger.longitude = data.longitude;
    charger.latitude = data.latitude;
    charger.tariff = tariff;
    charger.connectors = connectors;
    charger.status = ChargerStatus.AVAILABLE; // Default status

    await charger.save(); // Save charger first to get the ID

    await redisClient.geoadd(
        "chargers:locations",
        charger.longitude,
        charger.latitude,
        charger.id
    );
    return charger;
}

async function updateChargerTariff(chargerId: string, data: any) {
    if (!chargerId) {
        throw new MissingParameterError(`Charger ID is required to update tariff`);
    }
    const requiredFields = [
        "pricePerKWh",
    ];
    const missingFields = requiredFields.filter(field => !data[field]);
    if (missingFields.length > 0) {
        throw new MissingParameterError(`Missing required fields: ${missingFields.join(", ")}`);
    }
    if (!uuidValidate(chargerId)) {
        throw new InvalidUUIDError(`Charger ID is invalid`);
    }
    const charger = await Chargers.findOne({
        where: {id: chargerId},
        relations: ["tariff"]
    });
    if (!charger) {
        throw new ResourceNotFoundError(`Charger with ID ${chargerId} not found`);
    }
    let newTariff = await Tariffs.findOne({
        where: {pricePerKWh: data.pricePerKWh, CGST: data.CGST, SGST: data.SGST, IGST: data.IGST}
    });
    if (!newTariff) {
        newTariff = new Tariffs();
        newTariff.pricePerKWh = data.pricePerKWh;
        newTariff.CGST = data.CGST;
        newTariff.SGST = data.SGST;
        newTariff.IGST = data.IGST;
    }
    charger.tariff = newTariff;
    await charger.save();
    return charger;
}

async function updateChargerAddress(chargerId: string, data: any) {
    if (!chargerId) {
        throw new MissingParameterError(`Charger ID is required to update address`);
    }
    const requiredFields = [
        "address_line1",
        "address_line2",
        "address_location",
        "address_city",
        "address_state",
        "address_zipCode",
        "address_country",
        "latitude",
        "longitude",
    ];
    const missingFields = requiredFields.filter(field => !data[field]);
    if (missingFields.length > 0) {
        throw new MissingParameterError(`Missing required fields: ${missingFields.join(", ")}`);
    }
    if (!uuidValidate(chargerId)) {
        throw new InvalidUUIDError(`Charger ID is invalid`);
    }
    const charger = await Chargers.findOne({
        where: {id: chargerId},
        relations: ["address"]
    });
    if (!charger) {
        throw new ResourceNotFoundError(`Charger with ID ${chargerId} not found`);
    }
    const address = charger.address;
    address.line1 = data.address_line1;
    address.line2 = data.address_line2;
    address.location = data.address_location;
    address.city = data.address_city;
    charger.city = address.city;
    address.state = data.address_state;
    address.zipCode = data.address_zipCode;
    address.country = data.address_country;
    charger.latitude = data.latitude;
    charger.longitude = data.longitude;
    await charger.save();
    await redisClient.geoadd(
        "chargers:locations",
        charger.longitude,
        charger.latitude,
        charger.id
    );
    return charger;
}

async function updateChargerData(chargerId: string, data: any) {
    if (!chargerId) {
        throw new MissingParameterError(`Charger ID is required to update charger data`);
    }
    if (!uuidValidate(chargerId)) {
        throw new InvalidUUIDError(`Charger ID is invalid`);
    }
    const charger = await Chargers.findOneBy({id: chargerId});
    if (!charger) {
        throw new ResourceNotFoundError(`Charger with ID ${chargerId} not found`);
    }
    charger.vendor = data.vendor ?? charger.vendor;
    charger.model = data.model ?? charger.model;
    charger.maxPower = data.maxPower ?? charger.maxPower;
    charger.alias = data.alias ?? charger.alias;
    return await charger.save();
}

async function updateConnectorType(chargerId: string, connectorId: number, type: string) {
    if (!chargerId) {
        throw new MissingParameterError(`Charger ID is required to update connector type`);
    }
    if (!uuidValidate(chargerId)) {
        throw new InvalidUUIDError(`Charger ID is invalid`);
    }
    const charger = await Chargers.findOne({
        where: {id: chargerId},
        relations: ["connectors"],
    });
    if (!charger) {
        throw new ResourceNotFoundError(`Charger with ID ${chargerId} not found`);
    }
    const connector = charger.connectors.find(c => c.chargerConnectorId === connectorId);
    if (!connector) {
        throw new ResourceNotFoundError(`Connector with ID ${connectorId} not found for charger ${chargerId}`);
    }
    if (!Object.values(ConnectorStatus).includes(type as ConnectorStatus)) {
        throw new TypeError(`Connector type ${type} is not valid`);
    }
    connector.type = type;
    await charger.save();
    return charger;
}

async function updateChargerStatus(chargerId: string, statusLog: StatusLogs) {
    const charger = await Chargers.findOne({
        where: {id: chargerId},
        relations: ["connectors", "connectors.currentSession"]
    });
    if (!charger) {
        throw new Error(`Charger with ID ${chargerId} not found`);
    }
    if (statusLog.connectorId == 0) {
        if (!Object.values(ChargerStatus).includes(statusLog.status as unknown as ChargerStatus)) {
            throw new Error(`Charger status is invalid`);
        }
        charger.status = statusLog.status as unknown as ChargerStatus;
    } else {
        const connector = charger.connectors.find(c => c.chargerConnectorId === statusLog.connectorId);
        if (!connector) {
            throw new Error(`Connector with ID ${statusLog.connectorId} not found for charger ${chargerId}`);
        }
        if (!Object.values(ConnectorStatus).includes(statusLog.status)) {
            throw new Error(`Connector status is invalid`);
        }
        // TODO: Uncomment this when the transition validation is implemented
        // if (!isConnectorTransitionValid(connector.status, statusLog.status as ConnectorStatus)) {
        //     throw new Error(`Invalid status transition from ${connector.status} to ${statusLog.status}`);
        // }
        connector.status = statusLog.status;
        if (connector.currentSession &&  connector.currentSession.status !== SessionStatus.FINISHED){
            connector.currentSession.status = getSessionStatusFromConnectorStatus(statusLog.status);
        }
    }
    await charger.save();
}

async function listAllCharger() {
    return await Chargers.find();
}

async function getCharger(chargerId: string) {
    if (!chargerId) {
        throw new MissingParameterError(`Charger ID is required to fetch charger details`);
    }
    if (!uuidValidate(chargerId)) {
        throw new InvalidUUIDError(`Charger ID is invalid`);
    }
    const charger = await Chargers.findOneBy({id: chargerId});
    if (!charger) {
        throw new ResourceNotFoundError(`Charger with ID ${chargerId} not found`);
    }
    return charger;
}

async function updateCharger(chargerId: string, data: any) {
    if (!chargerId) {
        throw new MissingParameterError(`Charger ID is required to update charger details`);
    }
    if (!uuidValidate(chargerId)) {
        throw new InvalidUUIDError(`Charger ID is invalid`);
    }
    const charger = await Chargers.findOneBy({id: chargerId});
    if (!charger) {
        throw new ResourceNotFoundError(`Charger with ID ${chargerId} not found`);
    }
    charger.model = data.model ?? charger.model;
    charger.city = data.city ?? charger.city;
    charger.noOfConnector = data.noOfConnector ?? charger.noOfConnector;
    charger.vendor = data.vendor ?? charger.vendor;
    charger.serialNumber = data.serialNumber ?? charger.serialNumber;
    await charger.save();
    return charger;
}

async function getChargerByCity(city: string) {
    if (!city) {
        throw new MissingParameterError(`City is required to fetch charger details`);
    }
    const chargers = await Chargers.find({
        where: {city: city},
        relations: ["connectors", "address", "tariff"]
    });
    if (chargers.length === 0) {
        throw new NoContentError(`No chargers found in city ${city}`);
    }
    return chargers.map(charger => ({
        id: charger.id,
        model: charger.model,
        vendor: charger.vendor,
        city: charger.city,
        maxPower: charger.maxPower,
        alias: charger.alias,
        tariff: charger.tariff,
        address: charger.address,
        noOfConnector: charger.noOfConnector,
        status: charger.status,
        longitude: charger.longitude,
        latitude: charger.latitude,
        connectors: charger.connectors.map(connector => ({
            id: connector.id,
            connectorType: connector.type,
            connectorId: connector.chargerConnectorId,
            status: connector.status,
        }))
    }));
}

async function getCities() {
    const cities = await Chargers.createQueryBuilder("charger")
        .select("DISTINCT charger.city", "city")
        .getRawMany();
    if (cities.length === 0) {
        throw new NoContentError(`No cities found with chargers`);
    }
    return cities.map(city => city.city);
}

async function getChargersNearLocation(longitude: number, latitude: number, radiusInKm: number) {
    const geoResults = await redisClient.geosearch(
        "chargers:locations",
        "FROMLONLAT",
        longitude,
        latitude,
        "BYRADIUS",
        radiusInKm,
        "KM",
        "WITHDIST",
        "ASC",
        "COUNT",
        50
    );

    // geoResults items are expected to be [id, dist] but may come as strings depending on client
    const idDistancePairs: Array<[string, number]> = (geoResults as any[]).map((item: any) => {
        const id = Array.isArray(item) ? String(item[0]) : String(item);
        const dist = Array.isArray(item) ? parseFloat(String(item[1])) : 0;
        return [id, isNaN(dist) ? 0 : dist];
    });

    const ids = idDistancePairs.map(([id]) => id);
    if (ids.length === 0) {
        throw new NoContentError(`No chargers found within ${radiusInKm} km of the specified location`);
    }

    const chargers = await Chargers.find({
        where: { id: In(ids as string[]) },
        relations: ['connectors', 'tariff']
    });

    // Map chargers by id for ordering and attach distance, then filter missing records
    const chargerMap = new Map(chargers.map(c => [c.id, c]));
    return idDistancePairs
        .map(([id, dist]) => {
            const charger = chargerMap.get(id);
            if (!charger) return null;
            return {
                id: charger.id,
                model: charger.model,
                vendor: charger.vendor,
                city: charger.city,
                maxPower: charger.maxPower,
                alias: charger.alias,
                tariff: charger.tariff,
                noOfConnector: charger.noOfConnector,
                status: charger.status,
                longitude: charger.longitude,
                latitude: charger.latitude,
                dist, // distance in KM from redis geosearch
                connectors: (charger.connectors || [])
                    .filter(Boolean)
                    .map(connector => ({
                        id: connector.id,
                        connectorType: connector.type,
                        connectorId: connector.chargerConnectorId,
                        status: connector.status,
                    }))
            };
        })
        .filter((c): c is NonNullable<typeof c> => c !== null);
}


export {
    addCharger,
    updateChargerTariff,
    updateChargerAddress,
    updateChargerData,
    updateConnectorType,
    updateChargerStatus,
    listAllCharger,
    getCharger,
    updateCharger,
    getChargerByCity,
    getCities,
    getChargersNearLocation,
};