import type { MaterialLogisticsRecord } from "../pages/material-purchase/MaterialPurchaseTracking";

export type TransferBatchRecord = MaterialLogisticsRecord & {
  headLogisticsQty?: number;
  headLogisticsRolls?: number;
  originalBoxHead?: boolean;
};

export type TransferBatchStatus =
  | "待起运"
  | "已装柜"
  | "头程中"
  | "已到仓"
  | "已完成"
  | "待交货"
  | "已交货"
  | "已发货"
  | "已入库"
  | string;

export type TransferBatch = {
  batchNo: string;
  batchName: string;
  transferCenter: string;
  destinationWarehouse: string;
  carrier: string;
  carrierName?: string;
  carrierId?: string;
  carrierCode?: string;
  channelId?: string;
  channelCode?: string;
  channelName?: string;
  transportMethod?: string;
  estimatedTransitDays?: number;
  billingMethod?: string;
  taxMethod?: string;
  feeCurrency?: "RMB" | "USD" | "IDR";
  destinationCountry?: string;
  creator: string;
  createdAt: string;
  plannedShipDate: string;
  containerLoadedAt?: string;
  actualShipDate?: string;
  actualWarehouseSignedAt?: string;
  arrivedAt?: string;
  status: TransferBatchStatus;
  remark: string;
  records: TransferBatchRecord[];
  sourceRegion?: string;
  warehouse?: string;
  shippingType?: string;
  area?: string;
  regionRoute?: string;
  logisticsProvider?: string;
  expectedBandungArrivalAt?: string;
  transitDays?: number;
  boxCount?: number;
  bulkQty?: number;
  totalVolumeM3?: number;
  totalWeightKg?: number;
  goodsValueRmb?: number;
  goodsValueUsd?: number;
  freightRmb?: number;
  freightUsd?: number;
  incomeTaxIdr?: number;
  vatIdr?: number;
  customsDutyIdr?: number;
  fineIdr?: number;
  clearanceFeeIdr?: number;
};
