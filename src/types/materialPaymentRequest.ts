export type MaterialPaymentRequestStatus = "未请款" | "部分请款" | "已请款" | "已完成" | "已作废";
export type MaterialPaymentStatus = "未付款" | "部分付款" | "已付款" | "已完成";
export type MaterialPaymentApplyStatus = "未付款" | "已付款";
export type MaterialPaymentApplyType = "全款" | "部分付款";
export type MaterialPaymentCurrency = "CNY" | "USD" | "IDR";

export type MaterialPaymentSource = {
  reconciliationNo: string;
  materialPurchaseNo: string;
  sourceGoodsPurchaseNo?: string;
  supplierName: string;
  materialSku: string;
  materialName: string;
  materialCategory: string;
  specification?: string;
  baseUnit: string;
  packageUnit: string;
  purchaseBaseQty: number;
  purchasePackageQty: number;
  inboundBaseQty: number;
  inboundPackageQty: number;
  purchaseUnitPrice: number;
  purchaseAmount: number;
  adjustmentAmount: number;
  finalPayableAmount: number;
  supplierBillAmount: number;
  reconciliationStatus: string;
  currency: MaterialPaymentCurrency;
  confirmedPayable: number;
  requestedAmount: number;
  currentRequestAmount: number;
  remark?: string;
};

export type MaterialPaymentAmount = {
  currency: MaterialPaymentCurrency;
  requestAmount: number;
  requestedBefore: number;
  paidAmount: number;
  remainingRequestable: number;
  exchangeRate: number;
  baseCurrencyAmount: number;
  amountInWords: string;
};

export type MaterialPaymentAttachment = {
  id: string;
  name: string;
  type: "PDF" | "PPT" | "Excel" | "Image";
  size: string;
  uploader: string;
  uploadedAt: string;
};

export type MaterialPaymentApplyRecord = {
  id: string;
  applyNo: string;
  appliedAt: string;
  applicant: string;
  applyType: MaterialPaymentApplyType;
  currency: MaterialPaymentCurrency;
  applyAmount: number;
  paymentRemark: string;
  paymentStatus: MaterialPaymentApplyStatus;
  paidAt?: string;
  payer?: string;
  paymentNo?: string;
  remainingAmount: number;
  remark?: string;
};

export type MaterialActualPaymentRecord = {
  id: string;
  paymentNo: string;
  requestNo: string;
  applyNo: string;
  paidAt: string;
  payer: string;
  payeeName: string;
  payerEntity: string;
  paymentMethod: string;
  currency: MaterialPaymentCurrency;
  paidAmount: number;
  bankAccount: string;
  bankName: string;
  swiftCode?: string;
  voucher: string;
  paymentRemark?: string;
  amountInWords: string;
  attachments: MaterialPaymentAttachment[];
};

export type MaterialPaymentLog = {
  operatedAt: string;
  operator: string;
  action: string;
  content: string;
  remark?: string;
};

export type MaterialPaymentRequest = {
  id: string;
  requestNo: string;
  paymentType: string;
  supplierName: string;
  supplierShortName?: string;
  payeeName: string;
  payeeAddress?: string;
  contactName?: string;
  contactPhone?: string;
  paymentDate: string;
  payerEntity: string;
  paymentMethod: string;
  paymentNature: string;
  applicant: string;
  applicantDepartment: string;
  bankName: string;
  bankAccount: string;
  swiftCode?: string;
  receivingCurrency: MaterialPaymentCurrency;
  paymentRemark: string;
  internalRemark?: string;
  financeRemark?: string;
  status: MaterialPaymentRequestStatus;
  paymentStatus: MaterialPaymentStatus;
  createdAt: string;
  updatedAt: string;
  sources: MaterialPaymentSource[];
  amounts: MaterialPaymentAmount[];
  attachments: MaterialPaymentAttachment[];
  applyRecords: MaterialPaymentApplyRecord[];
  paymentRecords: MaterialActualPaymentRecord[];
  logs: MaterialPaymentLog[];
};
