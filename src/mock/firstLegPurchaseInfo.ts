export type FirstLegPurchaseInfo = {
  purchaseNo: string;
  purchaseType: string;
  sku: string;
  itemName: string;
  quantity: string;
  amount: number;
  currency: "CNY" | "USD" | "IDR";
  purchaser: string;
  purchasedAt: string;
  supplier: string;
  status: string;
};

export type FirstLegInfo = {
  firstLegNo: string;
  provider: string;
  channel: string;
  transportMethod: string;
  status: string;
  purchases: FirstLegPurchaseInfo[];
};

export const firstLegPurchaseInfoMap: Record<string, FirstLegInfo> = {
  "TB-2026-0004": {
    firstLegNo: "TB-2026-0004",
    provider: "广州城际国际货运",
    channel: "空运普货",
    transportMethod: "空派",
    status: "已签收",
    purchases: [
      {
        purchaseNo: "ID-MP-2026-0001",
        purchaseType: "面料采购",
        sku: "FAB-2026-0001",
        itemName: "180g纯棉针织布",
        quantity: "7,750米",
        amount: 1395,
        currency: "CNY",
        purchaser: "张三",
        purchasedAt: "2026-06-01",
        supplier: "广州华盛面料有限公司",
        status: "已入库",
      },
      {
        purchaseNo: "ID-MP-2026-0002",
        purchaseType: "辅料采购",
        sku: "ACC-2026-0002",
        itemName: "白色纽扣",
        quantity: "3,352个",
        amount: 201.12,
        currency: "CNY",
        purchaser: "李四",
        purchasedAt: "2026-06-02",
        supplier: "东莞宏远辅料有限公司",
        status: "已入库",
      },
      {
        purchaseNo: "ID-MP-2026-0003",
        purchaseType: "包材采购",
        sku: "PKG-2026-0004",
        itemName: "五层出口纸箱",
        quantity: "1,200个",
        amount: 3120,
        currency: "CNY",
        purchaser: "王五",
        purchasedAt: "2026-06-03",
        supplier: "苏州恒润包装材料有限公司",
        status: "已入库",
      },
    ],
  },
};

export const getFirstLegPurchaseInfo = (firstLegNo?: string) =>
  firstLegNo ? firstLegPurchaseInfoMap[firstLegNo] : undefined;
