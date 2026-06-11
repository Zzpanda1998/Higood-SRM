export type ProductPurchaseSuggestionSku = {
  sku: string;
  productName?: string;
  color: string;
  size: string;
  imageUrl?: string;
  codPaidQty?: number;
  nonCodPaidQty?: number;
  paidQty?: number;
  kolApplicationQty?: number;
  pendingDeliveryQty: number;
  realTimeStockQty?: number;
  stockQty: number;
  purchasingQty: number;
  transitQty: number;
  rawGapQty?: number;
  suggestedQty: number;
  status?: "待生成" | "已生成" | "无需采购" | "异常";
};

export type ProductPurchaseSuggestion = {
  id: string;
  suggestionNo: string;
  area: string;
  purchaseType: "做货" | "成衣" | "样衣";
  isProduction: "是" | "否";
  needProduction: boolean;
  imageUrl?: string;
  spu: string;
  mainSku: string;
  productName: string;
  skuCount: number;
  codPaidQty: number;
  nonCodPaidQty: number;
  totalPaidQty?: number;
  pendingDeliveryQty: number;
  rawGapQty?: number;
  suggestedQty: number;
  stockQty: number;
  purchasingQty: number;
  transitQty: number;
  defectiveQty: number;
  lastInboundAt: string;
  lastOutboundAt: string;
  paidAt: string;
  firstOrder: "是" | "否";
  productRemark?: string;
  status: "待生成" | "已生成" | "无需采购" | "异常";
  relatedPurchaseOrderNo?: string;
  creator: string;
  createdAt: string;
  updatedAt: string;
  skuItems: ProductPurchaseSuggestionSku[];
};

export const productPurchaseSuggestions: ProductPurchaseSuggestion[] = [
  {
    id: "1",
    suggestionNo: "PSG-2026-0001",
    area: "印尼",
    purchaseType: "做货",
    isProduction: "是",
    needProduction: true,
    imageUrl: "/mock/products/hg-ts-2601.svg",
    spu: "HG-TS-2601",
    mainSku: "HG-TS-2601-WH-M",
    productName: "男款圆领T恤",
    skuCount: 4,
    codPaidQty: 3200,
    nonCodPaidQty: 8800,
    pendingDeliveryQty: 12000,
    suggestedQty: 5800,
    stockQty: 2600,
    purchasingQty: 1800,
    transitQty: 1800,
    defectiveQty: 120,
    lastInboundAt: "2026-05-28",
    lastOutboundAt: "2026-06-02",
    paidAt: "2026-06-01",
    firstOrder: "否",
    productRemark: "618活动基础款补货",
    status: "待生成",
    creator: "系统计算",
    createdAt: "2026-06-01 09:00",
    updatedAt: "2026-06-06 09:15",
    skuItems: [
      { sku: "HG-TS-2601-WH-M", color: "白色", size: "M", pendingDeliveryQty: 3200, stockQty: 800, purchasingQty: 400, transitQty: 500, suggestedQty: 1500 },
      { sku: "HG-TS-2601-WH-L", color: "白色", size: "L", pendingDeliveryQty: 3600, stockQty: 900, purchasingQty: 500, transitQty: 500, suggestedQty: 1700 },
      { sku: "HG-TS-2601-BK-M", color: "黑色", size: "M", pendingDeliveryQty: 2800, stockQty: 400, purchasingQty: 500, transitQty: 400, suggestedQty: 1500 },
      { sku: "HG-TS-2601-BK-L", color: "黑色", size: "L", pendingDeliveryQty: 2400, stockQty: 500, purchasingQty: 400, transitQty: 400, suggestedQty: 1100 },
    ],
  },
  {
    id: "2",
    suggestionNo: "PSG-2026-0002",
    area: "印尼",
    purchaseType: "做货",
    isProduction: "是",
    needProduction: true,
    imageUrl: "/mock/products/hg-pt-2602.svg",
    spu: "HG-PT-2602",
    mainSku: "HG-PT-2602-BK-M",
    productName: "女款休闲裤",
    skuCount: 3,
    codPaidQty: 2100,
    nonCodPaidQty: 6400,
    pendingDeliveryQty: 8500,
    suggestedQty: 5200,
    stockQty: 1500,
    purchasingQty: 800,
    transitQty: 1000,
    defectiveQty: 80,
    lastInboundAt: "2026-05-25",
    lastOutboundAt: "2026-06-01",
    paidAt: "2026-05-31",
    firstOrder: "否",
    productRemark: "尺码M/L走量",
    status: "已生成",
    relatedPurchaseOrderNo: "GP-2026-0002",
    creator: "系统计算",
    createdAt: "2026-06-01 10:00",
    updatedAt: "2026-06-06 09:20",
    skuItems: [
      { sku: "HG-PT-2602-BK-M", color: "黑色", size: "M", pendingDeliveryQty: 3000, stockQty: 500, purchasingQty: 300, transitQty: 400, suggestedQty: 1800 },
      { sku: "HG-PT-2602-BK-L", color: "黑色", size: "L", pendingDeliveryQty: 3200, stockQty: 600, purchasingQty: 300, transitQty: 400, suggestedQty: 1900 },
      { sku: "HG-PT-2602-NV-M", color: "藏青", size: "M", pendingDeliveryQty: 2300, stockQty: 400, purchasingQty: 200, transitQty: 200, suggestedQty: 1500 },
    ],
  },
  {
    id: "3",
    suggestionNo: "PSG-2026-0003",
    area: "印尼",
    purchaseType: "做货",
    isProduction: "是",
    needProduction: true,
    imageUrl: "/mock/products/hg-hd-2603.svg",
    spu: "HG-HD-2603",
    mainSku: "HG-HD-2603-GY-M",
    productName: "连帽卫衣",
    skuCount: 4,
    codPaidQty: 1800,
    nonCodPaidQty: 4400,
    pendingDeliveryQty: 6200,
    suggestedQty: 3900,
    stockQty: 900,
    purchasingQty: 700,
    transitQty: 700,
    defectiveQty: 45,
    lastInboundAt: "2026-05-22",
    lastOutboundAt: "2026-05-30",
    paidAt: "2026-05-30",
    firstOrder: "否",
    status: "待生成",
    creator: "系统计算",
    createdAt: "2026-06-01 11:00",
    updatedAt: "2026-06-06 09:25",
    skuItems: [
      { sku: "HG-HD-2603-GY-M", color: "灰色", size: "M", pendingDeliveryQty: 1600, stockQty: 200, purchasingQty: 200, transitQty: 200, suggestedQty: 1000 },
      { sku: "HG-HD-2603-GY-L", color: "灰色", size: "L", pendingDeliveryQty: 1800, stockQty: 300, purchasingQty: 200, transitQty: 200, suggestedQty: 1100 },
      { sku: "HG-HD-2603-BK-M", color: "黑色", size: "M", pendingDeliveryQty: 1500, stockQty: 200, purchasingQty: 200, transitQty: 100, suggestedQty: 1000 },
      { sku: "HG-HD-2603-BK-L", color: "黑色", size: "L", pendingDeliveryQty: 1300, stockQty: 200, purchasingQty: 100, transitQty: 200, suggestedQty: 800 },
    ],
  },
  {
    id: "4",
    suggestionNo: "PSG-2026-0004",
    area: "印尼",
    purchaseType: "做货",
    isProduction: "是",
    needProduction: true,
    imageUrl: "/mock/products/hg-jk-2605.svg",
    spu: "HG-JK-2605",
    mainSku: "HG-JK-2605-KH-M",
    productName: "轻薄夹克",
    skuCount: 3,
    codPaidQty: 1300,
    nonCodPaidQty: 2900,
    pendingDeliveryQty: 4200,
    suggestedQty: 2600,
    stockQty: 500,
    purchasingQty: 600,
    transitQty: 500,
    defectiveQty: 20,
    lastInboundAt: "2026-05-26",
    lastOutboundAt: "2026-06-02",
    paidAt: "2026-06-01",
    firstOrder: "否",
    productRemark: "轻薄款补单",
    status: "已生成",
    relatedPurchaseOrderNo: "GP-2026-0004",
    creator: "系统计算",
    createdAt: "2026-06-02 08:30",
    updatedAt: "2026-06-06 09:30",
    skuItems: [
      { sku: "HG-JK-2605-KH-M", color: "卡其", size: "M", pendingDeliveryQty: 1600, stockQty: 200, purchasingQty: 200, transitQty: 200, suggestedQty: 1000 },
      { sku: "HG-JK-2605-KH-L", color: "卡其", size: "L", pendingDeliveryQty: 1500, stockQty: 200, purchasingQty: 200, transitQty: 200, suggestedQty: 900 },
      { sku: "HG-JK-2605-BK-L", color: "黑色", size: "L", pendingDeliveryQty: 1100, stockQty: 100, purchasingQty: 200, transitQty: 100, suggestedQty: 700 },
    ],
  },
  {
    id: "5",
    suggestionNo: "PSG-2026-0005",
    area: "中国",
    purchaseType: "做货",
    isProduction: "是",
    needProduction: true,
    imageUrl: "/mock/products/hg-ts-2601.svg",
    spu: "HG-SH-2607",
    mainSku: "HG-SH-2607-WH-M",
    productName: "商务衬衫",
    skuCount: 5,
    codPaidQty: 2200,
    nonCodPaidQty: 5000,
    pendingDeliveryQty: 7200,
    suggestedQty: 3200,
    stockQty: 2200,
    purchasingQty: 1200,
    transitQty: 600,
    defectiveQty: 35,
    lastInboundAt: "2026-05-18",
    lastOutboundAt: "2026-06-01",
    paidAt: "2026-06-01",
    firstOrder: "否",
    productRemark: "无图待补拍",
    status: "待生成",
    creator: "系统计算",
    createdAt: "2026-06-02 09:00",
    updatedAt: "2026-06-06 09:35",
    skuItems: [
      { sku: "HG-SH-2607-WH-M", color: "白色", size: "M", pendingDeliveryQty: 1500, stockQty: 500, purchasingQty: 200, transitQty: 100, suggestedQty: 700 },
      { sku: "HG-SH-2607-WH-L", color: "白色", size: "L", pendingDeliveryQty: 1600, stockQty: 500, purchasingQty: 300, transitQty: 100, suggestedQty: 700 },
      { sku: "HG-SH-2607-BU-M", color: "浅蓝", size: "M", pendingDeliveryQty: 1400, stockQty: 400, purchasingQty: 200, transitQty: 100, suggestedQty: 0 },
      { sku: "HG-SH-2607-BU-L", color: "浅蓝", size: "L", pendingDeliveryQty: 1500, stockQty: 400, purchasingQty: 300, transitQty: 150, suggestedQty: 0 },
      { sku: "HG-SH-2607-BU-XL", color: "浅蓝", size: "XL", pendingDeliveryQty: 1200, stockQty: 400, purchasingQty: 200, transitQty: 150, suggestedQty: 0 },
    ],
  },
  {
    id: "6",
    suggestionNo: "PSG-2026-0006",
    area: "印尼",
    purchaseType: "成衣",
    isProduction: "否",
    needProduction: false,
    imageUrl: "/mock/products/hg-pt-2602.svg",
    spu: "HG-GAR-2601",
    mainSku: "HG-GAR-2601-BK-M",
    productName: "女款休闲裤成衣",
    skuCount: 1,
    codPaidQty: 300,
    nonCodPaidQty: 900,
    pendingDeliveryQty: 1200,
    suggestedQty: 900,
    stockQty: 100,
    purchasingQty: 100,
    transitQty: 100,
    defectiveQty: 8,
    lastInboundAt: "2026-05-20",
    lastOutboundAt: "2026-06-02",
    paidAt: "2026-06-01",
    firstOrder: "是",
    status: "待生成",
    creator: "系统计算",
    createdAt: "2026-06-02 10:00",
    updatedAt: "2026-06-06 09:40",
    skuItems: [{ sku: "HG-GAR-2601-BK-M", color: "黑色", size: "M", pendingDeliveryQty: 1200, stockQty: 100, purchasingQty: 100, transitQty: 100, suggestedQty: 900 }],
  },
  {
    id: "7",
    suggestionNo: "PSG-2026-0007",
    area: "中国",
    purchaseType: "样衣",
    isProduction: "否",
    needProduction: false,
    imageUrl: "/mock/products/hg-ts-2601.svg",
    spu: "HG-SAM-2601",
    mainSku: "HG-SAM-2601-WH-M",
    productName: "男款圆领T恤样衣",
    skuCount: 1,
    codPaidQty: 0,
    nonCodPaidQty: 60,
    pendingDeliveryQty: 60,
    suggestedQty: 60,
    stockQty: 0,
    purchasingQty: 0,
    transitQty: 0,
    defectiveQty: 0,
    lastInboundAt: "-",
    lastOutboundAt: "-",
    paidAt: "2026-06-02",
    firstOrder: "是",
    productRemark: "样衣开发首单",
    status: "待生成",
    creator: "系统计算",
    createdAt: "2026-06-02 11:00",
    updatedAt: "2026-06-06 09:45",
    skuItems: [{ sku: "HG-SAM-2601-WH-M", color: "白色", size: "M", pendingDeliveryQty: 60, stockQty: 0, purchasingQty: 0, transitQty: 0, suggestedQty: 60 }],
  },
  {
    id: "8",
    suggestionNo: "PSG-2026-0008",
    area: "印尼",
    purchaseType: "做货",
    isProduction: "是",
    needProduction: true,
    imageUrl: "/mock/products/hg-jk-2605.svg",
    spu: "HG-SK-2604",
    mainSku: "HG-SK-2604-BG-M",
    productName: "女款半身裙",
    skuCount: 2,
    codPaidQty: 1200,
    nonCodPaidQty: 3800,
    pendingDeliveryQty: 5000,
    suggestedQty: 0,
    stockQty: 2800,
    purchasingQty: 1200,
    transitQty: 1000,
    defectiveQty: 18,
    lastInboundAt: "2026-05-29",
    lastOutboundAt: "2026-06-02",
    paidAt: "2026-06-01",
    firstOrder: "否",
    status: "无需采购",
    creator: "系统计算",
    createdAt: "2026-06-02 13:00",
    updatedAt: "2026-06-06 09:50",
    skuItems: [
      { sku: "HG-SK-2604-BG-M", color: "米色", size: "M", pendingDeliveryQty: 900, stockQty: 1400, purchasingQty: 600, transitQty: 600, suggestedQty: 0 },
      { sku: "HG-SK-2604-BG-L", color: "米色", size: "L", pendingDeliveryQty: 800, stockQty: 1400, purchasingQty: 600, transitQty: 400, suggestedQty: 0 },
    ],
  },
];

export function calculateRawGapQty(
  pendingDeliveryQty: number,
  kolApplicationQty: number,
  purchasingQty: number,
  realTimeStockQty: number,
) {
  return Math.max(0, pendingDeliveryQty + kolApplicationQty - purchasingQty - realTimeStockQty);
}

export function calculateSuggestedQty(
  pendingDeliveryQty: number,
  kolApplicationQty: number,
  purchasingQty: number,
  realTimeStockQty: number,
) {
  return Math.ceil(calculateRawGapQty(pendingDeliveryQty, kolApplicationQty, purchasingQty, realTimeStockQty) * 0.7);
}

function currentDateTime() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
}

export function createProductPurchaseSuggestions(): ProductPurchaseSuggestion[] {
  const updatedAt = currentDateTime();
  return productPurchaseSuggestions.map((row, rowIndex) => {
    let allocatedCodPaidQty = 0;
    let allocatedNonCodPaidQty = 0;
    const totalSkuPendingQty = row.skuItems.reduce((sum, item) => sum + item.pendingDeliveryQty, 0);
    const skuItems = row.skuItems.map((item, itemIndex) => {
      const kolApplicationQty = [18, 12, 8, 5, 3][(rowIndex + itemIndex) % 5];
      const realTimeStockQty = item.stockQty;
      const rawGapQty = calculateRawGapQty(item.pendingDeliveryQty, kolApplicationQty, item.purchasingQty, realTimeStockQty);
      const codPaidQty = itemIndex === row.skuItems.length - 1
        ? row.codPaidQty - allocatedCodPaidQty
        : Math.round(row.codPaidQty * (item.pendingDeliveryQty / totalSkuPendingQty));
      const nonCodPaidQty = itemIndex === row.skuItems.length - 1
        ? row.nonCodPaidQty - allocatedNonCodPaidQty
        : Math.round(row.nonCodPaidQty * (item.pendingDeliveryQty / totalSkuPendingQty));
      allocatedCodPaidQty += codPaidQty;
      allocatedNonCodPaidQty += nonCodPaidQty;
      const paidQty = codPaidQty + nonCodPaidQty;
      const suggestedQty = calculateSuggestedQty(
        item.pendingDeliveryQty,
        kolApplicationQty,
        item.purchasingQty,
        realTimeStockQty,
      );
      return {
        ...item,
        productName: row.productName,
        imageUrl: row.imageUrl,
        codPaidQty,
        nonCodPaidQty,
        paidQty,
        kolApplicationQty,
        realTimeStockQty,
        rawGapQty,
        suggestedQty,
        status: suggestedQty === 0 ? "无需采购" as const : row.status === "已生成" ? "已生成" as const : "待生成" as const,
      };
    });

    return {
      ...row,
      skuCount: skuItems.length,
      totalPaidQty: skuItems.reduce((sum, item) => sum + (item.paidQty ?? 0), 0),
      skuItems,
      pendingDeliveryQty: skuItems.reduce((sum, item) => sum + item.pendingDeliveryQty, 0),
      stockQty: skuItems.reduce((sum, item) => sum + (item.realTimeStockQty ?? 0), 0),
      purchasingQty: skuItems.reduce((sum, item) => sum + item.purchasingQty, 0),
      transitQty: skuItems.reduce((sum, item) => sum + item.transitQty, 0),
      rawGapQty: skuItems.reduce((sum, item) => sum + (item.rawGapQty ?? 0), 0),
      suggestedQty: skuItems.reduce((sum, item) => sum + item.suggestedQty, 0),
      updatedAt,
      status: skuItems.every((item) => item.suggestedQty === 0)
        ? "无需采购" as const
        : row.status === "已生成"
          ? "已生成" as const
          : "待生成" as const,
    };
  });
}

export function applyKolDemandQuantities(
  suggestions: ProductPurchaseSuggestion[],
  quantities: Map<string, number>,
): ProductPurchaseSuggestion[] {
  const updatedAt = currentDateTime();
  return suggestions.map((row) => {
    const skuItems = row.skuItems.map((item) => {
      const kolApplicationQty = quantities.get(item.sku) ?? 0;
      const rawGapQty = calculateRawGapQty(
        item.pendingDeliveryQty,
        kolApplicationQty,
        item.purchasingQty,
        item.realTimeStockQty ?? item.stockQty,
      );
      const suggestedQty = calculateSuggestedQty(
        item.pendingDeliveryQty,
        kolApplicationQty,
        item.purchasingQty,
        item.realTimeStockQty ?? item.stockQty,
      );
      return {
        ...item,
        kolApplicationQty,
        rawGapQty,
        suggestedQty,
        status: suggestedQty === 0 ? "无需采购" as const : row.status === "已生成" ? "已生成" as const : "待生成" as const,
      };
    });
    const suggestedQty = skuItems.reduce((sum, item) => sum + item.suggestedQty, 0);
    const rawGapQty = skuItems.reduce((sum, item) => sum + (item.rawGapQty ?? 0), 0);
    return {
      ...row,
      skuItems,
      totalPaidQty: skuItems.reduce((sum, item) => sum + (item.paidQty ?? 0), 0),
      rawGapQty,
      suggestedQty,
      updatedAt,
      status: suggestedQty === 0 ? "无需采购" as const : row.status === "已生成" ? "已生成" as const : "待生成" as const,
    };
  });
}
