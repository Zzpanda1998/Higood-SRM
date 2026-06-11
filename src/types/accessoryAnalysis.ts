export type AccessoryRequirementStatus = "待分析" | "已分析" | "已确认" | "已转采购单" | "异常";

export interface AccessoryRequirementAnalysis {
  id: string;
  analysisNo: string;
  garmentPlanNo: string;
  bomNo: string;
  styleNo: string;
  productName: string;
  accessoryKinds: number;
  requiredQty: number;
  shortageQty: number;
  suggestedSupplier: string;
  status: AccessoryRequirementStatus;
  creator: string;
  createdAt: string;
}
