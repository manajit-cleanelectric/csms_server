import {IChargerCompact, IChargerHighCompact} from '../charger';
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
  energyUsed: number;
  location?: string;
  socStart?: number;
  socLast?: number;
  reason?: string;
  status: 'Preparing' | 'Charging' | 'SuspendedEVSE' | 'SuspendedEV' | 'Finishing' | 'Finished';
  baseAmount?: string;
  netCGST?: string;
  netSGST?: string;
  netIGST?: string;
  totalAmount?: string;
  transactionId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISessionCompact {
    id: number;
    location?: string;
    endTime?: Date;
    energyUsed: number;
    status: string;
    totalAmount?: string;
}

export interface IOngoingSession {
    id: number;
    charger: IChargerHighCompact;
    connector: IConnector;
    vehicleNo?: string;
    vehicleVendor?: string;
    vehicleModel?: string;
    startTime: Date;
    meterStart?: number;
    energyUsed: number;
    location?: string;
    socLast?: number;
    status: 'Preparing' | 'Charging' | 'SuspendedEVSE' | 'SuspendedEV' | 'Finishing';
    totalCostSoFar?: string;
}