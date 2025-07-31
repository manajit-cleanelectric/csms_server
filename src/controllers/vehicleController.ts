import {Users} from "../models/users";
import {Vehicles} from "../models/vehicle";
import {
    InvalidUUIDError,
    MissingParameterError,
    NoContentError,
    ResourceAlreadyExistsError,
    ResourceNotFoundError
} from "../errors/customErrors";
import {validate} from "uuid";
import * as fs from "node:fs";
import path from "path";
import {logger, STATIC_FOLDER_PATH} from "../app";

function deleteImageFromDisk(imagePath: string): void {
    if (!imagePath) return;
    imagePath = path.join(STATIC_FOLDER_PATH, imagePath);
    fs.unlink(imagePath, (err) => {
        if (err) {
            logger.error(`Failed to delete image from disk: ${err.message}`);
        } else {
            logger.info(`Image deleted successfully from disk: ${imagePath}`);
        }
    });
}

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
    const existingVehicle = await Vehicles.findOne({
        where: [
            {rcNumber: data.rcNumber},
            {vin: data.vin},
        ]
    })
    if (existingVehicle) {
        throw new ResourceAlreadyExistsError(`Vehicle with RC Number ${data.rcNumber} or VIN ${data.vin} already exists in database`);
    }
    const vehicle = new Vehicles();
    vehicle.vehicleNo = data.vehicleNo;
    vehicle.rcNumber = data.rcNumber;
    vehicle.rcImageUrl = data.rcImageUrl;
    vehicle.vin = data.vin;
    vehicle.vendor = data.vendor;
    vehicle.model = data.model ?? null;
    user.isVehicleRegistered = true;
    user.isAccountApproved = false;
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
    const vehicle = await Vehicles.findOneBy({id: vehicleId});
    if (!vehicle) {
        throw new ResourceNotFoundError(`Vehicle with ID ${vehicleId} not found`);
    }
    vehicle.model = data.model ?? vehicle.model;
    vehicle.vendor = data.vendor ?? vehicle.vendor;
    await vehicle.save();
    return vehicle;
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
        throw new MissingParameterError(`Vehicle ID is required for deletion`);
    }
    if (!validate(vehicleId)) {
        throw new InvalidUUIDError(`Invalid Vehicle ID format for deletion`);
    }
    const vehicle = await Vehicles.findOneBy({id: vehicleId});
    if (!vehicle) {
        throw new ResourceNotFoundError(`Vehicle with ID ${vehicleId} not found for deletion`);
    }
    if (vehicle.rcImageUrl) {
        deleteImageFromDisk(vehicle.rcImageUrl);
    }
    await vehicle.remove();
    logger.info(`Vehicle with ID ${vehicleId} removed successfully`);
    return true;
}

export {
    deleteImageFromDisk,
    addVehicle,
    updateVehicle,
    getVehicleById,
    getVehiclesByUserId,
    approveVehicle,
    listUnapprovedVehicles,
    removeVehicle,
}