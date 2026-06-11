import { useMemo, useState, type ReactNode } from "react";
import { Download, Eye, FilePenLine, MessageSquareText, PackageCheck, Plus, Search, XCircle } from "lucide-react";
import DesignLogicCard from "../../components/common/DesignLogicCard";
import PageHeader from "../../components/common/PageHeader";
import StatusBadge from "../../components/common/StatusBadge";
import Toast from "../../components/common/Toast";
import type { ProductPurchaseSuggestion as Suggestion } from "../../mock/productPurchaseSuggestions";
import type {
  KolDemandInboundRecord,
  KolDemandLog,
  KolDemandRemark,
  KolPurchaseDemand,
} from "../../mock/kolPurchaseDemands";

type Props = {
  suggestions: Suggestion[];
  demands: KolPurchaseDemand[];
  onDemandsChange: (demands: KolPurchaseDemand[]) => void;
};

type Filters = {
  keyword: string;
  demandNo: string;
  style: string;
  status: string;
  store: string;
  isHotSale: string;
  appliedStart: string;
  appliedEnd: string;
  availableStart: string;
  availableEnd: string;
  inboundStart: string;
  inboundEnd: string;
  pageSize: string;
};

const initialFilters: Filters = {
  keyword: "",
  demandNo: "",
  style: "全部款式",
  status: "全部状态",
  store: "全部店铺",
  isHotSale: "全部",
  appliedStart: "",
  appliedEnd: "",
  availableStart: "",
  availableEnd: "",
  inboundStart: "",
  inboundEnd: "",
  pageSize: "20",
};

const stores = ["Shopee印尼旗舰店", "TikTok印尼店", "Lazada印尼店"];
const currentUser = "张敏";

const nowText = () => {
  const date = new Date();
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
};

const createId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

function ProductImage({ src, name, large = false }: { src?: string; name: string; large?: boolean }) {
  const size = large ? "h-28 w-28" : "h-14 w-14";
  return src ? (
    <img src={src} alt={name} className={`${size} shrink-0 rounded-md border border-gray-200 object-cover`} />
  ) : (
    <div className={`${size} flex shrink-0 items-center justify-center rounded-md border border-gray-200 bg-gray-100 text-xs text-gray-400`}>无图</div>
  );
}

function Drawer({ open, title, onClose, children, width = "max-w-[920px]" }: { open: boolean; title: string; onClose: () => void; children: ReactNode; width?: string }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[70] flex justify-end bg-black/25">
      <div className={`flex h-full w-full ${width} flex-col bg-white shadow-xl`}>
        <div className="flex h-14 shrink-0 items-center justify-between border-b px-5">
          <h2 className="font-semibold text-gray-900">{title}</h2>
          <button className="text-xl text-gray-400 hover:text-gray-700" onClick={onClose}>×</button>
        </div>
        <div className="min-h-0 flex-1 overflow-auto p-5">{children}</div>
      </div>
    </div>
  );
}

function Modal({ open, title, onClose, children }: { open: boolean; title: string; onClose: () => void; children: ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[75] flex items-center justify-center bg-black/25 p-4">
      <div className="max-h-[90vh] w-full max-w-xl overflow-auto rounded bg-white shadow-xl">
        <div className="flex items-center justify-between border-b px-5 py-3">
          <h2 className="font-semibold text-gray-900">{title}</h2>
          <button className="text-xl text-gray-400" onClick={onClose}>×</button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: ReactNode }) {
  return <h3 className="mb-3 border-l-2 border-brand pl-2 text-sm font-semibold text-gray-900">{children}</h3>;
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="block"><span className="mb-1 block text-xs text-gray-600">{label}</span>{children}</label>;
}

const inputClass = "h-9 w-full rounded border border-gray-300 px-2.5 text-sm outline-none focus:border-brand";

type DemandForm = {
  applicant: string;
  storeName: string;
  isHotSale: boolean;
  appliedAt: string;
  note: string;
  spu: string;
  selectedSkus: string[];
  quantities: Record<string, number>;
  skuRemarks: Record<string, string>;
};

const emptyForm = (spu = ""): DemandForm => ({
  applicant: currentUser,
  storeName: stores[0],
  isHotSale: false,
  appliedAt: nowText(),
  note: "",
  spu,
  selectedSkus: [],
  quantities: {},
  skuRemarks: {},
});

export default function KolPurchaseRequirement({ suggestions, demands, onDemandsChange }: Props) {
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [appliedFilters, setAppliedFilters] = useState<Filters>(initialFilters);
  const [selected, setSelected] = useState<string[]>([]);
  const [toast, setToast] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<KolPurchaseDemand | null>(null);
  const [form, setForm] = useState<DemandForm>(emptyForm(suggestions[0]?.spu));
  const [spuQuery, setSpuQuery] = useState("");
  const [spuOpen, setSpuOpen] = useState(false);
  const [detail, setDetail] = useState<KolPurchaseDemand | null>(null);
  const [inboundTargets, setInboundTargets] = useState<KolPurchaseDemand[]>([]);
  const [inboundQty, setInboundQty] = useState("");
  const [inboundAt, setInboundAt] = useState(nowText());
  const [inboundRemark, setInboundRemark] = useState("");
  const [rejectTargets, setRejectTargets] = useState<KolPurchaseDemand[]>([]);
  const [rejectReason, setRejectReason] = useState("");
  const [remarkTargets, setRemarkTargets] = useState<KolPurchaseDemand[]>([]);
  const [remarkContent, setRemarkContent] = useState("");

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2000);
  };

  const filtered = useMemo(() => demands.filter((item) => {
    const keyword = appliedFilters.keyword.trim().toLowerCase();
    const inboundAtValue = item.inboundRecords[0]?.inboundAt ?? "";
    return (!keyword || `${item.productName} ${item.spu} ${item.sku}`.toLowerCase().includes(keyword))
      && (!appliedFilters.demandNo || item.demandNo.includes(appliedFilters.demandNo.trim()))
      && (appliedFilters.style === "全部款式" || item.styleName === appliedFilters.style)
      && (appliedFilters.status === "全部状态" || item.status === appliedFilters.status)
      && (appliedFilters.store === "全部店铺" || item.storeName === appliedFilters.store)
      && (appliedFilters.isHotSale === "全部" || item.isHotSale === (appliedFilters.isHotSale === "是"))
      && (!appliedFilters.appliedStart || item.appliedAt.slice(0, 10) >= appliedFilters.appliedStart)
      && (!appliedFilters.appliedEnd || item.appliedAt.slice(0, 10) <= appliedFilters.appliedEnd)
      && (!appliedFilters.availableStart || (item.lastAvailableAt ?? "").slice(0, 10) >= appliedFilters.availableStart)
      && (!appliedFilters.availableEnd || (item.lastAvailableAt ?? "").slice(0, 10) <= appliedFilters.availableEnd)
      && (!appliedFilters.inboundStart || inboundAtValue.slice(0, 10) >= appliedFilters.inboundStart)
      && (!appliedFilters.inboundEnd || inboundAtValue.slice(0, 10) <= appliedFilters.inboundEnd);
  }), [appliedFilters, demands]);

  const pageRows = filtered.slice(0, Number(appliedFilters.pageSize));
  const stats = useMemo(() => ({
    demandCount: filtered.length,
    applyQty: filtered.reduce((sum, item) => sum + item.kolApplyQty, 0),
    inboundQty: filtered.reduce((sum, item) => sum + item.kolInboundQty, 0),
    pendingQty: filtered.reduce((sum, item) => sum + Math.max(0, item.inboundDiffQty), 0),
    spuCount: new Set(filtered.map((item) => item.spu)).size,
    skuCount: new Set(filtered.map((item) => item.sku)).size,
    hotSaleCount: filtered.filter((item) => item.isHotSale).length,
  }), [filtered]);

  const styles = Array.from(new Set(demands.map((item) => item.styleName).filter(Boolean))) as string[];
  const selectedRows = demands.filter((item) => selected.includes(item.id));
  const currentSpu = suggestions.find((item) => item.spu === form.spu);
  const spuMatches = suggestions.filter((item) => `${item.spu} ${item.productName}`.toLowerCase().includes(spuQuery.toLowerCase()));
  const selectedQty = currentSpu?.skuItems.reduce((sum, item) => sum + (form.selectedSkus.includes(item.sku) ? form.quantities[item.sku] ?? 0 : 0), 0) ?? 0;

  const updateFilter = (key: keyof Filters, value: string) => setFilters((current) => ({ ...current, [key]: value }));
  const updateDemands = (updater: (item: KolPurchaseDemand) => KolPurchaseDemand) => {
    const ids = new Set([...inboundTargets, ...rejectTargets, ...remarkTargets].map((item) => item.id));
    onDemandsChange(demands.map((item) => ids.has(item.id) ? updater(item) : item));
    setSelected([]);
  };

  const requireSelection = (action: (rows: KolPurchaseDemand[]) => void) => {
    if (!selectedRows.length) return showToast("请先选择KOL采购需求");
    action(selectedRows);
  };

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm(suggestions[0]?.spu));
    setSpuQuery("");
    setFormOpen(true);
  };

  const openEdit = (item: KolPurchaseDemand) => {
    setEditing(item);
    setForm({
      applicant: item.applicant,
      storeName: item.storeName ?? stores[0],
      isHotSale: item.isHotSale,
      appliedAt: item.appliedAt,
      note: item.remarks[0]?.content ?? "",
      spu: item.spu,
      selectedSkus: [item.sku],
      quantities: { [item.sku]: item.kolApplyQty },
      skuRemarks: { [item.sku]: item.skuRemark ?? "" },
    });
    setSpuQuery("");
    setFormOpen(true);
  };

  const saveForm = (status: "草稿" | "待入库") => {
    if (!form.applicant.trim() || !form.storeName || !form.spu) return showToast("请完整填写基础信息和 SPU");
    const validSkus = form.selectedSkus.filter((sku) => (form.quantities[sku] ?? 0) > 0);
    if (!validSkus.length) return showToast("请勾选 SKU 并填写大于 0 的申请数量");
    const row = suggestions.find((item) => item.spu === form.spu);
    if (!row) return;
    const timestamp = nowText();
    const demandNo = editing?.demandNo ?? `KOL-${timestamp.replace(/\D/g, "").slice(0, 14)}`;
    const records = validSkus.map((sku, index): KolPurchaseDemand => {
      const skuItem = row.skuItems.find((item) => item.sku === sku)!;
      const existing = editing && editing.sku === sku ? editing : null;
      const quantity = form.quantities[sku];
      const log: KolDemandLog = {
        id: createId("LOG"),
        action: status === "草稿" ? "保存草稿" : existing ? "提交申请" : "新增申请",
        operator: currentUser,
        operatedAt: timestamp,
        detail: `${status === "草稿" ? "保存" : "提交"}KOL采购需求${quantity}件`,
      };
      return {
        id: existing?.id ?? createId("KOL-D"),
        demandNo: validSkus.length > 1 ? `${demandNo}-${String(index + 1).padStart(2, "0")}` : demandNo,
        applicant: form.applicant,
        appliedAt: form.appliedAt,
        storeName: form.storeName,
        status,
        imageUrl: skuItem.imageUrl ?? row.imageUrl ?? "",
        spu: row.spu,
        sku,
        productName: row.productName,
        color: skuItem.color,
        size: skuItem.size,
        styleId: existing?.styleId ?? `ST-${row.id.padStart(4, "0")}`,
        styleName: existing?.styleName ?? `${row.productName}款`,
        category: existing?.category ?? "服装",
        score: existing?.score ?? "-",
        kolApplyQty: quantity,
        kolInboundQty: existing?.kolInboundQty ?? 0,
        inboundDiffQty: quantity - (existing?.kolInboundQty ?? 0),
        actualAvailableCount: existing?.actualAvailableCount ?? 0,
        kolInboundCount: existing?.kolInboundCount ?? 0,
        lastAvailableQty: existing?.lastAvailableQty,
        lastInboundQty: existing?.lastInboundQty,
        lastAvailableAt: existing?.lastAvailableAt,
        isHotSale: form.isHotSale,
        skuRemark: form.skuRemarks[sku],
        remarks: form.note.trim()
          ? [...(existing?.remarks ?? []), { id: createId("RM"), content: form.note.trim(), createdBy: currentUser, createdAt: timestamp }]
          : existing?.remarks ?? [],
        inboundRecords: existing?.inboundRecords ?? [],
        logs: [...(existing?.logs ?? []), log],
      };
    });
    const next = editing ? [...demands.filter((item) => item.id !== editing.id), ...records] : [...records, ...demands];
    onDemandsChange(next);
    setFormOpen(false);
    showToast(status === "草稿" ? "草稿已保存" : "KOL采购需求已提交");
  };

  const confirmInbound = () => {
    const quantity = Number(inboundQty);
    if (quantity <= 0) return showToast("本次入库数量必须大于 0");
    if (inboundTargets.some((item) => item.status === "已驳回" || item.status === "全部入库")) return showToast("已驳回或全部入库需求不能确认入库");
    if (inboundTargets.length > 1 && quantity > Math.min(...inboundTargets.map((item) => item.inboundDiffQty))) return showToast("批量入库数量不能超过任一需求的待入库数量");
    if (inboundTargets.length === 1 && quantity > inboundTargets[0].inboundDiffQty && !window.confirm("本次入库数量超过待入库数量，仍要继续吗？")) return;
    const timestamp = inboundAt || nowText();
    updateDemands((item) => {
      const nextInboundQty = item.kolInboundQty + quantity;
      const record: KolDemandInboundRecord = { id: createId("IN"), quantity, inboundBy: currentUser, inboundAt: timestamp, remark: inboundRemark };
      const log: KolDemandLog = { id: createId("LOG"), action: "确认入库", operator: currentUser, operatedAt: timestamp, detail: `确认入库${quantity}件` };
      return {
        ...item,
        kolInboundQty: nextInboundQty,
        inboundDiffQty: item.kolApplyQty - nextInboundQty,
        status: nextInboundQty >= item.kolApplyQty ? "全部入库" : "部分入库",
        actualAvailableCount: item.actualAvailableCount + 1,
        kolInboundCount: item.kolInboundCount + 1,
        lastAvailableQty: quantity,
        lastInboundQty: quantity,
        lastAvailableAt: timestamp,
        inboundRecords: [record, ...item.inboundRecords],
        logs: [log, ...item.logs],
      };
    });
    setInboundTargets([]);
    setInboundQty("");
    setInboundRemark("");
    showToast("入库确认成功");
  };

  const confirmReject = () => {
    if (!rejectReason.trim()) return showToast("请填写驳回原因");
    if (rejectTargets.some((item) => item.status === "全部入库" || item.status === "已驳回")) return showToast("全部入库或已驳回需求不能再次驳回");
    const timestamp = nowText();
    updateDemands((item) => ({
      ...item,
      status: "已驳回",
      rejectReason: rejectReason.trim(),
      rejectedBy: currentUser,
      rejectedAt: timestamp,
      logs: [{ id: createId("LOG"), action: "驳回", operator: currentUser, operatedAt: timestamp, detail: rejectReason.trim() }, ...item.logs],
    }));
    setRejectTargets([]);
    setRejectReason("");
    showToast("需求已驳回，商品采购建议已重新计算");
  };

  const confirmRemark = () => {
    if (!remarkContent.trim()) return showToast("请填写备注内容");
    const timestamp = nowText();
    updateDemands((item) => {
      const remark: KolDemandRemark = { id: createId("RM"), content: remarkContent.trim(), createdBy: currentUser, createdAt: timestamp };
      return {
        ...item,
        remarks: [remark, ...item.remarks],
        logs: [{ id: createId("LOG"), action: "新增备注", operator: currentUser, operatedAt: timestamp, detail: remarkContent.trim() }, ...item.logs],
      };
    });
    setRemarkTargets([]);
    setRemarkContent("");
    showToast("备注已添加");
  };

  const chooseSpu = (spu: string) => {
    setForm((current) => ({ ...current, spu, selectedSkus: [], quantities: {}, skuRemarks: {} }));
    setSpuQuery("");
    setSpuOpen(false);
  };

  const toggleSku = (sku: string) => setForm((current) => ({
    ...current,
    selectedSkus: current.selectedSkus.includes(sku) ? current.selectedSkus.filter((item) => item !== sku) : [...current.selectedSkus, sku],
  }));

  return (
    <div>
      <PageHeader title="KOL采购需求" desc="管理 KOL 渠道商品采购需求、内部入库确认及商品采购建议联动。" />

      <div className="mb-3 rounded border border-gray-200 bg-white p-3">
        <div className="grid grid-cols-2 gap-2 lg:grid-cols-4 xl:grid-cols-8">
          <input className={inputClass} value={filters.keyword} onChange={(event) => updateFilter("keyword", event.target.value)} placeholder="商品名称 / SPU / SKU" />
          <input className={inputClass} value={filters.demandNo} onChange={(event) => updateFilter("demandNo", event.target.value)} placeholder="申请单号" />
          <select className={inputClass} value={filters.style} onChange={(event) => updateFilter("style", event.target.value)}>
            <option>全部款式</option>{styles.map((item) => <option key={item}>{item}</option>)}
          </select>
          <select className={inputClass} value={filters.status} onChange={(event) => updateFilter("status", event.target.value)}>
            {["全部状态", "草稿", "待入库", "部分入库", "全部入库", "已驳回"].map((item) => <option key={item}>{item}</option>)}
          </select>
          <select className={inputClass} value={filters.store} onChange={(event) => updateFilter("store", event.target.value)}>
            <option>全部店铺</option>{stores.map((item) => <option key={item}>{item}</option>)}
          </select>
          <select className={inputClass} value={filters.isHotSale} onChange={(event) => updateFilter("isHotSale", event.target.value)}>
            {["全部", "是", "否"].map((item) => <option key={item}>{item}</option>)}
          </select>
          <button className="h-9 rounded bg-brand px-4 text-sm text-white" onClick={() => setAppliedFilters(filters)}>查询</button>
          <button className="h-9 rounded bg-gray-100 px-4 text-sm text-gray-700" onClick={() => { setFilters(initialFilters); setAppliedFilters(initialFilters); }}>清除</button>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-500">
          <span>申请时间</span><input className="h-8 rounded border px-2" type="date" value={filters.appliedStart} onChange={(event) => updateFilter("appliedStart", event.target.value)} /><span>至</span><input className="h-8 rounded border px-2" type="date" value={filters.appliedEnd} onChange={(event) => updateFilter("appliedEnd", event.target.value)} />
          <span className="ml-2">最近货时间</span><input className="h-8 rounded border px-2" type="date" value={filters.availableStart} onChange={(event) => updateFilter("availableStart", event.target.value)} /><span>至</span><input className="h-8 rounded border px-2" type="date" value={filters.availableEnd} onChange={(event) => updateFilter("availableEnd", event.target.value)} />
          <span className="ml-2">入库时间</span><input className="h-8 rounded border px-2" type="date" value={filters.inboundStart} onChange={(event) => updateFilter("inboundStart", event.target.value)} /><span>至</span><input className="h-8 rounded border px-2" type="date" value={filters.inboundEnd} onChange={(event) => updateFilter("inboundEnd", event.target.value)} />
          <span className="ml-auto">每页显示</span>
          <select className="h-8 rounded border px-2" value={filters.pageSize} onChange={(event) => updateFilter("pageSize", event.target.value)}>{["10", "20", "30", "50"].map((item) => <option key={item}>{item}</option>)}</select>
        </div>
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-2 rounded border border-gray-200 bg-white p-3">
        <button className="inline-flex h-8 items-center gap-1.5 rounded bg-brand px-3 text-sm text-white" onClick={openCreate}><Plus className="h-4 w-4" />新增KOL采购需求</button>
        <button className="inline-flex h-8 items-center gap-1.5 rounded border border-green-300 px-3 text-sm text-green-700" onClick={() => requireSelection((rows) => { setInboundTargets(rows); setInboundAt(nowText()); })}><PackageCheck className="h-4 w-4" />批量确认入库</button>
        <button className="inline-flex h-8 items-center gap-1.5 rounded border border-red-300 px-3 text-sm text-red-600" onClick={() => requireSelection(setRejectTargets)}><XCircle className="h-4 w-4" />批量驳回</button>
        <button className="inline-flex h-8 items-center gap-1.5 rounded border border-teal-300 px-3 text-sm text-teal-700" onClick={() => requireSelection(setRemarkTargets)}><MessageSquareText className="h-4 w-4" />批量备注</button>
        <button className="ml-auto inline-flex h-8 items-center gap-1.5 rounded border px-3 text-sm" onClick={() => showToast("导出需求功能已预留")}><Download className="h-4 w-4" />导出需求</button>
        <button className="inline-flex h-8 items-center gap-1.5 rounded border px-3 text-sm" onClick={() => showToast("导出SKU明细功能已预留")}><Download className="h-4 w-4" />导出明细</button>
      </div>

      <div className="mb-3 grid grid-cols-2 gap-2 md:grid-cols-4 xl:grid-cols-7">
        {[
          ["需求单数量", stats.demandCount], ["KOL申请总数量", stats.applyQty], ["已入库数量", stats.inboundQty],
          ["待入库数量", stats.pendingQty], ["涉及SPU数", stats.spuCount], ["涉及SKU数", stats.skuCount], ["可售爆款数量", stats.hotSaleCount],
        ].map(([label, value]) => <div key={label} className="rounded border border-gray-200 bg-white px-3 py-2"><div className="text-xs text-gray-500">{label}</div><div className="mt-1 text-base font-semibold">{value}</div></div>)}
      </div>

      <div className="overflow-x-auto rounded border border-gray-200 bg-white">
        <table className="min-w-[1720px] w-full text-left text-[13px]">
          <thead className="bg-gray-50 text-gray-700">
            <tr>
              <th className="w-10 px-3 py-2.5"><input type="checkbox" checked={pageRows.length > 0 && pageRows.every((item) => selected.includes(item.id))} onChange={() => setSelected(pageRows.every((item) => selected.includes(item.id)) ? [] : pageRows.map((item) => item.id))} /></th>
              {["KOL申请信息", "KOL关联商品信息", "KOL申请数量", "KOL入库数量", "入库差", "状态", "实际可得次数", "KOL入库次数", "最后一次实际可得", "是否可售爆款", "操作"].map((item) => <th key={item} className="border-b px-3 py-2.5 font-medium">{item}</th>)}
            </tr>
          </thead>
          <tbody>
            {pageRows.map((item) => (
              <tr key={item.id} className="border-b border-gray-100 align-top hover:bg-gray-50">
                <td className="px-3 py-3"><input type="checkbox" checked={selected.includes(item.id)} onChange={() => setSelected((current) => current.includes(item.id) ? current.filter((id) => id !== item.id) : [...current, item.id])} /></td>
                <td className="whitespace-nowrap px-3 py-3">
                  <div className="font-medium text-gray-900">{item.applicant}</div>
                  <div className="mt-1 text-xs text-gray-500">{item.appliedAt}</div>
                  <div className="mt-0.5 text-xs text-gray-500">{item.demandNo}</div>
                  <div className="mt-0.5 text-xs text-gray-400">{item.storeName}</div>
                </td>
                <td className="px-3 py-3">
                  <div className="flex min-w-[330px] gap-3">
                    <ProductImage src={item.imageUrl} name={item.productName} />
                    <div>
                      <div className="font-medium text-gray-900">{item.productName}</div>
                      <div className="mt-1 text-xs text-gray-500">SPU {item.spu} · SKU {item.sku}</div>
                      <div className="mt-0.5 text-xs text-gray-500">{item.color} / {item.size} · 款式 {item.styleId} {item.styleName}</div>
                      <div className="mt-0.5 text-xs text-gray-400">{item.category} · 评分 {item.score ?? "-"}</div>
                    </div>
                  </div>
                </td>
                <td className="px-3 py-3 font-semibold text-brand">{item.kolApplyQty}</td>
                <td className="px-3 py-3">{item.kolInboundQty}</td>
                <td className={`px-3 py-3 font-medium ${item.inboundDiffQty > 0 ? "text-orange-600" : item.inboundDiffQty === 0 ? "text-green-600" : "text-red-600"}`}>{item.inboundDiffQty}</td>
                <td className="px-3 py-3"><StatusBadge status={item.status} /></td>
                <td className="px-3 py-3">{item.actualAvailableCount}</td>
                <td className="px-3 py-3">{item.kolInboundCount}</td>
                <td className="whitespace-nowrap px-3 py-3 text-xs">
                  {item.lastAvailableAt ? <><div>实际可得：{item.lastAvailableQty ?? 0}</div><div>入库：{item.lastInboundQty ?? 0}</div><div className="text-gray-500">{item.lastAvailableAt}</div></> : "-"}
                </td>
                <td className="px-3 py-3"><span className={`rounded px-2 py-0.5 text-xs ${item.isHotSale ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-600"}`}>{item.isHotSale ? "是" : "否"}</span></td>
                <td className="px-3 py-3">
                  <div className="flex min-w-[205px] flex-wrap gap-1.5">
                    {(item.status === "待入库" || item.status === "部分入库") && <button className="rounded border border-green-300 px-2 py-1 text-xs text-green-700" onClick={() => { setInboundTargets([item]); setInboundAt(nowText()); }}>确认入库</button>}
                    {(item.status === "待入库" || item.status === "部分入库") && <button className="rounded border border-red-300 px-2 py-1 text-xs text-red-600" onClick={() => setRejectTargets([item])}>驳回</button>}
                    {item.status === "草稿" && <button className="rounded border border-orange-300 px-2 py-1 text-xs text-orange-700" onClick={() => openEdit(item)}><FilePenLine className="mr-1 inline h-3 w-3" />编辑</button>}
                    {item.status === "草稿" && <button className="rounded border border-blue-300 px-2 py-1 text-xs text-brand" onClick={() => { onDemandsChange(demands.map((row) => row.id === item.id ? { ...row, status: "待入库" as const, logs: [{ id: createId("LOG"), action: "提交申请", operator: currentUser, operatedAt: nowText(), detail: "草稿提交" }, ...row.logs] } : row)); showToast("草稿已提交"); }}>提交</button>}
                    <button className="rounded border border-teal-300 px-2 py-1 text-xs text-teal-700" onClick={() => setRemarkTargets([item])}>备注</button>
                    <button className="px-1 py-1 text-xs text-brand" onClick={() => setDetail(item)}><Eye className="mr-1 inline h-3 w-3" />查看</button>
                  </div>
                </td>
              </tr>
            ))}
            {!pageRows.length && <tr><td colSpan={12} className="p-10 text-center text-gray-400">暂无KOL采购需求</td></tr>}
          </tbody>
        </table>
      </div>
      <div className="mb-5 mt-2 text-right text-xs text-gray-500">共 {filtered.length} 条，当前显示 {pageRows.length} 条</div>

      <DesignLogicCard sections={[
        { title: "页面定位", headers: ["项目", "说明"], rows: [["页面名称", "KOL采购需求"], ["所属模块", "采购建议"], ["页面目标", "管理内部KOL采购需求申请、入库确认及驳回"], ["业务链路", "提出需求 → 选择SPU/SKU → 提交 → 确认入库或驳回 → 联动商品采购建议"]] },
        { title: "采购建议联动", headers: ["场景", "是否计入KOL申请数量", "规则"], rows: [["草稿", "否", "未提交不参与"], ["待入库 / 部分入库 / 全部入库", "是", "按申请总量计入"], ["已驳回", "否", "驳回后立即扣除"], ["采购建议公式", "-", "ceil((待发货数量 + KOL申请数量 - 采购中数量 - 实时库存数量) × 0.7)，小于0显示0"]] },
        { title: "状态与操作", headers: ["状态", "含义", "可操作"], rows: [["草稿", "已保存未提交", "编辑、提交、备注、查看"], ["待入库", "等待入库确认", "确认入库、驳回、备注、查看"], ["部分入库", "部分数量已确认", "确认入库、驳回、备注、查看"], ["全部入库", "申请数量全部入库", "备注、查看"], ["已驳回", "需求被驳回", "备注、查看"]] },
        { title: "数量规则", headers: ["字段", "规则"], rows: [["入库差", "KOL申请数量 - KOL入库数量"], ["入库次数", "每次确认入库后 +1"], ["实际可得次数", "每次确认实际入库后 +1"], ["超量入库", "单条操作二次确认，批量操作不允许超量"]] },
      ]} />

      <Drawer open={formOpen} title={editing ? "编辑KOL采购需求" : "新增KOL采购需求"} onClose={() => setFormOpen(false)}>
        <div className="space-y-5">
          <section>
            <SectionTitle>基础信息</SectionTitle>
            <div className="grid grid-cols-2 gap-3">
              <Field label="申请人 *"><input className={inputClass} value={form.applicant} onChange={(event) => setForm((current) => ({ ...current, applicant: event.target.value }))} /></Field>
              <Field label="店铺 *"><select className={inputClass} value={form.storeName} onChange={(event) => setForm((current) => ({ ...current, storeName: event.target.value }))}>{stores.map((item) => <option key={item}>{item}</option>)}</select></Field>
              <Field label="是否可售爆款"><select className={inputClass} value={form.isHotSale ? "是" : "否"} onChange={(event) => setForm((current) => ({ ...current, isHotSale: event.target.value === "是" }))}><option>否</option><option>是</option></select></Field>
              <Field label="申请时间 *"><input className={inputClass} value={form.appliedAt} onChange={(event) => setForm((current) => ({ ...current, appliedAt: event.target.value }))} /></Field>
            </div>
          </section>
          <section>
            <SectionTitle>商品选择</SectionTitle>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input className={`${inputClass} pl-9`} value={spuOpen ? spuQuery : currentSpu ? `${currentSpu.spu} · ${currentSpu.productName}` : ""} onFocus={() => { setSpuOpen(true); setSpuQuery(""); }} onChange={(event) => { setSpuOpen(true); setSpuQuery(event.target.value); }} placeholder="搜索 SPU / 款号 / 商品名称" />
              {spuOpen && <div className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded border bg-white py-1 shadow-lg">
                {spuMatches.map((item) => <button key={item.spu} className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm hover:bg-blue-50" onMouseDown={(event) => event.preventDefault()} onClick={() => chooseSpu(item.spu)}><ProductImage src={item.imageUrl} name={item.productName} /><span><strong>{item.spu}</strong><span className="ml-2 text-gray-500">{item.productName} · {item.skuItems.length} SKU</span></span></button>)}
              </div>}
            </div>
          </section>
          {currentSpu && <section>
            <SectionTitle>SKU明细</SectionTitle>
            <div className="overflow-x-auto rounded border">
              <table className="min-w-[850px] w-full text-left text-xs">
                <thead className="bg-gray-50"><tr>{["", "图片", "SKU", "商品名称", "颜色", "尺码", "历史KOL申请数量", "本次KOL申请数量", "备注"].map((item) => <th key={item} className="border-b px-2 py-2 font-medium">{item}</th>)}</tr></thead>
                <tbody>{currentSpu.skuItems.map((item) => <tr key={item.sku} className="border-b">
                  <td className="px-2 py-2"><input type="checkbox" checked={form.selectedSkus.includes(item.sku)} onChange={() => toggleSku(item.sku)} /></td>
                  <td className="px-2 py-2"><ProductImage src={item.imageUrl ?? currentSpu.imageUrl} name={currentSpu.productName} /></td>
                  <td className="px-2 py-2 font-medium">{item.sku}</td><td className="px-2 py-2">{currentSpu.productName}</td><td className="px-2 py-2">{item.color}</td><td className="px-2 py-2">{item.size}</td>
                  <td className="px-2 py-2">{item.kolApplicationQty ?? 0}</td>
                  <td className="px-2 py-2"><input type="number" min={0} className="h-8 w-24 rounded border px-2 text-right" value={form.quantities[item.sku] ?? 0} onChange={(event) => setForm((current) => ({ ...current, quantities: { ...current.quantities, [item.sku]: Math.max(0, Number(event.target.value)) } }))} /></td>
                  <td className="px-2 py-2"><input className="h-8 w-40 rounded border px-2" value={form.skuRemarks[item.sku] ?? ""} onChange={(event) => setForm((current) => ({ ...current, skuRemarks: { ...current.skuRemarks, [item.sku]: event.target.value } }))} /></td>
                </tr>)}</tbody>
              </table>
            </div>
            <div className="mt-2 rounded bg-blue-50 px-3 py-2 text-sm text-gray-700">已选 <strong>{form.selectedSkus.length}</strong> 个 SKU，本次KOL申请总数 <strong className="text-brand">{selectedQty}</strong></div>
          </section>}
          <section><SectionTitle>备注</SectionTitle><textarea className="min-h-24 w-full rounded border border-gray-300 p-2 text-sm outline-none focus:border-brand" value={form.note} onChange={(event) => setForm((current) => ({ ...current, note: event.target.value }))} placeholder="填写申请说明" /></section>
          <div className="sticky bottom-0 flex justify-end gap-2 border-t bg-white py-3"><button className="h-9 rounded border px-4 text-sm" onClick={() => setFormOpen(false)}>取消</button><button className="h-9 rounded border border-brand px-4 text-sm text-brand" onClick={() => saveForm("草稿")}>保存草稿</button><button className="h-9 rounded bg-brand px-4 text-sm text-white" onClick={() => saveForm("待入库")}>提交申请</button></div>
        </div>
      </Drawer>

      <Drawer open={!!detail} title="KOL采购需求详情" onClose={() => setDetail(null)} width="max-w-[860px]">
        {detail && <div className="space-y-5 text-sm">
          <section><SectionTitle>申请信息</SectionTitle><div className="grid grid-cols-3 gap-3 rounded bg-gray-50 p-3">{[["申请单号", detail.demandNo], ["申请人", detail.applicant], ["申请时间", detail.appliedAt], ["店铺", detail.storeName ?? "-"], ["是否可售爆款", detail.isHotSale ? "是" : "否"], ["状态", detail.status]].map(([label, value]) => <div key={label}><div className="text-xs text-gray-500">{label}</div><div className="mt-1">{value}</div></div>)}</div></section>
          <section><SectionTitle>商品信息</SectionTitle><div className="flex gap-4"><ProductImage src={detail.imageUrl} name={detail.productName} large /><div className="grid flex-1 grid-cols-2 gap-3">{[["SPU", detail.spu], ["SKU", detail.sku], ["商品名称", detail.productName], ["颜色 / 尺码", `${detail.color} / ${detail.size}`], ["款式", `${detail.styleId} ${detail.styleName}`], ["品类 / 评分", `${detail.category} / ${detail.score}`]].map(([label, value]) => <div key={label}><span className="text-gray-500">{label}：</span>{value}</div>)}</div></div></section>
          <section><SectionTitle>数量信息</SectionTitle><div className="grid grid-cols-3 gap-2">{[["KOL申请数量", detail.kolApplyQty], ["KOL入库数量", detail.kolInboundQty], ["入库差", detail.inboundDiffQty], ["实际可得次数", detail.actualAvailableCount], ["KOL入库次数", detail.kolInboundCount], ["最后一次实际可得", detail.lastAvailableAt ?? "-"]].map(([label, value]) => <div key={label} className="rounded border px-3 py-2"><div className="text-xs text-gray-500">{label}</div><div className="mt-1 font-medium">{value}</div></div>)}</div></section>
          <section><SectionTitle>入库记录</SectionTitle><div className="rounded border">{detail.inboundRecords.length ? detail.inboundRecords.map((item) => <div key={item.id} className="grid grid-cols-4 border-b px-3 py-2 text-xs"><span>{item.inboundAt}</span><span>{item.inboundBy}</span><span>{item.quantity} 件</span><span>{item.remark || "-"}</span></div>) : <div className="p-4 text-center text-gray-400">暂无入库记录</div>}</div></section>
          {detail.status === "已驳回" && <section><SectionTitle>驳回信息</SectionTitle><div className="rounded border border-red-100 bg-red-50 p-3"><div>{detail.rejectedBy} · {detail.rejectedAt}</div><div className="mt-1 text-red-700">{detail.rejectReason}</div></div></section>}
          <section><SectionTitle>备注记录</SectionTitle><div className="space-y-2">{detail.remarks.length ? detail.remarks.map((item) => <div key={item.id} className="rounded border p-3"><div className="text-xs text-gray-500">{item.createdBy} · {item.createdAt}</div><div className="mt-1">{item.content}</div></div>) : <div className="text-gray-400">暂无备注</div>}</div></section>
          <section><SectionTitle>操作日志</SectionTitle><div className="space-y-2">{detail.logs.map((item) => <div key={item.id} className="flex gap-3 border-b pb-2 text-xs"><span className="w-36 text-gray-500">{item.operatedAt}</span><span className="w-20 font-medium">{item.action}</span><span>{item.operator} · {item.detail}</span></div>)}</div></section>
        </div>}
      </Drawer>

      <Modal open={inboundTargets.length > 0} title="确认KOL需求入库" onClose={() => setInboundTargets([])}>
        {inboundTargets.length > 0 && <div className="space-y-4 text-sm">
          <div className="rounded bg-gray-50 p-3"><div className="font-medium">{inboundTargets.length === 1 ? inboundTargets[0].demandNo : `已选择 ${inboundTargets.length} 条需求`}</div>{inboundTargets.length === 1 && <div className="mt-2 flex gap-3"><ProductImage src={inboundTargets[0].imageUrl} name={inboundTargets[0].productName} /><div><div>{inboundTargets[0].productName}</div><div className="text-xs text-gray-500">{inboundTargets[0].spu} / {inboundTargets[0].sku}</div><div className="mt-1">申请 {inboundTargets[0].kolApplyQty} · 已入库 {inboundTargets[0].kolInboundQty} · 待入库 {inboundTargets[0].inboundDiffQty}</div></div></div>}</div>
          <Field label="本次入库数量 *"><input type="number" min={1} className={inputClass} value={inboundQty} onChange={(event) => setInboundQty(event.target.value)} /></Field>
          <Field label="入库时间 *"><input className={inputClass} value={inboundAt} onChange={(event) => setInboundAt(event.target.value)} /></Field>
          <Field label="备注"><textarea className="min-h-20 w-full rounded border p-2" value={inboundRemark} onChange={(event) => setInboundRemark(event.target.value)} /></Field>
          <div className="flex justify-end gap-2"><button className="h-9 rounded border px-4" onClick={() => setInboundTargets([])}>取消</button><button className="h-9 rounded bg-green-600 px-4 text-white" onClick={confirmInbound}>确认入库</button></div>
        </div>}
      </Modal>

      <Modal open={rejectTargets.length > 0} title="驳回KOL采购需求" onClose={() => setRejectTargets([])}>
        <div className="space-y-4 text-sm"><div className="rounded bg-gray-50 p-3">已选择 {rejectTargets.length} 条需求 · 驳回人：{currentUser} · {nowText()}</div><Field label="驳回原因 *"><textarea className="min-h-28 w-full rounded border p-2" value={rejectReason} onChange={(event) => setRejectReason(event.target.value)} /></Field><div className="flex justify-end gap-2"><button className="h-9 rounded border px-4" onClick={() => setRejectTargets([])}>取消</button><button className="h-9 rounded bg-red-600 px-4 text-white" onClick={confirmReject}>确认驳回</button></div></div>
      </Modal>

      <Modal open={remarkTargets.length > 0} title="添加备注" onClose={() => setRemarkTargets([])}>
        <div className="space-y-4 text-sm"><div className="rounded bg-gray-50 p-3">已选择 {remarkTargets.length} 条需求 · 备注人：{currentUser} · {nowText()}</div><Field label="备注内容 *"><textarea className="min-h-28 w-full rounded border p-2" value={remarkContent} onChange={(event) => setRemarkContent(event.target.value)} /></Field><div className="flex justify-end gap-2"><button className="h-9 rounded border px-4" onClick={() => setRemarkTargets([])}>取消</button><button className="h-9 rounded bg-teal-600 px-4 text-white" onClick={confirmRemark}>保存备注</button></div></div>
      </Modal>
      <Toast msg={toast} />
    </div>
  );
}
