import {Users} from "../models/users";
import {Vehicles} from "../models/vehicle";
import {logger} from "../app";

async function addVehicle(userId: any, data: any) {
    try {
        const user = await Users.findOneBy({id: userId});
        if (!user) {
            throw new Error("User not found");
        }
        const detailedUser = await Users.findOne({
            where: {id: userId},
            relations: ['vehicles'],
        });
        if (detailedUser && detailedUser?.vehicles.length > 0) {
            throw new Error("User already has added a vehicle");
        }
        const vehicle = new Vehicles();
        vehicle.vehicleNo = data.vehicleNo;
        vehicle.rcNumber = data.rcNumber;
        vehicle.rcImageUrl = data.rcImageUrl;
        vehicle.vin = data.vin;
        vehicle.vendor = data.vendor;
        vehicle.user = user;
        await vehicle.save();
        return vehicle;
    } catch (error) {
        logger.error(`Error adding vehicle: ${error}`);
        throw new Error(`Failed to add vehicle: ${error}`);
    }
}

async function updateVehicle(vehicleId: number, data: any) {
    try {
        const vehicle = await Vehicles.findOneBy({id: vehicleId});
        if (!vehicle) {
            throw new Error("Vehicle not found");
        }
        if (vehicle.isApproved){
            throw new Error("Vehicle is already approved and cannot be updated");
        }
        vehicle.vehicleNo = data.vehicleNo || vehicle.vehicleNo;
        vehicle.rcNumber = data.rcNumber || vehicle.rcNumber;
        vehicle.rcImageUrl = data.rcImageUrl || vehicle.rcImageUrl;
        vehicle.vin = data.vin || vehicle.vin;
        vehicle.vendor = data.vendor || vehicle.vendor;
        await vehicle.save();
        return vehicle;
    } catch (error) {
        logger.error(`Error updating vehicle: ${error}`);
        throw new Error(`Failed to update vehicle: ${error}`);
    }
}

async function approveVehicle(vehicleId: number) {
    try {
        const vehicle = await Vehicles.findOne({
            where: {id: vehicleId},
            relations: ["user"]
        });
        if (!vehicle) {
            throw new Error("Vehicle not found");
        }
        vehicle.isApproved = true;
        if (vehicle.user){
            vehicle.user.isAccountApproved = true;
            await vehicle.user.save();
        } else {
            logger.warn(`Vehicle with ID ${vehicleId} has no associated user.`);
            throw new Error("Vehicle has no associated user");
        }
        await vehicle.save();
        return vehicle;
    } catch (error) {
        logger.error(`Error approving vehicle: ${error}`);
        throw new Error(`Failed to approve vehicle: ${error}`);
    }
}

async function listUnapprovedVehicles() {
    try {
        return await Vehicles.find({
            where: {isApproved: false},
            relations: ["user"]
        });
    } catch (error) {
        throw new Error(`Failed to list unapproved vehicles: ${error}`);
    }
}

async function removeVehicle(vehicleId: number) {
    try {
        const vehicle = await Vehicles.findOneBy({id: vehicleId});
        if (!vehicle) {
            throw new Error("Vehicle not found");
        }
        await vehicle.remove();
        return {message: "Vehicle removed successfully"};
    } catch (error) {
        logger.error(`Error removing vehicle: ${error}`);
        throw new Error(`Failed to remove vehicle: ${error}`);
    }
}

export {
    addVehicle,
    updateVehicle,
    approveVehicle,
    listUnapprovedVehicles,
    removeVehicle,
}