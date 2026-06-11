export type SupplierType =
  | "面料供应商"
  | "辅料供应商"
  | "纱线供应商"
  | "包材供应商"
  | "成衣工厂"
  | "样衣工厂"
  | "综合供应商";

export type SupplierStatus = "草稿" | "待审核" | "已启用" | "已驳回" | "已停用";

export type PaymentMethod = "预付" | "月结" | "到货后付款" | "对账后付款";

export type Currency = "RMB" | "USD" | "IDR";

export type DeliveryMethod = "供应商直发海外仓" | "发至中国中转仓" | "采购方自提" | "货代上门提货";

export type SupplierLevel = "A级" | "B级" | "C级" | "临时供应商";

export interface Supplier {
  id: string;
  supplierCode: string;
  supplierName: string;
  shortName: string;
  supplierType: SupplierType;
  country: string;
  city: string;
  contactName: string;
  contactPhone: string;
  email?: string;
  wechat?: string;
  paymentMethod: PaymentMethod;
  currency: Currency;
  defaultDeliveryMethod: DeliveryMethod;
  invoiceInfo?: string;
  bankAccount?: string;
  supplierLevel?: SupplierLevel;
  status: SupplierStatus;
  totalPurchaseOrders?: number;
  totalPurchaseAmount?: number;
  onTimeDeliveryRate?: number;
  qualityPassRate?: number;
  recentPurchaseOrderNo?: string;
  recentPurchaseDate?: string;
  createdBy: string;
  createdAt: string;
  updatedAt?: string;
  remark?: string;
}

export type SupplierFormInput = Omit<Supplier, "id" | "supplierCode" | "status" | "createdBy" | "createdAt" | "updatedAt">;
