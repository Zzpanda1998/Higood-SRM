import type { AccessoryRequirementAnalysis } from "../types/accessoryAnalysis";

export const accessoryRequirementAnalysis: AccessoryRequirementAnalysis[] = [
  { id: "1", analysisNo: "ARA-2026-0001", garmentPlanNo: "GP-2026-0001", bomNo: "BOM-2026-0001", styleNo: "HG-TS-2601", productName: "男款圆领T恤", accessoryKinds: 3, requiredQty: 36000, shortageQty: 18000, suggestedSupplier: "东莞宏远辅料有限公司", status: "已转采购单", creator: "李采购", createdAt: "2026-06-01 14:00" },
  { id: "2", analysisNo: "ARA-2026-0002", garmentPlanNo: "GP-2026-0002", bomNo: "BOM-2026-0002", styleNo: "HG-PT-2602", productName: "女款休闲裤", accessoryKinds: 5, requiredQty: 42500, shortageQty: 26000, suggestedSupplier: "东莞宏远辅料有限公司", status: "已确认", creator: "李采购", createdAt: "2026-06-01 15:00" },
  { id: "3", analysisNo: "ARA-2026-0003", garmentPlanNo: "GP-2026-0003", bomNo: "BOM-2026-0003", styleNo: "HG-HD-2603", productName: "连帽卫衣", accessoryKinds: 6, requiredQty: 37200, shortageQty: 24000, suggestedSupplier: "泉州瑞达服装辅料有限公司", status: "已分析", creator: "王采购", createdAt: "2026-06-02 09:00" },
  { id: "4", analysisNo: "ARA-2026-0004", garmentPlanNo: "GP-2026-0004", bomNo: "BOM-2026-0004", styleNo: "HG-SK-2604", productName: "女款半身裙", accessoryKinds: 4, requiredQty: 20000, shortageQty: 12000, suggestedSupplier: "东莞宏远辅料有限公司", status: "待分析", creator: "王采购", createdAt: "2026-06-02 10:30" },
  { id: "5", analysisNo: "ARA-2026-0005", garmentPlanNo: "GP-2026-0005", bomNo: "BOM-2026-0005", styleNo: "HG-JK-2605", productName: "轻薄夹克", accessoryKinds: 7, requiredQty: 29400, shortageQty: 18000, suggestedSupplier: "苏州恒润包装材料有限公司", status: "已转采购单", creator: "陈采购", createdAt: "2026-06-02 13:20" },
  { id: "6", analysisNo: "ARA-2026-0006", garmentPlanNo: "GP-2026-0006", bomNo: "BOM-2026-0008", styleNo: "HG-ST-2606", productName: "样衣开发单", accessoryKinds: 2, requiredQty: 160, shortageQty: 160, suggestedSupplier: "杭州样衣开发中心", status: "异常", creator: "陈采购", createdAt: "2026-06-02 15:20" },
];
