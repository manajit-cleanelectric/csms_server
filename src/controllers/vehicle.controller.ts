import {Users} from "../models/user.model";
import {Vehicles, VehicleStatus} from "../models/vehicle.model";
import {
    InvalidUUIDError,
    MissingParameterError,
    NoContentError,
    ResourceAlreadyExistsError,
    ResourceNotFoundError
} from "../errors/customErrors";
import {validate} from "uuid";
import {logger} from "../services/logger.service";
import {AppDataSource} from "../database/datasource";
import {UserProducer} from "../kafka/producers/user.producer";
import {trimBIN, toTitleCase} from "../utils/titleCase";
import {Image} from "../models/image.model";
import {vehicleToIVehicle} from "../interface";

async function addVehicle(userId: string, data: any) {
    if (!userId) {
        throw new MissingParameterError(`User ID is required`);
    }
    if (!validate(userId)) {
        throw new InvalidUUIDError(`Invalid User ID format`);
    }
    const user = await Users.findOne({where: [{id: userId}], relations: ["vehicles"]});
    if (!user) {
        throw new ResourceNotFoundError(`User with ID ${userId} not found`);
    }
    if (!data.bin || !data.rcImageUrl || !data.vin || !data.vendor || !data.model) {
        throw new MissingParameterError(`All vehicle details are required`);
    }
    data.bin = trimBIN(data.bin);
    data.vin = data.vin.toUpperCase().trim();
    const existingVehicle = await AppDataSource.getRepository(Vehicles)
        .createQueryBuilder('vehicle')
        .where('vehicle.bin = :bin', {bin: data.bin})
        .orWhere('vehicle.vin = :vin', {vin: data.vin})
        .getMany();

    if (existingVehicle.length > 0) {
        throw new ResourceAlreadyExistsError(`Vehicle with BIN ${data.bin} or VIN ${data.vin} already exists in database`);
    }
    const image = new Image();
    image.title = 'Invoice Proof';
    image.url = data.rcImageUrl;
    const vehicle = new Vehicles();
    vehicle.vehicleNo = data.vehicleNo ?? vehicle.vehicleNo;
    vehicle.proofImages = [image];
    vehicle.vin = data.vin;
    vehicle.bin = data.bin;
    vehicle.vendor = data.vendor;
    vehicle.model = data.model ?? null;
    user.isVehicleRegistered = true;
    // user.isAccountApproved = false;
    await user.save();
    vehicle.user = user;
    await vehicle.save();

    const userProducer = UserProducer.getInstance();
    try {
        await userProducer.sendVehicleRegistrationMessage(
            user.fullName,
            user.phoneNumber,
            user.email ?? undefined,
            `${vehicle.vendor} ${vehicle.model}`,
            vehicle.vehicleNo,
            new Date().toISOString()
        );
        logger.info(`Vehicle registration message sent to Kafka for vehicle ID ${vehicle.id}`);
    } catch (error) {
        logger.error(`Failed to send vehicle registration message to Kafka: ${error}`);
    }

    return vehicle;
}

async function addVehicleV2(userId: string, data: any) {
    if (!userId) {
        throw new MissingParameterError(`User ID is required`);
    }
    if (!validate(userId)) {
        throw new InvalidUUIDError(`Invalid User ID format`);
    }
    const user = await Users.findOne({where: [{id: userId}], relations: ["vehicles"]});
    if (!user) {
        throw new ResourceNotFoundError(`User with ID ${userId} not found`);
    }
    if (!(data.invoiceProofUrls.length>0) || !data.vin || !data.vendor || !data.model || !data.bin ) {
        throw new MissingParameterError(`All vehicle details are required`);
    }
    data.vin = data.vin.toUpperCase();
    data.bin = data.bin.toUpperCase();
    const existingVehicles = await Vehicles.findOne({
        where: [
            {vin: data.vin},
            {bin: data.bin}
        ]
    });
    if (existingVehicles) {
        throw new ResourceAlreadyExistsError(`Vehicle with VIN ${data.vin} or BIN ${data.bin} already exists in database`);
    }

    const images: Image[] = [];
    for (const url of data.invoiceProofUrls) {
        const image = new Image();
        image.title = 'Invoice Proof';
        image.url = url;
        images.push(image);
    }
    for (const url of data.rcImageUrls) {
        const image = new Image();
        image.title = 'RC Image';
        image.url = url;
        images.push(image);
    }

    const vehicle = new Vehicles();
    vehicle.vin = data.vin;
    vehicle.vendor = toTitleCase(data.vendor);
    vehicle.model = toTitleCase(data.model);
    vehicle.bin = data.bin;
    vehicle.vehicleNo = toTitleCase(data.vehicleNo) ?? null;
    vehicle.proofImages = images;
    vehicle.user = user;
    await vehicle.save();

    return vehicleToIVehicle(vehicle);
}

async function replaceVehicle(vehicleId: string, data: any) {
    if (!vehicleId) {
        throw new MissingParameterError(`Vehicle ID is required`);
    }
    if (!validate(vehicleId)) {
        throw new InvalidUUIDError(`Invalid Vehicle ID format`);
    }
    const requiredFields = ['bin', 'rcImageUrl', 'vin'];
    const missingFields = requiredFields.filter(field => !data[field]);
    if (missingFields.length > 0) {
        throw new MissingParameterError(`Missing required fields: ${missingFields.join(', ')}`);
    }
    data.bin = trimBIN(data.bin);
    data.vin = data.vin.toUpperCase().trim();
    const existingVehicle = await Vehicles.find({
        where: [
            {bin: data.bin},
            {vin: data.vin}
        ],
    })

    if (existingVehicle.length > 1 || (existingVehicle.length === 1 && existingVehicle[0].id !== vehicleId)) {
        throw new ResourceAlreadyExistsError(`Vehicle with BIN ${data.bin} or VIN ${data.vin} already exists in database`);
    }
    const vehicle = await Vehicles.findOne({
        where: {id: vehicleId},
        relations: ["user", "proofImages"]
    })
    if (!vehicle) {
        throw new ResourceNotFoundError(`Vehicle with ID ${vehicleId} not found`);
    }
    const image = new Image();
    image.title = 'Invoice Proof';
    image.url = data.rcImageUrl;
    vehicle.vehicleNo = data.vehicleNo;
    vehicle.proofImages = [image];
    vehicle.vin = data.vin;
    vehicle.bin = data.bin;
    vehicle.vendor = data.vendor ?? vehicle.vendor;
    vehicle.model = data.model ?? vehicle.model;
    vehicle.status = VehicleStatus.PENDING;
    // if (vehicle.user) {
    //     vehicle.user.isAccountApproved = false;
    //     await vehicle.user.save();
    // }
    await vehicle.save();

    const userProducer = UserProducer.getInstance();
    try {
        await userProducer.sendVehicleRegistrationMessage(
            vehicle.user!.fullName,
            vehicle.user!.phoneNumber,
            vehicle.user!.email ?? undefined,
            `${vehicle.vendor} ${vehicle.model}`,
            vehicle.vehicleNo,
            new Date().toISOString()
        );
        logger.info(`Vehicle registration message sent to Kafka for vehicle ID ${vehicle.id}`);
    } catch (error) {
        logger.error(`Failed to send vehicle registration message to Kafka: ${error}`);
    }

    return vehicle;
}

async function replaceVehicleV2(vehicleId: string, data: any) {
    if (!vehicleId) {
        throw new MissingParameterError(`Vehicle ID is required`);
    }
    if (!validate(vehicleId)) {
        throw new InvalidUUIDError(`Invalid Vehicle ID format`);
    }
    const requiredFields = ['bin', 'rcImageUrl', 'vin', 'invoiceProofUrls'];
    const missingFields = requiredFields.filter(field => !data[field]);
    if (missingFields.length > 0) {
        throw new MissingParameterError(`Missing required fields: ${missingFields.join(', ')}`);
    }
    if (!Array.isArray(data.invoiceProofUrls) || data.invoiceProofUrls.length === 0) {
        throw new MissingParameterError(`At least one invoice proof URL is required`);
    }
    data.bin = trimBIN(data.bin);
    data.vin = data.vin.toUpperCase().trim();
    const existingVehicle = await Vehicles.find({
        where: [
            {bin: data.bin},
            {vin: data.vin}
        ],
    })

    if (existingVehicle.length > 1 || (existingVehicle.length === 1 && existingVehicle[0].id !== vehicleId)) {
        throw new ResourceAlreadyExistsError(`Vehicle with RC Number ${data.rcNumber} or VIN ${data.vin} already exists in database`);
    }
    const vehicle = await Vehicles.findOne({
        where: {id: vehicleId},
        relations: ["user", "proofImages"]
    })
    if (!vehicle) {
        throw new ResourceNotFoundError(`Vehicle with ID ${vehicleId} not found`);
    }

    const images: Image[] = [];
    for (const url of data.invoiceProofUrls) {
        const image = new Image();
        image.title = 'Invoice Proof';
        image.url = url;
        images.push(image);
    }
    for (const url of data.rcImageUrls) {
        const image = new Image();
        image.title = 'RC Image';
        image.url = url;
        images.push(image);
    }
    vehicle.vehicleNo = data.vehicleNo;
    vehicle.proofImages = images;
    vehicle.vin = data.vin;
    vehicle.bin = data.bin;
    vehicle.vendor = data.vendor ?? vehicle.vendor;
    vehicle.model = data.model ?? vehicle.model;
    vehicle.status = VehicleStatus.PENDING;
    // if (vehicle.user) {
    //     vehicle.user.isAccountApproved = false;
    //     await vehicle.user.save();
    // }
    await vehicle.save();

    const userProducer = UserProducer.getInstance();
    try {
        await userProducer.sendVehicleRegistrationMessage(
            vehicle.user!.fullName,
            vehicle.user!.phoneNumber,
            vehicle.user!.email ?? undefined,
            `${vehicle.vendor} ${vehicle.model}`,
            vehicle.vehicleNo,
            new Date().toISOString()
        );
        logger.info(`Vehicle registration message sent to Kafka for vehicle ID ${vehicle.id}`);
    } catch (error) {
        logger.error(`Failed to send vehicle registration message to Kafka: ${error}`);
    }

    return vehicleToIVehicle(vehicle);
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
        relations: ["user", "proofImages"]
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
        relations: ["user", "proofImages"]
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
        // relations: ["user"]
    });
    if (!vehicle) {
        throw new ResourceNotFoundError(`Vehicle with ID ${vehicleId} not found`);
    }
    vehicle.status = VehicleStatus.APPROVED;
    // if (vehicle.user) {
    //     vehicle.user.isAccountApproved = true;
    //     await vehicle.user.save();
    // } else {
    //     throw new Error("Vehicle has no associated user");
    // }
    await vehicle.save();
    return vehicle;
}

async function listUnapprovedVehicles() {
    const vehicles = await Vehicles.find({
        where: {status: VehicleStatus.PENDING},
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
    const vehicle = await Vehicles.findOne({
        where: {id: vehicleId},
        relations: ["user"]
    });
    if (!vehicle) {
        throw new ResourceNotFoundError(`Vehicle with ID ${vehicleId} not found for deletion`);
    }
    // if (vehicle.user) {
    //     vehicle.user.isVehicleRegistered = false;
    //     vehicle.user.isAccountApproved = false;
    //     await vehicle.user.save();
    // }
    await vehicle.remove();
    logger.info(`Vehicle with ID ${vehicleId} removed successfully`);
    return true;
}

async function updateBinOfVehicle(vin: string, bin: string) {
    const vehicle = await Vehicles.findOneBy({vin: vin});
    if (!vehicle) {
        throw new ResourceNotFoundError(`Vehicle with vin: ${vin} not found for update`);
    }
    vehicle.bin = bin;
    await vehicle.save();
}

export {
    addVehicle,
    addVehicleV2,
    replaceVehicle,
    replaceVehicleV2,
    updateVehicle,
    getVehicleById,
    getVehiclesByUserId,
    approveVehicle,
    listUnapprovedVehicles,
    removeVehicle,
    updateBinOfVehicle,
}