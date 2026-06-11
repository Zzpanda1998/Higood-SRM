import type { GarmentPurchasePlan } from "../types/procurementPlan";

export const garmentPurchasePlans: GarmentPurchasePlan[] = [
  { id: "1", planNo: "GP-2026-0001", styleNo: "HG-TS-2601", productName: "男款圆领T恤", season: "2026夏", brand: "HiGood", orderQty: 12000, deliveryDate: "2026-07-10", targetFactory: "印尼万隆加工厂", bomNo: "BOM-2026-0001", status: "已生成辅料需求", creator: "赵计划", createdAt: "2026-06-01 09:30" },
  { id: "2", planNo: "GP-2026-0002", styleNo: "HG-PT-2602", productName: "女款休闲裤", season: "2026秋", brand: "HiGood", orderQty: 8500, deliveryDate: "2026-07-18", targetFactory: "印尼泗水成衣厂", bomNo: "BOM-2026-0002", status: "已匹配BOM", creator: "赵计划", createdAt: "2026-06-01 10:40" },
  { id: "3", planNo: "GP-2026-0003", styleNo: "HG-HD-2603", productName: "连帽卫衣", season: "2026秋", brand: "HiGood", orderQty: 6200, deliveryDate: "2026-07-26", targetFactory: "印尼万隆加工厂", status: "已确认", creator: "周计划", createdAt: "2026-06-02 08:20" },
  { id: "4", planNo: "GP-2026-0004", styleNo: "HG-SK-2604", productName: "女款半身裙", season: "2026秋", brand: "HiGood", orderQty: 5000, deliveryDate: "2026-07-30", targetFactory: "印尼雅加达样衣仓", status: "草稿", creator: "周计划", createdAt: "2026-06-02 09:15" },
  { id: "5", planNo: "GP-2026-0005", styleNo: "HG-JK-2605", productName: "轻薄夹克", season: "2026秋", brand: "HiGood", orderQty: 4200, deliveryDate: "2026-08-05", targetFactory: "印尼泗水成衣厂", bomNo: "BOM-2026-0005", status: "已生成辅料需求", creator: "赵计划", createdAt: "2026-06-02 11:00" },
  { id: "6", planNo: "GP-2026-0006", styleNo: "HG-ST-2606", productName: "样衣开发单", season: "2027春", brand: "HiGood", orderQty: 80, deliveryDate: "2026-06-25", targetFactory: "杭州样衣开发中心", status: "已关闭", creator: "周计划", createdAt: "2026-06-02 14:00" },
];
