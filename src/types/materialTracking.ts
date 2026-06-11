export type MaterialTrackingStatus =
  | "待确认"
  | "已确认"
  | "备货中"
  | "已发货"
  | "在途"
  | "已到仓"
  | "已收货"
  | "已入库"
  | "异常";

export interface MaterialTrackingOrder {
  id: string;
  trackingNo: string;
  purchaseOrderNo: string;
  sourceType: string;
  sourceNo: string;
  supplier: string;
  materialCategory: string;
  materialName: string;
  targetWarehouse: string;
  purchaseQty: number;
  shippedQty: number;
  receivedQty: number;
  inboundQty: number;
  status: MaterialTrackingStatus;
  dueDate: string;
  owner: string;
}
