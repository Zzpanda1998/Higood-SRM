import { useMemo, useState, type ChangeEvent } from "react";
import { Check, Download, FileSpreadsheet, Pencil, Plus, Search, SlidersHorizontal, Upload } from "lucide-react";
import DesignLogicCard from "../../components/common/DesignLogicCard";
import FormModal from "../../components/common/FormModal";
import PageHeader from "../../components/common/PageHeader";
import Toast from "../../components/common/Toast";
import { initialMaterialPurchaseReconciliationRows } from "../../mock/materialPurchaseReconciliation";
import type {
  Currency,
  MaterialFeeItem,
  MaterialPurchaseReconciliationRow,
  MaterialReconciliationFeeLayer,
} from "../../types/finance";
import { parseExcelRows } from "../../utils/excelImport";

type FeeKey = "unitPrice" | "purchaseAmount" | "supplierBillAmount" | "adjustmentAmount";
type FeeDraft = {
  rowId: string;
  estimatedFee: Record<FeeKey, string> & { remark: string };
  actualFee: Record<FeeKey, string> & { remark: string };
  errors: string[];
};
type ImportPreviewRow = {
  rowNo: number;
  materialPurchaseNo: string;
  materialSku: string;
  supplierName: string;
  actualUnitPrice: number;
  actualPurchaseAmount: number;
  actualSupplierBillAmount: number;
  actualAdjustmentAmount: number;
  remark: string;
  errors: string[];
};

const feeColumns: Array<{ key: FeeKey; label: string; allowNegative?: boolean }> = [
  { key: "unitPrice", label: "采购单价" },
  { key: "purchaseAmount", label: "采购货款" },
  { key: "supplierBillAmount", label: "供应商账单金额" },
  { key: "adjustmentAmount", label: "调整金额", allowNegative: true },
];
const feeKeys = feeColumns.map((item) => item.key);
const confirmItems: MaterialFeeItem[] = ["采购货款", "供应商账单金额", "调整金额", "最终应付金额"];
const inputClass = "h-8 rounded border border-gray-200 bg-white px-2 text-sm outline-none focus:border-blue-500";
const now = "2026-06-15 10:00";

function normalizeFeeValue(value: unknown): number {
  if (value === null || value === undefined || value === "" || value === "-" || value === "-(-)") return 0;
  const result = Number(String(value).replace(/,/g, ""));
  return Number.isFinite(result) ? result : 0;
}

const money = (value: unknown) => normalizeFeeValue(value).toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const quantity = (value?: number) => normalizeFeeValue(value).toLocaleString("zh-CN", { maximumFractionDigits: 2 });
const statusClass = (status: string) => status === "已确认" ? "bg-emerald-50 text-emerald-700" : status === "部分确认" ? "bg-amber-50 text-amber-700" : "bg-blue-50 text-blue-700";
const baseQuantity = (row: MaterialPurchaseReconciliationRow) => row.inboundQty && row.inboundQty > 0 ? row.inboundQty : row.purchaseQty;

function calculateLayer(
  row: MaterialPurchaseReconciliationRow,
  values: Partial<MaterialReconciliationFeeLayer>,
  kind: "estimated" | "actual",
): MaterialReconciliationFeeLayer {
  const previous = kind === "estimated" ? row.estimatedFee : row.actualFee;
  const unitPrice = normalizeFeeValue(values.unitPrice ?? previous.unitPrice);
  const explicitPurchase = values.purchaseAmount === undefined ? previous.purchaseAmount : normalizeFeeValue(values.purchaseAmount);
  const purchaseAmount = explicitPurchase > 0 ? explicitPurchase : Number((baseQuantity(row) * unitPrice).toFixed(2));
  const supplierBillAmount = normalizeFeeValue(values.supplierBillAmount ?? previous.supplierBillAmount);
  const adjustmentAmount = normalizeFeeValue(values.adjustmentAmount ?? previous.adjustmentAmount);
  const payableBase = kind === "actual" && supplierBillAmount > 0 ? supplierBillAmount : purchaseAmount;
  return {
    unitPrice,
    purchaseAmount,
    supplierBillAmount,
    adjustmentAmount,
    finalPayableAmount: Number((payableBase + adjustmentAmount).toFixed(2)),
    remark: values.remark ?? previous.remark ?? "",
  };
}

function withCalculatedFees(
  row: MaterialPurchaseReconciliationRow,
  estimatedValues: Partial<MaterialReconciliationFeeLayer> = row.estimatedFee,
  actualValues: Partial<MaterialReconciliationFeeLayer> = row.actualFee,
) {
  const estimatedFee = calculateLayer(row, estimatedValues, "estimated");
  const actualFee = calculateLayer(row, actualValues, "actual");
  return {
    ...row,
    estimatedFee,
    actualFee,
    differenceAmount: Number((actualFee.finalPayableAmount - estimatedFee.finalPayableAmount).toFixed(2)),
  };
}

const importHeaders = ["面辅料采购单号", "面辅料SKU", "供应商", "实际采购单价", "实际采购货款", "实际供应商账单金额", "实际调整金额", "备注"];

const downloadTemplate = () => {
  const sample = ["ID-MP-2026-0001", "FAB-2026-0001", "广州华盛面料有限公司", "0.20", "1550", "1560", "10", "六月账单"];
  const html = `<!doctype html><html><head><meta charset="utf-8"></head><body><table><tr>${importHeaders.map((item) => `<th>${item}</th>`).join("")}</tr><tr>${sample.map((item) => `<td>${item}</td>`).join("")}</tr></table></body></html>`;
  const url = URL.createObjectURL(new Blob([html], { type: "application/vnd.ms-excel;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "面辅料供应商实际账单导入模板.xls";
  link.click();
  URL.revokeObjectURL(url);
};

const exportRows = (rows: MaterialPurchaseReconciliationRow[]) => {
  const headers = ["面辅料采购单号", "面辅料SKU", "供应商", "币种", "预计采购货款", "实际采购货款", "预计最终应付", "实际最终应付", "差异", "状态"];
  const body = rows.map((row) => [row.materialPurchaseNo, row.materialSku, row.supplierName, row.currency, row.estimatedFee.purchaseAmount, row.actualFee.purchaseAmount, row.estimatedFee.finalPayableAmount, row.actualFee.finalPayableAmount, row.differenceAmount, row.status]);
  const csv = [headers, ...body].map((line) => line.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\r\n");
  const url = URL.createObjectURL(new Blob([`\ufeff${csv}`], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "面辅料采购对账.csv";
  link.click();
  URL.revokeObjectURL(url);
};

function LayerCell({
  row,
  feeKey,
  draft,
  onChange,
}: {
  row: MaterialPurchaseReconciliationRow;
  feeKey: FeeKey;
  draft: FeeDraft | null;
  onChange: (layer: "estimatedFee" | "actualFee", key: FeeKey, value: string) => void;
}) {
  const editing = draft?.rowId === row.id;
  const renderInput = (layer: "estimatedFee" | "actualFee", label: string) => (
    <div className="flex h-7 items-center gap-1">
      <span className={`w-7 shrink-0 rounded px-1 text-[10px] ${layer === "estimatedFee" ? "bg-slate-100 text-gray-500" : "bg-blue-50 text-blue-600"}`}>{label}</span>
      <input
        className={`h-6 w-[78px] rounded border px-1 text-right text-xs outline-none ${draft?.errors.includes(`${layer}.${feeKey}`) ? "border-red-500 bg-red-50" : "border-gray-300 focus:border-blue-500"}`}
        inputMode="decimal"
        value={draft?.[layer][feeKey] ?? "0"}
        onChange={(event) => onChange(layer, feeKey, event.target.value)}
      />
    </div>
  );
  return <td className="min-w-[118px] border-l border-gray-100 px-2 py-1.5 text-right align-top">
    {editing ? <>
      {renderInput("estimatedFee", "预计")}
      <div className="mt-1 border-t border-dashed border-gray-200 pt-1">{renderInput("actualFee", "实际")}</div>
    </> : <>
      <div className="flex h-6 items-center justify-between gap-2 text-gray-500"><span className="rounded bg-slate-100 px-1 text-[10px]">预计</span><span>{money(row.estimatedFee[feeKey])}</span></div>
      <div className="mt-1 flex h-6 items-center justify-between gap-2 border-t border-dashed border-gray-200 pt-1 font-medium"><span className="rounded bg-blue-50 px-1 text-[10px] text-blue-600">实际</span><span>{money(row.actualFee[feeKey])}</span></div>
    </>}
  </td>;
}

export default function MaterialPurchaseReconciliation({ onCreatePaymentRequest }: { onCreatePaymentRequest?: (rows: MaterialPurchaseReconciliationRow[]) => void }) {
  const [rows, setRows] = useState(() => initialMaterialPurchaseReconciliationRows.map((row) => withCalculatedFees(row)));
  const [selected, setSelected] = useState<string[]>([]);
  const [toast, setToast] = useState("");
  const [editing, setEditing] = useState<FeeDraft | null>(null);
  const [partialRow, setPartialRow] = useState<MaterialPurchaseReconciliationRow | null>(null);
  const [confirmRow, setConfirmRow] = useState<MaterialPurchaseReconciliationRow | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [importRows, setImportRows] = useState<ImportPreviewRow[]>([]);
  const [importFileName, setImportFileName] = useState("");
  const [importing, setImporting] = useState(false);
  const [materialPurchaseNo, setMaterialPurchaseNo] = useState("");
  const [supplier, setSupplier] = useState("");
  const [materialSku, setMaterialSku] = useState("");
  const [status, setStatus] = useState("");
  const [currency, setCurrency] = useState("");

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2600);
  };
  const guardEditing = () => {
    if (!editing) return false;
    showToast("请先保存或取消当前编辑");
    return true;
  };
  const filteredRows = useMemo(() => rows.filter((row) =>
    (!materialPurchaseNo || row.materialPurchaseNo.toLowerCase().includes(materialPurchaseNo.toLowerCase()))
    && (!supplier || row.supplierName.includes(supplier))
    && (!materialSku || row.materialSku.toLowerCase().includes(materialSku.toLowerCase()))
    && (!status || row.status === status)
    && (!currency || row.currency === currency)
  ), [currency, materialPurchaseNo, materialSku, rows, status, supplier]);
  const suppliers = useMemo(() => Array.from(new Set(rows.map((row) => row.supplierName))), [rows]);

  const totals = useMemo(() => {
    const currencyTotals = (selector: (row: MaterialPurchaseReconciliationRow) => number) =>
      (["RMB", "USD", "IDR"] as Currency[]).map((item) => ({
        currency: item,
        value: filteredRows.filter((row) => row.currency === item).reduce((sum, row) => sum + selector(row), 0),
      }));
    const format = (items: Array<{ currency: Currency; value: number }>) => items.map((item) => `${item.currency} ${money(item.value)}`).join(" / ");
    return {
      estimatedPurchase: format(currencyTotals((row) => row.estimatedFee.purchaseAmount)),
      actualPurchase: format(currencyTotals((row) => row.actualFee.purchaseAmount)),
      estimatedPayable: format(currencyTotals((row) => row.estimatedFee.finalPayableAmount)),
      actualPayable: format(currencyTotals((row) => row.actualFee.finalPayableAmount)),
      difference: format(currencyTotals((row) => row.differenceAmount)),
    };
  }, [filteredRows]);

  const startEditing = (row: MaterialPurchaseReconciliationRow) => {
    if (editing && editing.rowId !== row.id) return showToast("请先保存或取消当前编辑");
    const layer = (fee: MaterialReconciliationFeeLayer) => ({
      ...Object.fromEntries(feeKeys.map((key) => [key, String(normalizeFeeValue(fee[key]))])) as Record<FeeKey, string>,
      remark: fee.remark ?? "",
    });
    setEditing({ rowId: row.id, estimatedFee: layer(row.estimatedFee), actualFee: layer(row.actualFee), errors: [] });
  };
  const updateDraft = (layer: "estimatedFee" | "actualFee", key: FeeKey, value: string) => {
    setEditing((current) => current ? {
      ...current,
      [layer]: { ...current[layer], [key]: value },
      errors: current.errors.filter((item) => item !== `${layer}.${key}`),
    } : current);
  };
  const updateRemark = (layer: "estimatedFee" | "actualFee", value: string) => {
    setEditing((current) => current ? { ...current, [layer]: { ...current[layer], remark: value } } : current);
  };
  const saveEditing = () => {
    if (!editing) return;
    const errors: string[] = [];
    let hasNegative = false;
    const parseLayer = (layer: "estimatedFee" | "actualFee") => {
      const values = Object.fromEntries(feeColumns.map(({ key, allowNegative }) => {
        const raw = editing[layer][key].trim().replace(/,/g, "");
        const value = raw === "" ? 0 : Number(raw);
        if (!Number.isFinite(value)) errors.push(`${layer}.${key}`);
        if (Number.isFinite(value) && value < 0 && !allowNegative) {
          errors.push(`${layer}.${key}`);
          hasNegative = true;
        }
        return [key, Number.isFinite(value) ? value : 0];
      })) as Record<FeeKey, number>;
      return { ...values, remark: editing[layer].remark };
    };
    const estimatedFee = parseLayer("estimatedFee");
    const actualFee = parseLayer("actualFee");
    if (errors.length) {
      setEditing({ ...editing, errors });
      return showToast(hasNegative ? "除调整金额外，其他费用不能小于 0" : "费用必须为数字");
    }
    setRows((current) => current.map((row) => row.id === editing.rowId ? withCalculatedFees(row, estimatedFee, actualFee) : row));
    setEditing(null);
    showToast("保存成功");
  };

  const confirmAll = (row: MaterialPurchaseReconciliationRow) => {
    if (guardEditing()) return;
    setConfirmRow(row);
  };
  const finishConfirmAll = () => {
    if (!confirmRow) return;
    setRows((current) => current.map((row) => row.id === confirmRow.id ? {
      ...row,
      status: "已确认",
      confirmedBy: "张三",
      confirmedAt: now,
      confirmedItems: row.confirmedItems.map((item) => ({ ...item, confirmed: true, confirmedBy: "张三", confirmedAt: now })),
    } : row));
    setConfirmRow(null);
    showToast("确认成功");
  };
  const savePartial = () => {
    if (!partialRow) return;
    const count = partialRow.confirmedItems.filter((item) => item.confirmed).length;
    const nextStatus = count === confirmItems.length ? "已确认" : count > 0 ? "部分确认" : "待确认";
    setRows((current) => current.map((row) => row.id === partialRow.id ? {
      ...partialRow,
      status: nextStatus,
      confirmedBy: nextStatus === "已确认" ? "张三" : undefined,
      confirmedAt: nextStatus === "已确认" ? now : undefined,
    } : row));
    setPartialRow(null);
    showToast(`已保存分项确认，当前状态：${nextStatus}`);
  };
  const batchConfirm = () => {
    if (guardEditing()) return;
    if (!selected.length) return showToast("请先勾选对账记录");
    setRows((current) => current.map((row) => selected.includes(row.id) ? {
      ...row, status: "已确认", confirmedBy: "张三", confirmedAt: now,
      confirmedItems: row.confirmedItems.map((item) => ({ ...item, confirmed: true, confirmedBy: "张三", confirmedAt: now })),
    } : row));
    setSelected([]);
    showToast("批量确认成功");
  };
  const generatePaymentRequest = () => {
    if (!selected.length) return showToast("请先勾选面辅料采购对账记录");
    const selectedRows = rows.filter((row) => selected.includes(row.id));
    const invalid = selectedRows.filter((row) => row.status === "待确认");
    if (invalid.length) return showToast("未确认的对账记录不允许生成请款单");
    const suppliers = new Set(selectedRows.map((row) => row.supplierName));
    if (suppliers.size > 1) return showToast("不同供应商需要拆分生成请款单");
    onCreatePaymentRequest?.(selectedRows);
  };

  const parseImportFile = async (file: File) => {
    setImportFileName(file.name);
    setImporting(true);
    try {
      const rawRows = await parseExcelRows(file);
      const headers = rawRows[0]?.map((cell) => cell.trim()) ?? [];
      const getIndex = (header: string) => headers.indexOf(header);
      const existing = new Set(rows.map((row) => `${row.materialPurchaseNo}|${row.materialSku}`));
      const seen = new Set<string>();
      const preview = rawRows.slice(1).filter((line) => line.some((cell) => cell.trim())).map((line, index) => {
        const get = (header: string) => line[getIndex(header)]?.trim() ?? "";
        const no = get("面辅料采购单号");
        const sku = get("面辅料SKU");
        const key = `${no}|${sku}`;
        const errors: string[] = [];
        if (!no) errors.push("面辅料采购单号为空");
        if (!sku) errors.push("面辅料SKU为空");
        if (!existing.has(key)) errors.push("未找到对应采购明细");
        if (seen.has(key)) errors.push("重复数据");
        seen.add(key);
        const parseAmount = (header: string, allowNegative = false) => {
          const raw = get(header).replace(/,/g, "");
          const value = raw === "" ? 0 : Number(raw);
          if (!Number.isFinite(value)) errors.push(`${header}必须为数字`);
          else if (!allowNegative && value < 0) errors.push(`${header}不能小于 0`);
          return Number.isFinite(value) ? value : 0;
        };
        return {
          rowNo: index + 2,
          materialPurchaseNo: no,
          materialSku: sku,
          supplierName: get("供应商"),
          actualUnitPrice: parseAmount("实际采购单价"),
          actualPurchaseAmount: parseAmount("实际采购货款"),
          actualSupplierBillAmount: parseAmount("实际供应商账单金额"),
          actualAdjustmentAmount: parseAmount("实际调整金额", true),
          remark: get("备注"),
          errors,
        };
      });
      setImportRows(preview);
      showToast(`已解析 ${preview.length} 条供应商账单`);
    } catch (error) {
      setImportRows([]);
      showToast(error instanceof Error ? error.message : "文件解析失败");
    } finally {
      setImporting(false);
    }
  };
  const confirmImport = () => {
    if (!importRows.length) return showToast("请先上传供应商账单");
    if (importRows.some((row) => row.errors.length)) return showToast("存在校验错误，请修正文件后重新上传");
    const imported = new Map(importRows.map((row) => [`${row.materialPurchaseNo}|${row.materialSku}`, row]));
    setRows((current) => current.map((row) => {
      const item = imported.get(`${row.materialPurchaseNo}|${row.materialSku}`);
      if (!item) return row;
      return withCalculatedFees(row, row.estimatedFee, {
        unitPrice: item.actualUnitPrice,
        purchaseAmount: item.actualPurchaseAmount,
        supplierBillAmount: item.actualSupplierBillAmount,
        adjustmentAmount: item.actualAdjustmentAmount,
        finalPayableAmount: 0,
        remark: item.remark,
      });
    }));
    showToast(`成功导入 ${importRows.length} 条实际费用`);
    setImportRows([]);
    setImportFileName("");
    setImportOpen(false);
  };

  const filterChange = (setter: (value: string) => void, value: string) => {
    if (editing && !window.confirm("当前有未保存费用，是否放弃修改？")) return;
    if (editing) setEditing(null);
    setter(value);
  };

  const columns = ["", "面辅料采购单号", "来源商品采购单号", "供应商", "面辅料SKU", "物料名称", "规格 / 颜色", "单位", "采购类型", "采购员", "状态", "下单时间", "到货时间", "入库时间", "采购数量", "到货数量", "入库数量", "币种", "费用类型", ...feeColumns.map((item) => item.label), "最终应付金额", "差异金额", "备注", "操作"];

  return <div>
    <PageHeader
      title="面辅料采购对账"
      desc="按面辅料采购单与 SKU 核对供应商采购货款，费用字段按预计与实际两层展示，支持编辑、部分确认和 Excel 导入。"
      extra={<div className="flex gap-2">
        <button className="inline-flex h-8 items-center gap-1 rounded border border-blue-200 bg-blue-50 px-3 text-sm text-blue-700" onClick={generatePaymentRequest}><Plus size={14} />生成面辅料采购请款单</button>
        <button className="inline-flex h-8 items-center gap-1 rounded border border-gray-200 bg-white px-3 text-sm" onClick={() => exportRows(filteredRows)}><Download size={14} />导出</button>
        <button className="inline-flex h-8 items-center gap-1 rounded bg-[#009688] px-3 text-sm text-white" onClick={() => guardEditing() || setImportOpen(true)}><Upload size={14} />导入供应商账单</button>
      </div>}
    />

    <section className="mb-2 flex flex-wrap items-end gap-2 border border-gray-200 bg-white px-3 py-2">
      <label className="grid gap-1 text-xs text-gray-500"><span>面辅料采购单号</span><input className={`${inputClass} w-[170px]`} value={materialPurchaseNo} onChange={(event) => filterChange(setMaterialPurchaseNo, event.target.value)} /></label>
      <label className="grid gap-1 text-xs text-gray-500"><span>供应商</span><select className={`${inputClass} w-[190px]`} value={supplier} onChange={(event) => filterChange(setSupplier, event.target.value)}><option value="">全部</option>{suppliers.map((item) => <option key={item}>{item}</option>)}</select></label>
      <label className="grid gap-1 text-xs text-gray-500"><span>面辅料SKU</span><input className={`${inputClass} w-[160px]`} value={materialSku} onChange={(event) => filterChange(setMaterialSku, event.target.value)} /></label>
      <label className="grid gap-1 text-xs text-gray-500"><span>币种</span><select className={`${inputClass} w-[90px]`} value={currency} onChange={(event) => filterChange(setCurrency, event.target.value)}><option value="">全部</option><option>RMB</option><option>USD</option><option>IDR</option></select></label>
      <label className="grid gap-1 text-xs text-gray-500"><span>状态</span><select className={`${inputClass} w-[110px]`} value={status} onChange={(event) => filterChange(setStatus, event.target.value)}><option value="">全部</option><option>待确认</option><option>部分确认</option><option>已确认</option></select></label>
      <button className="inline-flex h-8 items-center gap-1 rounded bg-blue-600 px-3 text-sm text-white"><Search size={14} />查询</button>
      <button className="h-8 rounded border border-gray-200 px-3 text-sm" onClick={() => { if (guardEditing()) return; setMaterialPurchaseNo(""); setSupplier(""); setMaterialSku(""); setCurrency(""); setStatus(""); }}>清空</button>
      <button className="h-8 rounded border border-emerald-200 px-3 text-sm text-emerald-700" onClick={batchConfirm}>批量确认</button>
    </section>

    <section className="mb-2 flex flex-wrap gap-x-7 gap-y-1 border border-gray-200 bg-white px-4 py-2 text-sm">
      <div><span className="text-gray-500">对账记录：</span><b>{filteredRows.length}</b></div>
      <div><span className="text-gray-500">采购数量：</span><b>{quantity(filteredRows.reduce((sum, row) => sum + row.purchaseQty, 0))}</b></div>
      <div><span className="text-gray-500">入库数量：</span><b>{quantity(filteredRows.reduce((sum, row) => sum + normalizeFeeValue(row.inboundQty), 0))}</b></div>
      <div><span className="text-gray-500">预计采购货款：</span><b>{totals.estimatedPurchase}</b></div>
      <div><span className="text-gray-500">实际采购货款：</span><b>{totals.actualPurchase}</b></div>
      <div><span className="text-gray-500">预计最终应付：</span><b>{totals.estimatedPayable}</b></div>
      <div><span className="text-gray-500">实际最终应付：</span><b className="text-blue-700">{totals.actualPayable}</b></div>
      <div><span className="text-gray-500">差异：</span><b>{totals.difference}</b></div>
      <div><span className="text-gray-500">待确认：</span><b className="text-blue-600">{filteredRows.filter((row) => row.status === "待确认").length}</b></div>
      <div><span className="text-gray-500">部分确认：</span><b className="text-amber-600">{filteredRows.filter((row) => row.status === "部分确认").length}</b></div>
      <div><span className="text-gray-500">已确认：</span><b className="text-emerald-600">{filteredRows.filter((row) => row.status === "已确认").length}</b></div>
    </section>

    <section className="overflow-x-auto border border-gray-200 bg-white">
      <table className="min-w-[3300px] text-left text-xs">
        <thead className="sticky top-0 z-10 bg-gray-50 text-gray-700"><tr>{columns.map((column, index) => <th key={`${column}-${index}`} className={`whitespace-nowrap border-b border-r border-gray-200 px-2 py-2 font-medium ${index === columns.length - 1 ? "sticky right-0 z-20 bg-gray-50" : ""}`}>{index === 0 ? <input type="checkbox" aria-label="全选当前列表" checked={filteredRows.length > 0 && filteredRows.every((row) => selected.includes(row.id))} onChange={(event) => setSelected(event.target.checked ? filteredRows.map((row) => row.id) : [])} /> : column}</th>)}</tr></thead>
        <tbody>{filteredRows.map((row) => {
          const isEditing = editing?.rowId === row.id;
          return <tr key={row.id} className={`border-b border-gray-100 align-top hover:bg-blue-50/30 ${isEditing ? "bg-blue-50/60" : ""}`}>
            <td className="px-2 py-2 text-center"><input type="checkbox" checked={selected.includes(row.id)} onChange={(event) => setSelected((current) => event.target.checked ? [...current, row.id] : current.filter((id) => id !== row.id))} /></td>
            <td className="whitespace-nowrap px-2 py-2 font-medium text-blue-600">{row.materialPurchaseNo}</td>
            <td className="whitespace-nowrap px-2 py-2">{row.sourceGoodsPurchaseNo || "-"}</td>
            <td className="min-w-[190px] px-2 py-2">{row.supplierName}</td>
            <td className="whitespace-nowrap px-2 py-2 font-medium">{row.materialSku}</td>
            <td className="min-w-[150px] px-2 py-2">{row.materialName}</td>
            <td className="min-w-[130px] px-2 py-2">{row.specification || "-"}</td>
            <td className="px-2 py-2">{row.unit}</td>
            <td className="px-2 py-2">{row.purchaseType}</td>
            <td className="whitespace-nowrap px-2 py-2">{row.purchaser || "-"}</td>
            <td className="px-2 py-2"><span className={`rounded-full px-2 py-1 ${statusClass(row.status)}`}>{row.status}</span></td>
            <td className="whitespace-nowrap px-2 py-2">{row.orderedAt || "-"}</td>
            <td className="whitespace-nowrap px-2 py-2">{row.arrivedAt || "-"}</td>
            <td className="whitespace-nowrap px-2 py-2">{row.inboundAt || "-"}</td>
            <td className="px-2 py-2 text-right">{quantity(row.purchaseQty)}</td>
            <td className="px-2 py-2 text-right">{quantity(row.arrivedQty)}</td>
            <td className="px-2 py-2 text-right">{quantity(row.inboundQty)}</td>
            <td className="px-2 py-2">{row.currency}</td>
            <td className="min-w-[70px] px-2 py-1.5"><div className="flex h-6 items-center"><span className="rounded bg-slate-100 px-1 text-[10px] text-gray-500">预计</span></div><div className="mt-1 flex h-6 items-center border-t border-dashed border-gray-200 pt-1"><span className="rounded bg-blue-50 px-1 text-[10px] text-blue-600">实际</span></div></td>
            {feeColumns.map((column) => <LayerCell key={column.key} row={row} feeKey={column.key} draft={editing} onChange={updateDraft} />)}
            <td className="min-w-[120px] border-l border-gray-100 px-2 py-1.5 text-right"><div className="flex h-6 items-center justify-between text-gray-500"><span className="text-[10px]">预计</span><b>{money(row.estimatedFee.finalPayableAmount)}</b></div><div className="mt-1 flex h-6 items-center justify-between border-t border-dashed border-gray-200 pt-1"><span className="text-[10px] text-blue-600">实际</span><b>{money(row.actualFee.finalPayableAmount)}</b></div></td>
            <td className="min-w-[100px] px-2 py-1.5 text-right"><div className="flex h-6 items-center justify-between text-gray-500"><span className="text-[10px]">预计</span><span>{money(0)}</span></div><div className={`mt-1 flex h-6 items-center justify-between border-t border-dashed border-gray-200 pt-1 font-semibold ${row.differenceAmount > 0 ? "text-red-600" : row.differenceAmount < 0 ? "text-emerald-600" : "text-gray-700"}`}><span className="text-[10px]">实际</span><span>{row.differenceAmount > 0 ? "+" : ""}{money(row.differenceAmount)}</span></div></td>
            <td className="min-w-[170px] px-2 py-1.5">{isEditing ? <><input className="h-6 w-full rounded border px-1 text-xs" value={editing.estimatedFee.remark} onChange={(event) => updateRemark("estimatedFee", event.target.value)} /><input className="mt-2 h-6 w-full rounded border px-1 text-xs" value={editing.actualFee.remark} onChange={(event) => updateRemark("actualFee", event.target.value)} /></> : <><div className="h-6 truncate text-gray-500" title={row.estimatedFee.remark}>{row.estimatedFee.remark || "0"}</div><div className="mt-1 h-6 truncate border-t border-dashed border-gray-200 pt-1" title={row.actualFee.remark}>{row.actualFee.remark || "0"}</div></>}</td>
            <td className="sticky right-0 min-w-[240px] border-l border-gray-200 bg-white px-2 py-2 shadow-[-4px_0_8px_rgba(15,23,42,0.04)]">{isEditing ? <div className="flex gap-4"><button className="text-blue-600" onClick={saveEditing}>保存</button><button className="text-gray-500" onClick={() => setEditing(null)}>取消</button></div> : <div className="flex gap-3 whitespace-nowrap"><button className="inline-flex items-center gap-1 text-blue-600" onClick={() => startEditing(row)}><Pencil size={13} />编辑费用</button><button className="inline-flex items-center gap-1 text-amber-600" onClick={() => guardEditing() || setPartialRow({ ...row, confirmedItems: row.confirmedItems.map((item) => ({ ...item })) })}><SlidersHorizontal size={13} />部分确认</button><button className="inline-flex items-center gap-1 text-emerald-600" onClick={() => confirmAll(row)}><Check size={13} />确认全部</button></div>}</td>
          </tr>;
        })}</tbody>
      </table>
    </section>

    <DesignLogicCard sections={[
      { title: "页面定位", headers: ["项目", "说明"], rows: [["页面名称", "面辅料采购对账"], ["对账维度", "面辅料采购单号 + 面辅料SKU"], ["费用结构", "每条记录一行，费用字段上层预计、下层实际"], ["实际费用来源", "人工行内编辑、供应商账单 Excel 导入"]] },
      { title: "核心规则", headers: ["场景", "规则"], rows: [["预计采购货款", "优先系统金额，否则入库数量或采购数量 × 预计单价"], ["实际采购货款", "优先录入金额，否则入库数量或采购数量 × 实际单价"], ["预计最终应付", "预计采购货款 + 预计调整金额"], ["实际最终应付", "实际供应商账单金额大于 0 时优先使用，否则使用实际采购货款，再加实际调整金额"], ["差异金额", "实际最终应付 - 预计最终应付"], ["导入", "只覆盖实际费用层，不自动确认"]] },
    ]} />

    <FormModal open={Boolean(partialRow)} onClose={() => setPartialRow(null)} title={`部分确认 ${partialRow?.materialPurchaseNo ?? ""}`} widthClass="w-[760px]">
      {partialRow && <div className="space-y-3 text-sm"><div className="overflow-hidden border border-gray-200"><table className="w-full text-left text-xs"><thead className="bg-gray-50"><tr>{["费用项目", "预计金额", "实际金额", "差异", "是否确认"].map((item) => <th key={item} className="border-b px-3 py-2">{item}</th>)}</tr></thead><tbody>{partialRow.confirmedItems.map((item) => {
        const key = item.feeItem === "采购货款" ? "purchaseAmount" : item.feeItem === "供应商账单金额" ? "supplierBillAmount" : item.feeItem === "调整金额" ? "adjustmentAmount" : "finalPayableAmount";
        const estimated = partialRow.estimatedFee[key];
        const actual = partialRow.actualFee[key];
        const difference = actual - estimated;
        return <tr key={item.feeItem} className="border-b last:border-0"><td className="px-3 py-2 font-medium">{item.feeItem}</td><td className="px-3 py-2 text-right">{money(estimated)}</td><td className="px-3 py-2 text-right">{money(actual)}</td><td className={`px-3 py-2 text-right ${difference > 0 ? "text-red-600" : difference < 0 ? "text-emerald-600" : ""}`}>{money(difference)}</td><td className="px-3 py-2 text-center"><input type="checkbox" checked={item.confirmed} onChange={(event) => setPartialRow({ ...partialRow, confirmedItems: partialRow.confirmedItems.map((feeItem) => feeItem.feeItem === item.feeItem ? { ...feeItem, confirmed: event.target.checked, confirmedBy: event.target.checked ? "张三" : undefined, confirmedAt: event.target.checked ? now : undefined } : feeItem) })} /></td></tr>;
      })}</tbody></table></div><div className="flex justify-end gap-2 border-t pt-3"><button className="h-8 rounded border px-4" onClick={() => setPartialRow(null)}>取消</button><button className="h-8 rounded bg-amber-500 px-4 text-white" onClick={savePartial}>保存确认结果</button></div></div>}
    </FormModal>

    <FormModal open={Boolean(confirmRow)} onClose={() => setConfirmRow(null)} title="确认全部面辅料采购费用" widthClass="w-[520px]">
      {confirmRow && <div className="space-y-4 text-sm"><div className="rounded bg-gray-50 p-3">{confirmRow.actualFee.finalPayableAmount === 0 ? "当前记录尚未录入实际费用，是否只确认预计费用？" : "确认该条面辅料采购费用无误？"}<br /><b>{confirmRow.materialPurchaseNo} / {confirmRow.materialSku}</b></div><div className="flex justify-end gap-2"><button className="h-8 rounded border px-4" onClick={() => setConfirmRow(null)}>取消</button><button className="h-8 rounded bg-blue-600 px-4 text-white" onClick={finishConfirmAll}>确认</button></div></div>}
    </FormModal>

    <FormModal open={importOpen} onClose={() => setImportOpen(false)} title="导入供应商账单" widthClass="w-[1080px]">
      <div className="space-y-3 text-sm">
        <div className="rounded border border-blue-100 bg-blue-50 px-3 py-2 text-xs text-blue-800">按“面辅料采购单号 + 面辅料SKU”匹配；只更新实际费用层，未填写字段按 0 处理，不自动确认。</div>
        <div className="flex items-center gap-2"><button className="inline-flex h-8 items-center gap-1 rounded border border-blue-300 px-3 text-blue-700" onClick={downloadTemplate}><FileSpreadsheet size={14} />下载模板</button><label className="inline-flex h-8 cursor-pointer items-center gap-1 rounded bg-[#009688] px-3 text-white"><Upload size={14} />上传 xls / xlsx<input className="hidden" type="file" accept=".xls,.xlsx,.csv,.txt" onChange={(event: ChangeEvent<HTMLInputElement>) => { const file = event.target.files?.[0]; if (file) void parseImportFile(file); event.currentTarget.value = ""; }} /></label><span className="text-xs text-gray-500">{importFileName || "未选择文件"}</span>{importing && <span className="text-xs text-blue-600">解析中...</span>}</div>
        <div className="overflow-x-auto border border-gray-200"><table className="min-w-[1200px] text-left text-xs"><thead className="bg-gray-50"><tr>{["行号", ...importHeaders, "校验"].map((item) => <th key={item} className="whitespace-nowrap border-b px-2 py-2">{item}</th>)}</tr></thead><tbody>{importRows.map((row) => <tr key={row.rowNo} className={`border-b ${row.errors.length ? "bg-red-50" : ""}`}><td className="px-2 py-2">{row.rowNo}</td><td className="px-2 py-2">{row.materialPurchaseNo}</td><td className="px-2 py-2">{row.materialSku}</td><td className="px-2 py-2">{row.supplierName || "-"}</td><td className="px-2 py-2 text-right">{money(row.actualUnitPrice)}</td><td className="px-2 py-2 text-right">{money(row.actualPurchaseAmount)}</td><td className="px-2 py-2 text-right">{money(row.actualSupplierBillAmount)}</td><td className="px-2 py-2 text-right">{money(row.actualAdjustmentAmount)}</td><td className="px-2 py-2">{row.remark || "-"}</td><td className={`px-2 py-2 ${row.errors.length ? "text-red-600" : "text-emerald-600"}`}>{row.errors.join("；") || "通过"}</td></tr>)}{!importRows.length && <tr><td colSpan={10} className="p-10 text-center text-gray-400">请上传供应商账单文件</td></tr>}</tbody></table></div>
        <div className="flex items-center justify-between border-t pt-3"><span className="text-xs text-gray-500">共 {importRows.length} 条，错误 {importRows.filter((row) => row.errors.length).length} 条</span><div className="flex gap-2"><button className="h-8 rounded border px-4" onClick={() => { setImportRows([]); setImportFileName(""); }}>清空</button><button className="h-8 rounded bg-[#009688] px-4 text-white" onClick={confirmImport}>确认导入</button></div></div>
      </div>
    </FormModal>
    <Toast msg={toast} />
  </div>;
}
