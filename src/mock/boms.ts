import type { Bom } from "../types/bom";

export const boms: Bom[] = [
  { id: "1", bomNo: "BOM-2026-0001", styleNo: "HG-TS-2601", sampleNo: "SAM-2026-0001", productName: "男款圆领T恤", version: "V1.2", itemCount: 5, owner: "版房A组", status: "已启用", createdAt: "2026-05-26 09:00", items: [{ materialCode: "FAB-2026-0001", materialName: "180g 纯棉针织布", category: "面料", usage: 1.45, unit: "米", lossRate: "3%" }, { materialCode: "ACC-2026-0003", materialName: "白色织唛", category: "辅料", usage: 1, unit: "个", lossRate: "2%" }] },
  { id: "2", bomNo: "BOM-2026-0002", styleNo: "HG-PT-2602", sampleNo: "SAM-2026-0002", productName: "女款休闲裤", version: "V1.0", itemCount: 7, owner: "版房B组", status: "已启用", createdAt: "2026-05-28 10:00", items: [{ materialCode: "ACC-2026-0001", materialName: "YKK 5号尼龙拉链", category: "辅料", usage: 1, unit: "条", lossRate: "2%" }] },
  { id: "3", bomNo: "BOM-2026-0003", styleNo: "HG-HD-2603", sampleNo: "SAM-2026-0003", productName: "连帽卫衣", version: "V0.9", itemCount: 8, owner: "版房A组", status: "草稿", createdAt: "2026-05-29 14:00", items: [] },
  { id: "4", bomNo: "BOM-2026-0004", styleNo: "HG-SK-2604", sampleNo: "SAM-2026-0004", productName: "女款半身裙", version: "V1.0", itemCount: 6, owner: "版房C组", status: "已启用", createdAt: "2026-05-30 11:00", items: [] },
  { id: "5", bomNo: "BOM-2026-0005", styleNo: "HG-JK-2605", sampleNo: "SAM-2026-0005", productName: "轻薄夹克", version: "V1.1", itemCount: 9, owner: "版房B组", status: "已启用", createdAt: "2026-06-01 09:30", items: [] },
  { id: "6", bomNo: "BOM-2026-0006", styleNo: "HG-DR-2606", sampleNo: "SAM-2026-0006", productName: "针织连衣裙", version: "V1.0", itemCount: 5, owner: "版房C组", status: "已停用", createdAt: "2026-06-01 10:30", items: [] },
  { id: "7", bomNo: "BOM-2026-0007", styleNo: "HG-SH-2607", sampleNo: "SAM-2026-0007", productName: "商务衬衫", version: "V1.0", itemCount: 8, owner: "版房A组", status: "已启用", createdAt: "2026-06-02 08:30", items: [] },
  { id: "8", bomNo: "BOM-2026-0008", styleNo: "HG-CT-2608", sampleNo: "SAM-2026-0008", productName: "风衣外套", version: "V0.8", itemCount: 11, owner: "版房B组", status: "草稿", createdAt: "2026-06-02 12:30", items: [] },
];
