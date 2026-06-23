import type {
  Currency,
  MaterialFeeItem,
  MaterialPurchaseReconciliationRow,
  MaterialPurchaseType,
  MaterialPurchaseConfirmStatus,
} from "../types/finance";

const confirmItems = (confirmed: MaterialFeeItem[] = []) =>
  (["采购货款", "供应商账单金额", "调整金额", "最终应付金额"] as MaterialFeeItem[]).map((feeItem) => ({
    feeItem,
    confirmed: confirmed.includes(feeItem),
    confirmedBy: confirmed.includes(feeItem) ? "王采购" : undefined,
    confirmedAt: confirmed.includes(feeItem) ? "2026-06-10 16:30" : undefined,
  }));

type Seed = {
  no: string;
  goodsNo?: string;
  supplier: string;
  sku: string;
  name: string;
  spec?: string;
  unit: string;
  type: MaterialPurchaseType;
  purchaser: string;
  status: MaterialPurchaseConfirmStatus;
  ordered: string;
  arrived?: string;
  inbound?: string;
  purchaseQty: number;
  arrivedQty?: number;
  inboundQty?: number;
  currency: Currency;
  price: number;
  bill?: number;
  adjustment?: number;
  differenceReason?: string;
  adjustmentReason?: string;
  remark?: string;
  paymentRequestGenerated?: boolean;
  confirmed?: MaterialFeeItem[];
};

const seeds: Seed[] = [
  { no: "ID-MP-2026-0001", goodsNo: "GP-2026-0001", supplier: "广州华盛面料有限公司", sku: "FAB-2026-0001", name: "180g纯棉针织布", spec: "白色 / 180g", unit: "米", type: "面料", purchaser: "王采购", status: "待确认", ordered: "2026-06-01", arrived: "2026-06-06", inbound: "2026-06-08", purchaseQty: 7750, arrivedQty: 7750, inboundQty: 7750, currency: "RMB", price: 0.18, remark: "首批面料" },
  { no: "ID-MP-2026-0002", goodsNo: "GP-2026-0001", supplier: "东莞宏远辅料有限公司", sku: "ACC-2026-0002", name: "白色纽扣", spec: "白色 / 15mm", unit: "个", type: "辅料", purchaser: "李采购", status: "待确认", ordered: "2026-06-02", arrived: "2026-06-07", purchaseQty: 3352, arrivedQty: 3000, inboundQty: 0, currency: "RMB", price: 0.06, bill: 205.12, differenceReason: "供应商账单含打样费" },
  { no: "ID-MP-2026-0003", goodsNo: "GP-2026-0002", supplier: "东莞宏远辅料有限公司", sku: "ACC-2026-0003", name: "YKK 5号尼龙拉链", spec: "黑色 / 60cm", unit: "个", type: "辅料", purchaser: "李采购", status: "已确认", ordered: "2026-06-02", arrived: "2026-06-08", inbound: "2026-06-09", purchaseQty: 6200, arrivedQty: 6150, inboundQty: 6100, currency: "RMB", price: 1.25, bill: 7600, adjustment: -25, differenceReason: "供应商按实收数量结算", adjustmentReason: "扣除破损件", paymentRequestGenerated: true, confirmed: ["采购货款", "供应商账单金额", "调整金额", "最终应付金额"] },
  { no: "ID-MP-2026-0004", goodsNo: "GP-2026-0002", supplier: "苏州恒润包装材料有限公司", sku: "PKG-2026-0004", name: "五层出口纸箱", spec: "60×40×30", unit: "箱", type: "包材", purchaser: "陈采购", status: "已确认", ordered: "2026-06-03", arrived: "2026-06-08", inbound: "2026-06-09", purchaseQty: 1200, arrivedQty: 1200, inboundQty: 1200, currency: "RMB", price: 2.6, bill: 3120, paymentRequestGenerated: true, confirmed: ["采购货款", "调整金额"], remark: "出口包装" },
  { no: "ID-MP-2026-0005", goodsNo: "GP-2026-0004", supplier: "中山综合服饰供应链有限公司", sku: "CON-2026-0005", name: "防潮珠", spec: "5g / 包", unit: "包", type: "耗材", purchaser: "陈采购", status: "待确认", ordered: "2026-06-03", arrived: "2026-06-09", purchaseQty: 4000, arrivedQty: 3900, inboundQty: 0, currency: "RMB", price: 0.09, adjustment: 15, adjustmentReason: "加急包装费" },
  { no: "ID-MP-2026-0006", goodsNo: "GP-2026-0004", supplier: "绍兴锦达纺织有限公司", sku: "FAB-2026-0006", name: "220g涤棉卫衣布", spec: "深灰 / 220g", unit: "米", type: "面料", purchaser: "王采购", status: "部分确认", ordered: "2026-06-04", arrived: "2026-06-10", inbound: "2026-06-11", purchaseQty: 4100, arrivedQty: 4080, inboundQty: 4080, currency: "USD", price: 1.85, bill: 7560, adjustment: -20, differenceReason: "汇率尾差", adjustmentReason: "质量扣款", confirmed: ["调整金额"] },
  { no: "ID-MP-2026-0007", goodsNo: "GP-2026-0005", supplier: "义乌小料供应商", sku: "ACC-2026-0007", name: "黑色四眼纽扣", spec: "黑色 / 18mm", unit: "个", type: "辅料", purchaser: "李采购", status: "部分确认", ordered: "2026-06-04", arrived: "2026-06-09", inbound: "2026-06-10", purchaseQty: 7600, arrivedQty: 7600, inboundQty: 7600, currency: "RMB", price: 0.08, bill: 608, confirmed: ["采购货款", "调整金额"] },
  { no: "ID-MP-2026-0008", goodsNo: "GP-2026-0006", supplier: "深圳包装材料供应商", sku: "PKG-2026-0008", name: "40×60cm透明胶袋", spec: "透明 / 8丝", unit: "个", type: "包材", purchaser: "陈采购", status: "待确认", ordered: "2026-06-05", purchaseQty: 2100, arrivedQty: 0, inboundQty: 0, currency: "RMB", price: 0.35 },
  { no: "ID-MP-2026-0009", goodsNo: "GP-2026-0007", supplier: "PT Textile Nusantara", sku: "YRN-2026-0009", name: "32支精梳棉纱", spec: "本白 / 32S", unit: "KG", type: "纱线", purchaser: "王采购", status: "待确认", ordered: "2026-06-06", arrived: "2026-06-11", inbound: "2026-06-11", purchaseQty: 850, arrivedQty: 850, inboundQty: 850, currency: "IDR", price: 68000, bill: 57900000, adjustment: 100000, adjustmentReason: "银行手续费" },
  { no: "ID-MP-2026-0010", supplier: "杭州新锐耗材有限公司", sku: "CON-2026-0010", name: "服装定位贴", spec: "30mm / 可移胶", unit: "卷", type: "耗材", purchaser: "陈采购", status: "待确认", ordered: "2026-06-07", arrived: "2026-06-11", purchaseQty: 180, arrivedQty: 180, inboundQty: 0, currency: "RMB", price: 12.5, bill: 2280, adjustment: 30, differenceReason: "含运费", adjustmentReason: "补充运输费" },
];

export const initialMaterialPurchaseReconciliationRows: MaterialPurchaseReconciliationRow[] = seeds.map((seed, index) => {
  const quantity = seed.inboundQty && seed.inboundQty > 0 ? seed.inboundQty : seed.purchaseQty;
  const estimatedPurchaseAmount = Number((quantity * seed.price).toFixed(2));
  const adjustmentAmount = seed.adjustment ?? 0;
  const actualUnitPrice = seed.bill == null ? 0 : seed.price;
  const actualPurchaseAmount = seed.bill == null ? 0 : estimatedPurchaseAmount;
  const supplierBillAmount = seed.bill ?? 0;
  const actualFinalPayable = Number(((supplierBillAmount > 0 ? supplierBillAmount : actualPurchaseAmount) + adjustmentAmount).toFixed(2));
  const estimatedFinalPayable = estimatedPurchaseAmount;
  return {
    id: `material-rec-${index + 1}`,
    reconciliationNo: index < 4 ? `MREC-202606-${String(index + 1).padStart(4, "0")}` : undefined,
    materialPurchaseNo: seed.no,
    sourceGoodsPurchaseNo: seed.goodsNo,
    supplierName: seed.supplier,
    materialSku: seed.sku,
    materialName: seed.name,
    specification: seed.spec,
    unit: seed.unit,
    purchaseType: seed.type,
    purchaser: seed.purchaser,
    status: seed.status,
    orderedAt: seed.ordered,
    arrivedAt: seed.arrived,
    inboundAt: seed.inbound,
    purchaseQty: seed.purchaseQty,
    arrivedQty: seed.arrivedQty,
    inboundQty: seed.inboundQty,
    currency: seed.currency,
    estimatedFee: {
      unitPrice: seed.price,
      purchaseAmount: estimatedPurchaseAmount,
      supplierBillAmount: 0,
      adjustmentAmount: 0,
      finalPayableAmount: estimatedFinalPayable,
      remark: seed.remark,
    },
    actualFee: {
      unitPrice: actualUnitPrice,
      purchaseAmount: actualPurchaseAmount,
      supplierBillAmount,
      adjustmentAmount,
      finalPayableAmount: actualFinalPayable,
      remark: seed.remark,
    },
    differenceAmount: Number((actualFinalPayable - estimatedFinalPayable).toFixed(2)),
    differenceReason: seed.differenceReason,
    paymentRequestGenerated: seed.paymentRequestGenerated ?? false,
    confirmedBy: seed.status === "已确认" ? "王采购" : undefined,
    confirmedAt: seed.status === "已确认" ? "2026-06-10 16:30" : undefined,
    confirmedItems: confirmItems(seed.confirmed),
  };
});
