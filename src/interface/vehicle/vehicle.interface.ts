import {IUserCompact} from '../user';

export interface IVehicle {
  id: string;
  user?: IUserCompact;
  model?: string;
  vendor?: string;
  vin: string;
  bin?: string;
  vehicleNo?: string;
  rcNumber?: string;
  isApproved: boolean;
  rcImageUrl?: string;
}

export interface IVehicleCompact {
    id: string;
    model?: string;
    vendor?: string;
    vin: string;
}