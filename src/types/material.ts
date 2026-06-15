export type MaterialCategory = "面料" | "辅料" | "纱线" | "包材" | "耗材" | "样衣" | "成衣";
export type MaterialStatus = "草稿" | "已启用" | "已停用";
export type MaterialPurpose = "生产用" | "包装用" | "样衣开发" | "成衣采购" | "日常耗材";
export type Unit = "米" | "码" | "公斤" | "KG" | "个" | "件" | "卷" | "箱" | "包" | "打";
export type Currency = "RMB" | "USD" | "IDR";
export type PurchaseRegion = "国内" | "印尼" | "其他";
export type BrandType = "无品牌" | "自有品牌" | "授权品牌";
export type TaxExemptionType = "照章征税" | "全免" | "其他";

export interface MaterialDeclarationInfo {
  chineseClearanceName?: string;
  englishClearanceName?: string;
  materialEnglish?: string;
  usageEnglish?: string;
  weavingMethod?: string;
  brandType?: BrandType;
  productMaterial?: string;
  productUsage?: string;
  productModel?: string;
  declarationBrandName?: string;
  brandEnglishName?: string;
  specialAttributes: string[];
  declarationImageUrl?: string;
}

export interface MaterialCustomsInfo {
  chineseCustomsName?: string;
  englishCustomsName?: string;
  originCountryOrRegion?: string;
  domesticSourcePlace?: string;
  taxExemptionType?: TaxExemptionType;
  otherDeclarationElements?: string;
  customsMaterial?: string;
  customsUsage?: string;
  customsSpecificationModel?: string;
  needCustomsDeclaration: boolean;
  transactionUnit?: string;
  legalSecondUnit?: string;
  legalSecondUnitValue?: number;
}

export interface MaterialSystemInfo {
  dataSource: "商品中心同步";
  sourceSystem: "PCS";
  sourceProductCode?: string;
  syncedAt?: string;
  createdBy?: string;
  createdAt?: string;
  updatedBy?: string;
  updatedAt?: string;
}

export interface Material {
  id: string;
  materialCode: string;
  materialName: string;
  materialCategory: MaterialCategory;
  specification: string;
  materialPurpose?: MaterialPurpose;
  styleNo?: string;
  composition?: string;
  weight?: string;
  width?: string;
  color?: string;
  colorCode?: string;
  size?: string;
  baseUnit: Unit;
  purchaseUnit: Unit;
  inventoryUnit: Unit;
  conversionRate?: string;
  defaultSupplier?: string;
  referencePurchasePrice?: number;
  currency?: Currency;
  defaultPurchaseRegion?: PurchaseRegion;
  minPurchaseQty?: number;
  purchaseLeadTime?: number;
  needInspection: boolean;
  inspectionRequirement?: string;
  batchManagement?: boolean;
  colorSizeManagement?: boolean;
  status: MaterialStatus;
  totalPurchaseOrders?: number;
  totalPurchaseQty?: number;
  totalPurchaseAmount?: number;
  recentPurchaseOrderNo?: string;
  recentPurchaseDate?: string;
  createdBy: string;
  createdAt: string;
  updatedAt?: string;
  updatedBy?: string;
  declarationInfo?: MaterialDeclarationInfo;
  customsInfo?: MaterialCustomsInfo;
  systemInfo?: MaterialSystemInfo;
  remark?: string;
}
