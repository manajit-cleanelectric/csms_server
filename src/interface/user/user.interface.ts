import {IVehicleCompact} from "../vehicle";

export interface IUser {
  id: string;
  phoneNumber: string;
  firstName?: string;
  lastName?: string;
  city?: string;
  state?: string;
  vehicles: IVehicleCompact[];
  email?: string;
  isEmailVerified: boolean;
  isAccountApproved: boolean;
  isProfileComplete: boolean;
  isVehicleRegistered: boolean;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserCompact {
    id: string;
    phoneNumber: string;
    firstName?: string;
    lastName?: string;
    role: string;
}