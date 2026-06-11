export type UnitType = "长度" | "重量" | "数量" | "包装" | "面积" | "体积";
export type UnitStatus = "已启用" | "已停用";
export type ApplicableMaterial = "面料" | "辅料" | "纱线" | "包材" | "耗材" | "样衣" | "成衣";

export interface Unit {
  id: string;
  unitCode: string;
  unitName: string;
  unitSymbol: string;
  unitType: UnitType;
  isBaseUnit: boolean;
  applicableMaterials: ApplicableMaterial[];
  decimalPrecision: number;
  status: UnitStatus;
  referencedMaterialCount?: number;
  referencedPurchaseOrderCount?: number;
  recentUsedTime?: string;
  createdBy: string;
  createdAt: string;
  updatedAt?: string;
  remark?: string;
}
