export type LogisticsPaymentRequestStatus =
  | "未请款"
  | "部分请款"
  | "已请款"
  | "已完成"
  | "已作废";

export type LogisticsPaymentStatus = "未付款" | "部分付款" | "已付款" | "已完成";
export type LogisticsPaymentApplyStatus = "未付款" | "已付款";
export type LogisticsPaymentApplyType = "全款" | "部分付款";

export type LogisticsPaymentSource = {
  reconciliationNo: string;
  firstLegNo: string;
  provider: string;
  channel: string;
  transportMethod: string;
  domesticLogisticsNo: string;
  feeType: string;
  reconciliationStatus: string;
  currency: string;
  confirmedPayable: number;
  requestedAmount: number;
  currentRequestAmount: number;
  remark?: string;
};

export type LogisticsPaymentAmount = {
  currency: string;
  currencyName: string;
  requestAmount: number;
  paidAmount: number;
  amountInWords: string;
  exchangeRate: number;
  baseCurrencyAmount: number;
  requestedBefore: number;
  remainingRequestable: number;
};

export type LogisticsPaymentAttachment = {
  id: string;
  name: string;
  type: "PDF" | "PPT" | "Excel" | "Image";
  size: string;
  uploader: string;
  uploadedAt: string;
};

export type LogisticsPaymentApplyRecord = {
  id: string;
  applyNo: string;
  appliedAt: string;
  applicant: string;
  applyType: LogisticsPaymentApplyType;
  currency: "USD" | "CNY";
  applyAmount: number;
  applyRatio: number;
  paymentRemark: string;
  paymentStatus: LogisticsPaymentApplyStatus;
  paidAt?: string;
  paymentNo?: string;
  remark?: string;
};

export type LogisticsActualPaymentRecord = {
  id: string;
  paymentNo: string;
  requestNo: string;
  applyNo: string;
  paidAt: string;
  payer: string;
  payeeName: string;
  payerEntity: string;
  paymentMethod: string;
  currency: "USD" | "CNY";
  paidAmount: number;
  bankAccount: string;
  bankName: string;
  swiftCode?: string;
  voucher: string;
  paymentRemark?: string;
  amountInWords: string;
  attachments: LogisticsPaymentAttachment[];
};

export type LogisticsPaymentLog = {
  operatedAt: string;
  operator: string;
  action: string;
  content: string;
  remark?: string;
};

export type LogisticsPaymentRequest = {
  id: string;
  requestNo: string;
  paymentType: string;
  payeeName: string;
  payeeShortName?: string;
  payeeAddress?: string;
  contactName?: string;
  contactPhone?: string;
  paymentDate: string;
  payerEntity: string;
  paymentMethod: string;
  paymentNature: string;
  bankName: string;
  bankAccount: string;
  swiftCode?: string;
  receivingCurrency: "USD" | "CNY";
  paymentRemark: string;
  internalRemark?: string;
  financeRemark?: string;
  status: LogisticsPaymentRequestStatus;
  paymentStatus: LogisticsPaymentStatus;
  applicant: string;
  applicantDepartment?: string;
  createdAt: string;
  updatedAt: string;
  sources: LogisticsPaymentSource[];
  amounts: LogisticsPaymentAmount[];
  attachments: LogisticsPaymentAttachment[];
  applyRecords: LogisticsPaymentApplyRecord[];
  paymentRecords: LogisticsActualPaymentRecord[];
  logs: LogisticsPaymentLog[];
};
