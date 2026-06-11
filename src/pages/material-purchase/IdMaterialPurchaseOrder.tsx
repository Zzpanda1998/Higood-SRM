import { useMemo, useState } from "react";
import DesignLogicCard from "../../components/common/DesignLogicCard";
import FormModal from "../../components/common/FormModal";
import PageHeader from "../../components/common/PageHeader";
import Toast from "../../components/common/Toast";
import { idMaterialPurchaseOrders, type IdMaterialPurchaseOrder } from "../../mock/idMaterialPurchaseOrders";
import type { ImportedLogisticsInfo } from "../../types/materialLogistics";
import { parseExcelRows } from "../../utils/excelImport";

type Filters = {
  keyword: string;
  logisticsNo: string;
  orderType: string;
  purchaseRegion: string;
  hasLogisticsNo: string;
  includesProduction: string;
  merchantArrivalStatus: string;
  orderStatus: string;
  status: string;
  supplier: string;
  buyer: string;
  createdFrom: string;
  createdTo: string;
  inboundFrom: string;
  inboundTo: string;
  signedFrom: string;
  signedTo: string;
  transitFrom: string;
  transitTo: string;
  warehouseFrom: string;
  warehouseTo: string;
  minShippingDays: string;
  maxShippingDays: string;
  minTransitDays: string;
  maxTransitDays: string;
  costConfirmed: string;
  usageType: string;
  pageSize: string;
};

const emptyFilters: Filters = {
  keyword: "", logisticsNo: "", orderType: "请选择", purchaseRegion: "请选择", hasLogisticsNo: "请选择",
  includesProduction: "请选择", merchantArrivalStatus: "请选择", orderStatus: "请选择", status: "还未选择",
  supplier: "请选择", buyer: "请选择", createdFrom: "", createdTo: "", inboundFrom: "", inboundTo: "",
  signedFrom: "", signedTo: "", transitFrom: "", transitTo: "", warehouseFrom: "", warehouseTo: "",
  minShippingDays: "", maxShippingDays: "", minTransitDays: "", maxTransitDays: "", costConfirmed: "请选择",
  usageType: "还未选择", pageSize: "20",
};

type ImportPreviewRow = ImportedLogisticsInfo & {
  rowNo: number;
  errors: string[];
};

const importHeaders = ["面辅料采购单号", "快递公司", "物流单号", "发货时间", "货运方式", "联系人", "转运中心", "国内运费", "预计转运天数", "备注"];
const headerAliases: Record<string, keyof ImportedLogisticsInfo> = {
  面辅料采购单号: "idOrderNo",
  采购单号: "idOrderNo",
  快递公司: "company",
  物流单号: "logisticsNo",
  发货时间: "shippedAt",
  货运方式: "freightMethod",
  联系人: "contact",
  转运中心: "transitCenter",
  国内运费: "domesticFreight",
  预计转运天数: "estimatedTransitDays",
  备注: "remark",
};

const qty = (value?: number) => (value ?? 0).toLocaleString("zh-CN", { maximumFractionDigits: 3 });
const dateOnly = (value?: string) => value?.slice(0, 10) ?? "";
const inRange = (value: string | undefined, from: string, to: string) => {
  const current = dateOnly(value);
  if (from && current < from) return false;
  if (to && current > to) return false;
  return true;
};

const normalizeDate = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (/^\d{4}-\d{1,2}-\d{1,2}/.test(trimmed)) {
    const [year, month, day] = trimmed.slice(0, 10).split("-");
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }
  if (/^\d{4}\/\d{1,2}\/\d{1,2}/.test(trimmed)) {
    const [year, month, day] = trimmed.slice(0, 10).split("/");
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }
  const excelSerial = Number(trimmed);
  if (Number.isFinite(excelSerial) && excelSerial > 25000) {
    const date = new Date(Math.round((excelSerial - 25569) * 86400 * 1000));
    return date.toISOString().slice(0, 10);
  }
  return trimmed;
};

const downloadLogisticsTemplate = () => {
  const sampleRows = [
    ["ID-MP-2026-0003", "中通", "79009539542096", "2026-06-08", "快递", "采购物流 138****6688", "广州转运中心", "18.50", "9", "供应商国内发货"],
    ["ID-MP-2026-0004", "顺丰", "SF1574547229798", "2026-06-08", "快递", "采购物流 138****6688", "深圳转运中心", "25.00", "8", "加急发货"],
  ];
  const html = `<!doctype html><html><head><meta charset="utf-8" /></head><body><table><thead><tr>${importHeaders.map((header) => `<th>${header}</th>`).join("")}</tr></thead><tbody>${sampleRows.map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join("")}</tr>`).join("")}</tbody></table></body></html>`;
  const url = URL.createObjectURL(new Blob([html], { type: "application/vnd.ms-excel;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "面辅料采购快递信息导入模板.xls";
  link.click();
  URL.revokeObjectURL(url);
};

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="grid gap-1 text-xs text-gray-500">{label}{children}</label>;
}

function ImageCell({ src, name, size = "h-16 w-14" }: { src?: string; name: string; size?: string }) {
  if (!src) return <div className={`${size} flex items-center justify-center border border-gray-200 bg-gray-100 text-xs text-gray-400`}>无图</div>;
  return <img src={src} alt={name} className={`${size} border border-gray-200 object-cover`} />;
}

const legacyActions = [
  ["查看详情", "green"], ["开启入库", "blue"], ["修改实际采购价", "orange"], ["设置快递单", "blue"],
  ["采购备注", "green"], ["面辅料入库", "blue"], ["日志记录", "green"], ["打印采购详情", "blue"],
  ["现货和批发", "orange"], ["采购辅助", "green"], ["创建冲突单", "orange"], ["确认入库", "blue"],
  ["采购单挂起", "orange"], ["复制采购单", "green"], ["上传转运凭证", "blue"],
] as const;

export default function IdMaterialPurchaseOrder({
  orders = idMaterialPurchaseOrders,
  onOrdersChange,
  onLogisticsImported,
}: {
  orders?: IdMaterialPurchaseOrder[];
  onOrdersChange?: (orders: IdMaterialPurchaseOrder[]) => void;
  onLogisticsImported?: (records: ImportedLogisticsInfo[]) => void;
}) {
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [selected, setSelected] = useState<string[]>([]);
  const [toast, setToast] = useState("");
  const [importOpen, setImportOpen] = useState(false);
  const [importRows, setImportRows] = useState<ImportPreviewRow[]>([]);
  const [importFileName, setImportFileName] = useState("");
  const [importing, setImporting] = useState(false);

  const suppliers = useMemo(() => Array.from(new Set(orders.map((row) => row.supplier).filter(Boolean))), [orders]);
  const buyers = useMemo(() => Array.from(new Set(orders.map((row) => row.buyer).filter(Boolean))), [orders]);

  const rows = useMemo(() => {
    const minShipping = Number(filters.minShippingDays || 0);
    const maxShipping = Number(filters.maxShippingDays || Number.MAX_SAFE_INTEGER);
    const minTransit = Number(filters.minTransitDays || 0);
    const maxTransit = Number(filters.maxTransitDays || Number.MAX_SAFE_INTEGER);
    return orders.filter((row) => {
      const text = [row.idOrderNo, row.skuCode, row.materialCode, row.materialName, row.sourceProductOrderNo].join(" ");
      return (!filters.keyword || text.includes(filters.keyword))
        && (!filters.logisticsNo || row.logisticsNo?.includes(filters.logisticsNo))
        && (filters.orderType === "请选择" || row.orderType === filters.orderType)
        && (filters.purchaseRegion === "请选择" || row.purchaseRegion === filters.purchaseRegion)
        && (filters.hasLogisticsNo === "请选择" || row.hasLogisticsNo === filters.hasLogisticsNo)
        && (filters.includesProduction === "请选择" || row.includesProduction === filters.includesProduction)
        && (filters.merchantArrivalStatus === "请选择" || row.merchantArrivalStatus === filters.merchantArrivalStatus)
        && (filters.orderStatus === "请选择" || row.orderStatus === filters.orderStatus)
        && (filters.status === "还未选择" || row.status === filters.status)
        && (filters.supplier === "请选择" || row.supplier === filters.supplier)
        && (filters.buyer === "请选择" || row.buyer === filters.buyer)
        && inRange(row.orderDate, filters.createdFrom, filters.createdTo)
        && inRange(row.inboundAt, filters.inboundFrom, filters.inboundTo)
        && inRange(row.signedAt, filters.signedFrom, filters.signedTo)
        && inRange(row.transitAt, filters.transitFrom, filters.transitTo)
        && inRange(row.warehouseAt, filters.warehouseFrom, filters.warehouseTo)
        && (row.domesticDays ?? 0) >= minShipping && (row.domesticDays ?? 0) <= maxShipping
        && (row.estimatedTransitDays ?? 0) >= minTransit && (row.estimatedTransitDays ?? 0) <= maxTransit
        && (filters.costConfirmed === "请选择" || row.costConfirmed === filters.costConfirmed)
        && (filters.usageType === "还未选择" || row.usageType === filters.usageType);
    }).slice(0, Math.max(1, Number(filters.pageSize) || 20));
  }, [filters, orders]);

  const stats = useMemo(() => ({
    planned: rows.reduce((sum, row) => sum + (row.plannedPurchaseQty ?? row.purchaseQty), 0),
    arrived: rows.reduce((sum, row) => sum + (row.arrivedQty ?? 0), 0),
  }), [rows]);

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 1800);
  };
  const update = <K extends keyof Filters>(key: K, value: Filters[K]) => setFilters((current) => ({ ...current, [key]: value }));
  const toggle = (id: string) => setSelected((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  const runBatch = (action: string) => selected.length ? showToast(`${action}：已选择 ${selected.length} 张采购单`) : showToast("请先选择面辅料采购单");
  const actionClass = (color: string) => color === "blue" ? "bg-[#1677ff]" : color === "orange" ? "bg-[#fa8c16]" : "bg-[#009688]";
  const parseImportFile = async (file: File) => {
    setImporting(true);
    setImportFileName(file.name);
    try {
      const rawRows = await parseExcelRows(file);
      const headerRow = rawRows[0]?.map((cell) => cell.trim()) ?? [];
      const fieldIndexes = headerRow.reduce<Record<number, keyof ImportedLogisticsInfo>>((map, header, index) => {
        const key = headerAliases[header];
        if (key) map[index] = key;
        return map;
      }, {});
      const orderMap = new Map(orders.map((order) => [order.idOrderNo, order]));
      const seenLogisticsNos = new Set<string>();
      const preview = rawRows.slice(1).filter((row) => row.some((cell) => cell.trim())).map((row, index) => {
        const record: ImportedLogisticsInfo = {
          idOrderNo: "",
          company: "",
          logisticsNo: "",
          shippedAt: "",
          freightMethod: "快递",
          contact: "",
          transitCenter: "广州转运中心",
          domesticFreight: 0,
          estimatedTransitDays: 0,
          remark: "",
          importedAt: "2026-06-08 10:30",
        };
        Object.entries(fieldIndexes).forEach(([rawIndex, key]) => {
          const value = row[Number(rawIndex)]?.trim() ?? "";
          if (key === "domesticFreight") record.domesticFreight = Number(value || 0);
          else if (key === "estimatedTransitDays") record.estimatedTransitDays = Number(value || 0);
          else if (key === "shippedAt") record.shippedAt = normalizeDate(value);
          else record[key] = value as never;
        });
        const errors: string[] = [];
        if (!record.idOrderNo) errors.push("面辅料采购单号必填");
        if (record.idOrderNo && !orderMap.has(record.idOrderNo)) errors.push("采购单不存在");
        if (!record.company) errors.push("快递公司必填");
        if (!record.logisticsNo) errors.push("物流单号必填");
        if (record.logisticsNo && seenLogisticsNos.has(record.logisticsNo)) errors.push("物流单号重复");
        if (record.logisticsNo) seenLogisticsNos.add(record.logisticsNo);
        if (!record.shippedAt) errors.push("发货时间必填");
        if (!Number.isFinite(record.domesticFreight) || record.domesticFreight < 0) errors.push("国内运费必须为非负数字");
        if (!Number.isFinite(record.estimatedTransitDays) || record.estimatedTransitDays < 0) errors.push("预计转运天数必须为非负数字");
        return { ...record, rowNo: index + 2, errors };
      });
      setImportRows(preview);
      showToast(`已解析 ${preview.length} 条快递信息`);
    } catch (error) {
      setImportRows([]);
      showToast(error instanceof Error ? error.message : "文件解析失败");
    } finally {
      setImporting(false);
    }
  };

  const confirmImport = () => {
    const validRows = importRows.filter((row) => row.errors.length === 0);
    if (!validRows.length) {
      showToast("没有可导入的有效数据");
      return;
    }
    if (importRows.some((row) => row.errors.length > 0)) {
      showToast("存在错误数据，请修正后再导入");
      return;
    }
    const importMap = new Map(validRows.map((row) => [row.idOrderNo, row]));
    const nextOrders = orders.map((order) => {
      const imported = importMap.get(order.idOrderNo);
      if (!imported) return order;
      return {
        ...order,
        hasLogisticsNo: "是" as const,
        logisticsNo: imported.logisticsNo,
        logisticsStatus: "供应商已发货",
        freightMethod: imported.freightMethod,
        contact: imported.contact || order.contact,
        transitCenter: imported.transitCenter || order.transitCenter,
        domesticFreight: imported.domesticFreight,
        estimatedTransitDays: imported.estimatedTransitDays,
        shippedAt: imported.shippedAt,
        transitAt: imported.shippedAt,
        status: order.status === "草稿" || order.status === "待确认" ? "已发货" : order.status,
        transportNode: "国内已发货",
        purchaseRemark: imported.remark || order.purchaseRemark,
      };
    });
    onOrdersChange?.(nextOrders);
    onLogisticsImported?.(validRows.map(({ rowNo: _rowNo, errors: _errors, ...record }) => record));
    setFilters((current) => ({ ...current, logisticsNo: "" }));
    setImportOpen(false);
    setImportRows([]);
    setImportFileName("");
    showToast(`导入成功：回写 ${validRows.length} 张采购单，并生成物流信息`);
  };

  const dateRange = (from: keyof Filters, to: keyof Filters) => (
    <div className="flex gap-1">
      <input className="h-8 min-w-0 rounded border px-1 text-xs" type="date" value={filters[from]} onChange={(event) => update(from, event.target.value)} />
      <input className="h-8 min-w-0 rounded border px-1 text-xs" type="date" value={filters[to]} onChange={(event) => update(to, event.target.value)} />
    </div>
  );
  const select = (key: keyof Filters, options: string[]) => (
    <select className="h-8 rounded border px-2 text-sm" value={filters[key]} onChange={(event) => update(key, event.target.value)}>
      {options.map((option) => <option key={option}>{option}</option>)}
    </select>
  );

  return (
    <div>
      <PageHeader title="面辅料采购单列表" desc="按老系统高密度结构展示面料、辅料、物流、成本、到货入库及采购操作信息。" />

      <section className="mb-2 flex flex-wrap gap-1 border border-gray-200 bg-white px-3 py-2">
        {["批量设置采购员", "批量驳回", "批量切快递", "批量导出发货", "批量确认实际采购价", "采购备注", "批量设为已下单", "设置面辅料供应商", "辅料转添加成衣信息"].map((action, index) => (
          <button key={action} className={`h-7 rounded-sm px-2 text-xs text-white ${index < 2 ? "bg-[#009688]" : index < 6 ? "bg-[#1677ff]" : "bg-[#16a085]"}`} onClick={() => runBatch(action)}>{action}</button>
        ))}
      </section>

      <section className="mb-2 border border-gray-200 bg-white p-3">
        <div className="grid grid-cols-1 gap-x-3 gap-y-2 md:grid-cols-3 xl:grid-cols-5">
          <Field label="采购单号"><div className="flex"><select className="h-8 w-24 rounded-l border border-r-0 px-1 text-xs"><option>采购单号</option><option>SKU</option></select><input className="h-8 min-w-0 flex-1 rounded-r border px-2 text-sm" value={filters.keyword} onChange={(e) => update("keyword", e.target.value)} placeholder="采购单号 / SKU" /></div></Field>
          <Field label="物流单号"><input className="h-8 rounded border px-2 text-sm" value={filters.logisticsNo} onChange={(e) => update("logisticsNo", e.target.value)} /></Field>
          <Field label="采购单类型">{select("orderType", ["请选择", "面料采购", "辅料采购"])}</Field>
          <Field label="采购地区">{select("purchaseRegion", ["请选择", "CN", "ID"])}</Field>
          <Field label="是否有物流单号">{select("hasLogisticsNo", ["请选择", "是", "否"])}</Field>
          <Field label="是否含货生产">{select("includesProduction", ["请选择", "是", "否"])}</Field>
          <Field label="商家到货状态">{select("merchantArrivalStatus", ["请选择", "未到货", "部分到货", "全部到货"])}</Field>
          <Field label="下单状态">{select("orderStatus", ["请选择", "未下单", "已下单"])}</Field>
          <Field label="状态">{select("status", ["还未选择", "草稿", "待确认", "已确认", "已发货", "在途", "已到仓", "已入库", "已完成"])}</Field>
          <Field label="面辅料供应商">{select("supplier", ["请选择", ...suppliers])}</Field>
          <Field label="采购人">{select("buyer", ["请选择", ...buyers])}</Field>
          <Field label="创建时间">{dateRange("createdFrom", "createdTo")}</Field>
          <Field label="入库时间">{dateRange("inboundFrom", "inboundTo")}</Field>
          <Field label="签收时间">{dateRange("signedFrom", "signedTo")}</Field>
          <Field label="转运时间">{dateRange("transitFrom", "transitTo")}</Field>
          <Field label="到仓库时间">{dateRange("warehouseFrom", "warehouseTo")}</Field>
          <Field label="出货的天数"><div className="flex gap-1"><input className="h-8 min-w-0 rounded border px-2" type="number" placeholder="最小" value={filters.minShippingDays} onChange={(e) => update("minShippingDays", e.target.value)} /><input className="h-8 min-w-0 rounded border px-2" type="number" placeholder="最大" value={filters.maxShippingDays} onChange={(e) => update("maxShippingDays", e.target.value)} /></div></Field>
          <Field label="转运时效天数"><div className="flex gap-1"><input className="h-8 min-w-0 rounded border px-2" type="number" placeholder="最小" value={filters.minTransitDays} onChange={(e) => update("minTransitDays", e.target.value)} /><input className="h-8 min-w-0 rounded border px-2" type="number" placeholder="最大" value={filters.maxTransitDays} onChange={(e) => update("maxTransitDays", e.target.value)} /></div></Field>
          <Field label="是否已确定成本价">{select("costConfirmed", ["请选择", "是", "否"])}</Field>
          <Field label="使用类型">{select("usageType", ["还未选择", "成衣做货备货", "样衣", "返单"])}</Field>
          <Field label="每页显示">{select("pageSize", ["20", "50", "100"])}</Field>
        </div>
        <div className="mt-3 flex flex-wrap gap-2 border-t border-gray-100 pt-3">
          <button className="h-8 rounded bg-brand px-4 text-sm text-white" onClick={() => showToast("已按当前条件查询")}>查询</button>
          <button className="h-8 rounded border px-4 text-sm" onClick={() => { setFilters(emptyFilters); setSelected([]); }}>默认</button>
          <button className="h-8 rounded border border-blue-300 px-3 text-sm text-blue-700" onClick={() => showToast("导出采购单明细")}>导出采购单明细</button>
          <button className="h-8 rounded border border-blue-300 px-3 text-sm text-blue-700" onClick={() => showToast("导出面料采购小单明细")}>导出面料采购小单明细</button>
        </div>
      </section>

      <section className="mb-2 flex flex-wrap gap-1 border border-gray-200 bg-white px-3 py-2">
        {["面料采购", "辅料采购", "辅料采购", "批量采购"].map((action, index) => <button key={`${action}-${index}`} className={`h-7 rounded-sm px-3 text-xs text-white ${index < 2 ? "bg-brand" : "bg-[#009688]"}`} onClick={() => showToast(`${action}入口已打开`)}>{action}</button>)}
        <button className="h-7 rounded-sm bg-[#009688] px-3 text-xs text-white" onClick={() => setImportOpen(true)}>导入快递信息</button>
      </section>

      <section className="mb-2 flex gap-8 border border-gray-200 bg-white px-4 py-2 text-sm">
        <div><span className="text-gray-600">计划采购商品数：</span><strong>{qty(stats.planned)}</strong></div>
        <div><span className="text-gray-600">到货商品数：</span><strong>{qty(stats.arrived)}</strong></div>
      </section>

      <div className="overflow-x-auto border border-gray-200 bg-white">
        <table className="min-w-[3200px] table-fixed text-left text-xs text-gray-800">
          <colgroup>{[40,150,250,280,240,260,130,150,100,160,180,100,90,270].map((width, index) => <col key={index} style={{ width }} />)}</colgroup>
          <thead className="bg-gray-50"><tr>{["勾选框", "采购单号", "源采购单信息", "面料信息", "采购信息", "物流信息", "时间", "下单 / 商家到货状态", "状态", "成本数据", "备注", "质检结果", "添加人", "操作"].map((title) => <th key={title} className="border-b px-2 py-2 font-medium">{title}</th>)}</tr></thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.idOrderNo} className="border-b border-gray-200 align-top hover:bg-gray-50">
                <td className="px-2 py-2 text-center"><input type="checkbox" checked={selected.includes(row.idOrderNo)} onChange={() => toggle(row.idOrderNo)} /></td>
                <td className="px-2 py-2"><div className="flex flex-col items-center gap-1 text-center"><button className="font-medium text-brand" onClick={() => showToast(`查看采购单：${row.idOrderNo}`)}>{row.idOrderNo.replace(/\D/g, "")}</button><ImageCell src={row.materialImageUrl} name={row.materialName} /><div className="text-red-600">{row.skuCount ?? 1}个SKU</div><div className="w-32 break-all">{row.skuCode || row.materialCode}</div></div></td>
                <td className="px-2 py-2 leading-5"><div>源采购单：{row.sourceProductOrderNo.replace(/\D/g, "")}</div><div>计划采购：{qty(row.sourcePurchaseQty)}</div><div>创建时间：{row.sourceCreatedAt}</div><div className="my-1 flex items-center gap-2"><ImageCell src={row.sourceProductImageUrl} name={row.sourceProductName || "-"} size="h-12 w-10" /><span>{row.sourceProductName}</span></div><div>SPU：{row.sourceSpu}</div><button className="mt-1 rounded-sm bg-[#009688] px-2 py-0.5 text-white" onClick={() => showToast("关联商品采购单")}>关联商品采购单</button></td>
                <td className="px-2 py-2 leading-5"><div><span className="rounded-sm bg-green-600 px-1.5 py-0.5 text-white">{row.materialName}</span></div><div>SPU：{row.materialCode}</div><div>申请人：{row.applicant}</div><div>实际采购价：{qty(row.actualPurchasePrice)}</div><div>单件克重：{qty(row.unitWeight)}</div><div>单件辅料费用：{qty(row.unitMaterialCost)}</div><div className="text-green-700">采购中数量：{qty(row.purchasingQty)}</div><div className="text-red-600">库存：{qty(row.stockQty)}</div><div>单位克重：{qty(row.unitWeight)} KG</div><div>单位成衣：<span className={row.garmentUnit === "未设" ? "text-red-600" : ""}>{row.garmentUnit}</span></div><div className="mt-1 flex flex-wrap gap-1">{["设置重量", "编辑", "面辅料"].map((action) => <button key={action} className="rounded-sm bg-[#009688] px-1.5 py-0.5 text-white" onClick={() => showToast(action)}>{action}</button>)}</div></td>
                <td className="px-2 py-2 leading-5"><div>使用类型：{row.usageType}</div><div>采购地区：【{row.orderType}】</div><div>采购数量：{qty(row.purchaseQty)} {row.unit}</div><div className="text-green-700">实际采购数量：{qty(row.actualPurchaseQty)}</div><div>商家到货数量：{qty(row.merchantArrivalQty)}</div><div>采购中：{qty(row.purchasingQty)}</div><div className="text-blue-700">到货数量：{qty(row.arrivedQty)}</div><div>入库数量：{qty(row.inboundQty)}</div><div>给付：{qty(row.paidQty)}</div><div className="mt-1 flex flex-wrap gap-1">{["设置供应商", "设置面料供应商"].map((action) => <button key={action} className="rounded-sm bg-[#009688] px-1.5 py-0.5 text-white" onClick={() => showToast(action)}>{action}</button>)}</div></td>
                <td className="px-2 py-2 leading-5"><div>货运：{row.freightMethod}</div><div>快递：{row.logisticsNo ? <span className="text-brand">{row.logisticsNo}</span> : "-"}</div><div>{row.logisticsStatus}</div><div>{row.contact}</div><div>转运中心：{row.transitCenter}</div><div className={(row.domesticDays ?? 0) > 5 ? "text-red-600" : ""}>国内天数：{row.domesticDays}天</div><div className={(row.estimatedTransitDays ?? 0) > 12 ? "text-red-600" : ""}>预计转运：{row.estimatedTransitDays}天</div><div className="text-brand">{row.transitNo}</div><div>入库单：{row.inboundNo || "-"}</div><div>发货时间：{row.shippedAt || "-"}</div><div>入库时间：{row.inboundAt || "-"}</div><div>{row.inboundAt ? "快递送仓完成" : "待送仓"}</div><button className="mt-1 rounded-sm bg-[#1677ff] px-2 py-0.5 text-white" onClick={() => showToast(row.logisticsNo ? "查看物流信息" : "继续添加物流信息")}>{row.logisticsNo ? "查看物流信息" : "继续添加物流信息"}</button></td>
                <td className="px-2 py-2 leading-5"><div>创建：{dateOnly(row.orderDate)}</div><div>入库：{dateOnly(row.inboundAt)}</div></td>
                <td className="px-2 py-2 leading-5 text-blue-700"><div>{row.orderStatus}</div><div>{row.merchantArrivalStatus}</div></td>
                <td className="px-2 py-2">{row.status}</td>
                <td className="px-2 py-2 leading-5"><div>采购费用：{qty((row.actualPurchaseQty ?? row.purchaseQty) * (row.actualPurchasePrice ?? 0))}</div><div>国内运费：{qty(row.domesticFreight)}</div><div>转运费：{qty(row.transitFee)}</div><div className="font-medium">总成本：{qty(row.totalCost)}</div></td>
                <td className="whitespace-normal px-2 py-2 leading-5">{row.remark}<br />{row.purchaseRemark}</td>
                <td className="px-2 py-2">{row.qualityResult || "-"}</td>
                <td className="px-2 py-2">{row.creator || row.buyer}</td>
                <td className="px-2 py-2"><div className="flex w-[255px] flex-wrap items-start gap-1">{legacyActions.map(([action, color]) => <button key={action} className={`${actionClass(color)} whitespace-nowrap rounded-sm px-1.5 py-0.5 text-[11px] leading-[18px] text-white`} onClick={() => showToast(`${action}：${row.idOrderNo}`)}>{action}</button>)}</div></td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={14} className="p-8 text-center text-gray-400">暂无数据</td></tr>}
          </tbody>
        </table>
      </div>

      <DesignLogicCard sections={[
        { title: "页面定位", headers: ["项目", "说明"], rows: [["页面名称", "面辅料采购单列表"], ["所属模块", "面辅料采购"], ["上游来源", "面辅料需求分析"], ["下游去向", "采购跟踪、到货入库、采购对账"], ["展示结构", "批量操作、密集筛选、导出新增、统计条、高密度列表"]] },
        { title: "筛选与操作", headers: ["区域", "规则", "结果"], rows: [["批量操作", "9个老系统批量入口全部常驻", "勾选采购单后触发Mock提示"], ["筛选区", "21项筛选多行常驻，不折叠、不使用抽屉", "筛选直接作用于采购单列表"], ["导入快递信息", "下载模板、上传 xls/xlsx、解析预览、校验错误、确认导入", "回写采购单物流字段并生成面辅料采购物流信息"], ["统计条", "计划采购商品数与到货商品数按筛选结果汇总", "保留小数展示"]] },
        { title: "列表字段", headers: ["分区", "内容", "展示方式"], rows: [["采购来源", "采购单号、源采购单、源商品图片、SPU", "多行密集展示"], ["物料与采购", "物料价格重量、库存、采购数量、供应商入口", "字段与按钮保留在对应列"], ["物流与成本", "单号、时效、转运、入库、采购费、运费和总成本", "异常天数标红，物流单号标蓝"], ["操作列", "15个操作按钮", "绿蓝橙小按钮横向换行，间距4px"]] },
      ]} />
      <FormModal open={importOpen} title="导入快递信息" widthClass="w-[920px]" onClose={() => setImportOpen(false)}>
        <div className="space-y-3 text-sm">
          <div className="rounded border border-blue-100 bg-blue-50 px-3 py-2 text-xs leading-5 text-blue-800">
            导入链路：下载模板 → 上传 xls / xlsx → 系统解析校验 → 预览确认 → 回写面辅料采购单物流字段 → 生成面辅料采购物流信息。
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button className="h-8 rounded-sm border border-blue-300 px-3 text-sm text-blue-700" onClick={downloadLogisticsTemplate}>下载快递信息导入模板</button>
            <label className="inline-flex h-8 cursor-pointer items-center rounded-sm bg-[#1677ff] px-3 text-sm text-white">
              上传 xls / xlsx
              <input
                className="hidden"
                type="file"
                accept=".xls,.xlsx,.csv,.txt"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) void parseImportFile(file);
                  event.currentTarget.value = "";
                }}
              />
            </label>
            <span className="text-xs text-gray-500">{importFileName || "未选择文件"}</span>
            {importing && <span className="text-xs text-brand">解析中...</span>}
          </div>
          <div className="overflow-x-auto border border-gray-200">
            <table className="min-w-[1180px] text-left text-xs">
              <thead className="bg-gray-50">
                <tr>{["行号", "校验", ...importHeaders].map((header) => <th key={header} className="border-b px-2 py-2 font-medium">{header}</th>)}</tr>
              </thead>
              <tbody>
                {importRows.map((row) => (
                  <tr key={row.rowNo} className={`border-b last:border-0 ${row.errors.length ? "bg-red-50" : ""}`}>
                    <td className="px-2 py-2">{row.rowNo}</td>
                    <td className={`px-2 py-2 ${row.errors.length ? "text-red-600" : "text-green-700"}`}>{row.errors.length ? row.errors.join("；") : "通过"}</td>
                    <td className="px-2 py-2">{row.idOrderNo}</td>
                    <td className="px-2 py-2">{row.company}</td>
                    <td className="px-2 py-2">{row.logisticsNo}</td>
                    <td className="px-2 py-2">{row.shippedAt}</td>
                    <td className="px-2 py-2">{row.freightMethod}</td>
                    <td className="px-2 py-2">{row.contact}</td>
                    <td className="px-2 py-2">{row.transitCenter}</td>
                    <td className="px-2 py-2">{row.domesticFreight}</td>
                    <td className="px-2 py-2">{row.estimatedTransitDays}</td>
                    <td className="px-2 py-2">{row.remark}</td>
                  </tr>
                ))}
                {importRows.length === 0 && <tr><td colSpan={12} className="p-8 text-center text-gray-400">请先下载模板并上传 xls / xlsx 文件，解析后在这里预览。</td></tr>}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between border-t pt-3">
            <div className="text-xs text-gray-500">共 {importRows.length} 条，错误 {importRows.filter((row) => row.errors.length > 0).length} 条。</div>
            <div className="flex gap-2">
              <button className="h-8 rounded border px-4 text-sm" onClick={() => { setImportRows([]); setImportFileName(""); }}>清空</button>
              <button className="h-8 rounded bg-[#009688] px-4 text-sm text-white" onClick={confirmImport}>确认导入</button>
            </div>
          </div>
        </div>
      </FormModal>
      <Toast msg={toast} />
    </div>
  );
}
