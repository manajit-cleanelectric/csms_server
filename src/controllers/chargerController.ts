import {Chargers} from "../models/charger";
import {AppDataSource as dataSource} from "../database/datasource";
import {Connectors} from "../models/connector";

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
    try {
        return await Chargers.find();
    } catch (error: any) {
        throw new Error(error.message);
    }
}

async function getCharger(chargerId: string) {
    try {
        return await Chargers.findOneBy({id: chargerId});
    } catch (error: any) {
        throw new Error(error.message);
    }
}

async function updateCharger(charger: Chargers, data: any) {
    try {
        charger.type = data.type || charger.type;
        charger.model = data.model || charger.model;
        charger.address = data.address || charger.address;
        charger.city = data.city || charger.city;
        charger.noOfConnector = data.noOfConnector || charger.noOfConnector;
        charger.vendor = data.vendor || charger.vendor;
        charger.serialNumber = data.serialNumber || charger.serialNumber;
        await charger.save();
        return charger;
    } catch (error: any) {
        throw new Error(error.message);
    }
}

async function getChargerByCity(city: string) {
    try {
        return await Chargers.find({
            select: ["id", "model", "vendor", "city", "address", "type", "noOfConnector", "status", "longitude", "latitude"],
            where: {city: city}
        });
    } catch (error: any) {
        throw new Error(error.message);
    }
}


export {
    addCharger,
    listAllCharger,
    getCharger,
    updateCharger,
    getChargerByCity,
};