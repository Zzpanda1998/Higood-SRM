import { Fragment, useMemo, useState } from "react";
import { PackageCheck, Search } from "lucide-react";
import DataTable from "../../components/common/DataTable";
import DesignLogicCard from "../../components/common/DesignLogicCard";
import DetailModal from "../../components/common/DetailModal";
import PageHeader from "../../components/common/PageHeader";
import SearchBar from "../../components/common/SearchBar";
import StatusBadge from "../../components/common/StatusBadge";
import Toast from "../../components/common/Toast";
import { idMaterialPurchaseOrders, type IdMaterialPurchaseOrder } from "../../mock/idMaterialPurchaseOrders";
import {
  materialRequirementAnalysis,
  type MaterialCategory,
  type MaterialRequirementAnalysisDetail,
  type MaterialRequirementAnalysisOrder,
  type MaterialRequirementPushRecord,
  type MaterialRequirementPushStatus,
} from "../../mock/materialRequirementAnalysis";

type MaterialDetailRow = {
  id: string;
  order: MaterialRequirementAnalysisOrder;
  item: MaterialRequirementAnalysisDetail;
};

type CreateIdPurchaseLine = {
  row: MaterialDetailRow;
  selected: boolean;
  actualPurchaseQty: number;
};

type FilterState = {
  purchaseKeyword: string;
  applicant: string;
  materialSku: string;
  createdFrom: string;
  createdTo: string;
  minProductQty: string;
  maxProductQty: string;
  arrivalFrom: string;
  arrivalTo: string;
  status: string;
  regions: string[];
  productionFactory: string;
  isOverQuantity: string;
  latestWarehouseFrom: string;
  latestWarehouseTo: string;
  purchaseSource: string;
  supplierType: string;
  purchaseFrom: string;
  purchaseTo: string;
  printingStatus: string;
  cuttingStatus: string;
  cuttingArrivalFrom: string;
  cuttingArrivalTo: string;
  productType: string;
  hasIdMaterialOrder: string;
  isKolSampleOrder: string;
  pageSize: string;
};

const emptyFilters: FilterState = {
  purchaseKeyword: "",
  applicant: "",
  materialSku: "",
  createdFrom: "",
  createdTo: "",
  minProductQty: "",
  maxProductQty: "",
  arrivalFrom: "",
  arrivalTo: "",
  status: "全部",
  regions: [],
  productionFactory: "全部",
  isOverQuantity: "全部",
  latestWarehouseFrom: "",
  latestWarehouseTo: "",
  purchaseSource: "",
  supplierType: "全部",
  purchaseFrom: "",
  purchaseTo: "",
  printingStatus: "全部",
  cuttingStatus: "全部",
  cuttingArrivalFrom: "",
  cuttingArrivalTo: "",
  productType: "全部",
  hasIdMaterialOrder: "全部",
  isKolSampleOrder: "全部",
  pageSize: "10",
};

const statusOptions = ["全部", "等待采购", "已采购", "已入库", "已完成"];
const yesNoOptions = ["全部", "是", "否"];

const qty = (value?: number) => (value ?? 0).toLocaleString("zh-CN", { maximumFractionDigits: 2 });
const dateOnly = (value?: string) => value?.slice(0, 10) ?? "";
const inDateRange = (value: string | undefined, from: string, to: string) => {
  const current = dateOnly(value);
  if (from && current < from) return false;
  if (to && current > to) return false;
  return true;
};

function ProductImage({ src, name, size = "h-12 w-12" }: { src?: string; name: string; size?: string }) {
  if (!src) return <div className={`${size} flex shrink-0 items-center justify-center rounded-md border border-gray-200 bg-gray-100 text-xs text-gray-400`}>无图</div>;
  return <img src={src} alt={name} className={`${size} shrink-0 rounded-md border border-gray-200 object-cover`} />;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-1 text-xs text-gray-500">
      {label}
      {children}
    </label>
  );
}

function pushStatusOf(row: MaterialRequirementAnalysisOrder): MaterialRequirementPushStatus {
  return row.pushStatus ?? (row.status === "已下推" || row.status === "已下推ID采购" ? "已下推" : "未下推");
}

function summaryText(row: MaterialRequirementAnalysisOrder) {
  return [row.analysisNo, row.sourceProductOrderNo, row.spu, row.productName, row.skuItems?.map((sku) => sku.sku).join(" ")].join(" ");
}

const mockRegions = [["ID"], ["CN", "ID"], ["CN"], ["ID", "MY"]];
const mockFactories = ["佛山成衣加工厂", "东莞合作做货厂", "绍兴针织工厂"];
const mockSupplierTypes = ["面料供应商", "辅料供应商", "综合供应商"];
const mockProductTypes = ["常规做货", "返单", "新品"];

function enrichMockOrder(row: MaterialRequirementAnalysisOrder, index: number): MaterialRequirementAnalysisOrder {
  const total = row.totalPurchaseQty ?? 0;
  const isPushed = pushStatusOf(row) === "已下推";
  return {
    ...row,
    applicant: row.applicant ?? row.creator ?? row.purchaseOwner ?? "采购员",
    regions: row.regions ?? mockRegions[index % mockRegions.length],
    productionFactory: row.productionFactory ?? mockFactories[index % mockFactories.length],
    isOverQuantity: row.isOverQuantity ?? (index % 4 === 2 ? "是" : "否"),
    latestWarehouseDate: row.latestWarehouseDate ?? row.expectedArrivalDate,
    purchaseSource: row.purchaseSource ?? `商品采购单 ${row.sourceProductOrderNo}`,
    supplierType: row.supplierType ?? mockSupplierTypes[index % mockSupplierTypes.length],
    purchaseDate: row.purchaseDate ?? row.createdAt,
    printingStatus: row.printingStatus ?? (index % 3 === 0 ? "已完成" : "无需印花"),
    cuttingStatus: row.cuttingStatus ?? (index % 2 === 0 ? "已裁片" : "待裁片"),
    cuttingArrivalDate: row.cuttingArrivalDate ?? row.expectedArrivalDate,
    productType: row.productType ?? mockProductTypes[index % mockProductTypes.length],
    hasIdMaterialOrder: row.hasIdMaterialOrder ?? (isPushed ? "是" : "否"),
    isKolSampleOrder: row.isKolSampleOrder ?? (index % 5 === 4 ? "是" : "否"),
    logisticsNo: row.logisticsNo ?? (isPushed ? `SF202606${String(index + 1).padStart(4, "0")}` : ""),
    logisticsStatus: row.logisticsStatus ?? (isPushed ? "运输中" : "待发货"),
    remark: row.remark ?? (index % 2 === 0 ? "按采购计划优先安排主料" : "辅料齐套后统一发货"),
    arrivedProductQty: row.arrivedProductQty ?? Math.floor(total * (isPushed ? 0.65 : 0.2)),
    shippedProductQty: row.shippedProductQty ?? Math.floor(total * (isPushed ? 0.8 : 0.35)),
    waitingShipmentProductQty: row.waitingShipmentProductQty ?? Math.max(0, total - Math.floor(total * (isPushed ? 0.8 : 0.35))),
  };
}

export default function MaterialRequirementAnalysis() {
  const [rows, setRows] = useState<MaterialRequirementAnalysisOrder[]>(() => materialRequirementAnalysis.map(enrichMockOrder));
  const [filters, setFilters] = useState<FilterState>(emptyFilters);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [detail, setDetail] = useState<MaterialRequirementAnalysisOrder | null>(null);
  const [createLines, setCreateLines] = useState<CreateIdPurchaseLine[]>([]);
  const [createRemark, setCreateRemark] = useState("");
  const [toast, setToast] = useState("");

  const factories = useMemo(() => ["全部", ...Array.from(new Set(rows.map((row) => row.productionFactory).filter(Boolean) as string[]))], [rows]);

  const detailRows = useMemo<MaterialDetailRow[]>(() => rows.flatMap((order) =>
    order.detailItems.map((item, index) => ({
      id: `${order.analysisNo}::${item.materialCode}::${index}`,
      order,
      item,
    })),
  ), [rows]);

  const visibleRows = useMemo(() => {
    const minProductQty = Number(filters.minProductQty || 0);
    const maxProductQty = Number(filters.maxProductQty || Number.MAX_SAFE_INTEGER);
    return detailRows.filter(({ order, item }) => {
      const purchaseText = summaryText(order);
      const materialText = [item.materialCode, item.materialName, item.sourceSku].join(" ");
      const businessStatus = order.logisticsStatus === "已入库" ? "已入库" : order.logisticsStatus === "已完成" ? "已完成" : pushStatusOf(order) === "已下推" ? "已采购" : "等待采购";
      return (
        (!filters.purchaseKeyword || purchaseText.includes(filters.purchaseKeyword)) &&
        (!filters.applicant || order.applicant?.includes(filters.applicant)) &&
        (!filters.materialSku || materialText.includes(filters.materialSku)) &&
        inDateRange(order.createdAt, filters.createdFrom, filters.createdTo) &&
        (order.totalPurchaseQty ?? 0) >= minProductQty &&
        (order.totalPurchaseQty ?? 0) <= maxProductQty &&
        inDateRange(order.expectedArrivalDate, filters.arrivalFrom, filters.arrivalTo) &&
        (filters.status === "全部" || businessStatus === filters.status) &&
        (filters.regions.length === 0 || filters.regions.some((region) => order.regions?.includes(region))) &&
        (filters.productionFactory === "全部" || order.productionFactory === filters.productionFactory) &&
        (filters.isOverQuantity === "全部" || order.isOverQuantity === filters.isOverQuantity) &&
        inDateRange(order.latestWarehouseDate, filters.latestWarehouseFrom, filters.latestWarehouseTo) &&
        (!filters.purchaseSource || order.purchaseSource?.includes(filters.purchaseSource)) &&
        (filters.supplierType === "全部" || order.supplierType === filters.supplierType) &&
        inDateRange(order.purchaseDate, filters.purchaseFrom, filters.purchaseTo) &&
        (filters.printingStatus === "全部" || order.printingStatus === filters.printingStatus) &&
        (filters.cuttingStatus === "全部" || order.cuttingStatus === filters.cuttingStatus) &&
        inDateRange(order.cuttingArrivalDate, filters.cuttingArrivalFrom, filters.cuttingArrivalTo) &&
        (filters.productType === "全部" || order.productType === filters.productType) &&
        (filters.hasIdMaterialOrder === "全部" || order.hasIdMaterialOrder === filters.hasIdMaterialOrder) &&
        (filters.isKolSampleOrder === "全部" || order.isKolSampleOrder === filters.isKolSampleOrder)
      );
    });
  }, [detailRows, filters]);

  const stats = useMemo(() => {
    const orders = Array.from(new Map(visibleRows.map((row) => [row.order.analysisNo, row.order])).values());
    return {
      plannedProductQty: orders.reduce((sum, row) => sum + (row.totalPurchaseQty ?? 0), 0),
      arrivedProductQty: orders.reduce((sum, row) => sum + (row.arrivedProductQty ?? 0), 0),
      shippedProductQty: orders.reduce((sum, row) => sum + (row.shippedProductQty ?? 0), 0),
      waitingShipmentProductQty: orders.reduce((sum, row) => sum + (row.waitingShipmentProductQty ?? 0), 0),
    };
  }, [visibleRows]);

  const selectedDetailRows = useMemo(() => detailRows.filter((row) => selectedIds.includes(row.id)), [detailRows, selectedIds]);
  const selectedAnalysisNos = useMemo(() => Array.from(new Set(selectedDetailRows.map((row) => row.order.analysisNo))), [selectedDetailRows]);
  const pagedRows = useMemo(() => visibleRows.slice(0, Math.max(1, Number(filters.pageSize) || 10)), [visibleRows, filters.pageSize]);
  const groupedRows = useMemo(() => {
    const groups = new Map<string, { order: MaterialRequirementAnalysisOrder; details: MaterialDetailRow[] }>();
    pagedRows.forEach((row) => {
      const group = groups.get(row.order.analysisNo) ?? { order: row.order, details: [] };
      group.details.push(row);
      groups.set(row.order.analysisNo, group);
    });
    return Array.from(groups.values());
  }, [pagedRows]);

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 1800);
  };

  const updateFilter = <Key extends keyof FilterState>(key: Key, value: FilterState[Key]) => setFilters((current) => ({ ...current, [key]: value }));

  const resetFilters = () => {
    setFilters(emptyFilters);
    setSelectedIds([]);
  };

  const toggleSelected = (id: string) => {
    setSelectedIds((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  };

  const toggleVisibleSelected = () => {
    const visibleIds = pagedRows.map((row) => row.id);
    setSelectedIds((current) => (visibleIds.every((id) => current.includes(id)) ? current.filter((id) => !visibleIds.includes(id)) : Array.from(new Set([...current, ...visibleIds]))));
  };

  const toggleRegion = (region: string) => {
    setFilters((current) => ({
      ...current,
      regions: current.regions.includes(region) ? current.regions.filter((item) => item !== region) : [...current.regions, region],
    }));
  };

  const requireSelection = () => {
    if (selectedIds.length === 0) {
      showToast("请先选择面辅料需求明细");
      return false;
    }
    return true;
  };

  const confirmRows = (ids: string[]) => {
    setRows((current) => current.map((row) => (ids.includes(row.analysisNo) && row.status === "已分析" ? { ...row, status: "已确认", updatedAt: new Date().toLocaleString("zh-CN", { hour12: false }), operationLogs: [...(row.operationLogs ?? []), "确认分析"] } : row)));
    showToast(`已确认 ${ids.length} 张分析单`);
  };

  const openCreateIdPurchaseOrder = (targetRows: MaterialDetailRow[]) => {
    if (targetRows.length === 0) {
      showToast("请先选择面辅料");
      return;
    }
    const pushed = targetRows.find(({ item }) => item.isPushed === "是");
    if (pushed) {
      showToast(`${pushed.item.materialCode} 已下推，不允许重复创建`);
      return;
    }
    const zeroQty = targetRows.find(({ item }) => item.suggestedPurchaseQty <= 0);
    if (zeroQty) {
      showToast(`${zeroQty.item.materialCode} 建议采购数量为0，不允许创建`);
      return;
    }
    const missingSupplier = targetRows.find(({ item }) => !item.suggestedSupplier);
    if (missingSupplier) {
      showToast(`${missingSupplier.item.materialCode} 缺少供应商，请先设置供应商`);
      return;
    }
    setCreateLines(targetRows.map((row) => ({
      row,
      selected: true,
      actualPurchaseQty: row.item.suggestedPurchaseQty,
    })));
    setCreateRemark("");
  };

  const runBatchAction = (action: string) => {
    if (!requireSelection()) return;
    if (action === "批量确认分析") {
      confirmRows(selectedAnalysisNos);
      return;
    }
    if (action === "下推面辅料采购单" || action === "创建面辅料采购单") {
      openCreateIdPurchaseOrder(selectedDetailRows);
      return;
    }
    showToast(`${action}已触发，共 ${selectedIds.length} 条面辅料明细`);
  };

  const resetCreateLines = () => {
    setCreateLines((current) => current.map((line) => ({
      ...line,
      selected: true,
      actualPurchaseQty: line.row.item.suggestedPurchaseQty,
    })));
    setCreateRemark("");
  };

  const confirmCreateIdPurchaseOrder = () => {
    const activeLines = createLines.filter((line) => line.selected);
    if (activeLines.length === 0) {
      showToast("请至少选择一条面辅料");
      return;
    }
    const invalidQty = activeLines.find((line) => !Number.isFinite(line.actualPurchaseQty) || line.actualPurchaseQty <= 0);
    if (invalidQty) {
      showToast(`${invalidQty.row.item.materialCode} 实际采购数量必须大于0`);
      return;
    }
    const pushedAt = new Date().toLocaleString("zh-CN", { hour12: false });
    const maxOrderNo = idMaterialPurchaseOrders.reduce((max, order) => {
      const current = Number(order.idOrderNo.match(/(\d+)$/)?.[1] ?? 0);
      return Math.max(max, current);
    }, 0);
    const createdOrders: IdMaterialPurchaseOrder[] = activeLines.map((line, index) => ({
      idOrderNo: `ID-MP-2026-${String(maxOrderNo + index + 1).padStart(4, "0")}`,
      sourceAnalysisNo: line.row.order.analysisNo,
      sourceProductOrderNo: line.row.order.sourceProductOrderNo,
      materialCode: line.row.item.materialCode,
      materialCategory: line.row.item.category,
      materialName: line.row.item.materialName,
      materialImageUrl: line.row.item.materialImageUrl,
      plannedPurchaseQty: line.row.item.suggestedPurchaseQty,
      historicalMaterialStock: line.row.item.historicalMaterialStock ?? line.row.item.stockQty,
      idHistoricalMaterialStock: line.row.item.idHistoricalMaterialStock ?? 0,
      actualPurchaseQty: line.actualPurchaseQty,
      purchaseQty: line.actualPurchaseQty,
      unit: line.row.item.unit || "PCS",
      supplier: line.row.item.suggestedSupplier,
      targetWarehouse: line.row.item.targetWarehouse || line.row.order.targetWarehouse,
      remark: createRemark,
      orderDate: dateOnly(pushedAt),
      buyer: line.row.order.purchaseOwner || line.row.order.applicant || "采购员",
      status: "待确认",
      transportNode: "未发货",
    }));
    idMaterialPurchaseOrders.push(...createdOrders);

    const createdByAnalysis = new Map<string, Array<{ materialCode: string; order: IdMaterialPurchaseOrder }>>();
    activeLines.forEach((line, index) => {
      const list = createdByAnalysis.get(line.row.order.analysisNo) ?? [];
      list.push({ materialCode: line.row.item.materialCode, order: createdOrders[index] });
      createdByAnalysis.set(line.row.order.analysisNo, list);
    });

    setRows((current) => current.map((order) => {
      const created = createdByAnalysis.get(order.analysisNo);
      if (!created) return order;
      const codes = new Set(created.map((item) => item.materialCode));
      const nextDetails = order.detailItems.map((item) => codes.has(item.materialCode) ? { ...item, isPushed: "是" as const } : item);
      const allPushed = nextDetails.filter((item) => item.suggestedPurchaseQty > 0 && !item.excluded).every((item) => item.isPushed === "是");
      const records: MaterialRequirementPushRecord[] = created.map(({ order: createdOrder }) => ({
        idPurchaseNo: createdOrder.idOrderNo,
        supplier: createdOrder.supplier,
        category: createdOrder.materialCategory as MaterialCategory,
        targetWarehouse: createdOrder.targetWarehouse || "-",
        materialLineCount: 1,
        pushQty: createdOrder.purchaseQty,
        pushedAt,
        operator: createdOrder.buyer,
      }));
      return {
        ...order,
        status: allPushed ? "已下推" : order.status,
        pushStatus: allPushed ? "已下推" : "部分下推",
        hasIdMaterialOrder: "是",
        idPurchaseNos: [...(order.idPurchaseNos ?? []), ...records.map((record) => record.idPurchaseNo)],
        updatedAt: pushedAt,
        detailItems: nextDetails,
        pushRecords: [...(order.pushRecords ?? []), ...records],
        operationLogs: [...(order.operationLogs ?? []), `创建面辅料采购单：${records.map((record) => record.idPurchaseNo).join("、")}`],
      };
    }));
    setSelectedIds((current) => current.filter((id) => !activeLines.some((line) => line.row.id === id)));
    setCreateLines([]);
    setCreateRemark("");
    showToast(`已创建面辅料采购单：${createdOrders.map((order) => order.idOrderNo).join("、")}`);
  };

  const renderSuggestedQty = (value: number) => {
    if (value <= 0) return <span className="rounded bg-gray-100 px-2 py-0.5 text-xs text-gray-500">无需采购</span>;
    return <span className="font-semibold text-green-700">{qty(value)}</span>;
  };

  const runLegacyAction = (action: string, row: MaterialDetailRow) => {
    if (action === "查看详情") {
      setDetail(row.order);
      return;
    }
    if (action === "创建面辅料采购单") {
      openCreateIdPurchaseOrder([row]);
      return;
    }
    showToast(`${action}：${row.item.materialCode}`);
  };

  const legacyActions = [
    "查看详情", "快递信息", "取回", "生产驳回", "采购备注", "日志记录", "出货记录",
    "设置付款时间", "创建裁片单", "关联面辅料采购单", "创建面辅料采购单",
    "更换面辅料SKU", "复制采购单", "设置印花", "关联辅料",
  ];

  return (
    <div>
      <PageHeader
        title="面辅料需求分析"
        desc="按面辅料需求明细展示做货商品采购单的 BOM 拆解结果，可直接核对库存、采购中、建议采购数量并下推面辅料采购单。"
      />

      <SearchBar>
        <div className="grid grid-cols-1 gap-x-3 gap-y-2 md:grid-cols-3 xl:grid-cols-5">
          <Field label="采购单号">
            <div className="flex">
              <select className="h-8 w-24 rounded-l border border-r-0 px-2 text-xs"><option>采购单号</option><option>SKU</option><option>SPU</option></select>
              <input className="h-8 min-w-0 flex-1 rounded-r border px-2 text-sm" value={filters.purchaseKeyword} onChange={(event) => updateFilter("purchaseKeyword", event.target.value)} placeholder="采购单号 / SKU / SPU" />
            </div>
          </Field>
          <Field label="申请人"><input className="h-8 rounded border px-2 text-sm" value={filters.applicant} onChange={(event) => updateFilter("applicant", event.target.value)} /></Field>
          <Field label="面辅料SKU"><input className="h-8 rounded border px-2 text-sm" value={filters.materialSku} onChange={(event) => updateFilter("materialSku", event.target.value)} /></Field>
          <Field label="创建时间"><div className="flex gap-1"><input className="h-8 min-w-0 rounded border px-1 text-xs" type="date" value={filters.createdFrom} onChange={(event) => updateFilter("createdFrom", event.target.value)} /><input className="h-8 min-w-0 rounded border px-1 text-xs" type="date" value={filters.createdTo} onChange={(event) => updateFilter("createdTo", event.target.value)} /></div></Field>
          <Field label="商品数量"><div className="flex gap-1"><input className="h-8 min-w-0 rounded border px-2 text-sm" type="number" placeholder="最小数量" value={filters.minProductQty} onChange={(event) => updateFilter("minProductQty", event.target.value)} /><input className="h-8 min-w-0 rounded border px-2 text-sm" type="number" placeholder="最大数量" value={filters.maxProductQty} onChange={(event) => updateFilter("maxProductQty", event.target.value)} /></div></Field>
          <Field label="到货时间"><div className="flex gap-1"><input className="h-8 min-w-0 rounded border px-1 text-xs" type="date" value={filters.arrivalFrom} onChange={(event) => updateFilter("arrivalFrom", event.target.value)} /><input className="h-8 min-w-0 rounded border px-1 text-xs" type="date" value={filters.arrivalTo} onChange={(event) => updateFilter("arrivalTo", event.target.value)} /></div></Field>
          <Field label="状态"><select className="h-8 rounded border px-2 text-sm" value={filters.status} onChange={(event) => updateFilter("status", event.target.value)}>{statusOptions.map((item) => <option key={item}>{item}</option>)}</select></Field>
          <Field label="区域">
            <div className="flex h-8 items-center gap-3 rounded border px-2 text-xs">{["CN", "ID", "MY"].map((region) => <label key={region} className="inline-flex items-center gap-1"><input type="checkbox" checked={filters.regions.includes(region)} onChange={() => toggleRegion(region)} />{region}</label>)}</div>
          </Field>
          <Field label="做货厂"><select className="h-8 rounded border px-2 text-sm" value={filters.productionFactory} onChange={(event) => updateFilter("productionFactory", event.target.value)}>{factories.map((item) => <option key={item}>{item}</option>)}</select></Field>
          <Field label="是否超量"><select className="h-8 rounded border px-2 text-sm" value={filters.isOverQuantity} onChange={(event) => updateFilter("isOverQuantity", event.target.value)}>{yesNoOptions.map((item) => <option key={item}>{item}</option>)}</select></Field>
          <Field label="最晚到仓时间"><div className="flex gap-1"><input className="h-8 min-w-0 rounded border px-1 text-xs" type="date" value={filters.latestWarehouseFrom} onChange={(event) => updateFilter("latestWarehouseFrom", event.target.value)} /><input className="h-8 min-w-0 rounded border px-1 text-xs" type="date" value={filters.latestWarehouseTo} onChange={(event) => updateFilter("latestWarehouseTo", event.target.value)} /></div></Field>
          <Field label="采购来源"><input className="h-8 rounded border px-2 text-sm" value={filters.purchaseSource} onChange={(event) => updateFilter("purchaseSource", event.target.value)} /></Field>
          <Field label="供应商类型"><select className="h-8 rounded border px-2 text-sm" value={filters.supplierType} onChange={(event) => updateFilter("supplierType", event.target.value)}>{["全部", ...mockSupplierTypes].map((item) => <option key={item}>{item}</option>)}</select></Field>
          <Field label="采购时间"><div className="flex gap-1"><input className="h-8 min-w-0 rounded border px-1 text-xs" type="date" value={filters.purchaseFrom} onChange={(event) => updateFilter("purchaseFrom", event.target.value)} /><input className="h-8 min-w-0 rounded border px-1 text-xs" type="date" value={filters.purchaseTo} onChange={(event) => updateFilter("purchaseTo", event.target.value)} /></div></Field>
          <Field label="印花状态"><select className="h-8 rounded border px-2 text-sm" value={filters.printingStatus} onChange={(event) => updateFilter("printingStatus", event.target.value)}>{["全部", "待印花", "印花中", "已完成", "无需印花"].map((item) => <option key={item}>{item}</option>)}</select></Field>
          <Field label="裁片状态"><select className="h-8 rounded border px-2 text-sm" value={filters.cuttingStatus} onChange={(event) => updateFilter("cuttingStatus", event.target.value)}>{["全部", "待裁片", "已裁片", "已到货"].map((item) => <option key={item}>{item}</option>)}</select></Field>
          <Field label="裁片到货时间"><div className="flex gap-1"><input className="h-8 min-w-0 rounded border px-1 text-xs" type="date" value={filters.cuttingArrivalFrom} onChange={(event) => updateFilter("cuttingArrivalFrom", event.target.value)} /><input className="h-8 min-w-0 rounded border px-1 text-xs" type="date" value={filters.cuttingArrivalTo} onChange={(event) => updateFilter("cuttingArrivalTo", event.target.value)} /></div></Field>
          <Field label="商品类型"><select className="h-8 rounded border px-2 text-sm" value={filters.productType} onChange={(event) => updateFilter("productType", event.target.value)}>{["全部", ...mockProductTypes].map((item) => <option key={item}>{item}</option>)}</select></Field>
          <Field label="是否有面辅料采购单"><select className="h-8 rounded border px-2 text-sm" value={filters.hasIdMaterialOrder} onChange={(event) => updateFilter("hasIdMaterialOrder", event.target.value)}>{yesNoOptions.map((item) => <option key={item}>{item}</option>)}</select></Field>
          <Field label="是否KOL样品小单"><select className="h-8 rounded border px-2 text-sm" value={filters.isKolSampleOrder} onChange={(event) => updateFilter("isKolSampleOrder", event.target.value)}>{yesNoOptions.map((item) => <option key={item}>{item}</option>)}</select></Field>
          <Field label="每页条数"><select className="h-8 rounded border px-2 text-sm" value={filters.pageSize} onChange={(event) => updateFilter("pageSize", event.target.value)}>{["10", "20", "50", "100"].map((item) => <option key={item}>{item}</option>)}</select></Field>
          <div className="flex items-end gap-2">
            <button className="inline-flex h-8 items-center gap-1 rounded bg-brand px-4 text-sm text-white" onClick={() => showToast("已按当前条件查询")}><Search size={14} /> 查询</button>
            <button className="h-8 rounded border px-4 text-sm" onClick={resetFilters}>默认</button>
          </div>
        </div>
      </SearchBar>

      <section className="mb-2 flex flex-wrap items-center gap-2 border border-gray-200 bg-white px-3 py-2">
        <label className="mr-2 inline-flex items-center gap-1 text-xs text-gray-600">
          <input type="checkbox" checked={pagedRows.length > 0 && pagedRows.every((row) => selectedIds.includes(row.id))} onChange={toggleVisibleSelected} />
          全选当前页
        </label>
        <button className="h-8 rounded bg-brand px-3 text-sm text-white" onClick={() => runBatchAction("面辅料采购")}>面辅料采购</button>
        <button className="h-8 rounded bg-[#009688] px-3 text-sm text-white" onClick={() => runBatchAction("下推面辅料采购单")}>创建面辅料采购单</button>
        <button className="h-8 rounded bg-green-600 px-3 text-sm text-white" onClick={() => runBatchAction("运单排入库")}>运单排入库</button>
        <button className="h-8 rounded border border-blue-300 px-3 text-sm text-blue-700" onClick={() => runBatchAction("批量填写物流单号")}>批量填写物流单号</button>
        <button className="h-8 rounded border px-3 text-sm" onClick={() => runBatchAction("上传入库")}>上传入库</button>
        <button className="h-8 rounded border px-3 text-sm" onClick={() => runBatchAction("面辅料实际采购数量上传")}>面辅料实际采购数量上传</button>
        <span className="ml-auto text-xs text-gray-500">已选 {selectedIds.length} 条面辅料明细</span>
      </section>

      <section className="mb-2 flex flex-wrap items-center gap-x-8 gap-y-1 border border-gray-200 bg-white px-4 py-2 text-sm">
        {[
          ["计划采购商品数", qty(stats.plannedProductQty)],
          ["到货商品数", qty(stats.arrivedProductQty)],
          ["已出货商品数", qty(stats.shippedProductQty)],
          ["等待出货商品数", qty(stats.waitingShipmentProductQty)],
        ].map(([label, value]) => (
          <div key={label}><span className="text-gray-600">{label}：</span><span className="font-semibold text-gray-900">{value}</span></div>
        ))}
      </section>

      <div className="overflow-x-auto border border-gray-200 bg-white">
        <table className="min-w-[2380px] table-fixed text-left text-xs text-gray-800">
          <colgroup>
            <col className="w-10" />
            <col className="w-36" />
            <col className="w-72" />
            <col className="w-56" />
            <col className="w-56" />
            <col className="w-28" />
            <col className="w-40" />
            <col className="w-44" />
            <col className="w-40" />
            <col className="w-52" />
            <col className="w-44" />
            <col className="w-[310px]" />
          </colgroup>
          <thead className="bg-gray-50 text-gray-700">
            <tr>
              {["勾选框", "商品图片", "商品信息", "供应商信息", "采购类型", "状态", "时间", "库存流转", "物流信息", "备注", "采购备注", "操作"].map((title) => (
                <th key={title} className="border-b border-gray-200 px-2 py-2 font-medium">{title}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {groupedRows.map(({ order, details }) => (
              <Fragment key={order.analysisNo}>
                <tr className="h-10 border-y border-amber-100 bg-[#fff7e8]">
                  <td className="px-2 py-1.5" />
                  <td colSpan={11} className="px-2 py-1.5">
                    <div className="flex items-center gap-4 whitespace-nowrap">
                      <span>采购来源：<button className="font-medium text-brand" onClick={() => setDetail(order)}>{order.sourceProductOrderNo.replace(/\D/g, "") || order.sourceProductOrderNo}</button></span>
                      <ProductImage src={order.imageUrl} name={order.productName} size="h-8 w-8" />
                      <span>SPU：<button className="text-brand" onClick={() => setDetail(order)}>{order.spu}</button></span>
                      <span>状态：{order.logisticsStatus === "已入库" ? "已入库" : pushStatusOf(order) === "已下推" ? "已采购" : "采购中"}</span>
                      <button className="rounded-sm bg-[#009688] px-2 py-0.5 text-white" onClick={() => showToast(`生产单员：${order.purchaseOwner || order.applicant || "-"}`)}>生产单员</button>
                    </div>
                  </td>
                </tr>
                {details.map((row, detailIndex) => {
                  const productNo = `${row.order.sourceProductOrderNo.replace(/\D/g, "") || "300"}${detailIndex + 1}`;
                  const unit = row.item.unit || "PCS";
                  const status = row.item.isPushed === "是" ? "已采购" : "等待采购";
                  const purchaseQty = row.item.suggestedPurchaseQty;
                  const requiredQty = row.item.bomRequiredQty ?? row.item.bomDemandQty;
                  return (
                    <tr key={row.id} className="border-b border-gray-200 align-top hover:bg-gray-50">
                      <td className="px-2 py-2 text-center"><input type="checkbox" checked={selectedIds.includes(row.id)} onChange={() => toggleSelected(row.id)} /></td>
                      <td className="px-2 py-2">
                        <div className="flex flex-col items-center gap-1 text-center">
                          <div className="font-medium">{productNo}</div>
                          <ProductImage src={row.item.materialImageUrl} name={row.item.materialName} size="h-16 w-12" />
                          <div className="w-28 whitespace-normal break-all text-[11px]">{row.item.materialCode}：{row.item.materialName}</div>
                        </div>
                      </td>
                      <td className="px-2 py-2 leading-5">
                        <div><span className="rounded-sm bg-green-600 px-1.5 py-0.5 text-[11px] text-white">New</span> <span className="font-medium">{row.item.materialName}</span></div>
                        <div>SPU：{row.order.spu}</div>
                        <div>申请人：{row.order.applicant || row.order.creator || "-"}</div>
                        <div>选品人：{row.order.purchaseOwner || "-"}</div>
                        <div>成本价：{(Math.max(1, row.item.unitUsage ?? row.item.usage ?? 1) * 0.01).toFixed(3)}</div>
                        <div>重量：{(Math.max(1, row.item.unitUsage ?? 1) * 0.2).toFixed(3)}(kg)</div>
                        <div>仓库剩余库存：</div>
                        <div className="whitespace-normal break-all text-red-600">{row.item.materialCode}：{qty(row.item.stockQty - requiredQty)} / {unit}</div>
                        <div className="text-green-700">采购中数量 {qty(row.item.purchasingQty)}</div>
                        <div className="text-green-700">历史采购数量 {qty(row.order.totalPurchaseQty)}</div>
                        <div className="text-green-700">ID历史采购数量 {qty(row.order.shippedProductQty)}</div>
                      </td>
                      <td className="px-2 py-2 leading-5">
                        <div>供应商：{row.item.suggestedSupplier || <span className="text-red-600">未设置</span>}</div>
                        <div>地址类型：{row.order.productionArea || "未知"}</div>
                        <div>商品ID：{detailIndex + 1}</div>
                        <div className="text-green-700">是否转运：{row.order.productionArea === "国内" ? "需要转运" : "无需转运"}</div>
                        <button className="text-brand" onClick={() => showToast(`打开商品链接：${row.item.materialCode}`)}>商品链接</button>
                      </td>
                      <td className="px-2 py-2 leading-5">
                        <div>区域：{row.order.regions?.join("/") || "ID"}</div>
                        <div>{row.item.category === "面料" ? "面料区域" : "调料区域"}：{row.order.regions?.[0] || "ID"}</div>
                        <div className="my-1 inline-block rounded-sm border border-green-500 px-1.5 text-green-700">【{row.item.category === "面料" ? "面料采购" : "配件采购"}】</div>
                        <div>采购数量：{qty(purchaseQty)}</div>
                        {["设置采购员", "设置面料供应商", "设置裁片工厂", "设置印花厂"].map((action) => (
                          <button key={action} className="mr-1 mt-1 rounded-sm bg-[#16a085] px-1.5 py-0.5 text-[11px] leading-4 text-white" onClick={() => showToast(`${action}：${row.item.materialCode}`)}>{action}</button>
                        ))}
                      </td>
                      <td className="px-2 py-2 leading-5">
                        <div>{status}</div>
                        <span className="mt-1 inline-block rounded-sm bg-gray-800 px-1.5 py-0.5 text-[11px] text-white">【{row.item.usagePart ? "有裁片" : "无裁片"}】</span>
                      </td>
                      <td className="px-2 py-2 leading-5">
                        <div>创建：{dateOnly(row.order.createdAt)}</div>
                        <div>到货：{dateOnly(row.order.expectedArrivalDate) || ""}</div>
                        <div>发货：{row.order.logisticsNo ? dateOnly(row.order.purchaseDate) : ""}</div>
                        <div>签收：{row.order.logisticsStatus === "已入库" ? dateOnly(row.order.latestWarehouseDate) : ""}</div>
                      </td>
                      <td className="px-2 py-2 leading-5">
                        <div>计划采购：{qty(purchaseQty)} {unit}</div>
                        <div>生产需要数量：{qty(requiredQty)} {unit}</div>
                        <div className="text-red-600">到货：{qty(row.order.arrivedProductQty && row.item.isPushed === "是" ? Math.min(purchaseQty, row.order.arrivedProductQty) : 0)} {unit}</div>
                        <div className="text-red-600">出货：{qty(row.item.isPushed === "是" ? Math.min(purchaseQty, row.order.shippedProductQty ?? 0) : 0)} {unit}</div>
                      </td>
                      <td className="px-2 py-2 leading-5">
                        <div>方式：{row.order.logisticsNo ? "快递" : ""}</div>
                        <div>单号：{row.order.logisticsNo ? <button className="text-brand" onClick={() => showToast(`查看物流：${row.order.logisticsNo}`)}>{row.order.logisticsNo}</button> : ""}</div>
                        <div>发货：{row.order.logisticsStatus === "运输中" ? "已发货" : ""}</div>
                        <div>转运：{row.order.productionArea === "国内" ? "是" : "否"}</div>
                        {row.order.logisticsNo && <div className="text-gray-500">{row.order.logisticsStatus}</div>}
                      </td>
                      <td className="whitespace-normal px-2 py-2 leading-5">
                        {row.order.applicant || row.order.creator || "采购员"}在{row.order.createdAt || "-"}从采购单<br />
                        {row.order.sourceProductOrderNo.replace(/\D/g, "") || row.order.sourceProductOrderNo}批量生成
                      </td>
                      <td className="whitespace-normal px-2 py-2 leading-5">{row.order.remark || "-"}</td>
                      <td className="px-2 py-2">
                        <div className="flex w-[294px] flex-wrap content-start items-start gap-1">
                          {legacyActions.map((action) => (
                            <button key={action} className="whitespace-nowrap rounded-sm bg-[#009688] px-1.5 py-0.5 text-[11px] leading-[18px] text-white hover:bg-[#007f73]" onClick={() => runLegacyAction(action, row)}>{action}</button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </Fragment>
            ))}
            {groupedRows.length === 0 && <tr><td colSpan={12} className="p-8 text-center text-gray-400">暂无数据</td></tr>}
          </tbody>
        </table>
      </div>

      <DesignLogicCard
        sections={[
          { title: "页面结构", headers: ["顺序", "区域", "规则"], rows: [["1", "密集筛选区", "全部筛选字段多行常驻，不使用高级筛选折叠或抽屉"], ["2", "批量操作区", "面辅料采购、排入库、物流维护和上传操作独立展示"], ["3", "统计数量条", "展示计划采购、到货、已出货和等待出货商品数"], ["4", "老系统明细列表", "浅米色采购来源分组行在上，所属面辅料明细直接展开在下"]] },
          { title: "列表表头规则", headers: ["顺序", "表头", "展示内容"], rows: [["1-4", "勾选框、商品图片、商品信息、供应商信息", "字段在单元格内多行密集展示，不再拆分"], ["5-8", "采购类型、状态、时间、库存流转", "保留设置人员与工厂按钮、状态标签及数量单位"], ["9-11", "物流信息、备注、采购备注", "直接展示完整多行内容，不截断、不隐藏"], ["12", "操作", "全部操作使用青绿色小按钮，2-3个一行自动换行"]] },
          { title: "分组与明细规则", headers: ["区域", "内容", "展示方式"], rows: [["采购来源分组行", "采购来源、商品缩略图、SPU、状态、生产单员", "使用浅米色背景并横跨整张表"], ["商品信息", "标签、SPU、申请人、选品人、成本价、重量及库存采购历史", "红色突出库存，绿色突出采购数量"], ["供应商与采购", "供应商、地址类型、商品ID、转运、区域、类型、采购数量", "采购类型列内保留设置采购员与工厂按钮"], ["库存与物流", "计划采购、生产需要、到货、出货、方式、单号、发货、转运", "按老系统多行文字展示"]] },
          { title: "操作按钮规则", headers: ["项目", "规则", "结果"], rows: [["按钮范围", "查看、快递、取回、驳回、备注、日志、出货、付款、裁片、ID单等操作全部展示", "不隐藏到更多菜单"], ["按钮样式", "青绿色背景、白色文字、2px圆角、小字号", "保持老系统密集操作感"], ["排列方式", "操作列固定区域内横向2-3个一行并自动换行，间距4px", "不是纵向单按钮占一整行"], ["交互逻辑", "查看详情和创建ID单沿用原逻辑，其余Mock入口沿用提示交互", "不改变现有数据处理"]] },
          { title: "创建面辅料采购单", headers: ["场景", "规则", "结果"], rows: [["单条入口", "点击明细操作列中的创建面辅料采购单", "默认带入当前面辅料"], ["批量入口", "勾选一条或多条明细后点击顶部创建面辅料采购单", "带入当前勾选明细"], ["创建校验", "已下推、建议采购数量为0、缺少供应商均不允许创建", "给出对应物料的明确提示"], ["弹窗明细", "展示图片、SKU编码、计划采购、历史库存、ID历史库存和实际采购数量", "实际采购数量可调整，重置恢复计划采购数量"], ["确认生成", "只生成弹窗内最终勾选且实际采购数量大于0的明细", "写入面辅料采购单Mock并逐条回写下推状态"]] },
          { title: "计算与下推规则", headers: ["场景", "规则", "结果"], rows: [["BOM需求数量", "SKU采购数量 × 单件用量 × (1 + 损耗率)", "得到原始需求"], ["建议采购数量", "Math.max(0, BOM需求数量 - 库存数量 - 采购中数量)", "小于等于0显示无需采购"], ["实际采购数量", "弹窗默认等于建议采购数量，允许采购员手动修改", "生成ID采购单时使用实际采购数量"], ["重复下推", "已下推明细不允许重复创建", "未选中的同分析单明细不会被误标为已下推"]] },
        ]}
      />

      <DetailModal open={!!detail} title="面辅料需求分析详情" onClose={() => setDetail(null)}>
        {detail && (
          <div className="max-h-[75vh] space-y-4 overflow-y-auto pr-1 text-sm">
            <section className="rounded border border-gray-200 bg-white p-3">
              <h3 className="mb-3 font-semibold text-gray-900">来源商品采购单信息</h3>
              <div className="flex gap-4">
                <ProductImage src={detail.imageUrl} name={detail.productName} size="h-24 w-24" />
                <div className="grid flex-1 gap-2 md:grid-cols-3">
                  {[
                    ["来源商品采购单号", detail.sourceProductOrderNo],
                    ["SPU / 款号", detail.spu],
                    ["商品名称", detail.productName],
                    ["采购类型", detail.sourcePurchaseType ?? "做货"],
                    ["SKU数量", qty(detail.skuCount)],
                    ["采购总数量", qty(detail.totalPurchaseQty)],
                    ["做货供应商", detail.supplierName ?? "-"],
                    ["目标仓库", detail.targetWarehouse ?? "-"],
                    ["预计到货时间", detail.expectedArrivalDate ?? "-"],
                  ].map(([label, value]) => <div key={label}><span className="text-gray-500">{label}：</span>{value}</div>)}
                </div>
              </div>
            </section>

            <section className="rounded border border-gray-200 bg-white p-3">
              <h3 className="mb-3 font-semibold text-gray-900">BOM / 样板信息</h3>
              <div className="grid gap-2 md:grid-cols-3">
                {[
                  ["BOM编号", detail.bomNo],
                  ["BOM版本", detail.bomVersion ?? "-"],
                  ["BOM状态", detail.bomStatus ?? "-"],
                  ["使用时间", detail.bomSnapshotTime ?? detail.createdAt ?? "-"],
                  ["是否快照", detail.isBomSnapshot ?? "是"],
                  ["物料种类数", qty(detail.materialKinds)],
                ].map(([label, value]) => <div key={label} className="rounded bg-gray-50 px-3 py-2"><span className="text-gray-500">{label}：</span>{value}</div>)}
              </div>
            </section>

            <section>
              <h3 className="mb-2 font-semibold text-gray-900">SKU 采购明细</h3>
              <DataTable
                columns={[
                  { key: "sku", title: "SKU" },
                  { key: "color", title: "颜色" },
                  { key: "size", title: "尺码" },
                  { key: "purchaseQty", title: "采购数量", render: (row) => qty(row.purchaseQty) },
                  { key: "bomNo", title: "BOM编号" },
                  { key: "bomVersion", title: "BOM版本" },
                  { key: "bomStatus", title: "BOM状态", render: (row) => <StatusBadge status={row.bomStatus} /> },
                ]}
                rows={detail.skuItems ?? []}
              />
            </section>

            <section>
              <h3 className="mb-2 font-semibold text-gray-900">面辅料需求明细</h3>
              <DataTable
                columns={[
                  { key: "materialImage", title: "物料图片", render: (row) => <ProductImage src={row.materialImageUrl} name={row.materialName} size="h-10 w-10" /> },
                  { key: "materialCode", title: "物料编码" },
                  { key: "materialName", title: "物料名称" },
                  { key: "category", title: "物料分类", render: (row) => <StatusBadge status={row.category} /> },
                  { key: "usagePart", title: "使用部位", render: (row) => row.usagePart || "-" },
                  { key: "sourceSku", title: "来源SKU", render: (row) => <div className="min-w-[180px]">{row.sourceSku || "-"}</div> },
                  { key: "skuPurchaseQty", title: "SKU采购数量", render: (row) => qty(row.skuPurchaseQty) },
                  { key: "unitUsage", title: "单件用量", render: (row) => qty(row.unitUsage ?? row.usage) },
                  { key: "lossRate", title: "损耗率" },
                  { key: "bomDemandQty", title: "BOM需求数量", render: (row) => qty(row.bomRequiredQty ?? row.bomDemandQty) },
                  { key: "stockQty", title: "库存数量", render: (row) => qty(row.stockQty) },
                  { key: "purchasingQty", title: "采购中数量", render: (row) => qty(row.purchasingQty) },
                  { key: "suggestedPurchaseQty", title: "建议采购数量", render: (row) => renderSuggestedQty(row.suggestedPurchaseQty) },
                  { key: "unit", title: "单位", render: (row) => row.unit || "-" },
                  { key: "suggestedSupplier", title: "建议供应商", render: (row) => row.suggestedSupplier ? row.suggestedSupplier : <span className="text-red-600">缺供应商</span> },
                  { key: "targetWarehouse", title: "目标仓库", render: (row) => row.targetWarehouse || detail.targetWarehouse || "-" },
                  { key: "isPushed", title: "是否下推", render: (row) => row.isPushed ?? "否" },
                  { key: "exceptionFlag", title: "异常标记", render: (row) => row.exceptionFlag ? <span className="rounded bg-red-50 px-2 py-0.5 text-xs text-red-600">{row.exceptionFlag}</span> : "-" },
                  { key: "op", title: "操作", render: (row) => <div className="flex w-[120px] flex-col items-start gap-1.5 whitespace-nowrap text-xs"><button className="text-brand" onClick={() => showToast("设置供应商入口已预留")}>设置供应商</button><button className="text-brand" onClick={() => showToast(row.isPushed === "是" ? "已下推明细不允许排除" : "已标记排除下推")}>排除下推</button></div> },
                ]}
                rows={detail.detailItems}
              />
            </section>

            <section className="rounded border border-blue-100 bg-blue-50 p-3 text-sm text-blue-800">
              <h3 className="mb-2 font-semibold">需求计算说明</h3>
              <div>BOM需求数量 = SKU采购数量 × 单件用量 × (1 + 损耗率)</div>
              <div>建议采购数量 = BOM需求数量 - 库存数量 - 采购中数量；小于等于 0 时显示“无需采购”。</div>
            </section>

            <section>
              <h3 className="mb-2 font-semibold text-gray-900">下推记录</h3>
              <DataTable
                columns={[
                  { key: "idPurchaseNo", title: "面辅料采购单号" },
                  { key: "supplier", title: "供应商" },
                  { key: "category", title: "物料分类" },
                  { key: "targetWarehouse", title: "目标仓库" },
                  { key: "materialLineCount", title: "明细行数", render: (row) => qty(row.materialLineCount) },
                  { key: "pushQty", title: "下推数量", render: (row) => qty(row.pushQty) },
                  { key: "pushedAt", title: "下推时间" },
                  { key: "operator", title: "操作人" },
                ]}
                rows={detail.pushRecords ?? []}
              />
            </section>

            <section className="rounded border border-gray-200 bg-gray-50 p-3">
              <h3 className="mb-2 font-semibold text-gray-900">操作日志</h3>
              <div className="space-y-1 text-xs text-gray-600">
                {(detail.operationLogs ?? []).map((log, index) => <div key={`${log}-${index}`}>{index + 1}. {log}</div>)}
                {(detail.operationLogs ?? []).length === 0 && <div>暂无操作日志</div>}
              </div>
            </section>
          </div>
        )}
      </DetailModal>

      {createLines.length > 0 && (
        <div className="fixed inset-0 z-[65] flex items-center justify-center overflow-y-auto bg-black/25 p-3">
          <div className="max-h-[calc(100vh-24px)] w-full max-w-[1000px] overflow-auto rounded bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
              <div className="font-semibold text-gray-900">创建面辅料采购单</div>
              <button className="text-gray-500" onClick={() => setCreateLines([])}>x</button>
            </div>
            <div className="space-y-4 p-4 text-sm">
              <section className="border border-gray-200 bg-gray-50 px-3 py-2">
                <div className="grid gap-x-6 gap-y-2 md:grid-cols-2">
                  <div><span className="text-gray-500">采购单：</span>{Array.from(new Set(createLines.map((line) => line.row.order.sourceProductOrderNo))).join("、")}</div>
                  <div><span className="text-gray-500">分析单号：</span>{Array.from(new Set(createLines.map((line) => line.row.order.analysisNo))).join("、")}</div>
                  <div><span className="text-gray-500">供应商：</span>{Array.from(new Set(createLines.map((line) => line.row.item.suggestedSupplier))).join("、")}</div>
                  <div><span className="text-gray-500">目标仓库：</span>{Array.from(new Set(createLines.map((line) => line.row.item.targetWarehouse || line.row.order.targetWarehouse || "-"))).join("、")}</div>
                </div>
              </section>

              <section>
                <div className="mb-2 font-medium text-gray-900">SKU列表 / 面辅料列表</div>
                <div className="overflow-x-auto border border-gray-200">
                  <table className="min-w-full text-left text-xs">
                    <thead className="bg-gray-50 text-gray-700">
                      <tr>
                        {["勾选框", "图片", "SKU编码", "计划采购数量", "历史面辅料库存", "ID历史面辅料库存", "实际采购数量"].map((title) => (
                          <th key={title} className="border-b border-gray-200 px-3 py-2 font-medium">{title}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {createLines.map((line, index) => (
                        <tr key={line.row.id} className="border-b border-gray-100">
                          <td className="px-3 py-2">
                            <input
                              type="checkbox"
                              checked={line.selected}
                              onChange={(event) => setCreateLines((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, selected: event.target.checked } : item))}
                            />
                          </td>
                          <td className="px-3 py-2"><ProductImage src={line.row.item.materialImageUrl} name={line.row.item.materialName} size="h-12 w-12" /></td>
                          <td className="px-3 py-2">
                            <div className="min-w-[180px] font-medium text-brand">{line.row.item.materialCode}</div>
                            <div className="text-gray-500">{line.row.item.materialName}</div>
                          </td>
                          <td className="px-3 py-2">{qty(line.row.item.suggestedPurchaseQty)} {line.row.item.unit || "PCS"}</td>
                          <td className="px-3 py-2">{qty(line.row.item.historicalMaterialStock ?? line.row.item.stockQty)} {line.row.item.unit || "PCS"}</td>
                          <td className="px-3 py-2">{qty(line.row.item.idHistoricalMaterialStock ?? 0)} {line.row.item.unit || "PCS"}</td>
                          <td className="px-3 py-2">
                            <input
                              className="h-8 w-32 rounded border px-2 text-right text-sm outline-none focus:border-brand"
                              type="number"
                              min="0"
                              step="0.01"
                              disabled={!line.selected}
                              value={line.actualPurchaseQty}
                              onChange={(event) => setCreateLines((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, actualPurchaseQty: Number(event.target.value) } : item))}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              <label className="grid gap-1 text-sm text-gray-700">
                备注
                <textarea className="min-h-20 rounded border border-gray-200 px-3 py-2 outline-none focus:border-brand" value={createRemark} onChange={(event) => setCreateRemark(event.target.value)} placeholder="填写本次ID面辅料采购备注" />
              </label>

              <div className="flex justify-end gap-2 border-t border-gray-200 pt-3">
                <button className="h-8 rounded border px-4 text-sm" onClick={resetCreateLines}>重置</button>
                <button className="inline-flex h-8 items-center gap-1 rounded bg-[#009688] px-4 text-sm text-white" onClick={confirmCreateIdPurchaseOrder}><PackageCheck size={14} /> 确定</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <Toast msg={toast} />
    </div>
  );
}
