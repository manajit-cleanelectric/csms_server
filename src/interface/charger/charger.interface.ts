import { IAddress } from '../address';
import { ITariff } from '../tariff';
import {IConnector} from "../connector";

export interface ICharger {
  id: string;
  model: string;
  vendor: string;
  serialNumber: string;
  maxPower: number;
  alias?: string;
  city: string;
  address: IAddress;
  noOfConnector: number;
  latitude: string;
  longitude: string;
  status: 'Available' | 'Occupied' | 'Faulted' | 'Unavailable';
  tariff: ITariff;
  pricePerKWh: string;
  lastHeartBeat?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IChargerCompact {
    id: string;
    model: string;
    vendor: string;
    serialNumber: string;
    city: string;
    alias?: string;
    maxPower: number;
    noOfConnector: number;
    tariff: ITariff;
    pricePerKWh: string;
    connectors: IConnector[];
}

export interface IMapCharger {
    id: string;
    latitude: string;
    longitude: string;
    status: 'Available' | 'Occupied' | 'Faulted' | 'Unavailable';
}