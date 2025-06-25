import {Chargers} from "../models/charger";

async function addCharger(data: any) {
    try {
        const charger = new Chargers();
        charger.type = data.type;
        charger.model = data.model;
        charger.type = data.type;
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


export {addCharger, listAllCharger, getCharger};
