import { idMaterialPurchaseOrders } from "./idMaterialPurchaseOrders";

export const materialPurchaseTracking = idMaterialPurchaseOrders.map((item, index) => ({
  trackingNo: `MPT-2026-${String(index + 1).padStart(4, "0")}`,
  idOrderNo: item.idOrderNo,
  sourceProductOrderNo: item.sourceProductOrderNo,
  materialName: item.materialName,
  supplier: item.supplier,
  buyer: item.buyer,
  orderDate: item.orderDate,
  internalConfirmTime: index % 2 === 0 ? "2026-06-04 10:00" : "-",
  estimatedShipDate: "2026-06-08",
  actualShipDate: item.status === "已发货" || item.status === "在途" || item.status === "已到仓" || item.status === "已入库" ? "2026-06-07" : "-",
  transportNode: item.transportNode,
  status: item.status,
  abnormalFlag: item.status === "待确认" ? "内部未确认" : "-",
  updatedAt: "2026-06-04 15:00",
}));
