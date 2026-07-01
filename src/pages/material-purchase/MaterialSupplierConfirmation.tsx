import { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import { Download, Plus, Printer, RefreshCw, Search, X } from "lucide-react";
import PageHeader from "../../components/common/PageHeader";
import Toast from "../../components/common/Toast";

type Status = "待确认" | "已编辑" | "已确认";
type SupplierConfirmStatus = "未确认" | "已确认" | "已变更" | "已作废";
type LabelStatus = "未生成" | "已生成" | "已打印" | "部分打印" | "已重打" | "异常";
type Label = {
  labelNo: string; packageNo: string; inboundNo: string; relationNo: string; qrContent: string;
  status: LabelStatus; printCount: number; printedAt: string; printedBy: string;
};
type Roll = { no: string; qty: number; weight: number; boxNo: string; remark: string; label?: Label };
type Pack = { no: string; type: "包" | "箱" | "袋"; packQty: number; baseQty: number; weight: number; boxNo: string; remark: string; label?: Label };
type Box = { no: string; count: number; weight: number; volume: number; length: number; width: number; height: number; packQty: number; baseQty: number; remark: string };
type Log = { time: string; operator: string; type: string; content: string; remark?: string };
type Confirmation = {
  confirmationNo: string; purchaseNo: string; sourceNo: string; supplier: string; sku: string; spu: string; materialName: string;
  category: "面料" | "辅料"; specification: string; baseUnit: string; packageUnit: "卷" | "包";
  purchaseQty: number; purchasePackageQty: number; packageRule: string; unitPrice: number; amount: string;
  buyer: string; purchaseDate: string; expectedArrivalDate: string; status: Status; updatedAt: string; operator: string;
  supplierConfirmStatus: SupplierConfirmStatus; syncedAt?: string; syncedBy?: string;
  actualQty: number | ""; actualPackageQty: number | ""; actualBoxes: number | ""; totalWeight: number | "";
  totalVolume: number | ""; shipDate: string;
  shippingRemark: string; supplierRemark: string; purchaseRemark: string; internalRemark: string;
  rolls: Roll[]; packs: Pack[]; boxes: Box[]; logs: Log[];
};

const stamp = () => new Date().toLocaleString("zh-CN", { hour12: false }).replaceAll("/", "-");
const dateStamp = () => new Date().toISOString().slice(0, 10);
const labelStatusClass: Record<LabelStatus, string> = {
  未生成: "bg-gray-100 text-gray-600", 已生成: "bg-blue-50 text-blue-700", 已打印: "bg-emerald-50 text-emerald-700",
  部分打印: "bg-amber-50 text-amber-700", 已重打: "bg-violet-50 text-violet-700", 异常: "bg-red-50 text-red-700",
};
const statusClass: Record<Status, string> = {
  待确认: "border-amber-200 bg-amber-50 text-amber-700", 已编辑: "border-blue-200 bg-blue-50 text-blue-700", 已确认: "border-emerald-200 bg-emerald-50 text-emerald-700",
};
const inputClass = "h-8 rounded border border-gray-300 bg-white px-2 text-sm outline-none focus:border-blue-500";

function qrText(row: Confirmation, packageNo: string, type: string, qty: number, baseQty: number) {
  return [
    `SKU：${row.sku}`,
    `采购单号：${row.purchaseNo}`,
    `基础单位：${row.baseUnit}`,
    `包装单位：${row.packageUnit}`,
    `包装号：${packageNo}`,
    `包装数量：${qty}${type}`,
    `基础数量：${baseQty}${row.baseUnit}`,
    `供应商：${row.supplier}`,
    `打印日期：${dateStamp()}`,
  ].join("\n");
}

function makeLabel(row: Confirmation, packageNo: string, type: string, qty: number, baseQty: number, index: number, existing?: Label): Label {
  return {
    labelNo: existing?.labelNo || `LAB-${dateStamp().replaceAll("-", "")}-${String(index + 1).padStart(4, "0")}`,
    packageNo, inboundNo: existing?.inboundNo || `YRK-${row.sku}-${dateStamp().replaceAll("-", "")}`,
    relationNo: row.sourceNo, qrContent: qrText(row, packageNo, type, qty, baseQty),
    status: existing?.status || "已生成", printCount: existing?.printCount || 0, printedAt: existing?.printedAt || "", printedBy: existing?.printedBy || "",
  };
}

const fabricRolls: Roll[] = [
  [80, 12, "BOX-001"], [78, 11.8, "BOX-001"], [82, 12.3, "BOX-002"],
].map(([qty, weight, boxNo], i) => ({
  no: `F260625${String(i + 1).padStart(4, "0")}`, qty: Number(qty), weight: Number(weight), boxNo: String(boxNo), remark: "",
  label: {
    labelNo: `LAB-20260625-${String(i + 1).padStart(4, "0")}`, packageNo: `F260625${String(i + 1).padStart(4, "0")}`,
    inboundNo: "YRK-FAB-20260528-101", relationNo: "GG-FAB-20260528-101", qrContent: "", status: "已生成",
    printCount: 0, printedAt: "", printedBy: "",
  },
}));

const initialRows: Confirmation[] = [
  {
    confirmationNo: "SC-MAT-202606-0001", purchaseNo: "ID-MP-2026-0001", sourceNo: "GP-2026-0001", supplier: "广州华盛面料有限公司",
    sku: "FAB-5000", spu: "FAB-1000", materialName: "180g纯棉针织布", category: "面料", specification: "白色 / 180g", baseUnit: "米", packageUnit: "卷",
    purchaseQty: 500, purchasePackageQty: 10, packageRule: "50米/卷，5卷/箱", unitPrice: 2.79, amount: "1,395.00 CNY",
    buyer: "张三", purchaseDate: "2026-06-01", expectedArrivalDate: "2026-06-28", status: "已编辑", supplierConfirmStatus: "未确认", updatedAt: "2026-06-25 10:00", operator: "张三",
    actualQty: 498, actualPackageQty: 3, actualBoxes: 2, totalWeight: 86, totalVolume: 0.72, shipDate: "2026-06-25",
    shippingRemark: "分两箱发出，请按卷号清点。",
    supplierRemark: "实际米数以卷标为准。", purchaseRemark: "到货后抽检克重和色差。", internalRemark: "",
    rolls: fabricRolls, packs: [], boxes: [
      { no: "BOX-001", count: 1, weight: 43, volume: 0.36, length: 60, width: 45, height: 35, packQty: 2, baseQty: 158, remark: "" },
      { no: "BOX-002", count: 1, weight: 43, volume: 0.36, length: 60, width: 45, height: 35, packQty: 1, baseQty: 82, remark: "" },
    ],
    logs: [
      { time: "2026-06-25 09:00", operator: "系统", type: "同步采购单", content: "从面辅料采购单 ID-MP-2026-0001 同步生成确认单" },
      { time: "2026-06-25 10:00", operator: "系统", type: "自动生成标签", content: "根据3条卷号明细自动生成3张标签" },
    ],
  },
  {
    confirmationNo: "SC-MAT-202606-0002", purchaseNo: "ID-MP-2026-0002", sourceNo: "GP-2026-0001", supplier: "东莞宏远辅料有限公司",
    sku: "ACC-2002", spu: "ACC-1000", materialName: "白色纽扣", category: "辅料", specification: "白色 / 15mm", baseUnit: "个", packageUnit: "包",
    purchaseQty: 10000, purchasePackageQty: 100, packageRule: "100个/包，20包/箱", unitPrice: 0.020112, amount: "201.12 CNY",
    buyer: "李四", purchaseDate: "2026-06-02", expectedArrivalDate: "2026-06-29", status: "已确认", supplierConfirmStatus: "已确认", syncedAt: "2026-06-25 11:30", syncedBy: "李四", updatedAt: "2026-06-25 11:30", operator: "李四",
    actualQty: 10000, actualPackageQty: 100, actualBoxes: 5, totalWeight: 42, totalVolume: "", shipDate: "",
    shippingRemark: "", supplierRemark: "", purchaseRemark: "注意纽扣色差。", internalRemark: "",
    rolls: [], packs: Array.from({ length: 100 }, (_, i) => ({ no: `PK260625${String(i + 1).padStart(4, "0")}`, type: "包" as const, packQty: 1, baseQty: 100, weight: 0.42, boxNo: `BOX-${String(Math.floor(i / 20) + 1).padStart(3, "0")}`, remark: "" })),
    boxes: [{ no: "BOX-001", count: 1, weight: 8.4, volume: 0.12, length: 45, width: 35, height: 28, packQty: 20, baseQty: 2000, remark: "" }],
    logs: [
      { time: "2026-06-25 11:00", operator: "系统", type: "自动生成标签", content: "根据100条包装明细自动生成100张标签" },
      { time: "2026-06-25 11:30", operator: "李四", type: "供应商确认", content: "确认实际发货10000个，100包，5箱" },
      { time: "2026-06-25 11:30", operator: "系统", type: "同步到面辅料采购单", content: "同步到 ID-MP-2026-0002" },
    ],
  },
];

fabricRolls.forEach((roll) => {
  if (roll.label) roll.label.qrContent = qrText(initialRows[0], roll.no, "卷", 1, roll.qty);
});

function autoLabels(row: Confirmation): Confirmation {
  if (row.packageUnit === "卷") {
    const previous = new Map(row.rolls.flatMap((x) => x.label ? [[x.label.packageNo, x.label] as const] : []));
    return { ...row, rolls: row.rolls.map((x, i) => ({ ...x, label: x.no && row.sku && x.qty ? makeLabel(row, x.no, "卷", 1, x.qty, i, previous.get(x.no)) : undefined })) };
  }
  const previous = new Map(row.packs.flatMap((x) => x.label ? [[x.label.packageNo, x.label] as const] : []));
  return { ...row, packs: row.packs.map((x, i) => ({ ...x, label: x.no && row.sku && x.baseQty ? makeLabel(row, x.no, x.type, x.packQty, x.baseQty, i, previous.get(x.no)) : undefined })) };
}

initialRows.forEach((row, index) => {
  const normalized = autoLabels(row);
  if (index === 1) normalized.packs.forEach((x) => {
    if (x.label) Object.assign(x.label, { status: "已打印", printCount: 1, printedAt: "2026-06-25 11:20", printedBy: "李四" });
  });
  initialRows[index] = normalized;
});

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="grid gap-1 text-xs text-gray-600"><span>{label}</span>{children}</label>;
}
function Section({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return <section className="rounded-lg border border-gray-200 bg-white"><div className="flex items-center justify-between border-b px-4 py-3">
    <h3 className="flex items-center gap-2 text-sm font-semibold"><span className="h-4 w-1 rounded bg-blue-600" />{title}</h3>{action}</div><div className="p-4">{children}</div></section>;
}
function InfoGrid({ items }: { items: [string, React.ReactNode][] }) {
  return <div className="grid gap-x-6 gap-y-3 md:grid-cols-3 xl:grid-cols-4">{items.map(([label, value]) => <div key={label} className="min-w-0 text-sm"><div className="mb-1 text-xs text-gray-500">{label}</div><div className="break-words">{value || "-"}</div></div>)}</div>;
}
function Overlay({ title, subtitle, children, onClose, width = "w-[1180px]" }: { title: string; subtitle?: string; children: React.ReactNode; onClose: () => void; width?: string }) {
  return <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/45 p-4"><div className={`relative flex max-h-[92vh] max-w-[calc(100vw-24px)] flex-col overflow-hidden rounded-xl border bg-slate-50 shadow-2xl ${width}`}>
    <div className="flex items-center justify-between border-b bg-white px-5 py-4"><div><h2 className="font-semibold">{title}</h2>{subtitle && <p className="mt-1 text-xs text-gray-500">{subtitle}</p>}</div><button className="rounded p-2 hover:bg-gray-100" onClick={onClose}><X size={18} /></button></div>{children}</div></div>;
}
function StatusPill({ value }: { value: LabelStatus }) {
  return <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] ${labelStatusClass[value]}`}>{value}</span>;
}
function ConfirmStatusPill({ value }: { value: SupplierConfirmStatus }) {
  const style = value === "已确认" ? "bg-emerald-50 text-emerald-700" : value === "已变更" ? "bg-orange-50 text-orange-700" : value === "已作废" ? "bg-red-50 text-red-700" : "bg-gray-100 text-gray-600";
  return <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] ${style}`}>{value}</span>;
}
function getLabels(row: Confirmation) {
  return row.packageUnit === "卷" ? row.rolls.flatMap((x) => x.label ? [x.label] : []) : row.packs.flatMap((x) => x.label ? [x.label] : []);
}
function getLabelState(row: Confirmation): LabelStatus {
  const total = row.packageUnit === "卷" ? row.rolls.length : row.packs.length;
  const invalid = row.packageUnit === "卷" ? row.rolls.some((x) => !x.no || !x.qty) : row.packs.some((x) => !x.no || !x.baseQty);
  if (total && (!row.sku || invalid)) return "异常";
  const labels = getLabels(row);
  if (!total || !labels.length) return "未生成";
  if (labels.some((x) => x.status === "异常")) return "异常";
  const printed = labels.filter((x) => x.printCount > 0).length;
  if (printed === 0) return "已生成";
  if (printed < labels.length) return "部分打印";
  return labels.some((x) => x.printCount > 1) ? "已重打" : "已打印";
}

export default function MaterialSupplierConfirmation() {
  const [rows, setRows] = useState(initialRows);
  const emptyFilters = { confirmationNo: "", purchaseNo: "", sourceNo: "", supplier: "", sku: "", spu: "", materialName: "", category: "", packageUnit: "", status: "", labelStatus: "", from: "", to: "", operator: "" };
  const [filters, setFilters] = useState(emptyFilters);
  const [applied, setApplied] = useState(emptyFilters);
  const [selected, setSelected] = useState<string[]>([]);
  const [dialog, setDialog] = useState<{ mode: "view" | "edit" | "logs"; row: Confirmation } | null>(null);
  const [draft, setDraft] = useState<Confirmation | null>(null);
  const [generatorOpen, setGeneratorOpen] = useState(false);
  const [generator, setGenerator] = useState({ count: 3, prefix: "F260625", qty: 80, weight: 12, start: 1 });
  const [labelPreview, setLabelPreview] = useState<{ row: Confirmation; labels: Label[]; index: number } | null>(null);
  const [confirming, setConfirming] = useState<Confirmation | null>(null);
  const [purchaseSync, setPurchaseSync] = useState<Confirmation | null>(null);
  const [editUnlocked, setEditUnlocked] = useState(false);
  const [toast, setToast] = useState("");
  const showToast = (text: string) => { setToast(text); window.setTimeout(() => setToast(""), 3500); };
  const updateFilter = (key: keyof typeof filters, value: string) => setFilters((x) => ({ ...x, [key]: value }));
  const filteredRows = useMemo(() => rows.filter((r) =>
    (!applied.confirmationNo || r.confirmationNo.includes(applied.confirmationNo)) && (!applied.purchaseNo || r.purchaseNo.includes(applied.purchaseNo)) &&
    (!applied.sourceNo || r.sourceNo.includes(applied.sourceNo)) && (!applied.supplier || r.supplier === applied.supplier) &&
    (!applied.sku || r.sku.includes(applied.sku)) && (!applied.spu || r.spu.includes(applied.spu)) &&
    (!applied.materialName || r.materialName.includes(applied.materialName)) && (!applied.category || r.category === applied.category) &&
    (!applied.packageUnit || r.packageUnit === applied.packageUnit) && (!applied.status || r.status === applied.status) &&
    (!applied.labelStatus || getLabelState(r) === applied.labelStatus) && (!applied.operator || r.operator === applied.operator) &&
    (!applied.from || r.updatedAt.slice(0, 10) >= applied.from) && (!applied.to || r.updatedAt.slice(0, 10) <= applied.to)
  ), [applied, rows]);

  const setDraftValue = <K extends keyof Confirmation>(key: K, value: Confirmation[K]) => setDraft((x) => x ? autoLabels({ ...x, [key]: value }) : x);
  const open = (mode: "view" | "edit" | "logs", row: Confirmation) => { setDialog({ mode, row }); setDraft(mode === "edit" ? structuredClone(row) : null); setEditUnlocked(false); };
  const close = () => { setDialog(null); setDraft(null); setGeneratorOpen(false); setEditUnlocked(false); };
  const updateRow = (next: Confirmation) => {
    setRows((current) => current.map((x) => x.confirmationNo === next.confirmationNo ? next : x));
    if (dialog) setDialog({ ...dialog, row: next });
    setDraft((x) => x?.confirmationNo === next.confirmationNo ? next : x);
  };
  const validateForLabels = (row: Confirmation) => {
    const details = row.packageUnit === "卷" ? row.rolls : row.packs;
    if (!details.length) return "请先生成卷号或维护包装明细";
    if (!row.sku) return "SKU为空，无法打印标签";
    if (details.some((x) => !x.no)) return "包装号为空，无法打印标签";
    if (row.packageUnit === "卷" ? row.rolls.some((x) => !x.qty) : row.packs.some((x) => !x.baseQty)) return "数量为空，无法打印标签";
    if (new Set(details.map((x) => x.no)).size !== details.length) return "包装号重复，请先修正";
    return "";
  };
  const openPrintPreview = (row: Confirmation) => {
    const error = validateForLabels(row);
    if (error) { showToast(error); return; }
    const labels = getLabels(row);
    if (!labels.length) { showToast("请先生成卷号或维护包装明细"); return; }
    setLabelPreview({ row, labels, index: 0 });
  };
  const printLabels = (row: Confirmation, labelNos?: string[]) => {
    const error = validateForLabels(row);
    if (error) { showToast(error); return; }
    if (!getLabels(row).length) { showToast("没有卷号或包装明细，暂无可打印标签"); return; }
    const target = new Set(labelNos || getLabels(row).map((x) => x.labelNo));
    const touch = (label?: Label) => label && target.has(label.labelNo) ? { ...label, status: label.printCount > 0 ? "已重打" as const : "已打印" as const, printCount: label.printCount + 1, printedAt: stamp(), printedBy: "当前用户" } : label;
    const next = { ...row, rolls: row.rolls.map((x) => ({ ...x, label: touch(x.label) })), packs: row.packs.map((x) => ({ ...x, label: touch(x.label) })),
      logs: [...row.logs, { time: stamp(), operator: "当前用户", type: getLabels(row).some((x) => target.has(x.labelNo) && x.printCount > 0) ? "重新打印标签" : "打印标签", content: `打印${target.size}张标签` }] };
    updateRow(next);
    setLabelPreview((p) => p?.row.confirmationNo === next.confirmationNo ? { ...p, row: next, labels: getLabels(next) } : p);
    showToast(`打印任务已提交，共 ${target.size} 张`);
  };
  const batchPrint = () => {
    if (!selected.length) return showToast("请先勾选确认单");
    const targetRows = rows.filter((r) => selected.includes(r.confirmationNo));
    const failed = targetRows.filter((r) => validateForLabels(r) || !getLabels(r).length);
    const ready = targetRows.filter((r) => !failed.includes(r));
    if (ready.length) openPrintPreview(ready[0]);
    showToast(failed.length ? `部分无标签：${failed.map((x) => x.confirmationNo).join("、")}` : "已进入标签预览，请确认后打印");
  };
  const save = (status: Status) => {
    if (!draft) return;
    const next = autoLabels({ ...draft, status, supplierConfirmStatus: draft.supplierConfirmStatus === "已确认" ? "已变更" : draft.supplierConfirmStatus, updatedAt: stamp(), operator: "当前用户", logs: [...draft.logs, { time: stamp(), operator: "当前用户", type: status === "已确认" ? "保存并确认" : "保存草稿", content: `实际发货${draft.actualQty || 0}${draft.baseUnit}，${draft.actualPackageQty || 0}${draft.packageUnit}` }] });
    setRows((x) => x.map((r) => r.confirmationNo === next.confirmationNo ? next : r)); close(); showToast(status === "已确认" ? "已保存并确认" : "草稿已保存");
  };
  const supplierConfirm = (row: Confirmation) => setConfirming(autoLabels(row));
  const confirmSync = () => {
    if (!confirming) return;
    const time = stamp();
    const next: Confirmation = {
      ...confirming, status: "已确认", supplierConfirmStatus: "已确认", syncedAt: time, syncedBy: "当前用户", updatedAt: time, operator: "当前用户",
      logs: [...confirming.logs,
        { time, operator: "当前用户", type: confirming.supplierConfirmStatus === "已变更" ? "重新供应商确认" : "供应商确认", content: `确认实际发货${confirming.actualQty || 0}${confirming.baseUnit}，${confirming.actualPackageQty || 0}${confirming.packageUnit}，${confirming.actualBoxes || 0}箱` },
        { time, operator: "系统", type: "同步到面辅料采购单", content: `同步到 ${confirming.purchaseNo}` },
      ],
    };
    setRows((current) => current.map((x) => x.confirmationNo === next.confirmationNo ? next : x));
    setDraft((current) => current?.confirmationNo === next.confirmationNo ? next : current);
    setDialog((current) => current?.row.confirmationNo === next.confirmationNo ? { ...current, row: next } : current);
    setConfirming(null); setPurchaseSync(next);
    showToast("供应商确认成功，实际发货和包装信息已同步到面辅料采购单。");
  };

  return <div className="p-4">
    <PageHeader title="面辅料供应商确认单" desc="独立承接面辅料采购单数据，维护供应商实际发货数量、卷号、包装数量、箱数、重量和标签打印信息。" />
    <section className="mb-3 rounded border bg-white p-3">
      <div className="grid gap-2 md:grid-cols-3 xl:grid-cols-5">
        {([["确认单号","confirmationNo"],["面辅料采购单号","purchaseNo"],["来源商品采购单号","sourceNo"],["面辅料SKU","sku"],["SPU","spu"],["物料名称","materialName"]] as const).map(([label,key]) => <Field key={key} label={label}><input className={inputClass} value={filters[key]} onChange={(e)=>updateFilter(key,e.target.value)} /></Field>)}
        <Field label="供应商"><select className={inputClass} value={filters.supplier} onChange={(e)=>updateFilter("supplier",e.target.value)}><option value="">全部</option>{[...new Set(rows.map((x)=>x.supplier))].map((x)=><option key={x}>{x}</option>)}</select></Field>
        <Field label="物料分类"><select className={inputClass} value={filters.category} onChange={(e)=>updateFilter("category",e.target.value)}><option value="">全部</option><option>面料</option><option>辅料</option></select></Field>
        <Field label="包装单位"><select className={inputClass} value={filters.packageUnit} onChange={(e)=>updateFilter("packageUnit",e.target.value)}><option value="">全部</option><option>卷</option><option>包</option></select></Field>
        <Field label="状态"><select className={inputClass} value={filters.status} onChange={(e)=>updateFilter("status",e.target.value)}><option value="">全部</option><option>待确认</option><option>已编辑</option><option>已确认</option></select></Field>
        <Field label="标签状态"><select className={inputClass} value={filters.labelStatus} onChange={(e)=>updateFilter("labelStatus",e.target.value)}><option value="">全部</option>{Object.keys(labelStatusClass).map((x)=><option key={x}>{x}</option>)}</select></Field>
        <Field label="更新时间"><div className="flex gap-1"><input type="date" className={`${inputClass} min-w-0`} value={filters.from} onChange={(e)=>updateFilter("from",e.target.value)} /><input type="date" className={`${inputClass} min-w-0`} value={filters.to} onChange={(e)=>updateFilter("to",e.target.value)} /></div></Field>
        <Field label="最后操作人"><select className={inputClass} value={filters.operator} onChange={(e)=>updateFilter("operator",e.target.value)}><option value="">全部</option>{[...new Set(rows.map((x)=>x.operator))].map((x)=><option key={x}>{x}</option>)}</select></Field>
      </div>
      <div className="mt-3 flex flex-wrap gap-2 border-t pt-3">
        <button className="flex h-8 items-center gap-1 rounded bg-blue-600 px-4 text-sm text-white" onClick={()=>setApplied(filters)}><Search size={14}/>查询</button>
        <button className="h-8 rounded border px-4 text-sm" onClick={()=>{setFilters(emptyFilters);setApplied(emptyFilters)}}>重置</button>
        <button className="flex h-8 items-center gap-1 rounded border border-blue-300 px-3 text-sm text-blue-700" onClick={()=>showToast(`已导出 ${filteredRows.length} 条`)}><Download size={14}/>导出</button>
        <button className="flex h-8 items-center gap-1 rounded bg-teal-600 px-3 text-sm text-white" onClick={()=>showToast("同步完成，暂无新增数据")}><RefreshCw size={14}/>同步采购单</button>
        <button className="flex h-8 items-center gap-1 rounded bg-slate-700 px-3 text-sm text-white" onClick={batchPrint}><Printer size={14}/>批量打印标签</button>
      </div>
    </section>
    <div className="mb-2 rounded border bg-white px-3 py-2 text-xs text-gray-600">共 <b className="text-blue-700">{filteredRows.length}</b> 条 · 标签打印内置于确认单模块，不提供独立标签菜单</div>
    <div className="overflow-x-auto border bg-white"><table className="min-w-[2780px] table-fixed text-left text-xs">
      <colgroup>{[44,165,145,145,180,115,100,135,70,65,65,85,95,95,95,75,80,85,110,110,135,80,280].map((w,i)=><col key={i} style={{width:w}} />)}</colgroup>
      <thead className="bg-gray-50"><tr>{["选择","确认单号","面辅料采购单号","来源商品采购单号","供应商名称","面辅料SKU","SPU","物料名称","分类","基础单位","包装单位","采购数量","采购包装数量","实际发货数量","实际包装数量","实际箱数","总重量","标签数量","标签状态","供应商确认状态","状态 / 更新时间","最后操作人","操作"].map((h)=><th key={h} className="border-b px-2 py-2 font-medium">{h}</th>)}</tr></thead>
      <tbody>{filteredRows.map((row)=>{const labels=getLabels(row);return <tr key={row.confirmationNo} className="border-b align-top hover:bg-blue-50/30">
        <td className="px-2 py-2 text-center"><input type="checkbox" checked={selected.includes(row.confirmationNo)} onChange={()=>setSelected((x)=>x.includes(row.confirmationNo)?x.filter((n)=>n!==row.confirmationNo):[...x,row.confirmationNo])}/></td>
        <td className="px-2 py-2 font-medium text-blue-700">{row.confirmationNo}</td><td className="px-2 py-2"><button className="text-blue-700 hover:underline" onClick={()=>setPurchaseSync(row)}>{row.purchaseNo}</button></td><td className="px-2 py-2">{row.sourceNo}</td><td className="px-2 py-2">{row.supplier}</td>
        <td className="px-2 py-2">{row.sku}</td><td className="px-2 py-2">{row.spu}</td><td className="px-2 py-2">{row.materialName}</td><td className="px-2 py-2">{row.category}</td><td className="px-2 py-2">{row.baseUnit}</td><td className="px-2 py-2">{row.packageUnit}</td>
        <td className="px-2 py-2">{row.purchaseQty.toLocaleString()}</td><td className="px-2 py-2">{row.purchasePackageQty}</td><td className="px-2 py-2">{row.actualQty||"-"}</td><td className="px-2 py-2">{row.actualPackageQty||"-"}</td><td className="px-2 py-2">{row.actualBoxes||"-"}</td><td className="px-2 py-2">{row.totalWeight?`${row.totalWeight}KG`:"-"}</td>
        <td className="px-2 py-2 font-medium">{labels.length}</td><td className="px-2 py-2"><StatusPill value={getLabelState(row)}/></td><td className="px-2 py-2"><ConfirmStatusPill value={row.supplierConfirmStatus}/></td><td className="px-2 py-2"><span className={`rounded-full border px-2 py-0.5 ${statusClass[row.status]}`}>{row.status}</span><div className="mt-1 text-gray-500">{row.updatedAt}</div></td><td className="px-2 py-2">{row.operator}</td>
        <td className="px-2 py-2"><div className="flex flex-wrap gap-x-2 gap-y-1"><button className="text-blue-700" onClick={()=>open("view",row)}>查看</button><button className="text-teal-700" onClick={()=>open("edit",row)}>编辑</button><button className="text-slate-700" onClick={()=>openPrintPreview(row)}>打印标签</button><button className="text-orange-700" onClick={()=>supplierConfirm(row)}>供应商确认</button><button className="text-gray-700" onClick={()=>open("logs",row)}>操作日志</button></div></td>
      </tr>})}</tbody></table></div>

    <section className="mt-4 rounded border bg-white p-4"><h2 className="mb-2 font-semibold">页面功能说明</h2><p className="text-sm leading-6 text-gray-600">面辅料供应商确认单用于维护供应商实际发货信息。在编辑弹窗中，生成卷号和打印标签是实际发货信息的核心操作，因此按钮固定展示在实际发货信息分组右上角。生成卷号根据实际包装数量自动生成卷号明细；标签根据卷号或包装明细自动生成，用户点击打印标签时先进入标签预览，再确认打印。供应商确认可将实际发货和包装信息同步到对应的面辅料采购单。</p></section>
    <section className="mt-3 rounded border bg-white p-4"><h2 className="mb-3 font-semibold">业务逻辑说明</h2><div className="overflow-x-auto rounded border"><table className="min-w-full text-left text-xs"><thead className="bg-gray-50"><tr>{["业务场景","规则说明","页面结果"].map((h)=><th key={h} className="border-b px-3 py-2">{h}</th>)}</tr></thead><tbody>
      {[
        ["标签二维码","二维码只承载核心包装信息","扫码后展示SKU、采购单号、单位、包装号、数量、供应商、打印日期"],["字段精简","删除入库单号、关联单号、批次、包装范围等字段","扫码结果更短、更适合仓库核对"],["包装数量","按当前包装单位展示","例如1卷、1包、1箱"],["基础数量","按基础单位展示当前包装内数量","例如80米、200个"],["打印日期","使用当前标签打印日期","便于追溯标签打印时间"],["按钮位置","生成卷号、打印标签放在实际发货信息右上角","用户填写实际包装数量后可直接操作"],["标签生成","标签根据卷号 / 包装明细自动生成","不需要生成标签按钮"],["打印标签","点击打印标签进入预览弹窗","用户确认后打印"],["供应商确认","用户确认实际发货和包装信息","同步到面辅料采购单"],
      ].map((r)=><tr key={r[0]} className="border-b last:border-0">{r.map((c)=><td key={c} className="px-3 py-2">{c}</td>)}</tr>)}
    </tbody></table></div></section>

    {dialog?.mode==="logs"&&<Overlay title="操作日志" subtitle={dialog.row.confirmationNo} onClose={close} width="w-[900px]"><div className="overflow-auto p-5"><LogTable logs={dialog.row.logs}/></div></Overlay>}
    {dialog?.mode==="view"&&<Overlay title="查看面辅料供应商确认单" subtitle={`${dialog.row.confirmationNo} · 只读`} onClose={close}><div className="space-y-3 overflow-y-auto p-5">
      <ReadSections row={dialog.row} onPrint={()=>openPrintPreview(dialog.row)} onSupplierConfirm={()=>supplierConfirm(dialog.row)}/>
    </div></Overlay>}
    {dialog?.mode==="edit"&&draft&&<Overlay title="编辑面辅料供应商确认单" subtitle={`${draft.confirmationNo} · ${draft.supplierConfirmStatus==="已确认"&&!editUnlocked?"核心信息已同步，只读保护中":"所有实际发货字段均非必填"}`} onClose={close}><div className="space-y-3 overflow-y-auto p-5 pb-24">
      <Section title="一、基础信息"><InfoGrid items={[["确认单号",draft.confirmationNo],["面辅料采购单号",draft.purchaseNo],["供应商",draft.supplier],["状态",draft.status],["供应商确认状态",<ConfirmStatusPill value={draft.supplierConfirmStatus}/>],["标签状态",<StatusPill value={getLabelState(draft)}/>],["更新时间",draft.updatedAt],["操作人",draft.operator]]}/></Section>
      <Section title="二、采购信息"><InfoGrid items={[["面辅料SKU",draft.sku],["SPU",draft.spu],["物料名称",draft.materialName],["规格 / 颜色",draft.specification],["采购数量",`${draft.purchaseQty}${draft.baseUnit}`],["采购包装数量",`${draft.purchasePackageQty}${draft.packageUnit}`],["采购金额",draft.amount],["采购人",draft.buyer],["采购时间",draft.purchaseDate]]}/></Section>
      <Section title="三、单位与包装信息"><InfoGrid items={[["基础单位",draft.baseUnit],["包装单位",draft.packageUnit],["每包装单位基础数量",draft.packageRule.split("，")[0]],["每箱包装数",draft.packageRule.split("，")[1]],["供应商包装规则",draft.packageRule]]}/></Section>
      <Section title="四、实际发货信息" action={<div className="flex gap-2">
        {draft.supplierConfirmStatus==="已确认"&&!editUnlocked&&<button className="rounded border border-orange-300 px-3 py-1.5 text-xs text-orange-700" onClick={()=>{if(window.confirm("该确认单已同步到面辅料采购单，修改后将标记为已变更，需要重新供应商确认。")){setEditUnlocked(true);setDraft((x)=>x?{...x,supplierConfirmStatus:"已变更",logs:[...x.logs,{time:stamp(),operator:"当前用户",type:"修改确认信息",content:"解除核心字段只读保护，待重新供应商确认"}]}:x)}}}>修改确认信息</button>}
        <button disabled={draft.supplierConfirmStatus==="已确认"&&!editUnlocked} className="rounded bg-blue-600 px-3 py-1.5 text-xs text-white disabled:cursor-not-allowed disabled:bg-gray-300" onClick={()=>{if(draft.packageUnit!=="卷"){showToast("当前包装单位不是卷，请维护包装明细");return}if(draft.actualPackageQty===""){showToast("请先填写实际包装数量");return}setGenerator((x)=>({...x,count:Number(draft.actualPackageQty)}));setGeneratorOpen(true)}}>生成卷号</button>
        <button className="rounded bg-orange-500 px-3 py-1.5 text-xs text-white" onClick={()=>openPrintPreview(draft)}>打印标签</button>
      </div>}><div className="grid gap-3 md:grid-cols-3 xl:grid-cols-5">
        {([["实际发货基础数量","actualQty"],["实际包装数量","actualPackageQty"],["实际箱数","actualBoxes"],["总重量","totalWeight"],["总体积","totalVolume"]] as const).map(([l,k])=><Field key={k} label={l}><input disabled={draft.supplierConfirmStatus==="已确认"&&!editUnlocked} type="number" className={`${inputClass} disabled:bg-gray-100`} value={draft[k]} onChange={(e)=>setDraftValue(k,e.target.value===""?"":Number(e.target.value))}/></Field>)}
        <Field label="发货日期"><input disabled={draft.supplierConfirmStatus==="已确认"&&!editUnlocked} type="date" className={`${inputClass} disabled:bg-gray-100`} value={draft.shipDate} onChange={(e)=>setDraftValue("shipDate",e.target.value)}/></Field>
        <Field label="供应商发货备注"><textarea className="min-h-20 rounded border p-2 text-sm md:col-span-2" value={draft.shippingRemark} onChange={(e)=>setDraftValue("shippingRemark",e.target.value)}/></Field>
      </div></Section>
      <Section title="五、卷号 / 包装明细" action={draft.packageUnit!=="卷"?<button disabled={draft.supplierConfirmStatus==="已确认"&&!editUnlocked} className="flex items-center gap-1 rounded border px-3 py-1.5 text-xs disabled:cursor-not-allowed disabled:bg-gray-100" onClick={()=>setDraft((x)=>x?autoLabels({...x,packs:[...x.packs,{no:`PK${dateStamp().replaceAll("-","")}${String(x.packs.length+1).padStart(4,"0")}`,type:"包",packQty:1,baseQty:100,weight:0,boxNo:"",remark:""}],logs:[...x.logs,{time:stamp(),operator:"系统",type:"自动生成标签",content:"新增包装明细并自动生成对应标签"}]}):x)}><Plus size={13}/>新增包装明细</button>:undefined}><EditableDetails locked={draft.supplierConfirmStatus==="已确认"&&!editUnlocked} draft={draft} setDraft={setDraft} onPrint={(label)=>setLabelPreview({row:draft,labels:[label],index:0})}/></Section>
      <Section title="六、箱规与重量信息" action={<button disabled={draft.supplierConfirmStatus==="已确认"&&!editUnlocked} className="flex items-center gap-1 rounded border px-3 py-1.5 text-xs disabled:cursor-not-allowed disabled:bg-gray-100" onClick={()=>setDraftValue("boxes",[...draft.boxes,{no:`BOX-${String(draft.boxes.length+1).padStart(3,"0")}`,count:1,weight:0,volume:0,length:0,width:0,height:0,packQty:0,baseQty:0,remark:""}])}><Plus size={13}/>新增箱号</button>}><EditableBoxes locked={draft.supplierConfirmStatus==="已确认"&&!editUnlocked} draft={draft} setDraft={setDraft}/></Section>
      <Section title="七、标签打印信息"><LabelInfo row={draft}/></Section>
      <Section title="八、备注信息"><div className="grid gap-3 md:grid-cols-3">{([["供应商备注","supplierRemark"],["采购备注","purchaseRemark"],["内部备注","internalRemark"]] as const).map(([l,k])=><Field key={k} label={l}><textarea className="min-h-24 rounded border p-2 text-sm" value={draft[k]} onChange={(e)=>setDraftValue(k,e.target.value)}/></Field>)}</div></Section>
      <Section title="九、操作日志"><LogTable logs={draft.logs}/></Section>
    </div><div className="absolute bottom-0 left-0 right-0 flex justify-end gap-2 border-t bg-white px-6 py-3"><button className="rounded border px-5 py-2 text-sm" onClick={close}>取消</button><button className="rounded border border-blue-300 px-5 py-2 text-sm text-blue-700" onClick={()=>save("已编辑")}>保存草稿</button><button className="rounded bg-blue-600 px-5 py-2 text-sm text-white" onClick={()=>save("已确认")}>保存并确认</button><button className="rounded bg-orange-500 px-5 py-2 text-sm text-white" onClick={()=>supplierConfirm(draft)}>供应商确认</button></div></Overlay>}

    {generatorOpen&&draft&&<Overlay title="生成卷号" onClose={()=>setGeneratorOpen(false)} width="w-[560px]"><div className="grid grid-cols-2 gap-3 p-5">{([["生成卷数","count"],["卷号前缀","prefix"],["默认每卷米数","qty"],["默认每卷重量","weight"],["起始序号","start"]] as const).map(([l,k])=><Field key={k} label={l}><input className={`${inputClass} ${k==="count"?"bg-gray-100 text-gray-500":""}`} readOnly={k==="count"} type={k==="prefix"?"text":"number"} value={generator[k]} onChange={(e)=>setGenerator((x)=>({...x,[k]:k==="prefix"?e.target.value:Number(e.target.value)}))}/></Field>)}</div><div className="flex justify-end gap-2 border-t bg-white px-5 py-3"><button className="rounded border px-4 py-2 text-sm" onClick={()=>setGeneratorOpen(false)}>取消</button><button className="rounded bg-blue-600 px-4 py-2 text-sm text-white" onClick={()=>{const nextRolls=Array.from({length:generator.count},(_,i)=>({no:`${generator.prefix}${String(generator.start+i).padStart(4,"0")}`,qty:generator.qty,weight:generator.weight,boxNo:i<2?"BOX-001":"BOX-002",remark:""}));setDraft((current)=>current?autoLabels({...current,rolls:nextRolls,logs:[...current.logs,{time:stamp(),operator:"当前用户",type:"生成卷号",content:`按实际包装数量生成${generator.count}条卷号明细`},{time:stamp(),operator:"系统",type:"自动生成标签",content:`根据${generator.count}条卷号明细自动生成${generator.count}张标签`}]}):current);setGeneratorOpen(false)}}>确认生成</button></div></Overlay>}
    {labelPreview&&<LabelPreview data={labelPreview} setData={setLabelPreview} onClose={()=>setLabelPreview(null)} onPrint={()=>printLabels(labelPreview.row,[labelPreview.labels[labelPreview.index].labelNo])} onToast={showToast}/>}
    {confirming&&<Overlay title="确认供应商发货信息" subtitle="确认后将同步到对应的面辅料采购单" onClose={()=>setConfirming(null)} width="w-[720px]"><div className="space-y-4 p-5"><div className="rounded border border-orange-200 bg-orange-50 p-3 text-sm text-orange-800">确认后，当前确认单中的实际发货数量、包装数量、卷号、箱号、重量和标签信息将同步到对应的面辅料采购单。</div><InfoGrid items={[["确认单号",confirming.confirmationNo],["面辅料采购单号",confirming.purchaseNo],["供应商",confirming.supplier],["SKU",confirming.sku],["实际发货基础数量",`${confirming.actualQty||"-"}${confirming.baseUnit}`],["实际包装数量",`${confirming.actualPackageQty||"-"}${confirming.packageUnit}`],["实际箱数",`${confirming.actualBoxes||"-"}箱`],["总重量",`${confirming.totalWeight||"-"}KG`],["标签数量",getLabels(confirming).length]]}/></div><div className="flex justify-end gap-2 border-t bg-white px-5 py-3"><button className="rounded border px-4 py-2 text-sm" onClick={()=>setConfirming(null)}>取消</button><button className="rounded bg-orange-500 px-4 py-2 text-sm text-white" onClick={confirmSync}>确认同步</button></div></Overlay>}
    {purchaseSync&&<Overlay title="面辅料采购单 · 供应商确认信息" subtitle={purchaseSync.purchaseNo} onClose={()=>setPurchaseSync(null)} width="w-[850px]"><div className="space-y-4 overflow-auto p-5"><div className={`rounded border p-3 text-sm ${purchaseSync.supplierConfirmStatus==="已确认"?"border-emerald-200 bg-emerald-50 text-emerald-800":"border-gray-200 bg-gray-50 text-gray-600"}`}>{purchaseSync.supplierConfirmStatus==="已确认"?"已同步供应商确认信息":"尚未同步供应商确认信息"}</div><InfoGrid items={[["来源确认单号",purchaseSync.confirmationNo],["供应商确认状态",purchaseSync.supplierConfirmStatus],["实际发货基础数量",`${purchaseSync.actualQty||"-"}${purchaseSync.baseUnit}`],["实际包装数量",`${purchaseSync.actualPackageQty||"-"}${purchaseSync.packageUnit}`],["实际箱数",`${purchaseSync.actualBoxes||"-"}箱`],["总重量",`${purchaseSync.totalWeight||"-"}KG`],["总体积",`${purchaseSync.totalVolume||"-"}m³`],["发货日期",purchaseSync.shipDate],["卷号 / 包装明细",purchaseSync.packageUnit==="卷"?`${purchaseSync.rolls.length}卷`:`${purchaseSync.packs.length}包`],["箱规信息",`${purchaseSync.boxes.length}条`],["标签数量",getLabels(purchaseSync).length],["最近同步时间",purchaseSync.syncedAt],["最近同步人",purchaseSync.syncedBy]]}/></div></Overlay>}
    <Toast msg={toast}/>
  </div>;
}

function ReadSections({ row, onPrint, onSupplierConfirm }: { row: Confirmation; onPrint:()=>void; onSupplierConfirm:()=>void }) {
  return <><Section title="一、基础信息"><InfoGrid items={[["确认单号",row.confirmationNo],["面辅料采购单号",row.purchaseNo],["来源商品采购单号",row.sourceNo],["供应商",row.supplier],["状态",row.status],["供应商确认状态",<ConfirmStatusPill value={row.supplierConfirmStatus}/>],["标签状态",<StatusPill value={getLabelState(row)}/>],["更新时间",row.updatedAt],["操作人",row.operator]]}/></Section>
  <Section title="二、采购信息"><InfoGrid items={[["面辅料SKU",row.sku],["SPU",row.spu],["物料名称",row.materialName],["物料分类",row.category],["规格 / 颜色",row.specification],["采购数量",`${row.purchaseQty}${row.baseUnit}`],["采购包装数量",`${row.purchasePackageQty}${row.packageUnit}`],["采购金额",row.amount],["采购人",row.buyer],["采购时间",row.purchaseDate]]}/></Section>
  <Section title="三、单位与包装信息"><InfoGrid items={[["基础单位",row.baseUnit],["包装单位",row.packageUnit],["包装规则",row.packageRule]]}/></Section>
  <Section title="四、实际发货信息"><InfoGrid items={[["实际发货数量",`${row.actualQty||"-"}${row.baseUnit}`],["实际包装数量",`${row.actualPackageQty||"-"}${row.packageUnit}`],["实际箱数",`${row.actualBoxes||"-"}箱`],["总重量",`${row.totalWeight||"-"}KG`],["总体积",`${row.totalVolume||"-"}m³`],["发货日期",row.shipDate],["供应商发货备注",row.shippingRemark]]}/></Section>
  <Section title="五、卷号 / 包装明细"><DetailTable row={row}/></Section><Section title="六、箱规与重量信息"><BoxTable row={row}/></Section>
  <Section title="七、标签打印信息" action={<div className="flex gap-2"><button className="rounded bg-slate-700 px-3 py-1.5 text-xs text-white" onClick={onPrint}>打印标签</button><button className="rounded bg-orange-500 px-3 py-1.5 text-xs text-white" onClick={onSupplierConfirm}>供应商确认</button></div>}><LabelInfo row={row}/></Section>
  <Section title="八、备注信息"><InfoGrid items={[["供应商备注",row.supplierRemark],["采购备注",row.purchaseRemark],["内部备注",row.internalRemark]]}/></Section><Section title="九、操作日志"><LogTable logs={row.logs}/></Section></>;
}

function DetailTable({ row }: { row: Confirmation }) {
  const heads = row.packageUnit==="卷"?["序号","卷号","本卷米数","本卷重量","所属箱号","已生成标签","标签号","打印状态","备注"]:["序号","包装号","包装类型","包装数量","基础数量","重量","所属箱号","已生成标签","标签号","打印状态","备注"];
  return <div className="overflow-x-auto"><table className="min-w-full text-left text-xs"><thead className="bg-gray-50"><tr>{heads.map((h)=><th key={h} className="border px-2 py-2">{h}</th>)}</tr></thead><tbody>{row.packageUnit==="卷"?row.rolls.map((x,i)=><tr key={x.no}><td className="border p-2">{i+1}</td><td className="border p-2">{x.no}</td><td className="border p-2">{x.qty}</td><td className="border p-2">{x.weight}KG</td><td className="border p-2">{x.boxNo}</td><td className="border p-2">{x.label?"是":"否"}</td><td className="border p-2">{x.label?.labelNo||"-"}</td><td className="border p-2">{x.label?<StatusPill value={x.label.status}/>:<StatusPill value="未生成"/>}</td><td className="border p-2">{x.remark||"-"}</td></tr>):row.packs.map((x,i)=><tr key={x.no}><td className="border p-2">{i+1}</td><td className="border p-2">{x.no}</td><td className="border p-2">{x.type}</td><td className="border p-2">{x.packQty}</td><td className="border p-2">{x.baseQty}</td><td className="border p-2">{x.weight}KG</td><td className="border p-2">{x.boxNo}</td><td className="border p-2">{x.label?"是":"否"}</td><td className="border p-2">{x.label?.labelNo||"-"}</td><td className="border p-2">{x.label?<StatusPill value={x.label.status}/>:<StatusPill value="未生成"/>}</td><td className="border p-2">{x.remark||"-"}</td></tr>)}</tbody></table></div>;
}
function BoxTable({row}:{row:Confirmation}) {return <div className="overflow-x-auto"><table className="min-w-full text-left text-xs"><thead className="bg-gray-50"><tr>{["箱号","箱数","单箱重量","单箱体积","箱长×宽×高","箱内包装数量","箱内基础数量","备注"].map((h)=><th key={h} className="border p-2">{h}</th>)}</tr></thead><tbody>{row.boxes.map((x)=><tr key={x.no}><td className="border p-2">{x.no}</td><td className="border p-2">{x.count}</td><td className="border p-2">{x.weight}KG</td><td className="border p-2">{x.volume}m³</td><td className="border p-2">{x.length}×{x.width}×{x.height}</td><td className="border p-2">{x.packQty}</td><td className="border p-2">{x.baseQty}</td><td className="border p-2">{x.remark||"-"}</td></tr>)}</tbody></table></div>}
function LabelInfo({row}:{row:Confirmation}) {const labels=getLabels(row);return <div className="grid gap-3 md:grid-cols-4"><div className="rounded bg-gray-50 p-3 text-sm">标签数量：<b>{labels.length}</b></div><div className="rounded bg-gray-50 p-3 text-sm">标签状态：<StatusPill value={getLabelState(row)}/></div><div className="rounded bg-gray-50 p-3 text-sm">已打印：<b>{labels.filter((x)=>x.printCount>0).length}</b></div><div className="rounded bg-gray-50 p-3 text-sm">打印总次数：<b>{labels.reduce((s,x)=>s+x.printCount,0)}</b></div></div>}
function LogTable({logs}:{logs:Log[]}) {return <div className="overflow-x-auto"><table className="min-w-full text-left text-xs"><thead className="bg-gray-50"><tr>{["操作时间","操作人","操作类型","操作内容","备注"].map((h)=><th key={h} className="border p-2">{h}</th>)}</tr></thead><tbody>{logs.map((x,i)=><tr key={i}><td className="border p-2">{x.time}</td><td className="border p-2">{x.operator}</td><td className="border p-2">{x.type}</td><td className="border p-2">{x.content}</td><td className="border p-2">{x.remark||"-"}</td></tr>)}</tbody></table></div>}

function EditableDetails({draft,setDraft,onPrint,locked}:{draft:Confirmation;setDraft:React.Dispatch<React.SetStateAction<Confirmation|null>>;onPrint:(l:Label)=>void;locked:boolean}) {
  const updateRoll=(i:number,key:keyof Roll,value:unknown)=>setDraft((d)=>d?autoLabels({...d,rolls:d.rolls.map((x,n)=>n===i?{...x,[key]:value}:x)}):d);
  const updatePack=(i:number,key:keyof Pack,value:unknown)=>setDraft((d)=>d?autoLabels({...d,packs:d.packs.map((x,n)=>n===i?{...x,[key]:value}:x)}):d);
  if(draft.packageUnit==="卷") return <div className="overflow-x-auto"><table className="min-w-[1250px] text-left text-xs"><thead className="bg-gray-50"><tr>{["序号","卷号","米数","重量","所属箱号","标签号","打印状态","备注","操作"].map((h)=><th key={h} className="border p-2">{h}</th>)}</tr></thead><tbody>{draft.rolls.map((x,i)=><tr key={i}><td className="border p-1">{i+1}</td>{(["no","qty","weight","boxNo"] as const).map((k)=><td key={k} className="border p-1"><input disabled={locked} className={`${inputClass} w-full disabled:bg-gray-100`} type={k==="qty"||k==="weight"?"number":"text"} value={x[k]} onChange={(e)=>updateRoll(i,k,k==="qty"||k==="weight"?Number(e.target.value):e.target.value)}/></td>)}<td className="border p-2">{x.label?.labelNo||"-"}</td><td className="border p-2">{x.label?<StatusPill value={x.label.status}/>:<StatusPill value="未生成"/>}</td><td className="border p-1"><input className={`${inputClass} w-full`} value={x.remark} onChange={(e)=>updateRoll(i,"remark",e.target.value)}/></td><td className="border p-2"><div className="flex gap-2">{x.label&&<button className="text-slate-700" onClick={()=>onPrint(x.label!)}>{x.label.printCount?"重打":"打印"}</button>}<button disabled={locked} className="text-red-600 disabled:text-gray-300" onClick={()=>setDraft((d)=>d?autoLabels({...d,rolls:d.rolls.filter((_,n)=>n!==i)}):d)}>删除</button></div></td></tr>)}</tbody></table></div>;
  return <div className="overflow-x-auto"><table className="min-w-[1380px] text-left text-xs"><thead className="bg-gray-50"><tr>{["序号","包装号","类型","包装数量","基础数量","重量","所属箱号","标签号","打印状态","备注","操作"].map((h)=><th key={h} className="border p-2">{h}</th>)}</tr></thead><tbody>{draft.packs.map((x,i)=><tr key={i}><td className="border p-1">{i+1}</td><td className="border p-1"><input disabled={locked} className={`${inputClass} w-full disabled:bg-gray-100`} value={x.no} onChange={(e)=>updatePack(i,"no",e.target.value)}/></td><td className="border p-1"><select disabled={locked} className={`${inputClass} w-full disabled:bg-gray-100`} value={x.type} onChange={(e)=>updatePack(i,"type",e.target.value)}><option>包</option><option>箱</option><option>袋</option></select></td>{(["packQty","baseQty","weight"] as const).map((k)=><td key={k} className="border p-1"><input disabled={locked} type="number" className={`${inputClass} w-full disabled:bg-gray-100`} value={x[k]} onChange={(e)=>updatePack(i,k,Number(e.target.value))}/></td>)}<td className="border p-1"><input disabled={locked} className={`${inputClass} w-full disabled:bg-gray-100`} value={x.boxNo} onChange={(e)=>updatePack(i,"boxNo",e.target.value)}/></td><td className="border p-2">{x.label?.labelNo||"-"}</td><td className="border p-2">{x.label?<StatusPill value={x.label.status}/>:<StatusPill value="未生成"/>}</td><td className="border p-1"><input className={`${inputClass} w-full`} value={x.remark} onChange={(e)=>updatePack(i,"remark",e.target.value)}/></td><td className="border p-2"><div className="flex gap-2">{x.label&&<button className="text-slate-700" onClick={()=>onPrint(x.label!)}>{x.label.printCount?"重打":"打印"}</button>}<button disabled={locked} className="text-red-600 disabled:text-gray-300" onClick={()=>setDraft((d)=>d?autoLabels({...d,packs:d.packs.filter((_,n)=>n!==i)}):d)}>删除</button></div></td></tr>)}</tbody></table></div>;
}
function EditableBoxes({draft,setDraft,locked}:{draft:Confirmation;setDraft:React.Dispatch<React.SetStateAction<Confirmation|null>>;locked:boolean}) {return <div className="overflow-x-auto"><table className="min-w-[1250px] text-left text-xs"><thead className="bg-gray-50"><tr>{["箱号","箱数","重量","体积","长","宽","高","包装数","基础数","备注","操作"].map((h)=><th key={h} className="border p-2">{h}</th>)}</tr></thead><tbody>{draft.boxes.map((x,i)=><tr key={i}>{(["no","count","weight","volume","length","width","height","packQty","baseQty","remark"] as const).map((k)=><td key={k} className="border p-1"><input disabled={locked&&k!=="remark"} className={`${inputClass} w-full disabled:bg-gray-100`} type={k==="no"||k==="remark"?"text":"number"} value={x[k]} onChange={(e)=>setDraft((d)=>d?{...d,boxes:d.boxes.map((b,n)=>n===i?{...b,[k]:k==="no"||k==="remark"?e.target.value:Number(e.target.value)}:b)}:d)}/></td>)}<td className="border p-2"><button disabled={locked} className="text-red-600 disabled:text-gray-300" onClick={()=>setDraft((d)=>d?{...d,boxes:d.boxes.filter((_,n)=>n!==i)}:d)}>删除</button></td></tr>)}</tbody></table></div>}

function LabelPreview({data,setData,onClose,onPrint,onToast}:{data:{row:Confirmation;labels:Label[];index:number};setData:React.Dispatch<React.SetStateAction<typeof data|null>>;onClose:()=>void;onPrint:()=>void;onToast:(s:string)=>void}) {
  const label=data.labels[data.index]; const [qrUrl,setQrUrl]=useState("");
  useEffect(()=>{void QRCode.toDataURL(label.qrContent,{width:360,margin:1,errorCorrectionLevel:"M"}).then(setQrUrl)},[label.qrContent]);
  const download=()=>{const a=document.createElement("a");a.href=qrUrl;a.download=`${label.labelNo}.png`;a.click();onToast("标签二维码已下载")};
  return <Overlay title="标签预览 / 打印" subtitle={`${data.index+1} / ${data.labels.length} · ${label.labelNo}`} onClose={onClose} width="w-[1060px]"><div className="grid min-h-0 flex-1 gap-4 overflow-y-auto p-5 lg:grid-cols-[390px_1fr]">
    <Section title="一、标签预览"><div className="mx-auto w-[300px] rounded border border-gray-400 bg-white p-5 shadow-[0_4px_18px_rgba(0,0,0,.12)]">{qrUrl&&<img src={qrUrl} alt="标签二维码" className="mx-auto h-56 w-56"/>}<div className="mt-3 border-t-2 border-black pt-3">
      {[["包装号",label.packageNo],["SKU",data.row.sku],["数量",`1${data.row.packageUnit} / ${data.row.packageUnit==="卷"?(data.row.rolls.find((x)=>x.no===label.packageNo)?.qty||"-"):(data.row.packs.find((x)=>x.no===label.packageNo)?.baseQty||"-")}${data.row.baseUnit}`]].map(([k,v])=><div key={k} className="mb-2 grid grid-cols-[82px_1fr] items-center"><b className="text-xl text-[#e5482f]">{k}</b><strong className="break-all text-lg text-black">{v}</strong></div>)}
      <div className="mt-3 text-center text-[10px] text-gray-500">{label.labelNo}</div></div></div></Section>
    <div className="space-y-3"><Section title="二、标签业务信息"><InfoGrid items={[["标签号",label.labelNo],["包装号",label.packageNo],["确认单号",data.row.confirmationNo],["采购单号",data.row.purchaseNo],["入库单号",label.inboundNo],["关联单号",label.relationNo],["SKU",data.row.sku],["SPU",data.row.spu],["物料名称",data.row.materialName],["供应商",data.row.supplier],["打印状态",<StatusPill value={label.status}/>]]}/></Section>
      <Section title="三、二维码内容预览"><pre className="max-h-64 overflow-auto whitespace-pre-wrap rounded bg-slate-900 p-3 text-xs leading-5 text-emerald-300">{label.qrContent}</pre></Section>
      <Section title="四、打印记录"><InfoGrid items={[["打印次数",label.printCount],["打印时间",label.printedAt],["打印人",label.printedBy],["当前状态",<StatusPill value={label.status}/>]]}/></Section></div>
  </div><div className="flex items-center justify-between border-t bg-white px-5 py-3"><div className="flex gap-2"><button className="rounded border px-3 py-2 text-sm" disabled={data.index===0} onClick={()=>setData((x)=>x?{...x,index:x.index-1}:x)}>上一张</button><button className="rounded border px-3 py-2 text-sm" disabled={data.index===data.labels.length-1} onClick={()=>setData((x)=>x?{...x,index:x.index+1}:x)}>下一张</button></div><div className="flex gap-2"><button className="rounded border px-4 py-2 text-sm" onClick={onClose}>关闭</button><button className="rounded border border-blue-300 px-4 py-2 text-sm text-blue-700" onClick={download}>下载标签</button>{label.printCount===0?<button className="rounded bg-slate-800 px-4 py-2 text-sm text-white" onClick={onPrint}>打印</button>:<button className="rounded bg-violet-700 px-4 py-2 text-sm text-white" onClick={onPrint}>重新打印</button>}</div></div></Overlay>;
}
