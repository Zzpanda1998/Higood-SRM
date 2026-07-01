import type { LogisticsFeeDetail, LogisticsFeeItem, LogisticsReconciliationRow } from "../types/finance";

export const logisticsFeeItems: LogisticsFeeItem[] = ["头程运费", "头程物流费", "关税", "增值税", "清关费", "附加费", "报关费"];

export const calculateLogisticsTotal = (fee: Omit<LogisticsFeeDetail, "totalFee" | "feeType"> | LogisticsFeeDetail) =>
  (fee.freightFee ?? 0) +
  (fee.firstLegLogisticsFee ?? 0) +
  (fee.customsDutyFee ?? 0) +
  (fee.vatFee ?? 0) +
  (fee.clearanceFee ?? 0) +
  (fee.additionalFee ?? 0) +
  (fee.customsDeclarationFee ?? 0);

const fee = (
  feeType: "预计" | "实际",
  values: Partial<Omit<LogisticsFeeDetail, "feeType" | "totalFee">>,
): LogisticsFeeDetail => {
  const detail = { feeType, currency: "RMB" as const, ...values, totalFee: 0 };
  return { ...detail, totalFee: calculateLogisticsTotal(detail) };
};

const itemStatus = (confirmed: LogisticsFeeItem[] = []) =>
  logisticsFeeItems.map((feeItem) => ({ feeItem, confirmed: confirmed.includes(feeItem), confirmedBy: confirmed.includes(feeItem) ? "王采购" : undefined, confirmedAt: confirmed.includes(feeItem) ? "2026-06-10 16:30" : undefined }));

const seeds: Array<Omit<LogisticsReconciliationRow, "id" | "firstLegNo" | "differenceAmount" | "confirmedItems"> & { confirmed?: LogisticsFeeItem[] }> = [
  { logisticsNo: "LOG-202606-0001", forwarderName: "DHL Global Forwarding", waybillNo: "DHL-CN-882011", shipmentId: "SHP-ID-260601", channel: "东南亚专线", forwarderChannelName: "DHL Express Worldwide", destination: "雅加达仓", status: "待确认", transportMethod: "空运", shippedAt: "2026-06-01", expectedSignedAt: "2026-06-06", actualSignedAt: "2026-06-06", signedQty: 1280, remark: "面辅料空运", estimatedFee: fee("预计", { freightFee: 1581, firstLegLogisticsFee: 1581, customsDutyFee: 420, vatFee: 210, clearanceFee: 180 }), actualFee: fee("实际", { freightFee: 1660, firstLegLogisticsFee: 1581, customsDutyFee: 460, vatFee: 210, clearanceFee: 180, additionalFee: 95 }), confirmStatus: "未确认" },
  { logisticsNo: "LOG-202606-0002", forwarderName: "Maersk Logistics", waybillNo: "MSK-992001", shipmentId: "SHP-ID-260602", channel: "海运拼箱", forwarderChannelName: "Maersk LCL", destination: "泗水仓", status: "部分确认", transportMethod: "海运", shippedAt: "2026-05-24", expectedSignedAt: "2026-06-15", signedQty: 3500, remark: "整柜拼箱", estimatedFee: fee("预计", { freightFee: 944, firstLegLogisticsFee: 3200, customsDutyFee: 820, vatFee: 410, clearanceFee: 260, customsDeclarationFee: 180 }), actualFee: fee("实际", { freightFee: 944, firstLegLogisticsFee: 3100, customsDutyFee: 800, vatFee: 410, clearanceFee: 260, customsDeclarationFee: 180 }), confirmStatus: "部分确认", confirmed: ["头程运费", "头程物流费"] },
  { logisticsNo: "LOG-202606-0003", forwarderName: "DHL Global Forwarding", waybillNo: "DHL-260603", channel: "国际快递", forwarderChannelName: "DHL Express", destination: "广州中转仓", status: "待确认", transportMethod: "快递", shippedAt: "2026-06-03", expectedSignedAt: "2026-06-05", actualSignedAt: "2026-06-05", signedQty: 420, estimatedFee: fee("预计", { freightFee: 315, firstLegLogisticsFee: 315 }), confirmStatus: "未确认" },
  { logisticsNo: "LOG-202606-0004", forwarderName: "广州城际国际货运", waybillNo: "HHA-260604", shipmentId: "SHP-ID-260604", channel: "印尼空运", forwarderChannelName: "空运普货", destination: "万隆仓", status: "已确认", transportMethod: "空运", shippedAt: "2026-05-30", expectedSignedAt: "2026-06-05", actualSignedAt: "2026-06-05", signedQty: 980, estimatedFee: fee("预计", { freightFee: 1260, firstLegLogisticsFee: 1260, customsDutyFee: 360, vatFee: 180, clearanceFee: 160 }), actualFee: fee("实际", { freightFee: 1260, firstLegLogisticsFee: 1260, customsDutyFee: 360, vatFee: 180, clearanceFee: 160 }), confirmStatus: "已确认", confirmed: logisticsFeeItems, confirmedBy: "王采购", confirmedAt: "2026-06-06 10:20" },
  { logisticsNo: "LOG-202606-0005", forwarderName: "广州城际国际货运", waybillNo: "GZ260605", channel: "头程陆运", forwarderChannelName: "陆运快线", destination: "深圳头程仓", status: "待确认", transportMethod: "陆运", shippedAt: "2026-06-05", expectedSignedAt: "2026-06-08", actualSignedAt: "2026-06-08", signedQty: 720, estimatedFee: fee("预计", { firstLegLogisticsFee: 680, additionalFee: 50 }), actualFee: fee("实际", { firstLegLogisticsFee: 620, additionalFee: 35 }), confirmStatus: "未确认" },
  { logisticsNo: "LOG-202606-0006", forwarderName: "Pacific Customs Broker", waybillNo: "PCB-260606", shipmentId: "SHP-ID-260606", channel: "税费清关", forwarderChannelName: "Jakarta Clearance", destination: "雅加达仓", status: "待确认", transportMethod: "空运", shippedAt: "2026-06-02", expectedSignedAt: "2026-06-09", signedQty: 640, estimatedFee: fee("预计", { customsDutyFee: 880, vatFee: 430, clearanceFee: 280, additionalFee: 120, customsDeclarationFee: 200 }), actualFee: fee("实际", { customsDutyFee: 930, vatFee: 430, clearanceFee: 300, additionalFee: 160, customsDeclarationFee: 200 }), confirmStatus: "未确认" },
  { logisticsNo: "LOG-202606-0007", forwarderName: "速航国际物流", waybillNo: "KY260607001", channel: "国际快运", forwarderChannelName: "当天达", destination: "广州中转仓", status: "已确认", transportMethod: "快递", shippedAt: "2026-06-07", expectedSignedAt: "2026-06-07", actualSignedAt: "2026-06-07", signedQty: 180, estimatedFee: fee("预计", { freightFee: 420 }), actualFee: fee("实际", { freightFee: 420 }), confirmStatus: "已确认", confirmed: logisticsFeeItems, confirmedBy: "李采购", confirmedAt: "2026-06-08 09:10" },
  { logisticsNo: "LOG-202606-0008", forwarderName: "海拓国际物流", waybillNo: "SYO-260608", shipmentId: "SHP-ID-260608", channel: "海运整柜", forwarderChannelName: "FCL 40HQ", destination: "泗水仓", status: "待确认", transportMethod: "海运", shippedAt: "2026-05-18", expectedSignedAt: "2026-06-18", signedQty: 8200, estimatedFee: fee("预计", { freightFee: 5300, firstLegLogisticsFee: 5300, customsDutyFee: 1250, vatFee: 625, clearanceFee: 380, additionalFee: 260, customsDeclarationFee: 220 }), confirmStatus: "未确认" },
  { logisticsNo: "LOG-202606-0009", forwarderName: "星舰国际物流", waybillNo: "JDVA26060901", channel: "国际快递", forwarderChannelName: "特惠送", destination: "义乌中转仓", status: "部分确认", transportMethod: "快递", shippedAt: "2026-06-08", expectedSignedAt: "2026-06-10", actualSignedAt: "2026-06-10", signedQty: 260, estimatedFee: fee("预计", { freightFee: 280, additionalFee: 25 }), actualFee: fee("实际", { freightFee: 300, additionalFee: 25 }), confirmStatus: "部分确认", confirmed: ["附加费"] },
  { logisticsNo: "LOG-202606-0010", forwarderName: "DHL Global Forwarding", waybillNo: "FDX-260610", shipmentId: "SHP-ID-260610", channel: "国际快递", forwarderChannelName: "DHL Global Forwarding International Priority", destination: "巴厘岛仓", status: "待确认", transportMethod: "空运", shippedAt: "2026-06-09", expectedSignedAt: "2026-06-13", signedQty: 350, estimatedFee: fee("预计", { freightFee: 2100, firstLegLogisticsFee: 2100, customsDutyFee: 520, vatFee: 260, clearanceFee: 190, additionalFee: 85, customsDeclarationFee: 150 }), actualFee: fee("实际", { freightFee: 2020, firstLegLogisticsFee: 2050, customsDutyFee: 500, vatFee: 260, clearanceFee: 190, additionalFee: 70, customsDeclarationFee: 150 }), confirmStatus: "未确认" },
];

export const initialLogisticsReconciliationRows: LogisticsReconciliationRow[] = seeds.map((row, index) => ({
  ...row,
  id: `log-rec-${index + 1}`,
  firstLegNo: index === 1 ? "ID20260608C" : `TB-2026-${String(index + 1).padStart(4, "0")}`,
  differenceAmount: row.actualFee ? row.actualFee.totalFee - row.estimatedFee.totalFee : undefined,
  confirmedItems: itemStatus(row.confirmed),
}));
