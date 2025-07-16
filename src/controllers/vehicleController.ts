import {Users} from "../models/users";
import {Vehicles} from "../models/vehicle";
import {InvalidUUIDError, MissingParameterError, NoContentError, ResourceNotFoundError} from "../errors/customErrors";
import {validate} from "uuid";

async function addVehicle(userId: string, data: any) {
    if (!userId) {
        throw new MissingParameterError(`User ID is required`);
    }
    if (!validate(userId)) {
        throw new InvalidUUIDError(`Invalid User ID format`);
    }
    const user = await Users.findOneBy({id: userId});
    if (!user) {
        throw new ResourceNotFoundError(`User with ID ${userId} not found`);
    }
    if (!data.vehicleNo || !data.rcNumber || !data.rcImageUrl || !data.vin || !data.vendor || !data.model) {
        throw new MissingParameterError(`All vehicle details are required`);
    }
    const vehicle = new Vehicles();
    vehicle.vehicleNo = data.vehicleNo;
    vehicle.rcNumber = data.rcNumber;
    vehicle.rcImageUrl = data.rcImageUrl;
    vehicle.vin = data.vin;
    vehicle.vendor = data.vendor;
    vehicle.model = data.model || null;
    user.isVehicleRegistered = true;
    await user.save();
    vehicle.user = user;
    await vehicle.save();
    return vehicle;
}

async function updateVehicle(vehicleId: string, data: any) {
    if (!vehicleId) {
        throw new MissingParameterError(`Vehicle ID is required`);
    }
    if (!validate(vehicleId)) {
        throw new InvalidUUIDError(`Invalid Vehicle ID format`);
    }
    const vehicle = await Vehicles.findOne({
        where: {id: vehicleId},
        relations: ["user"]
    });
    if (!vehicle) {
        throw new ResourceNotFoundError(`Vehicle with ID ${vehicleId} not found`);
    }
    const user = vehicle.user;
    if (!user) {
        throw new ResourceNotFoundError(`User associated with vehicle ID ${vehicleId} not found`);
    }
    if (data.rcNumber || data.vin || data.rcImageUrl){
        await vehicle.remove();
        if (!data.vehicleNo || !data.rcNumber || !data.rcImageUrl || !data.vin || !data.vendor || !data.model) {
            throw new MissingParameterError(`All vehicle details are required`);
        }
        const newVehicle = new Vehicles();
        newVehicle.vehicleNo = data.vehicleNo;
        newVehicle.rcNumber = data.rcNumber;
        newVehicle.rcImageUrl = data.rcImageUrl;
        newVehicle.vin = data.vin;
        newVehicle.vendor = data.vendor;
        newVehicle.model = data.model;
        user.isAccountApproved = false;
        await user.save();
        newVehicle.user = user;
        await newVehicle.save();
        return newVehicle;
    } else {
        vehicle.vehicleNo = data.vehicleNo || vehicle.vehicleNo;
        vehicle.rcImageUrl = data.rcImageUrl || vehicle.rcImageUrl;
        vehicle.model = data.model || vehicle.model;
        vehicle.vendor = data.vendor || vehicle.vendor;
        vehicle.vin = data.vin || vehicle.vin;
        vehicle.rcNumber = data.rcNumber || vehicle.rcNumber;
        await vehicle.save();
        return vehicle;
    }
}

async function getVehicleById(vehicleId: string) {
    if (!vehicleId) {
        throw new MissingParameterError(`Vehicle ID is required`);
    }
    if (!validate(vehicleId)) {
        throw new InvalidUUIDError(`Invalid Vehicle ID format`);
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
    if (!validate(userId)) {
        throw new InvalidUUIDError(`Invalid User ID format`);
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
    if (!validate(vehicleId)) {
        throw new InvalidUUIDError(`Invalid Vehicle ID format`);
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
    if (!validate(vehicleId)) {
        throw new InvalidUUIDError(`Invalid Vehicle ID format`);
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