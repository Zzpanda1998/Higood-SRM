export type ProductPurchaseType = "做货" | "成衣" | "样衣";
export type ProductPurchaseStatus = "草稿" | "待采购" | "待确认" | "已确认" | "已发货" | "已到货" | "已入库" | "已完成" | "已关闭";

export type ProductPurchaseSku = {
  sku: string;
  imageUrl?: string;
  productName: string;
  color: string;
  size: string;
  applicant?: string;
  creator?: string;
  standardPurchasePrice: number;
  actualPurchasePrice: number;
  suggestedPurchaseQty: number;
  actualPurchaseQty: number;
  suggestedTestStore?: string;
  weight?: string;
  needBom: boolean;
  bomNo?: string;
  bomVersion?: string;
  bomStatus?: "已匹配" | "未匹配";
  remark?: string;
};

export type ProductPurchaseOrder = {
  id: string;
  orderNo: string;
  purchaseOrderNo: string;
  purchaseType: ProductPurchaseType;
  spu: string;
  productName: string;
  imageUrl?: string;
  skuCount: number;
  totalPurchaseQty: number;
  totalAmount: number;
  supplierName: string;
  supplierContact: string;
  supplierType: "做货供应商" | "成衣供应商" | "样衣供应商";
  addressType: "拼多多" | "淘宝" | "线下";
  externalProductId: string;
  purchaseLink: string;
  supplierRemark?: string;
  purchaser: string;
  targetWarehouse: string;
  expectedArrivalDate: string;
  shippedAt?: string;
  signedAt?: string;
  auditTime?: string;
  latestWarehouseTime?: string;
  logisticsType?: string;
  trackingNo?: string;
  isUrgent: "是" | "否";
  isFirstOrder: "是" | "否";
  isOverQty: "是" | "否";
  hasLogistics: "是" | "否";
  hasTransferRecord: "是" | "否";
  isCombinedOrder: "是" | "否";
  region: "国内" | "印尼" | "其他";
  productionArea?: "国内" | "印尼" | "其他";
  afterSaleStatus: "正常" | "售后中" | "已关闭";
  needBom: "是" | "否";
  materialStatus: "不需要" | "未生成" | "已生成" | "已下推";
  relatedMaterialAnalysisNo?: string;
  materialGeneratedAt?: string;
  status: ProductPurchaseStatus;
  createdAt: string;
  updatedAt?: string;
  operationLogs?: string[];
  systemRemark?: string;
  productRemark?: string;
  purchaseRemark?: string;
  sourceSuggestionNo?: string;
  purchaseBusinessType?: "爆款" | "热销";
  purchaseRegions?: string[];
  regionPrice?: number;
  stockFlow: {
    purchaseQty: number;
    arrivedQty: number;
    outboundQty: number;
    inboundQty: number;
    waitingOutboundQty: number;
  };
  skuItems: ProductPurchaseSku[];
};

export type ProductCatalogSpu = {
  spu: string;
  productName: string;
  imageUrl?: string;
  defaultSupplier: string;
  skuItems: ProductPurchaseSku[];
};

export const productCatalogSpus: ProductCatalogSpu[] = [
  {
    spu: "HG-TS-2601",
    productName: "男款圆领T恤",
    imageUrl: "/mock/products/hg-ts-2601.svg",
    defaultSupplier: "佛山成衣加工厂",
    skuItems: [
      { sku: "HG-TS-2601-WH-M", imageUrl: "/mock/products/hg-ts-2601.svg", productName: "男款圆领T恤", color: "白色", size: "M", standardPurchasePrice: 31.5, actualPurchasePrice: 31.5, suggestedPurchaseQty: 2000, actualPurchaseQty: 2000, needBom: true },
      { sku: "HG-TS-2601-WH-L", imageUrl: "/mock/products/hg-ts-2601.svg", productName: "男款圆领T恤", color: "白色", size: "L", standardPurchasePrice: 31.5, actualPurchasePrice: 31.5, suggestedPurchaseQty: 2200, actualPurchaseQty: 2200, needBom: true },
      { sku: "HG-TS-2601-BK-M", imageUrl: "/mock/products/hg-ts-2601.svg", productName: "男款圆领T恤", color: "黑色", size: "M", standardPurchasePrice: 32.2, actualPurchasePrice: 32.2, suggestedPurchaseQty: 1900, actualPurchaseQty: 1900, needBom: true },
      { sku: "HG-TS-2601-BK-L", imageUrl: "/mock/products/hg-ts-2601.svg", productName: "男款圆领T恤", color: "黑色", size: "L", standardPurchasePrice: 32.2, actualPurchasePrice: 32.2, suggestedPurchaseQty: 1500, actualPurchaseQty: 1500, needBom: true },
    ],
  },
  {
    spu: "HG-PT-2602",
    productName: "女款休闲裤",
    imageUrl: "/mock/products/hg-pt-2602.svg",
    defaultSupplier: "佛山成衣加工厂",
    skuItems: [
      { sku: "HG-PT-2602-BK-S", imageUrl: "/mock/products/hg-pt-2602.svg", productName: "女款休闲裤", color: "黑色", size: "S", standardPurchasePrice: 58.6, actualPurchasePrice: 58.6, suggestedPurchaseQty: 1800, actualPurchaseQty: 1800, needBom: true },
      { sku: "HG-PT-2602-BK-M", imageUrl: "/mock/products/hg-pt-2602.svg", productName: "女款休闲裤", color: "黑色", size: "M", standardPurchasePrice: 58.6, actualPurchasePrice: 58.6, suggestedPurchaseQty: 2600, actualPurchaseQty: 2600, needBom: true },
      { sku: "HG-PT-2602-BK-L", imageUrl: "/mock/products/hg-pt-2602.svg", productName: "女款休闲裤", color: "黑色", size: "L", standardPurchasePrice: 58.6, actualPurchasePrice: 58.6, suggestedPurchaseQty: 1800, actualPurchaseQty: 1800, needBom: true },
    ],
  },
  {
    spu: "HG-HD-2603",
    productName: "连帽卫衣",
    imageUrl: "/mock/products/hg-hd-2603.svg",
    defaultSupplier: "绍兴锦达纺织有限公司",
    skuItems: [
      { sku: "HG-HD-2603-GY-M", imageUrl: "/mock/products/hg-hd-2603.svg", productName: "连帽卫衣", color: "灰色", size: "M", standardPurchasePrice: 86.2, actualPurchasePrice: 86.2, suggestedPurchaseQty: 1200, actualPurchaseQty: 1200, needBom: true },
      { sku: "HG-HD-2603-GY-L", imageUrl: "/mock/products/hg-hd-2603.svg", productName: "连帽卫衣", color: "灰色", size: "L", standardPurchasePrice: 86.2, actualPurchasePrice: 86.2, suggestedPurchaseQty: 1400, actualPurchaseQty: 1400, needBom: true },
      { sku: "HG-HD-2603-NV-M", imageUrl: "/mock/products/hg-hd-2603.svg", productName: "连帽卫衣", color: "藏青", size: "M", standardPurchasePrice: 87.5, actualPurchasePrice: 87.5, suggestedPurchaseQty: 1000, actualPurchaseQty: 1000, needBom: true },
      { sku: "HG-HD-2603-NV-L", imageUrl: "/mock/products/hg-hd-2603.svg", productName: "连帽卫衣", color: "藏青", size: "L", standardPurchasePrice: 87.5, actualPurchasePrice: 87.5, suggestedPurchaseQty: 1000, actualPurchaseQty: 1000, needBom: true },
    ],
  },
  {
    spu: "HG-JK-2605",
    productName: "轻薄夹克",
    imageUrl: "/mock/products/hg-jk-2605.svg",
    defaultSupplier: "中山综合服饰供应链有限公司",
    skuItems: [
      { sku: "HG-JK-2605-KH-M", imageUrl: "/mock/products/hg-jk-2605.svg", productName: "轻薄夹克", color: "卡其", size: "M", standardPurchasePrice: 112, actualPurchasePrice: 112, suggestedPurchaseQty: 900, actualPurchaseQty: 900, needBom: false },
      { sku: "HG-JK-2605-KH-L", imageUrl: "/mock/products/hg-jk-2605.svg", productName: "轻薄夹克", color: "卡其", size: "L", standardPurchasePrice: 112, actualPurchasePrice: 112, suggestedPurchaseQty: 800, actualPurchaseQty: 800, needBom: false },
      { sku: "HG-JK-2605-BK-L", imageUrl: "/mock/products/hg-jk-2605.svg", productName: "轻薄夹克", color: "黑色", size: "L", standardPurchasePrice: 116, actualPurchasePrice: 116, suggestedPurchaseQty: 700, actualPurchaseQty: 700, needBom: false },
    ],
  },
  {
    spu: "HG-SH-2607",
    productName: "商务衬衫",
    defaultSupplier: "广州华盛面料有限公司",
    skuItems: [
      { sku: "HG-SH-2607-WH-M", productName: "商务衬衫", color: "白色", size: "M", standardPurchasePrice: 49, actualPurchasePrice: 49, suggestedPurchaseQty: 700, actualPurchaseQty: 700, needBom: true },
      { sku: "HG-SH-2607-WH-L", productName: "商务衬衫", color: "白色", size: "L", standardPurchasePrice: 49, actualPurchasePrice: 49, suggestedPurchaseQty: 700, actualPurchaseQty: 700, needBom: true },
    ],
  },
];

const makeOrder = (
  id: number,
  orderNo: string,
  purchaseType: ProductPurchaseType,
  spu: ProductCatalogSpu,
  skuItems: ProductPurchaseSku[],
  status: ProductPurchaseStatus,
): ProductPurchaseOrder => {
  const normalizedItems = skuItems.map((item, index) => ({
    ...item,
    needBom: purchaseType === "做货",
    bomNo: purchaseType === "做货" ? item.bomNo ?? `BOM-${spu.spu}-${String(index + 1).padStart(2, "0")}` : "",
    bomVersion: purchaseType === "做货" ? item.bomVersion ?? "V1.0" : "",
    bomStatus: purchaseType === "做货" ? item.bomStatus ?? "已匹配" : "未匹配",
  }));
  const totalPurchaseQty = normalizedItems.reduce((sum, item) => sum + item.actualPurchaseQty, 0);
  const totalAmount = normalizedItems.reduce((sum, item) => sum + item.actualPurchaseQty * item.actualPurchasePrice, 0);
  const arrivedQty = status === "已到货" || status === "已入库" || status === "已完成" ? totalPurchaseQty : status === "已发货" ? Math.round(totalPurchaseQty * 0.35) : 0;
  const inboundQty = status === "已入库" || status === "已完成" ? arrivedQty : 0;
  const outboundQty = status === "已发货" || status === "已到货" || status === "已入库" || status === "已完成" ? Math.round(totalPurchaseQty * 0.2) : 0;
  const supplierType = purchaseType === "做货" ? "做货供应商" : purchaseType === "成衣" ? "成衣供应商" : "样衣供应商";
  const hasLogistics = status === "已发货" || status === "已到货" || status === "已入库" || status === "已完成" ? "是" : "否";
  const materialStatus = purchaseType === "做货" ? (id % 2 === 0 ? "已生成" : "未生成") : "不需要";
  const relatedMaterialAnalysisNo = materialStatus === "已生成" ? `MRA-2026-${String(id).padStart(4, "0")}` : "";

  return {
    id: `ppo-${String(id).padStart(3, "0")}`,
    orderNo,
    purchaseOrderNo: orderNo,
    purchaseType,
    spu: spu.spu,
    productName: spu.productName,
    imageUrl: spu.imageUrl,
    skuCount: normalizedItems.length,
    totalPurchaseQty,
    totalAmount,
    supplierName: spu.defaultSupplier,
    supplierContact: id % 2 === 0 ? "小林" : "周经理",
    supplierType,
    addressType: id % 3 === 0 ? "淘宝" : id % 3 === 1 ? "线下" : "拼多多",
    externalProductId: `EXT-${spu.spu}-${id}`,
    purchaseLink: `https://purchase.example.com/${spu.spu.toLowerCase()}`,
    supplierRemark: id % 4 === 0 ? "急单，需优先跟进" : id % 5 === 0 ? "需要转运" : "",
    purchaser: id % 2 === 0 ? "陈采购" : "王采购",
    targetWarehouse: id % 2 === 0 ? "印尼雅加达面辅料仓" : "中国广州中转仓",
    expectedArrivalDate: `2026-06-${String(14 + id).padStart(2, "0")}`,
    shippedAt: hasLogistics === "是" ? `2026-06-${String(8 + id).padStart(2, "0")}` : "",
    signedAt: arrivedQty > 0 ? `2026-06-${String(10 + id).padStart(2, "0")}` : "",
    auditTime: status === "待确认" || status === "已确认" || hasLogistics === "是" ? `2026-06-${String(5 + id).padStart(2, "0")} 14:30` : "",
    latestWarehouseTime: `2026-06-${String(20 + id).padStart(2, "0")}`,
    logisticsType: hasLogistics === "是" ? (id % 2 === 0 ? "快递" : "货代") : "",
    trackingNo: hasLogistics === "是" ? `TRK${String(202606000 + id)}` : "",
    isUrgent: id % 4 === 0 ? "是" : "否",
    isFirstOrder: id % 5 === 0 ? "是" : "否",
    isOverQty: totalPurchaseQty > 6000 ? "是" : "否",
    hasLogistics,
    hasTransferRecord: id % 3 === 0 ? "是" : "否",
    isCombinedOrder: id % 6 === 0 ? "是" : "否",
    region: id % 3 === 0 ? "印尼" : "国内",
    productionArea: id % 3 === 0 ? "印尼" : "国内",
    afterSaleStatus: id % 7 === 0 ? "售后中" : "正常",
    needBom: purchaseType === "做货" ? "是" : "否",
    materialStatus,
    relatedMaterialAnalysisNo,
    materialGeneratedAt: relatedMaterialAnalysisNo ? `2026-06-${String(10 + id).padStart(2, "0")} 09:20` : "",
    status,
    createdAt: `2026-06-${String(id).padStart(2, "0")} 10:00`,
    updatedAt: `2026-06-${String(id).padStart(2, "0")} 10:00`,
    operationLogs: relatedMaterialAnalysisNo ? [`生成面辅料需求分析：${relatedMaterialAnalysisNo}`] : [],
    systemRemark: id % 3 === 0 ? "系统自动标记需关注交期" : "",
    productRemark: normalizedItems[0]?.remark ?? "",
    purchaseRemark: purchaseType === "做货" ? "做货采购单，后续需拆解BOM生成面辅料需求。" : `${purchaseType}采购单，商品采购单本身即正式采购单。`,
    stockFlow: {
      purchaseQty: totalPurchaseQty,
      arrivedQty,
      outboundQty,
      inboundQty,
      waitingOutboundQty: Math.max(totalPurchaseQty - outboundQty, 0),
    },
    skuItems: normalizedItems,
  };
};

export const productPurchaseOrders: ProductPurchaseOrder[] = [
  makeOrder(1, "GP-2026-0001", "做货", productCatalogSpus[0], productCatalogSpus[0].skuItems, "待确认"),
  makeOrder(2, "GP-2026-0002", "做货", productCatalogSpus[1], productCatalogSpus[1].skuItems, "已确认"),
  makeOrder(3, "GP-2026-0003", "做货", productCatalogSpus[2], productCatalogSpus[2].skuItems, "待采购"),
  makeOrder(4, "GP-2026-0004", "做货", productCatalogSpus[3], productCatalogSpus[3].skuItems, "已发货"),
  makeOrder(5, "GP-2026-0005", "做货", productCatalogSpus[4], productCatalogSpus[4].skuItems, "草稿"),
  makeOrder(6, "GP-2026-0006", "做货", productCatalogSpus[0], productCatalogSpus[0].skuItems.slice(0, 2), "草稿"),
  makeOrder(7, "GP-2026-0007", "成衣", productCatalogSpus[3], productCatalogSpus[3].skuItems.slice(0, 1), "待确认"),
  makeOrder(8, "GP-2026-0008", "成衣", productCatalogSpus[1], productCatalogSpus[1].skuItems.slice(1, 2), "已入库"),
  makeOrder(9, "GP-2026-0009", "成衣", productCatalogSpus[0], productCatalogSpus[0].skuItems.slice(2, 3), "已发货"),
  makeOrder(10, "GP-2026-0010", "样衣", productCatalogSpus[0], [{ ...productCatalogSpus[0].skuItems[0], actualPurchaseQty: 8, suggestedPurchaseQty: 8, actualPurchasePrice: 78, standardPurchasePrice: 78 }], "草稿"),
  makeOrder(11, "GP-2026-0011", "样衣", productCatalogSpus[2], [{ ...productCatalogSpus[2].skuItems[0], actualPurchaseQty: 12, suggestedPurchaseQty: 12, actualPurchasePrice: 96, standardPurchasePrice: 96 }], "待确认"),
  makeOrder(12, "GP-2026-0012", "样衣", productCatalogSpus[4], [{ ...productCatalogSpus[4].skuItems[0], actualPurchaseQty: 10, suggestedPurchaseQty: 10, actualPurchasePrice: 68, standardPurchasePrice: 68 }], "已完成"),
];
