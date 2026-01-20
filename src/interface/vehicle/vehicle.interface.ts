import {IUserCompact} from '../user';
import {IImage} from "../image";

export interface IVehicle {
  id: string;
  user?: IUserCompact;
  model?: string;
  vendor?: string;
  vin: string;
  bin: string;
  vehicleNo?: string;
  isApproved: boolean;
  images: IImage[];
}

export interface IVehicleCompact {
    id: string;
    model?: string;
    vendor?: string;
    bin: string;
    vin: string;
    vehicleNo?: string;
}