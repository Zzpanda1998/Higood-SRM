export type MaterialRequirementAnalysisStatus = "待分析" | "已分析" | "已确认" | "已下推" | "已关闭" | string;
export type MaterialRequirementPushStatus = "未下推" | "部分下推" | "已下推";
export type MaterialCategory = "面料" | "辅料" | "包材" | "耗材" | "纱线";

export type MaterialRequirementAnalysisSku = {
  sku: string;
  color: string;
  size: string;
  purchaseQty: number;
  bomNo: string;
  bomVersion: string;
  bomStatus: "已匹配" | "未匹配";
};

export type MaterialRequirementAnalysisDetail = {
  materialCode: string;
  materialName: string;
  materialImageUrl?: string;
  specification?: string;
  category: MaterialCategory;
  usagePart?: string;
  sourceSku?: string;
  skuPurchaseQty?: number;
  usage?: number;
  unitUsage?: number;
  lossRate: string;
  bomDemandQty: number;
  bomRequiredQty?: number;
  stockQty: number;
  historicalMaterialStock?: number;
  idHistoricalMaterialStock?: number;
  purchasingQty: number;
  suggestedPurchaseQty: number;
  unit?: string;
  suggestedSupplier: string;
  targetWarehouse?: string;
  isPushed?: "是" | "否";
  exceptionFlag?: string;
  excluded?: boolean;
};

export type MaterialRequirementPushRecord = {
  idPurchaseNo: string;
  supplier: string;
  category: MaterialCategory | "混合";
  targetWarehouse: string;
  materialLineCount: number;
  pushQty: number;
  pushedAt: string;
  operator: string;
};

export type MaterialRequirementAnalysisOrder = {
  analysisNo: string;
  sourceProductOrderNo: string;
  sourcePurchaseType?: "做货";
  spu: string;
  productName: string;
  imageUrl?: string;
  skuCount: number;
  totalPurchaseQty?: number;
  supplierName?: string;
  targetWarehouse?: string;
  expectedArrivalDate?: string;
  productionArea?: "国内" | "印尼" | "其他";
  purchaseOwner?: string;
  applicant?: string;
  regions?: string[];
  productionFactory?: string;
  isOverQuantity?: "是" | "否";
  latestWarehouseDate?: string;
  purchaseSource?: string;
  supplierType?: string;
  purchaseDate?: string;
  printingStatus?: string;
  cuttingStatus?: string;
  cuttingArrivalDate?: string;
  productType?: string;
  hasIdMaterialOrder?: "是" | "否";
  isKolSampleOrder?: "是" | "否";
  logisticsNo?: string;
  logisticsStatus?: string;
  remark?: string;
  arrivedProductQty?: number;
  shippedProductQty?: number;
  waitingShipmentProductQty?: number;
  bomNo: string;
  bomVersion?: string;
  bomStatus?: "已启用" | "停用" | "草稿";
  bomSnapshotTime?: string;
  isBomSnapshot?: "是" | "否";
  materialKinds: number;
  bomDemandQty: number;
  stockQty: number;
  purchasingQty: number;
  suggestedPurchaseQty: number;
  pushStatus?: MaterialRequirementPushStatus;
  idPurchaseNos?: string[];
  hasGap?: "是" | "否";
  hasException?: "是" | "否";
  isSupplierMatched?: "是" | "否";
  status: MaterialRequirementAnalysisStatus;
  creator?: string;
  createdAt?: string;
  updatedAt?: string;
  skuItems?: MaterialRequirementAnalysisSku[];
  detailItems: MaterialRequirementAnalysisDetail[];
  pushRecords?: MaterialRequirementPushRecord[];
  operationLogs?: string[];
};

const sku = (spu: string, suffix: string, color: string, size: string, qty: number, bomNo: string, bomVersion = "V1.0"): MaterialRequirementAnalysisSku => ({
  sku: `${spu}-${suffix}`,
  color,
  size,
  purchaseQty: qty,
  bomNo,
  bomVersion,
  bomStatus: "已匹配",
});

const detail = (
  materialCode: string,
  materialName: string,
  category: MaterialCategory,
  usagePart: string,
  sourceSku: string,
  skuPurchaseQty: number,
  unitUsage: number,
  lossRate: string,
  stockQty: number,
  purchasingQty: number,
  unit: string,
  suggestedSupplier: string,
  targetWarehouse: string,
  isPushed: "是" | "否" = "否",
  exceptionFlag = "",
): MaterialRequirementAnalysisDetail => {
  const rate = Number(lossRate.replace("%", "")) / 100;
  const bomDemandQty = Number((skuPurchaseQty * unitUsage * (1 + rate)).toFixed(2));
  return {
    materialCode,
    materialName,
    specification: `${unitUsage}${unit}/件 · ${lossRate}损耗`,
    category,
    usagePart,
    sourceSku,
    skuPurchaseQty,
    usage: unitUsage,
    unitUsage,
    lossRate,
    bomDemandQty,
    bomRequiredQty: bomDemandQty,
    stockQty,
    historicalMaterialStock: Math.max(stockQty + Math.round(skuPurchaseQty * 0.18), 0),
    idHistoricalMaterialStock: Math.max(Math.round(stockQty * 0.65), 0),
    purchasingQty,
    suggestedPurchaseQty: Math.max(Number((bomDemandQty - stockQty - purchasingQty).toFixed(2)), 0),
    unit,
    suggestedSupplier,
    targetWarehouse,
    isPushed,
    exceptionFlag,
  };
};

const materialRequirementAnalysisBase: MaterialRequirementAnalysisOrder[] = [
  {
    analysisNo: "MRA-2026-0001",
    sourceProductOrderNo: "GP-2026-0001",
    sourcePurchaseType: "做货",
    spu: "HG-TS-2601",
    productName: "男款圆领T恤",
    imageUrl: "/mock/products/hg-ts-2601.svg",
    skuCount: 4,
    totalPurchaseQty: 7600,
    supplierName: "佛山成衣加工厂",
    targetWarehouse: "印尼雅加达面辅料仓",
    expectedArrivalDate: "2026-06-15",
    productionArea: "国内",
    purchaseOwner: "王采购",
    bomNo: "BOM-2026-0001",
    bomVersion: "V1.0",
    bomStatus: "已启用",
    bomSnapshotTime: "2026-06-02 09:20",
    isBomSnapshot: "是",
    materialKinds: 5,
    bomDemandQty: 22239.2,
    stockQty: 4750,
    purchasingQty: 2150,
    suggestedPurchaseQty: 15309.2,
    pushStatus: "已下推",
    idPurchaseNos: ["ID-MP-2026-0001", "ID-MP-2026-0002"],
    hasGap: "是",
    hasException: "否",
    isSupplierMatched: "是",
    status: "已下推",
    creator: "王采购",
    createdAt: "2026-06-02 09:20",
    updatedAt: "2026-06-02 16:30",
    skuItems: [
      sku("HG-TS-2601", "WH-M", "白色", "M", 2000, "BOM-2026-0001"),
      sku("HG-TS-2601", "WH-L", "白色", "L", 2200, "BOM-2026-0001"),
      sku("HG-TS-2601", "BK-M", "黑色", "M", 1900, "BOM-2026-0001"),
      sku("HG-TS-2601", "BK-L", "黑色", "L", 1500, "BOM-2026-0001"),
    ],
    detailItems: [
      { ...detail("FAB-2026-0001", "180g纯棉针织布", "面料", "大身", "HG-TS-2601-WH-M、HG-TS-2601-WH-L、HG-TS-2601-BK-M、HG-TS-2601-BK-L", 7600, 1.45, "3%", 2400, 1200, "米", "广州华盛面料有限公司", "印尼雅加达面辅料仓", "是") },
      { ...detail("ACC-2026-0002", "白色织唛", "辅料", "唛头", "HG-TS-2601-WH-M、HG-TS-2601-WH-L", 4200, 1, "2%", 2600, 800, "个", "东莞宏远辅料有限公司", "印尼雅加达面辅料仓", "是") },
      { ...detail("ACC-2026-0003", "黑色洗水唛", "辅料", "唛头", "HG-TS-2601-BK-M、HG-TS-2601-BK-L", 3400, 1, "2%", 900, 300, "个", "东莞宏远辅料有限公司", "印尼雅加达面辅料仓", "是") },
      { ...detail("PKG-2026-0001", "五层外箱", "包材", "包装", "HG-TS-2601-WH-M、HG-TS-2601-WH-L、HG-TS-2601-BK-M、HG-TS-2601-BK-L", 7600, 0.02, "1%", 80, 40, "个", "佛山顺联包装材料厂", "印尼雅加达面辅料仓", "是") },
      { ...detail("CON-2026-0001", "40S缝纫线", "耗材", "缝制", "HG-TS-2601-WH-M、HG-TS-2601-WH-L、HG-TS-2601-BK-M、HG-TS-2601-BK-L", 7600, 0.06, "5%", 90, 30, "卷", "绍兴锦达纺织有限公司", "印尼雅加达面辅料仓", "是") },
    ],
    pushRecords: [
      { idPurchaseNo: "ID-MP-2026-0001", supplier: "广州华盛面料有限公司", category: "面料", targetWarehouse: "印尼雅加达面辅料仓", materialLineCount: 1, pushQty: 8422, pushedAt: "2026-06-02 16:30", operator: "王采购" },
      { idPurchaseNo: "ID-MP-2026-0002", supplier: "东莞宏远辅料有限公司", category: "辅料", targetWarehouse: "印尼雅加达面辅料仓", materialLineCount: 2, pushQty: 5788, pushedAt: "2026-06-02 16:30", operator: "王采购" },
    ],
    operationLogs: ["生成面辅料需求分析", "采购确认分析", "下推面辅料采购单"],
  },
  {
    analysisNo: "MRA-2026-0002",
    sourceProductOrderNo: "GP-2026-0002",
    sourcePurchaseType: "做货",
    spu: "HG-PT-2602",
    productName: "女款休闲裤",
    imageUrl: "/mock/products/hg-pt-2602.svg",
    skuCount: 3,
    totalPurchaseQty: 6200,
    supplierName: "佛山成衣加工厂",
    targetWarehouse: "印尼雅加达面辅料仓",
    expectedArrivalDate: "2026-06-16",
    productionArea: "国内",
    purchaseOwner: "陈采购",
    bomNo: "BOM-2026-0002",
    bomVersion: "V1.1",
    bomStatus: "已启用",
    bomSnapshotTime: "2026-06-03 10:00",
    isBomSnapshot: "是",
    materialKinds: 7,
    bomDemandQty: 14534,
    stockQty: 1600,
    purchasingQty: 900,
    suggestedPurchaseQty: 11994,
    pushStatus: "未下推",
    idPurchaseNos: [],
    hasGap: "是",
    hasException: "否",
    isSupplierMatched: "是",
    status: "已分析",
    creator: "陈采购",
    createdAt: "2026-06-03 10:00",
    updatedAt: "2026-06-03 10:00",
    skuItems: [
      sku("HG-PT-2602", "BK-S", "黑色", "S", 1800, "BOM-2026-0002", "V1.1"),
      sku("HG-PT-2602", "BK-M", "黑色", "M", 2600, "BOM-2026-0002", "V1.1"),
      sku("HG-PT-2602", "BK-L", "黑色", "L", 1800, "BOM-2026-0002", "V1.1"),
    ],
    detailItems: [
      detail("FAB-2026-0101", "弹力斜纹布", "面料", "裤身", "HG-PT-2602-BK-S、HG-PT-2602-BK-M、HG-PT-2602-BK-L", 6200, 1.65, "4%", 1200, 500, "米", "广州华盛面料有限公司", "印尼雅加达面辅料仓"),
      detail("ACC-2026-0102", "树脂纽扣", "辅料", "门襟", "HG-PT-2602-BK-S、HG-PT-2602-BK-M、HG-PT-2602-BK-L", 6200, 1, "2%", 300, 200, "个", "东莞宏远辅料有限公司", "印尼雅加达面辅料仓"),
      detail("ACC-2026-0103", "黑色拉链", "辅料", "门襟", "HG-PT-2602-BK-S、HG-PT-2602-BK-M、HG-PT-2602-BK-L", 6200, 1, "2%", 100, 200, "条", "泉州瑞达服装辅料有限公司", "印尼雅加达面辅料仓"),
    ],
    pushRecords: [],
    operationLogs: ["生成面辅料需求分析"],
  },
  {
    analysisNo: "MRA-2026-0003",
    sourceProductOrderNo: "GP-2026-0003",
    sourcePurchaseType: "做货",
    spu: "HG-HD-2603",
    productName: "连帽卫衣",
    imageUrl: "/mock/products/hg-hd-2603.svg",
    skuCount: 4,
    totalPurchaseQty: 4600,
    supplierName: "绍兴锦达纺织有限公司",
    targetWarehouse: "中国广州中转仓",
    expectedArrivalDate: "2026-06-17",
    productionArea: "印尼",
    purchaseOwner: "王采购",
    bomNo: "BOM-2026-0003",
    bomVersion: "V2.0",
    bomStatus: "已启用",
    bomSnapshotTime: "2026-06-04 11:15",
    isBomSnapshot: "是",
    materialKinds: 8,
    bomDemandQty: 8600,
    stockQty: 900,
    purchasingQty: 700,
    suggestedPurchaseQty: 7000,
    pushStatus: "未下推",
    hasGap: "是",
    hasException: "是",
    isSupplierMatched: "否",
    status: "待分析",
    creator: "王采购",
    createdAt: "2026-06-04 11:15",
    skuItems: [
      sku("HG-HD-2603", "GY-M", "灰色", "M", 1200, "BOM-2026-0003", "V2.0"),
      sku("HG-HD-2603", "GY-L", "灰色", "L", 1400, "BOM-2026-0003", "V2.0"),
      sku("HG-HD-2603", "NV-M", "藏青", "M", 1000, "BOM-2026-0003", "V2.0"),
      { ...sku("HG-HD-2603", "NV-L", "藏青", "L", 1000, "BOM-2026-0003", "V2.0"), bomStatus: "未匹配" },
    ],
    detailItems: [
      detail("FAB-2026-0201", "抓绒卫衣布", "面料", "大身", "HG-HD-2603-GY-M、HG-HD-2603-GY-L、HG-HD-2603-NV-M", 3600, 1.9, "5%", 700, 400, "米", "绍兴锦达纺织有限公司", "中国广州中转仓", "否", "缺BOM"),
      detail("ACC-2026-0202", "帽绳", "辅料", "帽口", "HG-HD-2603-GY-M、HG-HD-2603-GY-L、HG-HD-2603-NV-M", 3600, 1, "2%", 200, 100, "根", "", "中国广州中转仓", "否", "缺供应商"),
    ],
    pushRecords: [],
    operationLogs: ["生成面辅料需求分析", "发现SKU未匹配BOM"],
  },
  {
    analysisNo: "MRA-2026-0004",
    sourceProductOrderNo: "GP-2026-0004",
    sourcePurchaseType: "做货",
    spu: "HG-JK-2605",
    productName: "轻薄夹克",
    imageUrl: "/mock/products/hg-jk-2605.svg",
    skuCount: 3,
    totalPurchaseQty: 2400,
    supplierName: "中山综合服饰供应链有限公司",
    targetWarehouse: "中国深圳集货仓",
    expectedArrivalDate: "2026-06-18",
    productionArea: "国内",
    purchaseOwner: "陈采购",
    bomNo: "BOM-2026-0004",
    bomVersion: "V1.0",
    bomStatus: "已启用",
    bomSnapshotTime: "2026-06-05 09:10",
    isBomSnapshot: "是",
    materialKinds: 9,
    bomDemandQty: 5400,
    stockQty: 800,
    purchasingQty: 600,
    suggestedPurchaseQty: 4000,
    pushStatus: "部分下推",
    idPurchaseNos: ["ID-MP-2026-0005"],
    hasGap: "是",
    hasException: "否",
    isSupplierMatched: "是",
    status: "已确认",
    creator: "陈采购",
    createdAt: "2026-06-05 09:10",
    detailItems: [
      { ...detail("FAB-2026-0301", "轻薄防风布", "面料", "大身", "HG-JK-2605-KH-M、HG-JK-2605-KH-L", 1700, 1.6, "4%", 800, 600, "米", "中山综合服饰供应链有限公司", "中国深圳集货仓", "是") },
      detail("PKG-2026-0302", "独立包装袋", "包材", "包装", "HG-JK-2605-KH-M、HG-JK-2605-KH-L、HG-JK-2605-BK-L", 2400, 1, "1%", 200, 100, "个", "深圳优品包材有限公司", "中国深圳集货仓"),
    ],
    pushRecords: [
      { idPurchaseNo: "ID-MP-2026-0005", supplier: "中山综合服饰供应链有限公司", category: "面料", targetWarehouse: "中国深圳集货仓", materialLineCount: 1, pushQty: 1428, pushedAt: "2026-06-05 15:00", operator: "陈采购" },
    ],
    operationLogs: ["生成面辅料需求分析", "采购确认分析", "部分下推面辅料采购单"],
  },
  {
    analysisNo: "MRA-2026-0005",
    sourceProductOrderNo: "GP-2026-0005",
    sourcePurchaseType: "做货",
    spu: "HG-SH-2607",
    productName: "商务衬衫",
    skuCount: 2,
    totalPurchaseQty: 1400,
    supplierName: "广州华盛面料有限公司",
    targetWarehouse: "中国广州中转仓",
    expectedArrivalDate: "2026-06-19",
    productionArea: "国内",
    purchaseOwner: "赵采购",
    bomNo: "BOM-2026-0005",
    bomVersion: "V1.0",
    bomStatus: "已启用",
    bomSnapshotTime: "2026-06-06 10:30",
    isBomSnapshot: "是",
    materialKinds: 8,
    bomDemandQty: 6600,
    stockQty: 2100,
    purchasingQty: 1200,
    suggestedPurchaseQty: 3300,
    pushStatus: "未下推",
    hasGap: "是",
    hasException: "否",
    isSupplierMatched: "是",
    status: "已分析",
    creator: "赵采购",
    createdAt: "2026-06-06 10:30",
    detailItems: [
      detail("FAB-2026-0401", "白色府绸", "面料", "大身", "HG-SH-2607-WH-M、HG-SH-2607-WH-L", 1400, 1.55, "3%", 500, 200, "米", "广州华盛面料有限公司", "中国广州中转仓"),
      detail("ACC-2026-0402", "贝壳扣", "辅料", "门襟", "HG-SH-2607-WH-M、HG-SH-2607-WH-L", 1400, 7, "2%", 3600, 1200, "个", "东莞宏远辅料有限公司", "中国广州中转仓"),
    ],
    pushRecords: [],
    operationLogs: ["生成面辅料需求分析"],
  },
  {
    analysisNo: "MRA-2026-0006",
    sourceProductOrderNo: "GP-2026-0006",
    sourcePurchaseType: "做货",
    spu: "HG-CT-2608",
    productName: "风衣外套",
    skuCount: 4,
    totalPurchaseQty: 3200,
    supplierName: "杭州样衣开发中心",
    targetWarehouse: "印尼万隆加工仓",
    expectedArrivalDate: "2026-06-20",
    productionArea: "印尼",
    purchaseOwner: "李采购",
    bomNo: "BOM-2026-0007",
    bomVersion: "V0.9",
    bomStatus: "草稿",
    bomSnapshotTime: "2026-06-07 14:20",
    isBomSnapshot: "是",
    materialKinds: 11,
    bomDemandQty: 4900,
    stockQty: 500,
    purchasingQty: 300,
    suggestedPurchaseQty: 4100,
    pushStatus: "未下推",
    hasGap: "是",
    hasException: "是",
    isSupplierMatched: "否",
    status: "待分析",
    creator: "李采购",
    createdAt: "2026-06-07 14:20",
    detailItems: [
      detail("FAB-2026-0501", "防泼水风衣布", "面料", "大身", "HG-CT-2608-KH-M、HG-CT-2608-KH-L", 3200, 1.8, "5%", 500, 300, "米", "", "印尼万隆加工仓", "否", "缺供应商"),
    ],
    pushRecords: [],
    operationLogs: ["生成面辅料需求分析", "BOM版本仍为草稿"],
  },
];

const regions = [["ID"], ["CN", "ID"], ["CN"], ["ID", "MY"]];
const factories = ["佛山成衣加工厂", "东莞合作做货厂", "绍兴针织工厂"];
const supplierTypes = ["面料供应商", "辅料供应商", "综合供应商"];
const productTypes = ["常规做货", "返单", "新品"];

export const materialRequirementAnalysis: MaterialRequirementAnalysisOrder[] = materialRequirementAnalysisBase.map((row, index) => {
  const total = row.totalPurchaseQty ?? 0;
  const pushed = row.pushStatus === "已下推";
  return {
    ...row,
    applicant: row.creator ?? row.purchaseOwner ?? "采购员",
    regions: regions[index % regions.length],
    productionFactory: factories[index % factories.length],
    isOverQuantity: index % 4 === 2 ? "是" : "否",
    latestWarehouseDate: row.expectedArrivalDate,
    purchaseSource: `商品采购单 ${row.sourceProductOrderNo}`,
    supplierType: supplierTypes[index % supplierTypes.length],
    purchaseDate: row.createdAt,
    printingStatus: index % 3 === 0 ? "已完成" : "无需印花",
    cuttingStatus: index % 2 === 0 ? "已裁片" : "待裁片",
    cuttingArrivalDate: row.expectedArrivalDate,
    productType: productTypes[index % productTypes.length],
    hasIdMaterialOrder: pushed ? "是" : "否",
    isKolSampleOrder: index % 5 === 4 ? "是" : "否",
    logisticsNo: pushed ? `SF202606${String(index + 1).padStart(4, "0")}` : "",
    logisticsStatus: pushed ? "运输中" : "待发货",
    remark: index % 2 === 0 ? "按采购计划优先安排主料" : "辅料齐套后统一发货",
    arrivedProductQty: Math.floor(total * (pushed ? 0.65 : 0.2)),
    shippedProductQty: Math.floor(total * (pushed ? 0.8 : 0.35)),
    waitingShipmentProductQty: Math.max(0, total - Math.floor(total * (pushed ? 0.8 : 0.35))),
  };
});
