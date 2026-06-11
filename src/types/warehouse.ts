export type WarehouseType = "面辅料仓" | "加工仓" | "成衣仓" | "样衣仓" | "中转仓" | "退货仓";
export type WarehouseAttribute = "自建" | "第三方" | "合作仓";
export type Country = "中国" | "印度尼西亚";
export type SyncStatus = "已同步" | "同步异常";

export interface Warehouse {
  id: string;
  warehouseCode: string;
  warehouseName: string;
  warehouseType: WarehouseType;
  warehouseAttribute: WarehouseAttribute;
  ownerEntity: string;
  country: Country;
  timezone: string;
  city: string;
  manager: string;
  contactPhone?: string;
  email?: string;
  receivingAddress: string;
  postalCode?: string;
  enabled: boolean;
  sourceSystem: "WMS";
  sourceWarehouseCode: string;
  syncStatus: SyncStatus;
  lastSyncTime: string;
  syncRemark?: string;
  availableForPurchaseRequest: boolean;
  availableForPurchaseOrder: boolean;
  availableForShipment: boolean;
  relatedPurchaseOrderCount?: number;
  recentUsedTime?: string;
  remark?: string;
}
