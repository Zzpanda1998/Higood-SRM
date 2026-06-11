import type { Currency, FeeType, PayableDetail, PayableStatus, PaymentRecord, ReconciliationOrder } from "../types/finance";

const feeSeeds: Array<[FeeType, Currency, string, PayableStatus]> = [
  ["面辅料采购货款", "RMB", "绍兴锦达纺织有限公司", "未对账"],
  ["面辅料采购货款", "RMB", "泉州瑞达服装辅料有限公司", "未对账"],
  ["面辅料采购货款", "USD", "PT Textile Nusantara", "对账中"],
  ["面辅料采购货款", "RMB", "深圳优品包材有限公司", "已对账"],
  ["面辅料采购货款", "RMB", "东莞恒发布业", "已付款"],
  ["国内物流费", "RMB", "顺丰速运", "未对账"],
  ["国内物流费", "RMB", "德邦物流", "未对账"],
  ["国内物流费", "RMB", "跨越速运", "对账中"],
  ["国内物流费", "RMB", "京东物流", "已付款"],
  ["头程物流费", "RMB", "广州海航国际货运", "未对账"],
  ["头程物流费", "USD", "DHL Global Forwarding", "未对账"],
  ["头程物流费", "USD", "Maersk Logistics", "对账中"],
  ["头程物流费", "RMB", "深圳远洋货代", "已作废"],
  ["所得税", "IDR", "PT Jakarta Customs", "未对账"],
  ["增值税", "IDR", "PT Jakarta Customs", "未对账"],
  ["关税", "IDR", "PT Jakarta Customs", "未对账"],
  ["罚款", "IDR", "PT Jakarta Customs", "已对账"],
  ["清关费用", "IDR", "PT Jakarta Customs", "未对账"],
  ["清关费用", "USD", "Pacific Customs Broker", "部分付款"],
  ["所得税", "IDR", "Bali Customs Service", "已付款"],
  ["增值税", "IDR", "Bali Customs Service", "已作废"],
  ["关税", "IDR", "Bali Customs Service", "未对账"],
];

const sourceForFee = (fee: FeeType) => fee === "面辅料采购货款" ? "面辅料采购单" : fee === "国内物流费" ? "国内物流单" : "头程物流单";
const objectTypeForFee = (fee: FeeType) => fee === "面辅料采购货款" ? "供应商" : fee === "国内物流费" ? "快递公司" : fee === "头程物流费" ? "货代" : "清关方";

export const initialPayables: PayableDetail[] = feeSeeds.map(([feeType, currency, settlementObjectName, reconciliationStatus], index) => {
  const amount = feeType === "面辅料采购货款" ? 12800 + index * 1350 : feeType.includes("物流") ? 680 + index * 125 : 1250000 + index * 175000;
  const sourceType = sourceForFee(feeType);
  return {
    id: `payable-${index + 1}`,
    payableNo: `PAY-202606-${String(index + 1).padStart(4, "0")}`,
    feeType,
    sourceType,
    sourceNo: `${sourceType === "面辅料采购单" ? "ID-MP" : sourceType === "国内物流单" ? "DL" : "HL"}-2026-${String(101 + index).padStart(4, "0")}`,
    sourceLineNo: `L${String(index + 1).padStart(3, "0")}`,
    logisticsNo: sourceType === "国内物流单" ? `SF${202606100001 + index}` : sourceType === "头程物流单" ? `BL-HG-${String(index + 1).padStart(4, "0")}` : undefined,
    linkedPurchaseNo: sourceType !== "面辅料采购单" ? `ID-MP-2026-${String(201 + index).padStart(4, "0")}` : undefined,
    settlementObjectType: objectTypeForFee(feeType),
    settlementObjectName,
    sku: feeType === "面辅料采购货款" || feeType === "国内物流费" ? `MAT-${String(2201 + index).padStart(5, "0")}` : undefined,
    quantity: feeType === "面辅料采购货款" ? 500 + index * 25 : undefined,
    weight: feeType === "国内物流费" ? 18 + index * 2.5 : undefined,
    unitPrice: feeType === "面辅料采购货款" ? 18.5 + index : undefined,
    amount,
    currency,
    exchangeRate: currency === "USD" ? 7.18 : currency === "IDR" ? 0.00046 : 1,
    localAmount: Math.round(amount * (currency === "USD" ? 7.18 : currency === "IDR" ? 0.00046 : 1) * 100) / 100,
    reconciliationStatus,
    reconciliationNo: reconciliationStatus === "未对账" ? undefined : `REC-202606-${String((index % 8) + 1).padStart(4, "0")}`,
    createdAt: `2026-06-${String((index % 8) + 1).padStart(2, "0")} 09:${String(index % 6)}0`,
    createdBy: index % 2 ? "李采购" : "王采购",
    businessDate: `2026-05-${String((index % 20) + 10).padStart(2, "0")}`,
    remark: feeType === "国内物流费" ? "按重量分摊" : undefined,
  } as PayableDetail;
});

const orderSeeds: Array<[string, ReconciliationOrder["reconciliationType"], string, Currency, ReconciliationOrder["status"], number, number]> = [
  ["绍兴锦达纺织有限公司", "面辅料采购", "供应商", "RMB", "草稿", 26800, 0],
  ["泉州瑞达服装辅料有限公司", "面辅料采购", "供应商", "RMB", "待确认", 15300, 0],
  ["顺丰速运", "国内物流", "快递公司", "RMB", "已确认", 2380, 0],
  ["德邦物流", "国内物流", "快递公司", "RMB", "部分付款", 4200, 2000],
  ["DHL Global Forwarding", "头程物流", "货代", "USD", "已付款", 6800, 6800],
  ["PT Jakarta Customs", "税费清关", "清关方", "IDR", "已确认", 16800000, 0],
  ["Pacific Customs Broker", "税费清关", "清关方", "USD", "已作废", 1200, 0],
  ["Maersk Logistics", "头程物流", "货代", "USD", "待确认", 9500, 0],
];

export const initialOrders: ReconciliationOrder[] = orderSeeds.map(([name, type, objectType, currency, status, amount, paid], index) => {
  const counterpartyAmount = index % 2 === 0 ? amount : amount + (currency === "IDR" ? 150000 : 120);
  const adjustmentAmount = index % 2 === 0 ? 0 : (currency === "IDR" ? 100000 : 80);
  const finalPayableAmount = amount + adjustmentAmount;
  const reconciliationNo = `REC-202606-${String(index + 1).padStart(4, "0")}`;
  return {
    id: `rec-${index + 1}`,
    reconciliationNo,
    reconciliationType: type,
    settlementObjectName: name,
    settlementObjectType: objectType as ReconciliationOrder["settlementObjectType"],
    currency,
    systemAmount: amount,
    counterpartyAmount,
    differenceAmount: counterpartyAmount - amount,
    adjustmentAmount,
    finalPayableAmount,
    paidAmount: paid,
    unpaidAmount: Math.max(0, finalPayableAmount - paid),
    status,
    periodStart: "2026-06-01",
    periodEnd: "2026-06-08",
    details: [{
      id: `rec-detail-${index + 1}`,
      reconciliationNo,
      payableNo: `PAY-202606-${String(index + 1).padStart(4, "0")}`,
      sourceType: type === "面辅料采购" ? "面辅料采购单" : type === "国内物流" ? "国内物流单" : "头程物流单",
      sourceNo: `SOURCE-2026-${String(index + 1).padStart(4, "0")}`,
      sku: type === "面辅料采购" ? `MAT-0220${index + 1}` : undefined,
      feeType: type,
      systemAmount: amount,
      counterpartyAmount,
      differenceAmount: counterpartyAmount - amount,
      adjustmentAmount,
      finalAmount: finalPayableAmount,
      differenceReason: adjustmentAmount ? "对方账单含补充服务费" : undefined,
      differenceConfirmed: adjustmentAmount ? true : undefined,
    }],
    createdAt: `2026-06-0${(index % 8) + 1} 10:00`,
    createdBy: "王采购",
  };
});

export const initialPayments: PaymentRecord[] = [
  ["PMT-202606-0001", "REC-202606-0005", "DHL Global Forwarding", "USD", 6800, "银行转账", "国际运费全额支付"],
  ["PMT-202606-0002", "REC-202606-0004", "德邦物流", "RMB", 1200, "银行转账", "第一笔付款"],
  ["PMT-202606-0003", "REC-202606-0004", "德邦物流", "RMB", 800, "现金", ""],
  ["PMT-202606-0004", "REC-202606-0003", "顺丰速运", "RMB", 2380, "银行转账", "月结"],
  ["PMT-202606-0005", "REC-202606-0006", "PT Jakarta Customs", "IDR", 5000000, "银行转账", "税费首付款"],
  ["PMT-202606-0006", "REC-202606-0008", "Maersk Logistics", "USD", 2500, "其他", ""],
  ["PMT-202606-0007", "REC-202606-0001", "绍兴锦达纺织有限公司", "RMB", 10000, "现金", "预付"],
  ["PMT-202606-0008", "REC-202606-0006", "PT Jakarta Customs", "IDR", 3000000, "银行转账", ""],
].map(([paymentNo, reconciliationNo, settlementObjectName, currency, paymentAmount, paymentMethod, remark], index) => ({
  id: `payment-${index + 1}`,
  paymentNo: paymentNo as string,
  reconciliationNo: reconciliationNo as string,
  settlementObjectName: settlementObjectName as string,
  currency: currency as Currency,
  paymentAmount: paymentAmount as number,
  paymentMethod: paymentMethod as PaymentRecord["paymentMethod"],
  paymentTime: `2026-06-${String(index + 1).padStart(2, "0")} 14:30`,
  paymentVoucher: index % 2 === 0 ? `VCH-${20260601 + index}` : undefined,
  paidBy: index % 2 ? "陈财务" : "周财务",
  createdAt: `2026-06-${String(index + 1).padStart(2, "0")} 14:35`,
  remark: remark as string,
}));

export const productReconciliation = initialOrders.filter((item) => item.reconciliationType === "面辅料采购");
export const materialReconciliation = productReconciliation;
