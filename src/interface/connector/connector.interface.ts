export interface IConnector {
  id: string;
  chargerConnectorId: number;
  type: 'TYPE_2_AC' | 'CCS2_DC' | 'CHADEMO_DC' | 'TYPE_1_AC' | 'TYPE_6_DC' | 'TYPE_7_ACDC' | 'BHARAT_AC001' | 'BHARAT_DC001' | 'GBT_AC' | 'GBT_DC' | 'PANTOGRAPH_DOWN' | 'PANTOGRAPH_UP';
  status: string;
  createdAt: Date;
  updatedAt: Date;
}
