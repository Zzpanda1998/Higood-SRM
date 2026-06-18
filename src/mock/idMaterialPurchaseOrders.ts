import { logisticsSplitDemoByOrderNo } from "./logisticsSplitDemo";
import type { DomesticLogisticsInfo, FirstLegLogisticsInfo } from "../types/logisticsSplit";

export type IdMaterialPurchaseOrder = {
  idOrderNo: string;
  sourceAnalysisNo: string;
  sourceProductOrderNo: string;
  materialCode?: string;
  materialCategory: string;
  materialName: string;
  materialImageUrl?: string;
  plannedPurchaseQty?: number;
  historicalMaterialStock?: number;
  idHistoricalMaterialStock?: number;
  actualPurchaseQty?: number;
  purchaseQty: number;
  unit: string;
  supplier: string;
  targetWarehouse?: string;
  remark?: string;
  orderDate: string;
  buyer: string;
  status: string;
  transportNode: string;
  orderType?: string;
  purchaseRegion?: string;
  hasLogisticsNo?: "是" | "否";
  includesProduction?: "是" | "否";
  merchantArrivalStatus?: string;
  orderStatus?: string;
  usageType?: string;
  sourcePurchaseQty?: number;
  sourceCreatedAt?: string;
  sourceProductImageUrl?: string;
  sourceProductName?: string;
  sourceSpu?: string;
  skuCode?: string;
  skuCount?: number;
  applicant?: string;
  actualPurchasePrice?: number;
  unitWeight?: number;
  unitMaterialCost?: number;
  purchasingQty?: number;
  stockQty?: number;
  garmentUnit?: string;
  merchantArrivalQty?: number;
  arrivedQty?: number;
  inboundQty?: number;
  paidQty?: number;
  freightMethod?: string;
  logisticsNo?: string;
  logisticsStatus?: string;
  contact?: string;
  transitCenter?: string;
  domesticDays?: number;
  estimatedTransitDays?: number;
  transitNo?: string;
  inboundNo?: string;
  shippedAt?: string;
  inboundAt?: string;
  signedAt?: string;
  transitAt?: string;
  warehouseAt?: string;
  domesticFreight?: number;
  transitFee?: number;
  totalCost?: number;
  costConfirmed?: "是" | "否";
  purchaseRemark?: string;
  qualityResult?: string;
  creator?: string;
  domesticLogistics?: DomesticLogisticsInfo;
  firstLegLogistics?: FirstLegLogisticsInfo;
};

const baseOrders: IdMaterialPurchaseOrder[] = [
  { idOrderNo: "ID-MP-2026-0001", sourceAnalysisNo: "MRA-2026-0001", sourceProductOrderNo: "GP-2026-0001", materialCategory: "面料", materialName: "180g 纯棉针织布", purchaseQty: 7750, unit: "米", supplier: "广州华盛面料有限公司", orderDate: "2026-06-01", buyer: "王采购", status: "已确认", transportNode: "备货中" },
  { idOrderNo: "ID-MP-2026-0002", sourceAnalysisNo: "MRA-2026-0001", sourceProductOrderNo: "GP-2026-0001", materialCategory: "辅料", materialName: "白色织唛", purchaseQty: 3352, unit: "个", supplier: "东莞宏远辅料有限公司", orderDate: "2026-06-01", buyer: "李采购", status: "已发货", transportNode: "在途" },
  { idOrderNo: "ID-MP-2026-0003", sourceAnalysisNo: "MRA-2026-0002", sourceProductOrderNo: "GP-2026-0002", materialCategory: "辅料", materialName: "YKK 5号尼龙拉链", purchaseQty: 6200, unit: "条", supplier: "东莞宏远辅料有限公司", orderDate: "2026-06-02", buyer: "李采购", status: "待确认", transportNode: "未发货" },
  { idOrderNo: "ID-MP-2026-0004", sourceAnalysisNo: "MRA-2026-0002", sourceProductOrderNo: "GP-2026-0002", materialCategory: "包材", materialName: "五层出口纸箱", purchaseQty: 1200, unit: "个", supplier: "苏州恒润包装材料有限公司", orderDate: "2026-06-02", buyer: "陈采购", status: "草稿", transportNode: "未提交" },
  { idOrderNo: "ID-MP-2026-0005", sourceAnalysisNo: "MRA-2026-0004", sourceProductOrderNo: "GP-2026-0004", materialCategory: "耗材", materialName: "防潮珠", purchaseQty: 4000, unit: "包", supplier: "中山综合服饰供应链有限公司", orderDate: "2026-06-03", buyer: "陈采购", status: "在途", transportNode: "海运中" },
  { idOrderNo: "ID-MP-2026-0006", sourceAnalysisNo: "MRA-2026-0004", sourceProductOrderNo: "GP-2026-0004", materialCategory: "面料", materialName: "220g 涤棉卫衣布", purchaseQty: 4100, unit: "米", supplier: "绍兴锦达纺织有限公司", orderDate: "2026-06-03", buyer: "王采购", status: "已到仓", transportNode: "雅加达仓待收" },
  { idOrderNo: "ID-MP-2026-0007", sourceAnalysisNo: "MRA-2026-0005", sourceProductOrderNo: "GP-2026-0005", materialCategory: "辅料", materialName: "黑色四眼纽扣", purchaseQty: 7600, unit: "个", supplier: "泉州瑞达服装辅料有限公司", orderDate: "2026-06-03", buyer: "李采购", status: "已入库", transportNode: "入库完成" },
  { idOrderNo: "ID-MP-2026-0008", sourceAnalysisNo: "MRA-2026-0006", sourceProductOrderNo: "GP-2026-0006", materialCategory: "包材", materialName: "40x60cm 透明胶袋", purchaseQty: 2100, unit: "个", supplier: "深圳优品包材有限公司", orderDate: "2026-06-04", buyer: "陈采购", status: "已完成", transportNode: "已对账" },
];

const productImages = ["/mock/products/hg-ts-2601.svg", "/mock/products/hg-pt-2602.svg", "/mock/products/hg-hd-2603.svg", "/mock/products/hg-jk-2605.svg"];
const sourceProducts = ["男款圆领T恤", "女款休闲裤", "连帽卫衣", "轻薄夹克"];
const sourceSpus = ["HG-TS-2601", "HG-PT-2602", "HG-HD-2603", "HG-JK-2605"];

export const idMaterialPurchaseOrders: IdMaterialPurchaseOrder[] = baseOrders.map((order, index) => {
  const actualQty = order.actualPurchaseQty ?? order.purchaseQty;
  const arrived = ["已到仓", "已入库", "已完成"].includes(order.status) ? actualQty : Math.round(actualQty * (index % 3 === 0 ? 0.6 : 0));
  const inbound = ["已入库", "已完成"].includes(order.status) ? arrived : 0;
  const actualPrice = order.actualPurchasePrice ?? Number((0.8 + index * 0.37).toFixed(2));
  const domesticFreight = Number((12 + index * 3.6).toFixed(2));
  const transitFee = Number((20 + index * 5.4).toFixed(2));
  return {
    ...order,
    materialCode: order.materialCode ?? `MAT-2026-${String(index + 1).padStart(4, "0")}`,
    materialImageUrl: order.materialImageUrl ?? productImages[index % productImages.length],
    plannedPurchaseQty: order.plannedPurchaseQty ?? order.purchaseQty,
    actualPurchaseQty: actualQty,
    targetWarehouse: order.targetWarehouse ?? "印尼雅加达面辅料仓",
    orderType: order.orderType ?? (order.materialCategory === "面料" ? "面料采购" : "辅料采购"),
    purchaseRegion: order.purchaseRegion ?? (index % 3 === 0 ? "CN" : "ID"),
    hasLogisticsNo: order.hasLogisticsNo ?? (index % 3 === 2 ? "否" : "是"),
    includesProduction: order.includesProduction ?? (index % 2 === 0 ? "是" : "否"),
    merchantArrivalStatus: order.merchantArrivalStatus ?? (arrived >= actualQty ? "全部到货" : arrived > 0 ? "部分到货" : "未到货"),
    orderStatus: order.orderStatus ?? (order.status === "草稿" ? "未下单" : "已下单"),
    usageType: order.usageType ?? "成衣做货备货",
    sourcePurchaseQty: order.sourcePurchaseQty ?? Math.round(order.purchaseQty * 1.15),
    sourceCreatedAt: order.sourceCreatedAt ?? `${order.orderDate} 08:56`,
    sourceProductImageUrl: order.sourceProductImageUrl ?? productImages[index % productImages.length],
    sourceProductName: order.sourceProductName ?? sourceProducts[index % sourceProducts.length],
    sourceSpu: order.sourceSpu ?? sourceSpus[index % sourceSpus.length],
    skuCode: order.skuCode ?? `${sourceSpus[index % sourceSpus.length]}-${index % 2 ? "black" : "white"}`,
    skuCount: order.skuCount ?? 1,
    applicant: order.applicant ?? order.buyer,
    actualPurchasePrice: actualPrice,
    unitWeight: order.unitWeight ?? Number((0.002 + index * 0.001).toFixed(3)),
    unitMaterialCost: order.unitMaterialCost ?? Number((actualPrice * 0.012).toFixed(3)),
    purchasingQty: order.purchasingQty ?? actualQty,
    stockQty: order.stockQty ?? Math.round(order.purchaseQty * 0.4),
    garmentUnit: order.garmentUnit ?? (index % 3 === 0 ? "未设" : `${(1 + index * 0.1).toFixed(1)}${order.unit}`),
    merchantArrivalQty: order.merchantArrivalQty ?? arrived,
    arrivedQty: order.arrivedQty ?? arrived,
    inboundQty: order.inboundQty ?? inbound,
    paidQty: order.paidQty ?? 0,
    freightMethod: order.freightMethod ?? (index % 2 === 0 ? "快递" : "货运"),
    logisticsNo: order.logisticsNo ?? (index % 3 === 2 ? "" : `SF202606${String(index + 1).padStart(4, "0")}`),
    logisticsStatus: order.logisticsStatus ?? order.transportNode,
    contact: order.contact ?? "采购物流 138****6688",
    transitCenter: order.transitCenter ?? "广州转运中心",
    domesticDays: order.domesticDays ?? index + 1,
    estimatedTransitDays: order.estimatedTransitDays ?? 8 + index,
    transitNo: order.transitNo ?? `ID202606${String(index + 1).padStart(2, "0")}B`,
    inboundNo: order.inboundNo ?? (inbound ? `IN-2026-${String(index + 1).padStart(4, "0")}` : ""),
    shippedAt: order.shippedAt ?? (index % 3 === 2 ? "" : `2026-06-${String(index + 5).padStart(2, "0")}`),
    inboundAt: order.inboundAt ?? (inbound ? `2026-06-${String(index + 12).padStart(2, "0")}` : ""),
    signedAt: order.signedAt ?? (arrived ? `2026-06-${String(index + 10).padStart(2, "0")}` : ""),
    transitAt: order.transitAt ?? (index % 3 === 2 ? "" : `2026-06-${String(index + 6).padStart(2, "0")}`),
    warehouseAt: order.warehouseAt ?? (arrived ? `2026-06-${String(index + 11).padStart(2, "0")}` : ""),
    domesticFreight,
    transitFee,
    totalCost: Number((actualQty * actualPrice + domesticFreight + transitFee).toFixed(2)),
    costConfirmed: order.costConfirmed ?? (index % 2 === 0 ? "是" : "否"),
    remark: order.remark ?? `通过面辅料采购单：${order.sourceProductOrderNo} 创建`,
    purchaseRemark: order.purchaseRemark ?? (index % 2 === 0 ? "按计划优先采购" : "-"),
    qualityResult: order.qualityResult ?? (inbound ? "合格" : "-"),
    creator: order.creator ?? order.buyer,
    domesticLogistics: order.domesticLogistics ?? logisticsSplitDemoByOrderNo[order.idOrderNo]?.domesticLogistics,
    firstLegLogistics: order.firstLegLogistics ?? logisticsSplitDemoByOrderNo[order.idOrderNo]?.firstLegLogistics,
  };
});
