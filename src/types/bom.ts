export type BomStatus = "草稿" | "已启用" | "已停用";

export interface BomItem {
  materialCode: string;
  materialName: string;
  category: string;
  usage: number;
  unit: string;
  lossRate: string;
}

export interface Bom {
  id: string;
  bomNo: string;
  styleNo: string;
  sampleNo: string;
  productName: string;
  version: string;
  itemCount: number;
  owner: string;
  status: BomStatus;
  createdAt: string;
  items: BomItem[];
}
