import {IUser, IUserCompact} from "./user.interface";
import {Users} from "../../models/user.model";
import {vehicleToIVehicleCompact} from "../vehicle";

export function userToIUserCompact(user: Users): IUserCompact {
    return {
        id: user.id,
        phoneNumber: user.phoneNumber,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
    };
}

export function userToIUser(user: Users): IUser {
    return {
        id: user.id,
        phoneNumber: user.phoneNumber,
        firstName: user.firstName,
        lastName: user.lastName,
        city: user.city,
        state: user.state,
        email: user.email,
        isEmailVerified: user.isEmailVerified,
        isAccountApproved: user.isAccountApproved,
        isProfileComplete: user.isProfileComplete,
        isVehicleRegistered: user.isVehicleRegistered,
        vehicles: user.vehicles.map(vehicle => vehicleToIVehicleCompact(vehicle)),
        isActive: user.isActive,
        isDeleted: user.isDeleted,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    };
}