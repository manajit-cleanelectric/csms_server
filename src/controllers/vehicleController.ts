import {Users} from "../models/users";
import {Vehicles} from "../models/vehicle";

async function addVehicle(userId: any, data: any) {
    try {
        const user = await Users.findOneBy({id: userId});
        if (!user) {
            throw new Error("User not found");
        }
        const vehicle = new Vehicles();
        vehicle.vehicleNo = data.vehicleNo;
        vehicle.rcNumber = data.rcNumber;
        vehicle.vin = data.vin;
        vehicle.vendor = data.vendor;
        vehicle.user = user;
        await vehicle.save();
        return vehicle;
    } catch (error) {
        throw new Error("Failed to add user");
    }
}

export {
    addVehicle,
}