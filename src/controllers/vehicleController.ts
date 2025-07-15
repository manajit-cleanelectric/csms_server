import {Users} from "../models/users";
import {Vehicles} from "../models/vehicle";
import {
    MissingParameterError,
    NoContentError,
    ResourceAlreadyExistsError,
    ResourceNotFoundError
} from "../errors/customErrors";

async function addVehicle(userId: string, data: any) {
    if (!userId) {
        throw new MissingParameterError(`User ID is required`);
    }
    const detailedUser = await Users.findOne({
        where: {id: userId},
        relations: ['vehicles'],
    });
    if (!detailedUser) {
        throw new ResourceNotFoundError(`User with ID ${userId} not found`);
    }
    if (detailedUser.vehicles.length > 0) {
        throw new ResourceAlreadyExistsError(`User with ID ${userId} already has a vehicle registered`);
    }
    if (!data.vehicleNo || !data.rcNumber || !data.rcImageUrl || !data.vin) {
        throw new MissingParameterError(`All vehicle details are required`);
    }
    const vehicle = new Vehicles();
    vehicle.vehicleNo = data.vehicleNo;
    vehicle.rcNumber = data.rcNumber;
    vehicle.rcImageUrl = data.rcImageUrl;
    vehicle.vin = data.vin;
    vehicle.vendor = data.vendor;
    vehicle.model = data.model || null;
    detailedUser.isProfileComplete = true;
    await detailedUser.save();
    vehicle.user = detailedUser;
    await vehicle.save();
    return vehicle;
}

async function updateVehicle(vehicleId: string, data: any) {
    if (!vehicleId) {
        throw new MissingParameterError(`Vehicle ID is required`);
    }
    const vehicle = await Vehicles.findOneBy({id: vehicleId});
    if (!vehicle) {
        throw new ResourceNotFoundError(`Vehicle with ID ${vehicleId} not found`);
    }
    if (vehicle.isApproved){
        throw new ResourceAlreadyExistsError(`Vehicle with ID ${vehicleId} already has approved`);
    }
    vehicle.vehicleNo = data.vehicleNo || vehicle.vehicleNo;
    vehicle.rcNumber = data.rcNumber || vehicle.rcNumber;
    vehicle.rcImageUrl = data.rcImageUrl || vehicle.rcImageUrl;
    vehicle.vin = data.vin || vehicle.vin;
    vehicle.vendor = data.vendor || vehicle.vendor;
    await vehicle.save();
    return vehicle;
}

async function getVehicleById(vehicleId: string) {
    if (!vehicleId) {
        throw new MissingParameterError(`Vehicle ID is required`);
    }
    const vehicle = await Vehicles.findOne({
        where: {id: vehicleId},
        relations: ["user"]
    });
    if (!vehicle) {
        throw new ResourceNotFoundError(`Vehicle with ID ${vehicleId} not found`);
    }
    return vehicle;
}

async function getVehiclesByUserId(userId: string) {
    if (!userId) {
        throw new MissingParameterError(`User ID is required`);
    }
    const vehicles = await Vehicles.find({
        where: {user: {id: userId}},
        relations: ["user"]
    });
    if (vehicles.length === 0) {
        throw new NoContentError(`No vehicles found for user with ID ${userId}`);
    }
    return vehicles;
}

async function approveVehicle(vehicleId: string) {
    if (!vehicleId) {
        throw new MissingParameterError(`Vehicle ID is required`);
    }
    const vehicle = await Vehicles.findOne({
        where: {id: vehicleId},
        relations: ["user"]
    });
    if (!vehicle) {
        throw new ResourceNotFoundError(`Vehicle with ID ${vehicleId} not found`);
    }
    vehicle.isApproved = true;
    if (vehicle.user){
        vehicle.user.isAccountApproved = true;
        await vehicle.user.save();
    } else {
        throw new Error("Vehicle has no associated user");
    }
    await vehicle.save();
    return vehicle;
}

async function listUnapprovedVehicles() {
    const vehicles = await Vehicles.find({
        where: {isApproved: false},
        relations: ["user"]
    });
    if (vehicles.length === 0) {
        throw new NoContentError(`No unapproved vehicles found`);
    }
    return vehicles;
}

async function removeVehicle(vehicleId: string) {
    if (!vehicleId) {
        throw new MissingParameterError(`Vehicle ID is required`);
    }
    const vehicle = await Vehicles.findOneBy({id: vehicleId});
    if (!vehicle) {
        throw new ResourceNotFoundError(`Vehicle with ID ${vehicleId} not found`);
    }
    await vehicle.remove();
    return true;
}

export {
    addVehicle,
    updateVehicle,
    getVehicleById,
    getVehiclesByUserId,
    approveVehicle,
    listUnapprovedVehicles,
    removeVehicle,
}