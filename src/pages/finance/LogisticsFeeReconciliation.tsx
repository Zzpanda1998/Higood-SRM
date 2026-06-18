import { useMemo, useState, type ChangeEvent } from "react";
import { Check, Download, FileSpreadsheet, Pencil, Plus, Search, SlidersHorizontal, Upload } from "lucide-react";
import DesignLogicCard from "../../components/common/DesignLogicCard";
import FormModal from "../../components/common/FormModal";
import PageHeader from "../../components/common/PageHeader";
import Toast from "../../components/common/Toast";
import {
  calculateLogisticsTotal,
  initialLogisticsReconciliationRows,
  logisticsFeeItems,
} from "../../mock/logisticsReconciliation";
import type {
  LogisticsFeeDetail,
  LogisticsFeeItem,
  LogisticsReconciliationRow,
} from "../../types/finance";
import { parseExcelRows } from "../../utils/excelImport";

type FeeKey =
  | "freightFee"
  | "domesticLogisticsFee"
  | "firstLegLogisticsFee"
  | "customsDutyFee"
  | "vatFee"
  | "clearanceFee"
  | "additionalFee"
  | "customsDeclarationFee";

type ImportRow = {
  rowNo: number;
  firstLegNo: string;
  values: Partial<Record<FeeKey, number>>;
  remark: string;
  errors: string[];
};

type FeeDraft = {
  rowId: string;
  estimatedFee: Record<FeeKey, string>;
  actualFee: Record<FeeKey, string>;
  errors: string[];
};

const feeColumns: Array<{ key: FeeKey; label: LogisticsFeeItem }> = [
  { key: "freightFee", label: "运费" },
  { key: "domesticLogisticsFee", label: "国内物流费" },
  { key: "firstLegLogisticsFee", label: "头程物流费" },
  { key: "customsDutyFee", label: "关税" },
  { key: "vatFee", label: "增值税" },
  { key: "clearanceFee", label: "清关费" },
  { key: "additionalFee", label: "附加费" },
  { key: "customsDeclarationFee", label: "报关费" },
];

const importHeaders = ["头程物流单号", "运单号", "货件号", "头程物流商", ...feeColumns.map((item) => item.label), "备注"];
const money = (value?: number) => (value ?? 0).toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const inputClass = "h-8 w-full rounded border border-gray-200 px-2 text-sm outline-none focus:border-blue-500";
const feeKeys = feeColumns.map((column) => column.key);
const firstLegCarrierOptions = [
  "星舰国际物流",
  "广州城际国际货运",
  "海拓国际物流",
  "速航国际物流",
  "DHL Global Forwarding",
  "Maersk Logistics",
  "顺丰速运",
  "德邦物流",
  "Pacific Customs Broker",
];

function normalizeFeeValue(value: unknown): number {
  if (value === null || value === undefined || value === "" || value === "-" || value === "-(-)") return 0;
  const numberValue = Number(String(value).replace(/,/g, ""));
  return Number.isFinite(numberValue) ? numberValue : 0;
}

const completeFee = (feeType: "预计" | "实际", fee?: Partial<LogisticsFeeDetail>): LogisticsFeeDetail => {
  const detail = {
    feeType,
    currency: fee?.currency ?? "RMB",
    remark: fee?.remark,
    totalFee: 0,
    ...Object.fromEntries(feeKeys.map((key) => [key, normalizeFeeValue(fee?.[key])])),
  } as LogisticsFeeDetail;
  detail.totalFee = calculateLogisticsTotal(detail);
  return detail;
};

const statusClass = (status: string) => {
  if (status === "已确认") return "bg-emerald-50 text-emerald-700";
  if (status === "部分确认") return "bg-amber-50 text-amber-700";
  return "bg-blue-50 text-blue-700";
};

const downloadTemplate = () => {
  const sample = ["TB-2026-0001", "DHL-CN-882011", "SHP-ID-260601", "DHL Global Forwarding", "1660", "260", "1581", "460", "210", "180", "95", "0", "头程物流商账单"];
  const html = `<!doctype html><html><head><meta charset="utf-8"></head><body><table><tr>${importHeaders.map((item) => `<th>${item}</th>`).join("")}</tr><tr>${sample.map((item) => `<td>${item}</td>`).join("")}</tr></table></body></html>`;
  const url = URL.createObjectURL(new Blob([html], { type: "application/vnd.ms-excel;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "物流实际费用导入模板.xls";
  link.click();
  URL.revokeObjectURL(url);
};

const exportRows = (rows: LogisticsReconciliationRow[]) => {
  const headers = ["头程物流单号", "头程物流商", "运单号", "状态", "预计总费用", "实际总费用", "差异"];
  const body = rows.map((row) => [
    row.firstLegNo,
    row.forwarderName ?? "",
    row.waybillNo ?? "",
    row.confirmStatus,
    row.estimatedFee.totalFee,
    row.actualFee?.totalFee ?? "",
    row.differenceAmount ?? "",
  ]);
  const csv = [headers, ...body].map((line) => line.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\r\n");
  const url = URL.createObjectURL(new Blob([`\ufeff${csv}`], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "物流费用对账.csv";
  link.click();
  URL.revokeObjectURL(url);
};

function FeeCell({
  row,
  feeKey,
  draft,
  onChange,
}: {
  row: LogisticsReconciliationRow;
  feeKey: FeeKey;
  draft: FeeDraft | null;
  onChange: (kind: "estimatedFee" | "actualFee", key: FeeKey, value: string) => void;
}) {
  const estimated = normalizeFeeValue(row.estimatedFee[feeKey]);
  const actual = normalizeFeeValue(row.actualFee?.[feeKey]);
  const changed = actual !== estimated;
  const editing = draft?.rowId === row.id;
  const input = (kind: "estimatedFee" | "actualFee", label: string) => {
    const errorKey = `${kind}.${feeKey}`;
    return (
      <div className="flex h-7 items-center gap-1">
        <span className={`w-7 shrink-0 rounded px-1 text-[10px] ${kind === "estimatedFee" ? "bg-slate-100 text-gray-500" : "bg-blue-50 text-blue-600"}`}>{label}</span>
        <input
          className={`h-6 w-[70px] rounded border px-1 text-right text-xs outline-none ${draft?.errors.includes(errorKey) ? "border-red-500 bg-red-50" : "border-gray-300 focus:border-blue-500"}`}
          inputMode="decimal"
          value={draft?.[kind][feeKey] ?? "0"}
          onChange={(event) => onChange(kind, feeKey, event.target.value)}
        />
      </div>
    );
  };
  return (
    <td className="min-w-[106px] border-l border-gray-100 px-2 py-1.5 text-right align-top">
      {editing ? <>
        {input("estimatedFee", "预计")}
        <div className="mt-1 border-t border-dashed border-gray-200 pt-1">{input("actualFee", "实际")}</div>
      </> : <>
      <div className="flex h-6 items-center justify-between gap-2 text-xs text-gray-500">
        <span className="rounded bg-slate-100 px-1 text-[10px]">预计</span>
        <span>{money(estimated)}</span>
      </div>
      <div className={`mt-1 flex h-6 items-center justify-between gap-2 border-t border-dashed border-gray-200 pt-1 text-xs font-medium ${changed ? "text-orange-600" : "text-gray-900"}`}>
        <span className={`rounded px-1 text-[10px] ${actual == null ? "bg-gray-100 text-gray-400" : "bg-blue-50 text-blue-600"}`}>实际</span>
        <span>{money(actual)}</span>
      </div>
      </>}
    </td>
  );
}

export default function LogisticsFeeReconciliation({
  onOpenFirstLeg,
  onCreatePaymentRequest,
}: {
  onOpenFirstLeg: (firstLegNo: string) => void;
  onCreatePaymentRequest: (rows: LogisticsReconciliationRow[]) => void;
}) {
  const [rows, setRows] = useState<LogisticsReconciliationRow[]>(() => initialLogisticsReconciliationRows.map((row) => ({
    ...row,
    estimatedFee: completeFee("预计", row.estimatedFee),
    actualFee: completeFee("实际", row.actualFee),
    differenceAmount: row.actualFee ? completeFee("实际", row.actualFee).totalFee - completeFee("预计", row.estimatedFee).totalFee : 0,
  })));
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState("");
  const [transportMethod, setTransportMethod] = useState("");
  const [forwarder, setForwarder] = useState("");
  const [toast, setToast] = useState("");
  const [editing, setEditing] = useState<FeeDraft | null>(null);
  const [confirming, setConfirming] = useState<LogisticsReconciliationRow | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [importRows, setImportRows] = useState<ImportRow[]>([]);
  const [importFileName, setImportFileName] = useState("");
  const [importing, setImporting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2600);
  };

  const filteredRows = useMemo(() => rows.filter((row) => {
    const text = `${row.firstLegNo}${row.logisticsNo}${row.forwarderName ?? ""}${row.waybillNo ?? ""}${row.shipmentId ?? ""}${row.destination ?? ""}`.toLowerCase();
    return (!keyword || text.includes(keyword.toLowerCase()))
      && (!status || row.confirmStatus === status)
      && (!transportMethod || row.transportMethod === transportMethod)
      && (!forwarder || row.forwarderName === forwarder);
  }), [forwarder, keyword, rows, status, transportMethod]);

  const stats = useMemo(() => ({
    total: filteredRows.length,
    estimated: filteredRows.reduce((sum, row) => sum + row.estimatedFee.totalFee, 0),
    actual: filteredRows.reduce((sum, row) => sum + (row.actualFee?.totalFee ?? 0), 0),
    pending: filteredRows.filter((row) => row.confirmStatus !== "已确认").length,
    difference: filteredRows.reduce((sum, row) => sum + (row.actualFee?.totalFee ?? 0), 0) - filteredRows.reduce((sum, row) => sum + row.estimatedFee.totalFee, 0),
  }), [filteredRows]);

  const startEditing = (row: LogisticsReconciliationRow) => {
    if (editing && editing.rowId !== row.id) return showToast("请先保存或取消当前编辑");
    setEditing({
      rowId: row.id,
      estimatedFee: Object.fromEntries(feeKeys.map((key) => [key, String(normalizeFeeValue(row.estimatedFee[key]))])) as Record<FeeKey, string>,
      actualFee: Object.fromEntries(feeKeys.map((key) => [key, String(normalizeFeeValue(row.actualFee?.[key]))])) as Record<FeeKey, string>,
      errors: [],
    });
  };

  const saveEditing = () => {
    if (!editing) return;
    const errors: string[] = [];
    const parseLayer = (kind: "estimatedFee" | "actualFee") => Object.fromEntries(feeKeys.map((key) => {
      const raw = editing[kind][key].trim().replace(/,/g, "");
      const value = raw === "" ? 0 : Number(raw);
      if (!Number.isFinite(value)) errors.push(`${kind}.${key}`);
      else if (value < 0) errors.push(`${kind}.${key}`);
      return [key, Number.isFinite(value) && value >= 0 ? value : 0];
    })) as Record<FeeKey, number>;
    const estimatedValues = parseLayer("estimatedFee");
    const actualValues = parseLayer("actualFee");
    if (errors.length) {
      setEditing((current) => current ? { ...current, errors } : current);
      return showToast(errors.some((key) => {
        const [kind, feeKey] = key.split(".") as ["estimatedFee" | "actualFee", FeeKey];
        return Number(String(editing[kind][feeKey]).replace(/,/g, "")) < 0;
      }) ? "费用不能小于 0" : "费用必须为数字");
    }
    setRows((current) => current.map((row) => {
      if (row.id !== editing.rowId) return row;
      const estimatedFee = completeFee("预计", { ...row.estimatedFee, ...estimatedValues });
      const actualFee = completeFee("实际", { ...row.actualFee, ...actualValues });
      return { ...row, estimatedFee, actualFee, differenceAmount: actualFee.totalFee - estimatedFee.totalFee };
    }));
    setEditing(null);
    showToast("保存成功");
  };

  const updateFee = (kind: "estimatedFee" | "actualFee", key: FeeKey, value: string) => {
    setEditing((current) => current ? {
      ...current,
      [kind]: { ...current[kind], [key]: value },
      errors: current.errors.filter((error) => error !== `${kind}.${key}`),
    } : current);
  };

  const confirmAll = (row: LogisticsReconciliationRow) => {
    if (editing) return showToast("请先保存或取消当前编辑");
    const message = (row.actualFee?.totalFee ?? 0) === 0
      ? "当前头程物流单尚未录入实际费用，是否只确认预计费用？"
      : "确认该头程物流费用无误？";
    if (!window.confirm(message)) return;
    setRows((current) => current.map((item) => item.id === row.id ? {
      ...item,
      status: "已确认",
      confirmStatus: "已确认",
      confirmedItems: item.confirmedItems.map((feeItem) => ({ ...feeItem, confirmed: true, confirmedBy: "张三", confirmedAt: "2026-06-11 10:00" })),
      confirmedBy: "张三",
      confirmedAt: "2026-06-11 10:00",
    } : item));
    showToast(`已确认 ${row.firstLegNo} 全部费用`);
  };

  const savePartialConfirmation = () => {
    if (!confirming) return;
    const confirmedCount = confirming.confirmedItems.filter((item) => item.confirmed).length;
    const confirmStatus = confirmedCount === logisticsFeeItems.length ? "已确认" : confirmedCount > 0 ? "部分确认" : "未确认";
    setRows((current) => current.map((row) => row.id === confirming.id ? {
      ...confirming,
      status: confirmStatus === "未确认" ? "待确认" : confirmStatus,
      confirmStatus,
      confirmedBy: confirmStatus === "已确认" ? "张三" : undefined,
      confirmedAt: confirmStatus === "已确认" ? "2026-06-11 10:00" : undefined,
    } : row));
    setConfirming(null);
    showToast(`已保存分项确认，共确认 ${confirmedCount} 项费用`);
  };

  const parseImportFile = async (file: File) => {
    setImporting(true);
    setImportFileName(file.name);
    try {
      const rawRows = await parseExcelRows(file);
      const headers = rawRows[0]?.map((cell) => cell.trim()) ?? [];
      const logisticsIndex = headers.indexOf("头程物流单号");
      const remarkIndex = headers.indexOf("备注");
      const feeIndexes = feeColumns.map((column) => ({ ...column, index: headers.indexOf(column.label) }));
      const existing = new Set(rows.map((row) => row.firstLegNo));
      const seen = new Set<string>();
      const preview = rawRows.slice(1).filter((line) => line.some((cell) => cell.trim())).map((line, index) => {
        const firstLegNo = line[logisticsIndex]?.trim() ?? "";
        const errors: string[] = [];
        const values: Partial<Record<FeeKey, number>> = {};
        if (!firstLegNo) errors.push("头程物流单号为空");
        else if (!existing.has(firstLegNo)) errors.push("系统中不存在该头程物流单");
        else if (seen.has(firstLegNo)) errors.push("头程物流单号重复");
        seen.add(firstLegNo);
        feeIndexes.forEach(({ key, label, index: cellIndex }) => {
          const raw = cellIndex < 0 ? "" : line[cellIndex]?.trim() ?? "";
          const cleaned = raw.replace(/,/g, "");
          const value = raw === "" ? 0 : Number(cleaned);
          if (!Number.isFinite(value) || value < 0) errors.push(`${label}格式错误`);
          else values[key] = value;
        });
        return { rowNo: index + 2, firstLegNo, values, remark: remarkIndex >= 0 ? line[remarkIndex]?.trim() ?? "" : "", errors };
      });
      setImportRows(preview);
      showToast(`已解析 ${preview.length} 条实际费用`);
    } catch (error) {
      setImportRows([]);
      showToast(error instanceof Error ? error.message : "文件解析失败");
    } finally {
      setImporting(false);
    }
  };

  const confirmImport = () => {
    if (!importRows.length) return showToast("请先上传费用文件");
    if (importRows.some((row) => row.errors.length)) return showToast("存在校验错误，请修正文件后重新上传");
    const importMap = new Map(importRows.map((row) => [row.firstLegNo, row]));
    setRows((current) => current.map((row) => {
      const imported = importMap.get(row.firstLegNo);
      if (!imported) return row;
      const actualFee = completeFee("实际", { currency: row.estimatedFee.currency ?? "RMB", ...imported.values, remark: imported.remark });
      return { ...row, actualFee, differenceAmount: actualFee.totalFee - row.estimatedFee.totalFee };
    }));
    showToast(`成功导入 ${importRows.length} 个物流单的实际费用`);
    setImportRows([]);
    setImportFileName("");
    setImportOpen(false);
  };

  const clearFilters = () => {
    if (editing) return showToast("当前有未保存费用，请先保存或取消当前编辑");
    setKeyword("");
    setStatus("");
    setTransportMethod("");
    setForwarder("");
    setSelectedIds([]);
  };

  const requestableRows = filteredRows.filter((row) => row.confirmStatus === "已确认");
  const selectedRequestableRows = filteredRows.filter((row) => selectedIds.includes(row.id) && row.confirmStatus === "已确认");
  const toggleSelected = (row: LogisticsReconciliationRow, checked: boolean) => {
    if (row.confirmStatus !== "已确认") return showToast("未完成对账的记录不能生成请款单");
    setSelectedIds((current) => checked ? [...current, row.id] : current.filter((id) => id !== row.id));
  };
  const generatePaymentRequest = (targetRows: LogisticsReconciliationRow[]) => {
    if (!targetRows.length) return showToast("请先选择已完成对账的记录");
    onCreatePaymentRequest(targetRows);
  };

  return (
    <div>
      <PageHeader
        title="物流费用对账"
        desc="按头程物流单集中核对预计费用与头程物流商实际费用，支持行内编辑、分项确认和 Excel 导入"
        extra={<div className="flex gap-2">
          <button className="inline-flex h-8 items-center gap-1 rounded border border-blue-200 bg-blue-50 px-3 text-sm text-blue-700 hover:bg-blue-100" onClick={() => generatePaymentRequest(selectedRequestableRows)}><Plus size={14} />生成请款单{selectedRequestableRows.length ? `(${selectedRequestableRows.length})` : ""}</button>
          <button className="inline-flex h-8 items-center gap-1 rounded border border-gray-200 bg-white px-3 text-sm text-gray-700 hover:bg-gray-50" onClick={() => exportRows(filteredRows)}><Download size={14} />导出</button>
          <button className="inline-flex h-8 items-center gap-1 rounded bg-[#009688] px-3 text-sm text-white hover:bg-[#00897b]" onClick={() => editing ? showToast("请先保存或取消当前编辑") : setImportOpen(true)}><Upload size={14} />导入实际费用</button>
        </div>}
      />

      <section className="mb-2 flex flex-wrap items-end gap-2 border border-gray-200 bg-white px-3 py-2">
        <label className="grid gap-1 text-xs text-gray-500"><span>头程物流单 / 运单 / 货件号</span><input className={`${inputClass} w-[210px]`} value={keyword} onChange={(event) => editing ? showToast("当前有未保存费用，请先保存或取消当前编辑") : setKeyword(event.target.value)} placeholder="请输入关键词" /></label>
        <label className="grid gap-1 text-xs text-gray-500"><span>头程物流商</span><select className={`${inputClass} w-[190px] bg-white`} value={forwarder} onChange={(event) => editing ? showToast("当前有未保存费用，请先保存或取消当前编辑") : setForwarder(event.target.value)}><option value="">全部</option>{firstLegCarrierOptions.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
        <label className="grid gap-1 text-xs text-gray-500"><span>运输方式</span><select className={`${inputClass} w-[110px] bg-white`} value={transportMethod} onChange={(event) => editing ? showToast("当前有未保存费用，请先保存或取消当前编辑") : setTransportMethod(event.target.value)}><option value="">全部</option><option>空运</option><option>海运</option><option>快递</option><option>陆运</option></select></label>
        <label className="grid gap-1 text-xs text-gray-500"><span>确认状态</span><select className={`${inputClass} w-[110px] bg-white`} value={status} onChange={(event) => editing ? showToast("当前有未保存费用，请先保存或取消当前编辑") : setStatus(event.target.value)}><option value="">全部</option><option>未确认</option><option>部分确认</option><option>已确认</option></select></label>
        <button className="inline-flex h-8 items-center gap-1 rounded bg-blue-600 px-3 text-sm text-white"><Search size={14} />查询</button>
        <button className="h-8 rounded border border-gray-200 px-3 text-sm text-gray-600" onClick={clearFilters}>清空</button>
      </section>

      <section className="mb-2 flex flex-wrap gap-x-8 gap-y-1 border border-gray-200 bg-white px-4 py-2 text-sm">
        <div><span className="text-gray-500">物流单：</span><b>{stats.total}</b></div>
        <div><span className="text-gray-500">预计费用：</span><b>RMB {money(stats.estimated)}</b></div>
        <div><span className="text-gray-500">实际费用：</span><b>RMB {money(stats.actual)}</b></div>
        <div><span className="text-gray-500">费用差异：</span><b className={stats.difference > 0 ? "text-red-600" : stats.difference < 0 ? "text-emerald-600" : "text-gray-800"}>RMB {money(stats.difference)}</b></div>
        <div><span className="text-gray-500">待确认：</span><b className="text-blue-600">{stats.pending}</b></div>
      </section>

      <section className="overflow-x-auto border border-gray-200 bg-white">
        <table className="min-w-[2180px] text-left text-xs">
          <thead className="sticky top-0 z-10 bg-gray-50 text-gray-700">
            <tr>
              {["选择", "头程物流单信息", "头程物流商 / 渠道", "运输信息", ...feeColumns.map((item) => item.label), "费用合计", "差异", "确认状态", "操作"].map((title) => (
                <th key={title} className="whitespace-nowrap border-b border-r border-gray-200 px-2 py-2 font-medium">{title}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((row) => {
              const isEditing = editing?.rowId === row.id;
              return (
              <tr key={row.id} className={`border-b border-gray-100 align-top hover:bg-blue-50/30 ${isEditing ? "bg-blue-50/50" : ""}`}>
                <td className="w-[54px] px-2 py-2 text-center">
                  <input
                    type="checkbox"
                    disabled={row.confirmStatus !== "已确认"}
                    checked={selectedIds.includes(row.id)}
                    onChange={(event) => toggleSelected(row, event.target.checked)}
                    title={row.confirmStatus === "已确认" ? "选择生成请款单" : "未完成对账，不能生成请款单"}
                  />
                </td>
                <td className="w-[180px] px-2 py-2">
                  <button className="font-medium text-blue-600 hover:underline" onClick={() => onOpenFirstLeg(row.firstLegNo)}>{row.firstLegNo}</button>
                  <div className="mt-1 text-gray-500">运单：{row.waybillNo ?? "-"}</div>
                  <div className="text-gray-500">货件：{row.shipmentId ?? "-"}</div>
                </td>
                <td className="w-[180px] px-2 py-2">
                  <div className="font-medium">{row.forwarderName ?? "-"}</div>
                  <div className="mt-1 text-gray-500">{row.channel ?? "-"}</div>
                  <div className="text-gray-500">{row.forwarderChannelName ?? "-"}</div>
                </td>
                <td className="w-[168px] px-2 py-2">
                  <div>{row.transportMethod ?? "-"} · {row.destination ?? "-"}</div>
                  <div className="mt-1 text-gray-500">发出：{row.shippedAt ?? "-"}</div>
                  <div className="text-gray-500">签收：{row.actualSignedAt ?? row.expectedSignedAt ?? "-"}</div>
                  <div className="text-gray-500">签收数量：{row.signedQty?.toLocaleString("zh-CN") ?? "-"}</div>
                </td>
                {feeColumns.map((column) => <FeeCell key={column.key} row={row} feeKey={column.key} draft={editing} onChange={updateFee} />)}
                <td className="min-w-[120px] border-l border-gray-100 px-2 py-1.5 text-right">
                  <div className="flex h-6 items-center justify-between text-gray-500"><span className="text-[10px]">预计</span><b>{money(row.estimatedFee.totalFee)}</b></div>
                  <div className="mt-1 flex h-6 items-center justify-between border-t border-dashed border-gray-200 pt-1"><span className="text-[10px] text-blue-600">实际</span><b>{money(row.actualFee?.totalFee)}</b></div>
                </td>
                <td className={`min-w-[92px] px-2 py-2 text-right font-semibold ${(row.differenceAmount ?? 0) > 0 ? "text-red-600" : (row.differenceAmount ?? 0) < 0 ? "text-emerald-600" : "text-gray-600"}`}>
                  {(row.differenceAmount ?? 0) > 0 ? "+" : ""}{money(row.differenceAmount)}
                </td>
                <td className="min-w-[92px] px-2 py-2">
                  <span className={`rounded-full px-2 py-1 ${statusClass(row.confirmStatus)}`}>{row.confirmStatus}</span>
                  <div className="mt-2 text-[10px] text-gray-400">{row.confirmedItems.filter((item) => item.confirmed).length}/{logisticsFeeItems.length} 项</div>
                </td>
                <td className="sticky right-0 min-w-[250px] border-l border-gray-200 bg-white px-2 py-2 shadow-[-4px_0_8px_rgba(15,23,42,0.04)]">
                  {isEditing ? <div className="flex gap-4">
                    <button className="text-blue-600 hover:text-blue-800" onClick={saveEditing}>保存</button>
                    <button className="text-gray-500 hover:text-gray-700" onClick={() => setEditing(null)}>取消</button>
                  </div> : <div className="flex flex-wrap gap-x-3 gap-y-2">
                    <button className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800" onClick={() => startEditing(row)}><Pencil size={13} />编辑费用</button>
                    <button className="inline-flex items-center gap-1 text-amber-600 hover:text-amber-800" onClick={() => editing ? showToast("请先保存或取消当前编辑") : setConfirming(row)}><SlidersHorizontal size={13} />部分确认</button>
                    <button className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-800" onClick={() => confirmAll(row)}><Check size={13} />确认全部</button>
                    <button className={`inline-flex items-center gap-1 ${row.confirmStatus === "已确认" ? "text-blue-600 hover:text-blue-800" : "text-gray-400"}`} disabled={row.confirmStatus !== "已确认"} onClick={() => generatePaymentRequest([row])}><Plus size={13} />生成请款单</button>
                  </div>}
                </td>
              </tr>
            );})}
            {!filteredRows.length && <tr><td colSpan={16} className="py-12 text-center text-gray-400">暂无符合条件的物流单</td></tr>}
          </tbody>
        </table>
      </section>

      <div className="mt-2 text-xs text-gray-400">共 {filteredRows.length} 条，已完成对账可生成请款单 {requestableRows.length} 条；费用单元格上层为预计，下层为实际。</div>

      <FormModal open={Boolean(confirming)} onClose={() => setConfirming(null)} title={`分项确认 ${confirming?.firstLegNo ?? ""}`} widthClass="w-[680px]">
        {confirming && <div className="space-y-3 text-sm">
          <div className="rounded border border-amber-100 bg-amber-50 px-3 py-2 text-xs text-amber-800">勾选本次已与头程物流商核对无误的费用项。未勾选项目继续保留为待确认。</div>
          <div className="border border-gray-200">
            {feeColumns.map((column) => {
              const item = confirming.confirmedItems.find((statusItem) => statusItem.feeItem === column.label);
              const estimated = normalizeFeeValue(confirming.estimatedFee[column.key]);
              const actual = normalizeFeeValue(confirming.actualFee?.[column.key]);
              return <label key={column.key} className="grid cursor-pointer grid-cols-[32px_1fr_110px_110px_110px] items-center border-b border-gray-100 px-3 py-2 last:border-0">
                <input type="checkbox" checked={Boolean(item?.confirmed)} onChange={(event) => setConfirming((current) => current ? { ...current, confirmedItems: current.confirmedItems.map((statusItem) => statusItem.feeItem === column.label ? { ...statusItem, confirmed: event.target.checked, confirmedBy: event.target.checked ? "张三" : undefined, confirmedAt: event.target.checked ? "2026-06-11 10:00" : undefined } : statusItem) } : current)} />
                <span className="font-medium">{column.label}</span>
                <span className="text-right text-gray-500">预计 {money(estimated)}</span>
                <span className="text-right">实际 {money(actual)}</span>
                <span className={`text-right ${actual - estimated > 0 ? "text-red-600" : actual - estimated < 0 ? "text-emerald-600" : "text-gray-500"}`}>差异 {money(actual - estimated)}</span>
              </label>;
            })}
          </div>
          <div className="flex justify-end gap-2 border-t pt-3"><button className="h-8 rounded border px-4" onClick={() => setConfirming(null)}>取消</button><button className="h-8 rounded bg-amber-500 px-4 text-white" onClick={savePartialConfirmation}>保存确认结果</button></div>
        </div>}
      </FormModal>

      <FormModal open={importOpen} onClose={() => setImportOpen(false)} title="导入头程物流实际费用" widthClass="w-[1120px]">
        <div className="space-y-3 text-sm">
          <div className="rounded border border-blue-100 bg-blue-50 px-3 py-2 text-xs leading-5 text-blue-800">以头程物流单号匹配系统记录。导入会覆盖该单现有实际费用，不影响预计费用和已确认结果，未填写的费用项按 0 处理。</div>
          <div className="flex flex-wrap items-center gap-2">
            <button className="inline-flex h-8 items-center gap-1 rounded border border-blue-300 px-3 text-blue-700" onClick={downloadTemplate}><FileSpreadsheet size={14} />下载模板</button>
            <label className="inline-flex h-8 cursor-pointer items-center gap-1 rounded bg-[#009688] px-3 text-white"><Upload size={14} />上传 xls / xlsx<input className="hidden" type="file" accept=".xls,.xlsx,.csv,.txt" onChange={(event: ChangeEvent<HTMLInputElement>) => { const file = event.target.files?.[0]; if (file) void parseImportFile(file); event.currentTarget.value = ""; }} /></label>
            <span className="text-xs text-gray-500">{importFileName || "未选择文件"}</span>
            {importing && <span className="text-xs text-blue-600">解析中...</span>}
          </div>
          <div className="overflow-x-auto border border-gray-200">
            <table className="min-w-[1320px] text-left text-xs">
              <thead className="bg-gray-50"><tr>{["行号", "校验", ...importHeaders].map((header) => <th key={header} className="whitespace-nowrap border-b px-2 py-2 font-medium">{header}</th>)}</tr></thead>
              <tbody>
                {importRows.map((row) => <tr key={row.rowNo} className={`border-b ${row.errors.length ? "bg-red-50" : ""}`}>
                  <td className="px-2 py-2">{row.rowNo}</td>
                  <td className={`min-w-[160px] px-2 py-2 ${row.errors.length ? "text-red-600" : "text-emerald-600"}`}>{row.errors.length ? row.errors.join("；") : "通过"}</td>
                  <td className="px-2 py-2 font-medium">{row.firstLegNo}</td>
                  <td className="px-2 py-2">-</td>
                  <td className="px-2 py-2">-</td>
                  <td className="px-2 py-2">-</td>
                  {feeColumns.map((column) => <td key={column.key} className="px-2 py-2 text-right">{money(row.values[column.key])}</td>)}
                  <td className="px-2 py-2">{row.remark || "-"}</td>
                </tr>)}
                {!importRows.length && <tr><td colSpan={15} className="p-10 text-center text-gray-400">下载模板并上传头程物流商实际费用文件后，在此预览校验结果。</td></tr>}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between border-t pt-3"><div className="text-xs text-gray-500">共 {importRows.length} 条，错误 {importRows.filter((row) => row.errors.length).length} 条</div><div className="flex gap-2"><button className="h-8 rounded border px-4" onClick={() => { setImportRows([]); setImportFileName(""); }}>清空</button><button className="h-8 rounded bg-[#009688] px-4 text-white" onClick={confirmImport}>确认导入</button></div></div>
        </div>
      </FormModal>

      <DesignLogicCard sections={[
        {
          title: "页面功能说明",
          headers: ["说明项", "内容"],
          rows: [
            ["采购对账模块", "采购对账模块当前保留面辅料采购对账、物流费用对账和物流费用请款。物流费用对账中的头程物流商筛选项来自头程物流商管理，用于按物流商筛选费用对账记录。系统中申请人、请款人、操作人等人员字段统一显示真实姓名，不再显示“当前用户”。"],
          ],
        },
        {
          title: "业务逻辑说明",
          headers: ["业务场景", "规则说明", "页面结果"],
          rows: [
            ["菜单精简", "删除应付明细池、对账单管理、付款记录入口", "左侧采购对账菜单更简洁"],
            ["删除无效 Tab", "已删除模块不应继续作为顶部 Tab 打开", "页面不再出现无效功能入口"],
            ["人员名称展示", "不再显示“当前用户”", "申请人、请款人、操作人显示具体姓名"],
            ["头程物流商筛选", "货代字段改为头程物流商下拉", "用户可从物流商列表中选择"],
            ["枚举来源", "头程物流商下拉来自头程物流商管理", "筛选项与物流商档案保持一致"],
            ["查询筛选", "选择头程物流商后点击查询", "列表只显示对应物流商记录"],
            ["字段统一", "物流费用对账中统一叫头程物流商", "避免货代、物流商、承运商混用"],
          ],
        },
      ]} />

      <Toast msg={toast} />
    </div>
  );
}
