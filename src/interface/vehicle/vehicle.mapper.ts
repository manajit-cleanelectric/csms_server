import {IVehicle, IVehicleCompact} from "./vehicle.interface";
import {Vehicles} from "../../models/vehicle.model";
import {userToIUserCompact} from "../user";

export function vehicleToIVehicleCompact(vehicle: Vehicles): IVehicleCompact {
    return {
        id: vehicle.id,
        model: vehicle.model,
        vendor: vehicle.vendor,
        vin: vehicle.vin,
    };
}

export function vehicleToIVehicle(vehicle: Vehicles): IVehicle {
    return {
        id: vehicle.id,
        user: userToIUserCompact(vehicle.user!),
        model: vehicle.model,
        vendor: vehicle.vendor,
        vin: vehicle.vin,
        bin: vehicle.bin,
        vehicleNo: vehicle.vehicleNo,
        rcNumber: vehicle.rcNumber,
        isApproved: vehicle.isApproved,
        rcImageUrl: vehicle.rcImageUrl,
        createdAt: vehicle.createdAt,
        updatedAt: vehicle.updatedAt,
    };
}