import type { MaterialLogisticsRecord } from "../pages/material-purchase/MaterialPurchaseTracking";
import type { TransferBatch } from "../types/transferBatch";

export const createMockTransferBatches = (records: MaterialLogisticsRecord[]): TransferBatch[] => {
  const groups = [records.slice(0, 2), records.slice(2, 5), records.slice(5, 7)].filter((group) => group.length);
  const statuses: TransferBatch["status"][] = ["头程中", "已到仓", "已完成"];

  return groups.map((group, index) => ({
    batchNo: `TB-2026-${String(index + 1).padStart(4, "0")}`,
    batchName: index === 0 ? "广州空运第0608批" : index === 1 ? "深圳海运第0606批" : "义乌空运第0603批",
    transferCenter: index === 1 ? "深圳转运中心" : index === 2 ? "义乌转运中心" : "广州转运中心",
    destinationWarehouse: index === 2 ? "印尼泗水面辅料仓" : "印尼雅加达面辅料仓",
    carrier: index === 1 ? "海运拼柜" : "空运专线",
    creator: ["王采购", "李采购", "陈采购"][index],
    createdAt: ["2026-06-08 09:20", "2026-06-06 16:45", "2026-06-03 11:10"][index],
    plannedShipDate: ["2026-06-09", "2026-06-07", "2026-06-04"][index],
    actualShipDate: ["2026-06-09 10:15", "2026-06-07 14:30", "2026-06-04 09:40"][index],
    arrivedAt: index > 0 ? ["", "2026-06-08 18:20", "2026-06-06 15:35"][index] : undefined,
    status: statuses[index],
    remark: index === 0 ? "面辅料采购物流签收后统一空运，优先安排生产急料。" : index === 1 ? "海运拼柜，随附采购明细和装箱清单。" : "已完成到仓交接，等待后续入库。",
    records: group,
  }));
};
