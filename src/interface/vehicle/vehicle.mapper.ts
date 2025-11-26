import {IVehicle, IVehicleCompact} from "./vehicle.interface";
import {Vehicles} from "../../models/vehicle.model";
import {userToIUserCompact} from "../user";

export function vehicleToIVehicleCompact(vehicle: Vehicles): IVehicleCompact {
    return {
        id: vehicle.id,
        model: vehicle.model ?? undefined,
        vendor: vehicle.vendor ?? undefined,
        vin: vehicle.vin,
    };
}

export function vehicleToIVehicle(vehicle: Vehicles): IVehicle {
    return {
        id: vehicle.id,
        user: userToIUserCompact(vehicle.user!) ?? undefined,
        model: vehicle.model ?? undefined,
        vendor: vehicle.vendor ?? undefined,
        vin: vehicle.vin,
        bin: vehicle.bin ?? undefined,
        vehicleNo: vehicle.vehicleNo ?? undefined,
        rcNumber: vehicle.rcNumber ?? undefined,
        isApproved: vehicle.isApproved,
        rcImageUrl: vehicle.rcImageUrl ?? undefined,
    };
}