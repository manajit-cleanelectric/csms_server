import { IChargerCompact } from '../charger';
import { IConnector } from '../connector';
import { IUserCompact } from '../user';

export interface ISession {
  id: number;
  charger: IChargerCompact;
  connector: IConnector;
  vehicleNo?: string;
  vehicleVendor?: string;
  vehicleModel?: string;
  user: IUserCompact;
  startTime: Date;
  endTime?: Date;
  meterStart?: number;
  meterStop?: number;
  energyUsed?: number;
  location?: string;
  socStart?: number;
  socLast?: number;
  reason?: string;
  status: 'Preparing' | 'Charging' | 'SuspendedEVSE' | 'SuspendedEV' | 'Finishing';
  baseAmount?: string;
  netCGST?: string;
  netSGST?: string;
  netIGST?: string;
  totalAmount?: string;
  transaction?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISessionCompact {
    id: number;
    charger: IChargerCompact;
    location?: string;
    startTime: Date;
    endTime?: Date;
    energyUsed?: number;
    status: string;
    totalAmount?: string;
}