import {Chargers} from "../models/charger";
import {AppDataSource as dataSource} from "../database/datasource";
import {Connectors} from "../models/connector";
import {InvalidUUIDError, MissingParameterError, NoContentError, ResourceNotFoundError} from "../errors/customErrors";
import {validate as uuidValidate} from "uuid";

async function addCharger(data: any) {
    const queryRunner = dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
        const charger = queryRunner.manager.create(Chargers, {
            type: data.type,
            model: data.model,
            address: data.address,
            city: data.city,
            noOfConnector: data.noOfConnector,
            vendor: data.vendor,
            serialNumber: data.serialNumber
        });
        await queryRunner.manager.save(charger);
        for (let count = 0; count < data.noOfConnector; count++) {
            let connector = queryRunner.manager.create(Connectors, {
                charger: charger,
                chargerConnectorId: count + 1,
            });
            await queryRunner.manager.save(connector);
        }
        await queryRunner.commitTransaction();
        return charger;
    } catch (error: any) {
        await queryRunner.rollbackTransaction();
        throw new Error(error.message);
    } finally {
        await queryRunner.release();
    }
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
    charger.type = data.type || charger.type;
    charger.model = data.model || charger.model;
    charger.address = data.address || charger.address;
    charger.city = data.city || charger.city;
    charger.noOfConnector = data.noOfConnector || charger.noOfConnector;
    charger.vendor = data.vendor || charger.vendor;
    charger.serialNumber = data.serialNumber || charger.serialNumber;
    await charger.save();
    return charger;
}

async function getChargerByCity(city: string) {
    if (!city) {
        throw new MissingParameterError(`City is required to fetch charger details`);
    }
    const chargers = await Chargers.find({
        where: {city: city},
        relations: ["connectors", "address"]
    });
    if (chargers.length === 0) {
        throw new NoContentError(`No chargers found in city ${city}`);
    }
    return chargers.map(charger => ({
        id: charger.id,
        model: charger.model,
        vendor: charger.vendor,
        city: charger.city,
        address: charger.address,
        type: charger.type,
        noOfConnector: charger.noOfConnector,
        status: charger.status,
        longitude: charger.longitude,
        latitude: charger.latitude,
        connectors: charger.connectors.map(connector => ({
            id: connector.id,
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


export {
    addCharger,
    listAllCharger,
    getCharger,
    updateCharger,
    getChargerByCity,
    getCities,
};