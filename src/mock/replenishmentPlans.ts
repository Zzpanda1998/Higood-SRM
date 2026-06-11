import type { ReplenishmentPlan } from "../types/procurementPlan";

export const replenishmentPlans: ReplenishmentPlan[] = [
  { id: "1", planNo: "RP-2026-0001", materialCategory: "面料", materialName: "180g 纯棉针织布", targetWarehouse: "印尼雅加达面辅料仓", plannedQty: 12000, unit: "米", demandDate: "2026-06-12", recommendedSupplier: "广州华盛面料有限公司", status: "已转采购单", creator: "王采购", createdAt: "2026-06-01 09:10", remark: "T恤基础面料补货" },
  { id: "2", planNo: "RP-2026-0002", materialCategory: "纱线", materialName: "32S 棉纱", targetWarehouse: "印尼万隆加工仓", plannedQty: 6500, unit: "公斤", demandDate: "2026-06-15", recommendedSupplier: "宁波恒源纱线有限公司", status: "已确认", creator: "李采购", createdAt: "2026-06-01 10:20" },
  { id: "3", planNo: "RP-2026-0003", materialCategory: "包材", materialName: "五层出口纸箱", targetWarehouse: "印尼泗水成衣仓", plannedQty: 30000, unit: "个", demandDate: "2026-06-18", recommendedSupplier: "苏州恒润包装材料有限公司", status: "待确认", creator: "陈采购", createdAt: "2026-06-02 08:30" },
  { id: "4", planNo: "RP-2026-0004", materialCategory: "耗材", materialName: "防潮珠", targetWarehouse: "中国深圳集货仓", plannedQty: 20000, unit: "包", demandDate: "2026-06-20", recommendedSupplier: "中山综合服饰供应链有限公司", status: "草稿", creator: "王采购", createdAt: "2026-06-02 09:00" },
  { id: "5", planNo: "RP-2026-0005", materialCategory: "面料", materialName: "220g 涤棉卫衣布", targetWarehouse: "印尼雅加达面辅料仓", plannedQty: 9000, unit: "米", demandDate: "2026-06-21", recommendedSupplier: "绍兴锦达纺织有限公司", status: "已转采购单", creator: "王采购", createdAt: "2026-06-02 10:10" },
  { id: "6", planNo: "RP-2026-0006", materialCategory: "辅料", materialName: "白色织唛", targetWarehouse: "印尼万隆加工仓", plannedQty: 50000, unit: "个", demandDate: "2026-06-22", recommendedSupplier: "东莞宏远辅料有限公司", status: "已确认", creator: "李采购", createdAt: "2026-06-02 11:20" },
  { id: "7", planNo: "RP-2026-0007", materialCategory: "包材", materialName: "40x60cm 透明胶袋", targetWarehouse: "印尼泗水成衣仓", plannedQty: 42000, unit: "个", demandDate: "2026-06-25", recommendedSupplier: "深圳优品包材有限公司", status: "待确认", creator: "陈采购", createdAt: "2026-06-02 13:00" },
  { id: "8", planNo: "RP-2026-0008", materialCategory: "耗材", materialName: "机针耗材包", targetWarehouse: "印尼万隆加工仓", plannedQty: 300, unit: "包", demandDate: "2026-06-28", recommendedSupplier: "中山综合服饰供应链有限公司", status: "已关闭", creator: "王采购", createdAt: "2026-06-02 15:30" },
];
