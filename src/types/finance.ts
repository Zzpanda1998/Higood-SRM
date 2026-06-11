export type Currency = "RMB" | "USD" | "IDR";
export type PayableStatus = "未对账" | "对账中" | "已对账" | "部分付款" | "已付款" | "已作废";
export type ReconciliationStatus = "草稿" | "待确认" | "已确认" | "部分付款" | "已付款" | "已作废";
export type FeeType = "面辅料采购货款" | "国内物流费" | "头程物流费" | "所得税" | "增值税" | "关税" | "罚款" | "清关费用";

export interface PayableDetail {
  id: string;
  payableNo: string;
  feeType: FeeType;
  sourceType: "面辅料采购单" | "国内物流单" | "头程物流单";
  sourceNo: string;
  sourceLineNo?: string;
  logisticsNo?: string;
  linkedPurchaseNo?: string;
  settlementObjectType: "供应商" | "快递公司" | "货代" | "清关方";
  settlementObjectName: string;
  sku?: string;
  quantity?: number;
  weight?: number;
  unitPrice?: number;
  amount: number;
  currency: Currency;
  exchangeRate?: number;
  localAmount?: number;
  reconciliationStatus: PayableStatus;
  reconciliationNo?: string;
  createdAt: string;
  createdBy: string;
  businessDate?: string;
  remark?: string;
}

export interface ReconciliationOrderDetail {
  id: string;
  reconciliationNo: string;
  payableNo: string;
  sourceType: string;
  sourceNo: string;
  sku?: string;
  feeType: string;
  quantity?: number;
  unitPrice?: number;
  systemAmount: number;
  counterpartyAmount?: number;
  differenceAmount?: number;
  adjustmentAmount: number;
  finalAmount: number;
  differenceReason?: string;
  differenceConfirmed?: boolean;
  remark?: string;
}

export interface ReconciliationOrder {
  id: string;
  reconciliationNo: string;
  reconciliationType: "面辅料采购" | "国内物流" | "头程物流" | "税费清关";
  settlementObjectName: string;
  settlementObjectType: "供应商" | "快递公司" | "货代" | "清关方";
  currency: Currency;
  systemAmount: number;
  counterpartyAmount?: number;
  differenceAmount?: number;
  adjustmentAmount: number;
  finalPayableAmount: number;
  paidAmount: number;
  unpaidAmount: number;
  status: ReconciliationStatus;
  periodStart?: string;
  periodEnd?: string;
  details: ReconciliationOrderDetail[];
  createdAt: string;
  createdBy: string;
  remark?: string;
}

export interface PaymentRecord {
  id: string;
  paymentNo: string;
  reconciliationNo: string;
  settlementObjectName: string;
  currency: Currency;
  paymentAmount: number;
  paymentMethod: "银行转账" | "现金" | "其他";
  paymentTime: string;
  paymentVoucher?: string;
  paidBy: string;
  createdAt: string;
  remark?: string;
}

export type StatementDoc = Record<string, string | number>;
