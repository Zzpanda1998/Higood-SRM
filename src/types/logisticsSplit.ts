export type DomesticLogisticsInfo = {
  channel: string;
  company: string;
  trackingNo: string;
  shippedAt: string;
  signedAt: string;
  inboundAt: string;
  status: string;
  packageCount: number;
  weightKg: number;
  volume: number;
  remark?: string;
};

export type FirstLegLogisticsInfo = {
  carrierName: string;
  channel: string;
  logisticsNo: string;
  batchNo: string;
  transportMethod: string;
  shippedAt: string;
  estimatedArrivedAt: string;
  actualArrivedAt: string;
  inboundAt: string;
  status: string;
  transitDays: string;
  boxCount: number;
  weightKg: number;
  volume: number;
  remark?: string;
};
