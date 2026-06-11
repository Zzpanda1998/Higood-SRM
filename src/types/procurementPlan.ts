export type ReplenishmentPlanStatus = "草稿" | "待确认" | "已确认" | "已转采购单" | "已关闭";

export interface ReplenishmentPlan {
  id: string;
  planNo: string;
  materialCategory: string;
  materialName: string;
  targetWarehouse: string;
  plannedQty: number;
  unit: string;
  demandDate: string;
  recommendedSupplier: string;
  status: ReplenishmentPlanStatus;
  creator: string;
  createdAt: string;
  remark?: string;
}

export type GarmentPurchasePlanStatus = "草稿" | "已确认" | "已匹配BOM" | "已生成辅料需求" | "已关闭";

export interface GarmentPurchasePlan {
  id: string;
  planNo: string;
  styleNo: string;
  productName: string;
  season: string;
  brand: string;
  orderQty: number;
  deliveryDate: string;
  targetFactory: string;
  bomNo?: string;
  status: GarmentPurchasePlanStatus;
  creator: string;
  createdAt: string;
}
