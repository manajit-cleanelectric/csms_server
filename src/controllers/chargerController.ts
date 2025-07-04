import {Chargers} from "../models/charger";

async function addCharger(data: any) {
    try {
        const charger = new Chargers();
        charger.type = data.type;
        charger.model = data.model;
        charger.address = data.address;
        charger.location = data.location;
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
        return await Chargers.findOneBy({ id: parseInt(chargerId,10) });
    } catch (error: any) {
        throw new Error(error.message);
    }
}

async  function updateCharger(chargerId: string, data: any) {
    try {
        const charger = await Chargers.findOneBy({ id: parseInt(chargerId,10) });
        if (!charger) {
            throw new Error("Charger not found");
        }
        charger.type = data.type || charger.type;
        charger.model = data.model || charger.model;
        charger.address = data.address || charger.address;
        charger.location = data.location || charger.location;
        charger.noOfConnector = data.noOfConnector || charger.noOfConnector;
        charger.vendor = data.vendor || charger.vendor;
        charger.serialNumber = data.serialNumber || charger.serialNumber;
        await charger.save();
        return charger;
    } catch (error: any) {
        throw new Error(error.message);
    }
}

async function getChargerByLocation(location: string) {
    try {
        return await Chargers.find({
            select: ["id", "model", "vendor", "location", "address", "type", "noOfConnector", "status", "longitude", "latitude"],
            where: { location: location}
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
    getChargerByLocation,
};
