import { useMemo, useState, type ChangeEvent } from "react";
import { ChevronDown, ChevronRight, Download, FileSpreadsheet, Search, Upload } from "lucide-react";
import DesignLogicCard from "../../components/common/DesignLogicCard";
import FormModal from "../../components/common/FormModal";
import PageHeader from "../../components/common/PageHeader";
import Toast from "../../components/common/Toast";
import { initialMaterialPurchaseReconciliationRows } from "../../mock/materialPurchaseReconciliation";
import type {
  Currency,
  MaterialPurchaseReconciliationRow,
} from "../../types/finance";
import { parseExcelRows } from "../../utils/excelImport";

type ImportPreviewRow = {
  rowNo: number;
  materialPurchaseNo: string;
  sourceGoodsPurchaseNo: string;
  supplierName: string;
  materialSku: string;
  materialName: string;
  currency: Currency;
  actualUnitPrice?: number;
  purchaseAmount?: number;
  supplierBillAmount?: number;
  adjustmentAmount?: number;
  differenceReason: string;
  remark: string;
  errors: string[];
};

const inputClass = "h-8 rounded border border-gray-200 bg-white px-2 text-sm outline-none focus:border-blue-500";
const money = (value?: number) => value == null ? "-" : value.toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const quantity = (value?: number) => value == null ? "0" : value.toLocaleString("zh-CN", { maximumFractionDigits: 2 });
const statusClass = (status: string) => status === "已确认" ? "bg-emerald-50 text-emerald-700" : status === "部分确认" ? "bg-amber-50 text-amber-700" : "bg-blue-50 text-blue-700";
const now = "2026-06-11 10:00";

const importHeaders = [
  "面辅料采购单号", "面辅料SKU", "供应商", "物料名称", "币种", "实际采购单价",
  "采购货款", "供应商账单金额", "调整金额", "差异原因", "备注",
];

const downloadTemplate = () => {
  const sample = ["ID-MP-2026-0001", "FAB-2026-0001", "广州华盛面料有限公司", "180g纯棉针织布", "RMB", "0.18", "1395", "1398", "0", "供应商账单含运费", "六月账单"];
  const html = `<!doctype html><html><head><meta charset="utf-8"></head><body><table><tr>${importHeaders.map((item) => `<th>${item}</th>`).join("")}</tr><tr>${sample.map((item) => `<td>${item}</td>`).join("")}</tr></table></body></html>`;
  const url = URL.createObjectURL(new Blob([html], { type: "application/vnd.ms-excel;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "面辅料供应商账单导入模板.xls";
  link.click();
  URL.revokeObjectURL(url);
};

const exportRows = (rows: MaterialPurchaseReconciliationRow[]) => {
  const headers = ["面辅料采购单号", "来源商品采购单号", "供应商", "面辅料SKU", "物料名称", "币种", "实际采购单价", "采购货款", "供应商账单金额", "调整金额", "最终应付金额", "差异金额", "状态"];
  const data = rows.map((row) => [row.materialPurchaseNo, row.sourceGoodsPurchaseNo ?? "", row.supplierName, row.materialSku, row.materialName, row.currency, row.actualUnitPrice ?? "", row.actualPurchaseAmount ?? "", row.supplierBillAmount ?? "", row.adjustmentAmount, row.finalPayableAmount, row.differenceAmount ?? "", row.status]);
  const csv = [headers, ...data].map((line) => line.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\r\n");
  const url = URL.createObjectURL(new Blob([`\ufeff${csv}`], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "面辅料采购对账.csv";
  link.click();
  URL.revokeObjectURL(url);
};

export default function MaterialPurchaseReconciliation() {
  const [rows, setRows] = useState(initialMaterialPurchaseReconciliationRows);
  const [selected, setSelected] = useState<string[]>([]);
  const [expanded, setExpanded] = useState<string[]>([]);
  const [toast, setToast] = useState("");
  const [editing, setEditing] = useState<MaterialPurchaseReconciliationRow | null>(null);
  const [partialRow, setPartialRow] = useState<MaterialPurchaseReconciliationRow | null>(null);
  const [confirmRow, setConfirmRow] = useState<MaterialPurchaseReconciliationRow | null>(null);
  const [detailRow, setDetailRow] = useState<MaterialPurchaseReconciliationRow | null>(null);
  const [confirmWithoutBill, setConfirmWithoutBill] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [importRows, setImportRows] = useState<ImportPreviewRow[]>([]);
  const [importFileName, setImportFileName] = useState("");
  const [importing, setImporting] = useState(false);

  const [reconciliationNo, setReconciliationNo] = useState("");
  const [materialPurchaseNo, setMaterialPurchaseNo] = useState("");
  const [sourceGoodsPurchaseNo, setSourceGoodsPurchaseNo] = useState("");
  const [supplier, setSupplier] = useState("");
  const [materialSku, setMaterialSku] = useState("");
  const [materialName, setMaterialName] = useState("");
  const [feeType, setFeeType] = useState("");
  const [currency, setCurrency] = useState("");
  const [status, setStatus] = useState("");
  const [purchaser, setPurchaser] = useState("");
  const [orderedFrom, setOrderedFrom] = useState("");
  const [orderedTo, setOrderedTo] = useState("");
  const [arrivedFrom, setArrivedFrom] = useState("");
  const [arrivedTo, setArrivedTo] = useState("");
  const [inboundFrom, setInboundFrom] = useState("");
  const [inboundTo, setInboundTo] = useState("");

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2600);
  };

  const filteredRows = useMemo(() => rows.filter((row) => {
    const dateInRange = (value: string | undefined, from: string, to: string) => (!from || Boolean(value && value >= from)) && (!to || Boolean(value && value <= to));
    return (!reconciliationNo || row.reconciliationNo?.includes(reconciliationNo))
      && (!materialPurchaseNo || row.materialPurchaseNo.toLowerCase().includes(materialPurchaseNo.toLowerCase()))
      && (!sourceGoodsPurchaseNo || row.sourceGoodsPurchaseNo?.toLowerCase().includes(sourceGoodsPurchaseNo.toLowerCase()))
      && (!supplier || row.supplierName.includes(supplier))
      && (!materialSku || row.materialSku.toLowerCase().includes(materialSku.toLowerCase()))
      && (!materialName || row.materialName.includes(materialName))
      && (!feeType
        || feeType === "面辅料采购货款"
        || (feeType === "调整费用" && row.adjustmentAmount !== 0)
        || (feeType === "其他费用" && Boolean(row.remark?.includes("其他费用"))))
      && (!currency || row.currency === currency)
      && (!status || row.status === status)
      && (!purchaser || row.purchaser === purchaser)
      && dateInRange(row.orderedAt, orderedFrom, orderedTo)
      && dateInRange(row.arrivedAt, arrivedFrom, arrivedTo)
      && dateInRange(row.inboundAt, inboundFrom, inboundTo);
  }), [arrivedFrom, arrivedTo, currency, feeType, inboundFrom, inboundTo, materialName, materialPurchaseNo, materialSku, orderedFrom, orderedTo, purchaser, reconciliationNo, rows, sourceGoodsPurchaseNo, status, supplier]);

  const suppliers = useMemo(() => Array.from(new Set(rows.map((row) => row.supplierName))), [rows]);
  const purchasers = useMemo(() => Array.from(new Set(rows.map((row) => row.purchaser).filter(Boolean))), [rows]);
  const statistics = useMemo(() => {
    const amountByCurrency = (selector: (row: MaterialPurchaseReconciliationRow) => number | undefined) =>
      (["RMB", "USD", "IDR"] as Currency[]).map((item) => ({
        currency: item,
        value: filteredRows.filter((row) => row.currency === item).reduce((sum, row) => sum + (selector(row) ?? 0), 0),
      })).filter((item) => item.value !== 0);
    const formatCurrencyTotals = (totals: Array<{ currency: Currency; value: number }>) =>
      totals.length ? totals.map((item) => `${item.currency} ${money(item.value)}`).join(" / ") : "-";
    return {
      purchaseQty: filteredRows.reduce((sum, row) => sum + row.purchaseQty, 0),
      inboundQty: filteredRows.reduce((sum, row) => sum + (row.inboundQty ?? 0), 0),
      purchaseAmount: formatCurrencyTotals(amountByCurrency((row) => row.actualPurchaseAmount)),
      supplierBillAmount: formatCurrencyTotals(amountByCurrency((row) => row.supplierBillAmount)),
      adjustmentAmount: formatCurrencyTotals(amountByCurrency((row) => row.adjustmentAmount)),
      finalPayableAmount: formatCurrencyTotals(amountByCurrency((row) => row.finalPayableAmount)),
      differenceAmount: formatCurrencyTotals(amountByCurrency((row) => row.differenceAmount)),
      pending: filteredRows.filter((row) => row.status === "待确认").length,
      partial: filteredRows.filter((row) => row.status === "部分确认").length,
      confirmed: filteredRows.filter((row) => row.status === "已确认").length,
    };
  }, [filteredRows]);

  const clearFilters = () => {
    setReconciliationNo(""); setMaterialPurchaseNo(""); setSourceGoodsPurchaseNo(""); setSupplier(""); setMaterialSku("");
    setMaterialName(""); setFeeType(""); setCurrency(""); setStatus(""); setPurchaser("");
    setOrderedFrom(""); setOrderedTo(""); setArrivedFrom(""); setArrivedTo(""); setInboundFrom(""); setInboundTo("");
  };

  const updateCalculatedAmounts = (row: MaterialPurchaseReconciliationRow) => {
    const baseQty = row.inboundQty && row.inboundQty > 0 ? row.inboundQty : row.purchaseQty;
    const actualPurchaseAmount = row.actualPurchaseAmount ?? (row.actualUnitPrice == null ? undefined : Number((baseQty * row.actualUnitPrice).toFixed(2)));
    return {
      ...row,
      actualPurchaseAmount,
      differenceAmount: row.supplierBillAmount == null || actualPurchaseAmount == null ? undefined : Number((row.supplierBillAmount - actualPurchaseAmount).toFixed(2)),
      finalPayableAmount: Number(((actualPurchaseAmount ?? 0) + row.adjustmentAmount).toFixed(2)),
    };
  };

  const saveEditing = () => {
    if (!editing) return;
    if ((editing.actualUnitPrice ?? 0) < 0 || (editing.actualPurchaseAmount ?? 0) < 0 || (editing.supplierBillAmount ?? 0) < 0) {
      return showToast("实际采购单价、采购货款和供应商账单金额不能小于 0");
    }
    if (editing.adjustmentAmount !== 0 && !editing.adjustmentReason?.trim()) return showToast("填写调整金额时必须填写调整原因");
    const next = updateCalculatedAmounts(editing);
    setRows((current) => current.map((row) => row.id === next.id ? next : row));
    setEditing(null);
    showToast(`已保存 ${next.materialPurchaseNo} / ${next.materialSku}`);
  };

  const confirmOne = (row: MaterialPurchaseReconciliationRow) => {
    setRows((current) => current.map((item) => item.id === row.id ? {
      ...item,
      status: "已确认",
      confirmedBy: "当前用户",
      confirmedAt: now,
      confirmedItems: item.confirmedItems.map((feeItem) => ({ ...feeItem, confirmed: true, confirmedBy: "当前用户", confirmedAt: now })),
    } : item));
    setConfirmRow(null);
    setConfirmWithoutBill(false);
    showToast(`已确认 ${row.materialPurchaseNo} / ${row.materialSku}`);
  };

  const requestConfirm = (row: MaterialPurchaseReconciliationRow) => {
    setConfirmWithoutBill(row.supplierBillAmount == null);
    setConfirmRow(row);
  };

  const savePartial = () => {
    if (!partialRow) return;
    const count = partialRow.confirmedItems.filter((item) => item.confirmed).length;
    const nextStatus = count === partialRow.confirmedItems.length ? "已确认" : count > 0 ? "部分确认" : "待确认";
    setRows((current) => current.map((row) => row.id === partialRow.id ? {
      ...partialRow,
      status: nextStatus,
      confirmedBy: nextStatus === "已确认" ? "当前用户" : undefined,
      confirmedAt: nextStatus === "已确认" ? now : undefined,
    } : row));
    setPartialRow(null);
    showToast(`已保存分项确认，当前状态：${nextStatus}`);
  };

  const batchConfirm = () => {
    if (!selected.length) return showToast("请先勾选对账记录");
    setRows((current) => current.map((row) => selected.includes(row.id) ? {
      ...row, status: "已确认", confirmedBy: "当前用户", confirmedAt: now,
      confirmedItems: row.confirmedItems.map((item) => ({ ...item, confirmed: true, confirmedBy: "当前用户", confirmedAt: now })),
    } : row));
    showToast(`已批量确认 ${selected.length} 条记录`);
    setSelected([]);
  };

  const batchPartial = () => {
    if (!selected.length) return showToast("请先勾选对账记录");
    setRows((current) => current.map((row) => selected.includes(row.id) ? {
      ...row,
      status: "部分确认",
      confirmedItems: row.confirmedItems.map((item) => item.feeItem === "采购货款" ? { ...item, confirmed: true, confirmedBy: "当前用户", confirmedAt: now } : item),
    } : row));
    showToast(`已批量部分确认 ${selected.length} 条记录的采购货款`);
    setSelected([]);
  };

  const parseImportFile = async (file: File) => {
    setImportFileName(file.name);
    setImporting(true);
    try {
      const rawRows = await parseExcelRows(file);
      const headers = rawRows[0]?.map((cell) => cell.trim()) ?? [];
      const indexOf = (header: string) => headers.indexOf(header);
      const existing = new Map(rows.map((row) => [`${row.materialPurchaseNo}|${row.materialSku}`, row]));
      const seen = new Set<string>();
      const preview = rawRows.slice(1).filter((line) => line.some((cell) => cell.trim())).map((line, index) => {
        const get = (header: string) => line[indexOf(header)]?.trim() ?? "";
        const materialPurchaseNoValue = get("面辅料采购单号");
        const materialSkuValue = get("面辅料SKU");
        const key = `${materialPurchaseNoValue}|${materialSkuValue}`;
        const errors: string[] = [];
        if (!materialPurchaseNoValue) errors.push("面辅料采购单号为空");
        if (!materialSkuValue) errors.push("面辅料SKU为空");
        if (seen.has(key)) errors.push("重复数据");
        seen.add(key);
        const matched = existing.get(key);
        if (materialPurchaseNoValue && materialSkuValue && !matched) errors.push("未找到对应采购明细");
        const parseAmount = (header: string, allowNegative = false) => {
          const raw = get(header);
          if (!raw) return undefined;
          const value = Number(raw);
          if (!Number.isFinite(value)) errors.push(`${header}格式错误`);
          else if (!allowNegative && value < 0) errors.push(`${header}不能小于 0`);
          return Number.isFinite(value) ? value : undefined;
        };
        const currencyValue = get("币种");
        if (currencyValue && !["RMB", "USD", "IDR"].includes(currencyValue)) errors.push("币种格式错误");
        return {
          rowNo: index + 2,
          materialPurchaseNo: materialPurchaseNoValue,
          sourceGoodsPurchaseNo: get("来源商品采购单号"),
          supplierName: get("供应商") || matched?.supplierName || "",
          materialSku: materialSkuValue,
          materialName: get("物料名称") || matched?.materialName || "",
          currency: (currencyValue || matched?.currency || "RMB") as Currency,
          actualUnitPrice: parseAmount("实际采购单价"),
          purchaseAmount: parseAmount("采购货款"),
          supplierBillAmount: parseAmount("供应商账单金额"),
          adjustmentAmount: parseAmount("调整金额", true),
          differenceReason: get("差异原因"),
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
    const validRows = importRows.filter((row) => row.errors.length === 0);
    const importMap = new Map(validRows.map((row) => [`${row.materialPurchaseNo}|${row.materialSku}`, row]));
    const overwriteCount = rows.filter((row) => importMap.has(`${row.materialPurchaseNo}|${row.materialSku}`) && row.supplierBillAmount != null).length;
    if (overwriteCount && !window.confirm(`其中 ${overwriteCount} 条记录已有供应商账单金额，确认覆盖？`)) return;
    setRows((current) => current.map((row) => {
      const imported = importMap.get(`${row.materialPurchaseNo}|${row.materialSku}`);
      if (!imported) return row;
      return updateCalculatedAmounts({
        ...row,
        currency: imported.currency,
        actualUnitPrice: imported.actualUnitPrice ?? row.actualUnitPrice,
        actualPurchaseAmount: imported.purchaseAmount ?? (imported.actualUnitPrice == null ? row.actualPurchaseAmount : undefined),
        supplierBillAmount: imported.supplierBillAmount,
        adjustmentAmount: imported.adjustmentAmount ?? row.adjustmentAmount,
        differenceReason: imported.differenceReason || row.differenceReason,
        remark: imported.remark || row.remark,
      });
    }));
    const failed = importRows.length - validRows.length;
    showToast(`导入完成：成功 ${validRows.length} 条，失败 ${failed} 条`);
    if (!failed) {
      setImportOpen(false);
      setImportRows([]);
      setImportFileName("");
    }
  };

  const dateRange = (label: string, from: string, setFrom: (value: string) => void, to: string, setTo: (value: string) => void) => (
    <label className="grid gap-1 text-xs text-gray-500"><span>{label}</span><div className="flex items-center gap-1"><input type="date" className={`${inputClass} w-[130px]`} value={from} onChange={(event) => setFrom(event.target.value)} /><span>~</span><input type="date" className={`${inputClass} w-[130px]`} value={to} onChange={(event) => setTo(event.target.value)} /></div></label>
  );

  const columns = ["", "展开", "面辅料采购单号", "来源商品采购单号", "供应商", "面辅料SKU", "物料名称", "规格 / 颜色", "单位", "采购类型", "采购员", "状态", "下单时间", "到货时间", "入库时间", "采购数量", "到货数量", "入库数量", "币种", "实际采购单价", "采购货款", "供应商账单金额", "调整金额", "最终应付金额", "差异金额", "备注", "操作"];

  return (
    <div>
      <PageHeader title="面辅料采购对账" desc="按面辅料采购单与 SKU 核对供应商采购货款，费用字段仅展示一层实际采购费用，支持编辑、部分确认和 Excel 导入" />

      <section className="mb-2 border border-gray-200 bg-white px-3 py-2">
        <div className="flex flex-wrap items-end gap-2">
          <label className="grid gap-1 text-xs text-gray-500"><span>对账单号</span><input className={`${inputClass} w-[150px]`} value={reconciliationNo} onChange={(event) => setReconciliationNo(event.target.value)} /></label>
          <label className="grid gap-1 text-xs text-gray-500"><span>面辅料采购单号</span><input className={`${inputClass} w-[170px]`} value={materialPurchaseNo} onChange={(event) => setMaterialPurchaseNo(event.target.value)} /></label>
          <label className="grid gap-1 text-xs text-gray-500"><span>来源商品采购单号</span><input className={`${inputClass} w-[170px]`} value={sourceGoodsPurchaseNo} onChange={(event) => setSourceGoodsPurchaseNo(event.target.value)} /></label>
          <label className="grid gap-1 text-xs text-gray-500"><span>供应商</span><select className={`${inputClass} w-[180px]`} value={supplier} onChange={(event) => setSupplier(event.target.value)}><option value="">全部</option>{suppliers.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label className="grid gap-1 text-xs text-gray-500"><span>面辅料SKU</span><input className={`${inputClass} w-[145px]`} value={materialSku} onChange={(event) => setMaterialSku(event.target.value)} /></label>
          <label className="grid gap-1 text-xs text-gray-500"><span>物料名称</span><input className={`${inputClass} w-[145px]`} value={materialName} onChange={(event) => setMaterialName(event.target.value)} /></label>
          <label className="grid gap-1 text-xs text-gray-500"><span>费用类型</span><select className={`${inputClass} w-[140px]`} value={feeType} onChange={(event) => setFeeType(event.target.value)}><option value="">全部</option><option>面辅料采购货款</option><option>调整费用</option><option>其他费用</option></select></label>
          <label className="grid gap-1 text-xs text-gray-500"><span>币种</span><select className={`${inputClass} w-[90px]`} value={currency} onChange={(event) => setCurrency(event.target.value)}><option value="">全部</option><option>RMB</option><option>USD</option><option>IDR</option></select></label>
          <label className="grid gap-1 text-xs text-gray-500"><span>状态</span><select className={`${inputClass} w-[105px]`} value={status} onChange={(event) => setStatus(event.target.value)}><option value="">全部</option><option>待确认</option><option>部分确认</option><option>已确认</option></select></label>
          <label className="grid gap-1 text-xs text-gray-500"><span>采购员</span><select className={`${inputClass} w-[110px]`} value={purchaser} onChange={(event) => setPurchaser(event.target.value)}><option value="">全部</option>{purchasers.map((item) => <option key={item}>{item}</option>)}</select></label>
          {dateRange("下单时间", orderedFrom, setOrderedFrom, orderedTo, setOrderedTo)}
          {dateRange("到货时间", arrivedFrom, setArrivedFrom, arrivedTo, setArrivedTo)}
          {dateRange("入库时间", inboundFrom, setInboundFrom, inboundTo, setInboundTo)}
          <button className="inline-flex h-8 items-center gap-1 rounded bg-blue-600 px-3 text-sm text-white"><Search size={14} />查询</button>
          <button className="h-8 rounded border border-gray-200 px-3 text-sm text-gray-600" onClick={clearFilters}>清空</button>
        </div>
      </section>

      <section className="mb-2 flex flex-wrap items-center gap-2 border border-gray-200 bg-white px-3 py-2">
        <button className="inline-flex h-8 items-center gap-1 rounded bg-[#009688] px-3 text-sm text-white" onClick={() => setImportOpen(true)}><Upload size={14} />导入供应商账单</button>
        <button className="h-8 rounded bg-blue-600 px-3 text-sm text-white" onClick={batchConfirm}>批量确认</button>
        <button className="h-8 rounded border border-blue-300 px-3 text-sm text-blue-700" onClick={batchPartial}>批量部分确认</button>
        <button className="inline-flex h-8 items-center gap-1 rounded border border-gray-200 px-3 text-sm text-gray-700" onClick={() => exportRows(filteredRows)}><Download size={14} />导出</button>
        <span className="ml-2 text-xs text-gray-500">已选 {selected.length} 条，共 {filteredRows.length} 条</span>
      </section>

      <section className="mb-2 flex flex-wrap gap-x-7 gap-y-2 border border-gray-200 bg-white px-4 py-2 text-sm">
        <div><span className="text-gray-500">对账记录：</span><b>{filteredRows.length}</b></div>
        <div><span className="text-gray-500">采购数量：</span><b>{quantity(statistics.purchaseQty)}</b></div>
        <div><span className="text-gray-500">入库数量：</span><b>{quantity(statistics.inboundQty)}</b></div>
        <div><span className="text-gray-500">采购货款：</span><b>{statistics.purchaseAmount}</b></div>
        <div><span className="text-gray-500">供应商账单：</span><b>{statistics.supplierBillAmount}</b></div>
        <div><span className="text-gray-500">调整金额：</span><b>{statistics.adjustmentAmount}</b></div>
        <div><span className="text-gray-500">最终应付：</span><b className="text-blue-700">{statistics.finalPayableAmount}</b></div>
        <div><span className="text-gray-500">差异：</span><b>{statistics.differenceAmount}</b></div>
        <div><span className="text-gray-500">待确认：</span><b className="text-blue-600">{statistics.pending}</b></div>
        <div><span className="text-gray-500">部分确认：</span><b className="text-amber-600">{statistics.partial}</b></div>
        <div><span className="text-gray-500">已确认：</span><b className="text-emerald-600">{statistics.confirmed}</b></div>
      </section>

      <section className="overflow-x-auto border border-gray-200 bg-white">
        <table className="min-w-[3250px] text-left text-xs">
          <thead className="sticky top-0 z-10 bg-gray-50 text-gray-700"><tr>{columns.map((column, index) => <th key={`${column}-${index}`} className={`whitespace-nowrap border-b border-r border-gray-200 px-2 py-2 font-medium ${index === columns.length - 1 ? "sticky right-0 z-20 bg-gray-50" : ""}`}>{index === 0 ? <input aria-label="全选当前列表" type="checkbox" checked={filteredRows.length > 0 && filteredRows.every((row) => selected.includes(row.id))} onChange={(event) => setSelected(event.target.checked ? filteredRows.map((row) => row.id) : [])} /> : column}</th>)}</tr></thead>
          <tbody>{filteredRows.map((row) => {
            const isExpanded = expanded.includes(row.id);
            return [
              <tr key={row.id} className="border-b border-gray-100 hover:bg-blue-50/30">
                <td className="px-2 py-2 text-center"><input type="checkbox" checked={selected.includes(row.id)} onChange={(event) => setSelected((current) => event.target.checked ? [...current, row.id] : current.filter((id) => id !== row.id))} /></td>
                <td className="px-2 py-2 text-center"><button aria-label={`展开 ${row.materialPurchaseNo}`} onClick={() => setExpanded((current) => current.includes(row.id) ? current.filter((id) => id !== row.id) : [...current, row.id])}>{isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}</button></td>
                <td className="whitespace-nowrap px-2 py-2"><button className="text-blue-600 hover:underline" onClick={() => setDetailRow(row)}>{row.materialPurchaseNo}</button></td>
                <td className="whitespace-nowrap px-2 py-2">{row.sourceGoodsPurchaseNo ? <button className="text-blue-600 hover:underline" onClick={() => showToast(`来源商品采购单：${row.sourceGoodsPurchaseNo}`)}>{row.sourceGoodsPurchaseNo}</button> : "-"}</td>
                <td className="min-w-[190px] px-2 py-2">{row.supplierName}</td>
                <td className="whitespace-nowrap px-2 py-2 font-medium">{row.materialSku}</td>
                <td className="min-w-[150px] px-2 py-2">{row.materialName}</td>
                <td className="min-w-[130px] px-2 py-2">{row.specification || "-"}</td>
                <td className="px-2 py-2">{row.unit || "-"}</td>
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
                <td className="px-2 py-2 text-right">{money(row.actualUnitPrice)}</td>
                <td className="px-2 py-2 text-right font-medium">{money(row.actualPurchaseAmount)}</td>
                <td className="px-2 py-2 text-right">{money(row.supplierBillAmount)}</td>
                <td className={`px-2 py-2 text-right ${row.adjustmentAmount ? "text-orange-600" : ""}`}>{money(row.adjustmentAmount)}</td>
                <td className="px-2 py-2 text-right font-semibold text-blue-700">{money(row.finalPayableAmount)}</td>
                <td className={`px-2 py-2 text-right font-medium ${(row.differenceAmount ?? 0) > 0 ? "text-red-600" : (row.differenceAmount ?? 0) < 0 ? "text-emerald-600" : "text-gray-700"}`}>{money(row.differenceAmount)}</td>
                <td className="max-w-[180px] truncate px-2 py-2" title={row.remark}>{row.remark || "-"}</td>
                <td className="sticky right-0 min-w-[230px] border-l border-gray-200 bg-white px-2 py-2 shadow-[-4px_0_8px_rgba(15,23,42,0.04)]">
                  <div className="flex gap-3 whitespace-nowrap">
                    <button className="text-blue-600" onClick={() => setEditing({ ...row })}>编辑费用</button>
                    <button className="text-blue-600" onClick={() => setPartialRow({ ...row, confirmedItems: row.confirmedItems.map((item) => ({ ...item })) })}>部分确认</button>
                    <button className="text-blue-600" onClick={() => requestConfirm(row)}>确认全部</button>
                  </div>
                </td>
              </tr>,
              isExpanded && <tr key={`${row.id}-expanded`} className="border-b border-blue-100 bg-blue-50/40"><td colSpan={27} className="px-10 py-3">
                <div className="grid min-w-[1100px] grid-cols-6 gap-4 text-xs">
                  <div><b className="text-gray-700">采购信息</b><div className="mt-1 leading-5 text-gray-600">采购单：{row.materialPurchaseNo}<br />来源单：{row.sourceGoodsPurchaseNo || "-"}<br />采购员：{row.purchaser || "-"}<br />供应商：{row.supplierName}</div></div>
                  <div><b className="text-gray-700">物料信息</b><div className="mt-1 leading-5 text-gray-600">SKU：{row.materialSku}<br />名称：{row.materialName}<br />规格：{row.specification || "-"}<br />单位：{row.unit}</div></div>
                  <div><b className="text-gray-700">数量信息</b><div className="mt-1 leading-5 text-gray-600">采购：{quantity(row.purchaseQty)}<br />到货：{quantity(row.arrivedQty)}<br />入库：{quantity(row.inboundQty)}</div></div>
                  <div><b className="text-gray-700">费用信息</b><div className="mt-1 leading-5 text-gray-600">币种：{row.currency}<br />实际单价：{money(row.actualUnitPrice)}<br />采购货款：{money(row.actualPurchaseAmount)}<br />供应商账单：{money(row.supplierBillAmount)}<br />调整金额：{money(row.adjustmentAmount)}<br />最终应付：{money(row.finalPayableAmount)}<br />差异金额：{money(row.differenceAmount)}<br />差异原因：{row.differenceReason || "-"}<br />备注：{row.remark || "-"}</div></div>
                  <div><b className="text-gray-700">差异信息</b><div className="mt-1 leading-5 text-gray-600">供应商账单：{money(row.supplierBillAmount)}<br />系统金额：{money(row.actualPurchaseAmount)}<br />差异金额：{money(row.differenceAmount)}<br />差异原因：{row.differenceReason || "-"}</div></div>
                  <div><b className="text-gray-700">确认信息</b><div className="mt-1 leading-5 text-gray-600">状态：{row.status}<br />确认人：{row.confirmedBy || "-"}<br />确认时间：{row.confirmedAt || "-"}<br />已确认：{row.confirmedItems.filter((item) => item.confirmed).map((item) => item.feeItem).join("、") || "-"}</div></div>
                </div>
              </td></tr>,
            ];
          })}</tbody>
        </table>
      </section>

      <DesignLogicCard sections={[
        { title: "页面定位", headers: ["项目", "说明"], rows: [["页面名称", "面辅料采购对账"], ["所属模块", "采购对账"], ["页面目标", "按面辅料采购单与 SKU 核对供应商采购货款"], ["上游来源", "面辅料采购单、供应商账单"], ["下游去向", "付款记录、财务核销"], ["展示方式", "一条采购明细一行，费用字段直接展示在主列表"]] },
        { title: "核心规则", headers: ["场景", "规则"], rows: [["对账维度", "面辅料采购单号 + 面辅料SKU"], ["采购货款", "优先使用手工录入，否则按入库数量或采购数量 × 实际采购单价计算"], ["供应商账单金额", "来自人工编辑或 Excel 导入"], ["调整金额", "用于补差、扣款和人工修正"], ["最终应付金额", "采购货款 + 调整金额"], ["差异金额", "供应商账单金额 - 采购货款"], ["确认全部", "确认整条采购费用"], ["部分确认", "分别确认采购货款和调整金额"], ["导入供应商账单", "按面辅料采购单号 + SKU 匹配更新费用"]] },
      ]} />

      <FormModal open={Boolean(editing)} onClose={() => setEditing(null)} title="编辑面辅料采购费用" widthClass="w-[720px]">
        {editing && <div className="space-y-4 text-sm">
          <div className="grid grid-cols-2 gap-3 rounded bg-gray-50 p-3">
            {[["面辅料采购单号", editing.materialPurchaseNo], ["来源商品采购单号", editing.sourceGoodsPurchaseNo || "-"], ["供应商", editing.supplierName], ["面辅料SKU", editing.materialSku], ["物料名称", editing.materialName], ["采购数量", quantity(editing.purchaseQty)], ["入库数量", quantity(editing.inboundQty)]].map(([label, value]) => <div key={label}><span className="text-xs text-gray-500">{label}</span><div className="font-medium">{value}</div></div>)}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className="grid gap-1"><span>币种</span><select className={inputClass} value={editing.currency} onChange={(event) => setEditing({ ...editing, currency: event.target.value as Currency })}><option>RMB</option><option>USD</option><option>IDR</option></select></label>
            <label className="grid gap-1"><span>实际采购单价</span><input className={inputClass} type="number" min="0" value={editing.actualUnitPrice ?? ""} onChange={(event) => setEditing({ ...editing, actualUnitPrice: event.target.value === "" ? undefined : Number(event.target.value), actualPurchaseAmount: undefined })} /></label>
            <label className="grid gap-1"><span>采购货款</span><input className={inputClass} type="number" min="0" value={editing.actualPurchaseAmount ?? ""} onChange={(event) => setEditing({ ...editing, actualPurchaseAmount: event.target.value === "" ? undefined : Number(event.target.value) })} /></label>
            <label className="grid gap-1"><span>供应商账单金额</span><input className={inputClass} type="number" min="0" value={editing.supplierBillAmount ?? ""} onChange={(event) => setEditing({ ...editing, supplierBillAmount: event.target.value === "" ? undefined : Number(event.target.value) })} /></label>
            <label className="grid gap-1"><span>调整金额</span><input className={inputClass} type="number" value={editing.adjustmentAmount} onChange={(event) => setEditing({ ...editing, adjustmentAmount: Number(event.target.value || 0) })} /></label>
            <label className="grid gap-1"><span>调整原因</span><input className={inputClass} value={editing.adjustmentReason ?? ""} onChange={(event) => setEditing({ ...editing, adjustmentReason: event.target.value })} /></label>
          </div>
          <label className="grid gap-1"><span>差异原因</span><textarea className="min-h-16 rounded border border-gray-200 p-2" value={editing.differenceReason ?? ""} onChange={(event) => setEditing({ ...editing, differenceReason: event.target.value })} /></label>
          <label className="grid gap-1"><span>备注</span><textarea className="min-h-16 rounded border border-gray-200 p-2" value={editing.remark ?? ""} onChange={(event) => setEditing({ ...editing, remark: event.target.value })} /></label>
          <div className="flex justify-end gap-2 border-t pt-3"><button className="h-8 rounded border px-4" onClick={() => setEditing(null)}>取消</button><button className="h-8 rounded bg-blue-600 px-4 text-white" onClick={saveEditing}>保存</button></div>
        </div>}
      </FormModal>

      <FormModal open={Boolean(confirmRow)} onClose={() => { setConfirmRow(null); setConfirmWithoutBill(false); }} title="确认全部面辅料采购费用" widthClass="w-[520px]">
        {confirmRow && <div className="space-y-4 text-sm">
          <div className="rounded bg-gray-50 p-3">确认该条面辅料采购费用无误？<br /><b>{confirmRow.materialPurchaseNo} / {confirmRow.materialSku}</b></div>
          {confirmWithoutBill && <div className="rounded border border-amber-200 bg-amber-50 p-3 text-amber-800">当前记录尚未录入供应商账单金额，是否直接确认系统采购货款？</div>}
          <div className="flex justify-end gap-2"><button className="h-8 rounded border px-4" onClick={() => setConfirmRow(null)}>取消</button><button className="h-8 rounded bg-blue-600 px-4 text-white" onClick={() => confirmOne(confirmRow)}>{confirmWithoutBill ? "二次确认" : "确认"}</button></div>
        </div>}
      </FormModal>

      <FormModal open={Boolean(partialRow)} onClose={() => setPartialRow(null)} title="部分确认面辅料采购费用" widthClass="w-[650px]">
        {partialRow && <div className="space-y-3 text-sm">
          <div className="overflow-hidden border border-gray-200"><table className="w-full text-left text-xs"><thead className="bg-gray-50"><tr>{["费用项目", "系统金额", "供应商账单金额", "差异", "是否确认"].map((item) => <th key={item} className="border-b px-3 py-2">{item}</th>)}</tr></thead><tbody>
            {partialRow.confirmedItems.map((item) => {
              const purchaseFee = item.feeItem === "采购货款";
              return <tr key={item.feeItem} className="border-b last:border-0"><td className="px-3 py-2 font-medium">{item.feeItem}</td><td className="px-3 py-2 text-right">{money(purchaseFee ? partialRow.actualPurchaseAmount : partialRow.adjustmentAmount)}</td><td className="px-3 py-2 text-right">{purchaseFee ? money(partialRow.supplierBillAmount) : "-"}</td><td className="px-3 py-2 text-right">{purchaseFee ? money(partialRow.differenceAmount) : "-"}</td><td className="px-3 py-2 text-center"><input type="checkbox" checked={item.confirmed} onChange={(event) => setPartialRow({ ...partialRow, confirmedItems: partialRow.confirmedItems.map((feeItem) => feeItem.feeItem === item.feeItem ? { ...feeItem, confirmed: event.target.checked, confirmedBy: event.target.checked ? "当前用户" : undefined, confirmedAt: event.target.checked ? now : undefined } : feeItem) })} /></td></tr>;
            })}
          </tbody></table></div>
          <div className="flex justify-end gap-2 border-t pt-3"><button className="h-8 rounded border px-4" onClick={() => setPartialRow(null)}>取消</button><button className="h-8 rounded bg-blue-600 px-4 text-white" onClick={savePartial}>保存确认结果</button></div>
        </div>}
      </FormModal>

      <FormModal open={Boolean(detailRow)} onClose={() => setDetailRow(null)} title={`面辅料采购单详情 ${detailRow?.materialPurchaseNo ?? ""}`} widthClass="w-[680px]">
        {detailRow && <div className="grid grid-cols-2 gap-3 text-sm">{[
          ["来源商品采购单号", detailRow.sourceGoodsPurchaseNo || "-"], ["供应商", detailRow.supplierName], ["面辅料SKU", detailRow.materialSku], ["物料名称", detailRow.materialName],
          ["规格 / 颜色", detailRow.specification || "-"], ["采购数量", quantity(detailRow.purchaseQty)], ["到货数量", quantity(detailRow.arrivedQty)], ["入库数量", quantity(detailRow.inboundQty)],
          ["实际采购单价", money(detailRow.actualUnitPrice)], ["采购货款", money(detailRow.actualPurchaseAmount)], ["供应商账单金额", money(detailRow.supplierBillAmount)], ["差异金额", money(detailRow.differenceAmount)],
        ].map(([label, value]) => <div key={label} className="rounded bg-gray-50 p-3"><span className="text-xs text-gray-500">{label}</span><div className="mt-1 font-medium">{value}</div></div>)}</div>}
      </FormModal>

      <FormModal open={importOpen} onClose={() => setImportOpen(false)} title="导入供应商账单" widthClass="w-[980px]">
        <div className="space-y-3 text-sm">
          <div className="rounded border border-blue-100 bg-blue-50 px-3 py-2 text-xs text-blue-800">按“面辅料采购单号 + 面辅料SKU”匹配。上传后必须先预览校验，再确认导入。</div>
          <div className="flex items-center gap-2">
            <button className="inline-flex h-8 items-center gap-1 rounded border border-blue-300 px-3 text-blue-700" onClick={downloadTemplate}><FileSpreadsheet size={14} />下载模板</button>
            <label className="inline-flex h-8 cursor-pointer items-center gap-1 rounded bg-[#009688] px-3 text-white"><Upload size={14} />上传 xls / xlsx<input className="hidden" type="file" accept=".xls,.xlsx" onChange={(event: ChangeEvent<HTMLInputElement>) => { const file = event.target.files?.[0]; if (file) void parseImportFile(file); event.currentTarget.value = ""; }} /></label>
            <span className="text-xs text-gray-500">{importFileName || "未选择文件"}</span>{importing && <span className="text-xs text-blue-600">解析中...</span>}
          </div>
          <div className="overflow-x-auto border border-gray-200"><table className="min-w-[1360px] text-left text-xs"><thead className="bg-gray-50"><tr>{["行号", "面辅料采购单号", "面辅料SKU", "供应商", "物料名称", "实际采购单价", "采购货款", "供应商账单金额", "调整金额", "差异原因", "校验状态", "错误原因"].map((item) => <th key={item} className="whitespace-nowrap border-b px-2 py-2">{item}</th>)}</tr></thead><tbody>
            {importRows.map((row) => <tr key={row.rowNo} className={`border-b ${row.errors.length ? "bg-red-50" : ""}`}><td className="px-2 py-2">{row.rowNo}</td><td className="px-2 py-2">{row.materialPurchaseNo}</td><td className="px-2 py-2">{row.materialSku}</td><td className="px-2 py-2">{row.supplierName}</td><td className="px-2 py-2">{row.materialName}</td><td className="px-2 py-2 text-right">{money(row.actualUnitPrice)}</td><td className="px-2 py-2 text-right">{money(row.purchaseAmount)}</td><td className="px-2 py-2 text-right">{money(row.supplierBillAmount)}</td><td className="px-2 py-2 text-right">{money(row.adjustmentAmount)}</td><td className="px-2 py-2">{row.differenceReason || "-"}</td><td className={`px-2 py-2 ${row.errors.length ? "text-red-600" : "text-emerald-600"}`}>{row.errors.length ? "失败" : "通过"}</td><td className="px-2 py-2 text-red-600">{row.errors.join("；") || "-"}</td></tr>)}
            {!importRows.length && <tr><td colSpan={12} className="p-10 text-center text-gray-400">请上传供应商账单文件，解析后在此预览。</td></tr>}
          </tbody></table></div>
          <div className="flex items-center justify-between border-t pt-3"><span className="text-xs text-gray-500">共 {importRows.length} 条，通过 {importRows.filter((row) => !row.errors.length).length} 条，失败 {importRows.filter((row) => row.errors.length).length} 条</span><div className="flex gap-2"><button className="h-8 rounded border px-4" onClick={() => { setImportRows([]); setImportFileName(""); }}>清空</button><button className="h-8 rounded bg-[#009688] px-4 text-white" onClick={confirmImport}>确认导入</button></div></div>
        </div>
      </FormModal>

      <Toast msg={toast} />
    </div>
  );
}
