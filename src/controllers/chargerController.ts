import {Chargers} from "../models/charger";

async function addCharger(data: any) {
    try {
        const charger = new Chargers();
        charger.type = data.type;
        charger.model = data.model;
        charger.address = data.address;
        charger.city = data.city;
        charger.noOfConnector = data.noOfConnector;
        charger.vendor = data.vendor;
        charger.serialNumber = data.serialNumber;
        await charger.save();
        return charger;
    } catch (error: any) {
        throw new Error(error.message);
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
        return await Chargers.findOneBy({ id: chargerId as unknown as typeof Chargers.prototype.id });
    } catch (error: any) {
        throw new Error(error.message);
    }
}

async  function updateCharger(charger: Chargers, data: any) {
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
            where: { city: city}
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
