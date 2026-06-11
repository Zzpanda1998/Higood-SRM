import { useMemo, useState } from "react";
import { Download, MoreHorizontal, PackageCheck, Plus, RotateCcw, Search, UserRound, X } from "lucide-react";
import DataTable from "../../components/common/DataTable";
import DesignLogicCard from "../../components/common/DesignLogicCard";
import DetailModal from "../../components/common/DetailModal";
import FormModal from "../../components/common/FormModal";
import PageHeader from "../../components/common/PageHeader";
import SearchBar from "../../components/common/SearchBar";
import StatusBadge from "../../components/common/StatusBadge";
import Toast from "../../components/common/Toast";
import { materialRequirementAnalysis, type MaterialRequirementAnalysisOrder } from "../../mock/materialRequirementAnalysis";
import {
  productCatalogSpus,
  productPurchaseOrders,
  type ProductCatalogSpu,
  type ProductPurchaseOrder,
  type ProductPurchaseStatus,
  type ProductPurchaseSku,
  type ProductPurchaseType,
} from "../../mock/productPurchaseOrders";

type FormState = {
  purchaseType: ProductPurchaseType;
  purchaser: string;
  targetWarehouse: string;
  expectedArrivalDate: string;
  isUrgent: "是" | "否";
  isFirstOrder: "是" | "否";
  productionArea: "国内" | "印尼" | "其他";
  purchaseRemark: string;
  spuSearch: string;
  selectedSpu?: ProductCatalogSpu;
  supplierName: string;
  skuDrafts: Record<string, { selected: boolean; actualPurchasePrice: string; actualPurchaseQty: string; remark: string }>;
};

type ListFilters = {
  keyword: string;
  purchaseType: "全部" | ProductPurchaseType;
  status: "全部" | ProductPurchaseStatus;
  supplierName: "全部" | string;
  purchaser: "全部" | string;
  createdFrom: string;
  createdTo: string;
  arrivalFrom: string;
  arrivalTo: string;
  shippedFrom: string;
  shippedTo: string;
  auditFrom: string;
  auditTo: string;
  latestWarehouseFrom: string;
  latestWarehouseTo: string;
  minQty: string;
  maxQty: string;
  color: string;
  region: "全部" | "国内" | "印尼" | "其他";
  productionArea: "全部" | "国内" | "印尼" | "其他";
  isFirstOrder: "全部" | "是" | "否";
  isUrgent: "全部" | "是" | "否";
  isOverQty: "全部" | "是" | "否";
  hasLogistics: "全部" | "是" | "否";
  hasTransferRecord: "全部" | "是" | "否";
  isCombinedOrder: "全部" | "是" | "否";
  materialGenerated: "全部" | "是" | "否";
  supplierType: "全部" | "做货供应商" | "成衣供应商" | "样衣供应商";
  afterSaleStatus: "全部" | "正常" | "售后中" | "已关闭";
};

const emptyForm: FormState = {
  purchaseType: "做货",
  purchaser: "王采购",
  targetWarehouse: "印尼雅加达面辅料仓",
  expectedArrivalDate: "",
  isUrgent: "否",
  isFirstOrder: "否",
  productionArea: "国内",
  purchaseRemark: "",
  spuSearch: "",
  supplierName: "",
  skuDrafts: {},
};

const emptyListFilters: ListFilters = {
  keyword: "",
  purchaseType: "全部",
  status: "全部",
  supplierName: "全部",
  purchaser: "全部",
  createdFrom: "",
  createdTo: "",
  arrivalFrom: "",
  arrivalTo: "",
  shippedFrom: "",
  shippedTo: "",
  auditFrom: "",
  auditTo: "",
  latestWarehouseFrom: "",
  latestWarehouseTo: "",
  minQty: "",
  maxQty: "",
  color: "",
  region: "全部",
  productionArea: "全部",
  isFirstOrder: "全部",
  isUrgent: "全部",
  isOverQty: "全部",
  hasLogistics: "全部",
  hasTransferRecord: "全部",
  isCombinedOrder: "全部",
  materialGenerated: "全部",
  supplierType: "全部",
  afterSaleStatus: "全部",
};

const purchasers = ["王采购", "陈采购", "李采购", "赵采购"];
const warehouses = ["印尼雅加达面辅料仓", "印尼万隆加工仓", "印尼泗水成衣仓", "中国广州中转仓", "中国深圳集货仓"];
const suppliers = ["佛山成衣加工厂", "绍兴锦达纺织有限公司", "广州华盛面料有限公司", "中山综合服饰供应链有限公司", "杭州样衣开发中心"];
const purchaseStatuses: ProductPurchaseStatus[] = ["草稿", "待采购", "待确认", "已确认", "已发货", "已到货", "已入库", "已完成", "已关闭"];

const money = (value: number) => `¥${value.toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const qty = (value: number) => value.toLocaleString("zh-CN");
const dateOnly = (value?: string) => value?.slice(0, 10) ?? "";
const inDateRange = (value: string | undefined, from: string, to: string) => {
  const current = dateOnly(value);
  if (from && current < from) return false;
  if (to && current > to) return false;
  return true;
};
const matchBoolFilter = (value: "是" | "否" | undefined, filter: "全部" | "是" | "否") => filter === "全部" || value === filter;

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

function buildDrafts(spu: ProductCatalogSpu, purchaseType: ProductPurchaseType) {
  return Object.fromEntries(
    spu.skuItems.map((sku) => [
      sku.sku,
      {
        selected: true,
        actualPurchasePrice: String(sku.actualPurchasePrice),
        actualPurchaseQty: String(purchaseType === "样衣" ? Math.min(sku.suggestedPurchaseQty, 10) : sku.suggestedPurchaseQty),
        remark: sku.remark ?? "",
      },
    ]),
  );
}

function skuNeedBom(purchaseType: ProductPurchaseType) {
  return purchaseType === "做货" ? "是" : "否";
}

function orderTotal(items: ProductPurchaseSku[]) {
  return items.reduce((sum, sku) => sum + sku.actualPurchaseQty * sku.actualPurchasePrice, 0);
}

type MaterialTemplate = {
  materialCode: string;
  materialName: string;
  category: "面料" | "辅料" | "包材" | "耗材" | "纱线";
  usagePart: string;
  unitUsage: number;
  lossRate: number;
  unit: string;
  stockQty: number;
  purchasingQty: number;
  suggestedSupplier: string;
};

type MaterialAnalysisLine = MaterialTemplate & {
  sourceSkus: string[];
  skuPurchaseQty: number;
  bomRequiredQty: number;
  suggestedPurchaseQty: number;
  targetWarehouse: string;
  isPushed: "是" | "否";
};

type MaterialAnalysisPreview = {
  analysisNo: string;
  skuTotal: number;
  matchedSkuCount: number;
  unmatchedSkuCount: number;
  totalPurchaseQty: number;
  materialTypeCount: number;
  bomRequiredTotalQty: number;
  stockTotalQty: number;
  purchasingTotalQty: number;
  suggestedPurchaseTotalQty: number;
  bomVersion: string;
  lines: MaterialAnalysisLine[];
};

const materialBomTemplates: MaterialTemplate[] = [
  { materialCode: "FAB-COTTON-180", materialName: "180g纯棉针织布", category: "面料", usagePart: "大身", unitUsage: 1.35, lossRate: 0.04, unit: "米", stockQty: 1200, purchasingQty: 600, suggestedSupplier: "广州华盛面料有限公司" },
  { materialCode: "ACC-RIB-001", materialName: "罗纹领口辅料", category: "辅料", usagePart: "领口", unitUsage: 0.18, lossRate: 0.03, unit: "米", stockQty: 360, purchasingQty: 120, suggestedSupplier: "东莞宏远辅料有限公司" },
  { materialCode: "ACC-LABEL-001", materialName: "主唛/洗水唛", category: "辅料", usagePart: "唛头", unitUsage: 1, lossRate: 0.02, unit: "个", stockQty: 2600, purchasingQty: 800, suggestedSupplier: "东莞宏远辅料有限公司" },
  { materialCode: "PKG-CARTON-001", materialName: "五层外箱", category: "包材", usagePart: "包装", unitUsage: 0.02, lossRate: 0.01, unit: "个", stockQty: 80, purchasingQty: 40, suggestedSupplier: "佛山顺联包装材料厂" },
  { materialCode: "CON-THREAD-001", materialName: "40S缝纫线", category: "耗材", usagePart: "缝制", unitUsage: 0.06, lossRate: 0.05, unit: "卷", stockQty: 90, purchasingQty: 30, suggestedSupplier: "绍兴锦达纺织有限公司" },
];

function buildMaterialAnalysisPreview(order: ProductPurchaseOrder, sequence: number): MaterialAnalysisPreview {
  const analysisNo = `MRA-2026-${String(sequence).padStart(4, "0")}`;
  const totalPurchaseQty = order.skuItems.reduce((sum, sku) => sum + sku.actualPurchaseQty, 0);
  const matchedSkuCount = order.skuItems.filter((sku) => sku.bomStatus === "已匹配").length;
  const grouped = new Map<string, MaterialAnalysisLine>();

  order.skuItems.forEach((sku) => {
    materialBomTemplates.forEach((template) => {
      const key = [template.materialCode, template.unit, order.targetWarehouse, template.suggestedSupplier].join("|");
      const existing = grouped.get(key);
      const bomRequiredQty = Number((sku.actualPurchaseQty * template.unitUsage * (1 + template.lossRate)).toFixed(2));
      if (existing) {
        existing.sourceSkus = Array.from(new Set([...existing.sourceSkus, sku.sku]));
        existing.skuPurchaseQty += sku.actualPurchaseQty;
        existing.bomRequiredQty = Number((existing.bomRequiredQty + bomRequiredQty).toFixed(2));
        existing.suggestedPurchaseQty = Math.max(Number((existing.bomRequiredQty - existing.stockQty - existing.purchasingQty).toFixed(2)), 0);
        return;
      }
      grouped.set(key, {
        ...template,
        sourceSkus: [sku.sku],
        skuPurchaseQty: sku.actualPurchaseQty,
        bomRequiredQty,
        suggestedPurchaseQty: Math.max(Number((bomRequiredQty - template.stockQty - template.purchasingQty).toFixed(2)), 0),
        targetWarehouse: order.targetWarehouse,
        isPushed: "否",
      });
    });
  });

  const lines = Array.from(grouped.values());
  return {
    analysisNo,
    skuTotal: order.skuItems.length,
    matchedSkuCount,
    unmatchedSkuCount: order.skuItems.length - matchedSkuCount,
    totalPurchaseQty,
    materialTypeCount: lines.length,
    bomRequiredTotalQty: Number(lines.reduce((sum, line) => sum + line.bomRequiredQty, 0).toFixed(2)),
    stockTotalQty: Number(lines.reduce((sum, line) => sum + line.stockQty, 0).toFixed(2)),
    purchasingTotalQty: Number(lines.reduce((sum, line) => sum + line.purchasingQty, 0).toFixed(2)),
    suggestedPurchaseTotalQty: Number(lines.reduce((sum, line) => sum + line.suggestedPurchaseQty, 0).toFixed(2)),
    bomVersion: Array.from(new Set(order.skuItems.map((sku) => sku.bomVersion).filter(Boolean))).join(" / ") || "-",
    lines,
  };
}

function materialActionLabel(order: ProductPurchaseOrder) {
  return order.materialStatus === "未生成" ? "生成面辅料需求分析" : "查看面辅料需求";
}

export function ProductPurchaseOrderView({ type }: { type?: ProductPurchaseType }) {
  const [rows, setRows] = useState<ProductPurchaseOrder[]>(productPurchaseOrders);
  const [analysisRows, setAnalysisRows] = useState(materialRequirementAnalysis);
  const [filters, setFilters] = useState<ListFilters>({ ...emptyListFilters, purchaseType: type ?? "全部" });
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [moreOpen, setMoreOpen] = useState(false);
  const [detail, setDetail] = useState<ProductPurchaseOrder | null>(null);
  const [editing, setEditing] = useState<ProductPurchaseOrder | "new" | null>(null);
  const [generationOrder, setGenerationOrder] = useState<ProductPurchaseOrder | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [spuOpen, setSpuOpen] = useState(false);
  const [toast, setToast] = useState("");

  const supplierOptions = useMemo(() => ["全部", ...Array.from(new Set(rows.map((row) => row.supplierName)))], [rows]);
  const purchaserOptions = useMemo(() => ["全部", ...Array.from(new Set(rows.map((row) => row.purchaser)))], [rows]);

  const visibleRows = useMemo(() => {
    return rows.filter((row) => {
      const matchType = !type || row.purchaseType === type;
      const text = [row.orderNo, row.purchaseType, row.spu, row.productName, row.supplierName, row.purchaser, ...row.skuItems.map((sku) => `${sku.sku} ${sku.color} ${sku.size}`)].join(" ");
      const minQty = Number(filters.minQty || 0);
      const maxQty = Number(filters.maxQty || Number.MAX_SAFE_INTEGER);
      const materialGenerated = row.materialStatus === "已生成" || row.materialStatus === "已下推" ? "是" : "否";
      return (
        matchType &&
        (!filters.keyword || text.includes(filters.keyword)) &&
        (filters.purchaseType === "全部" || row.purchaseType === filters.purchaseType) &&
        (filters.status === "全部" || row.status === filters.status) &&
        (filters.supplierName === "全部" || row.supplierName === filters.supplierName) &&
        (filters.purchaser === "全部" || row.purchaser === filters.purchaser) &&
        inDateRange(row.createdAt, filters.createdFrom, filters.createdTo) &&
        inDateRange(row.expectedArrivalDate, filters.arrivalFrom, filters.arrivalTo) &&
        inDateRange(row.shippedAt, filters.shippedFrom, filters.shippedTo) &&
        inDateRange(row.auditTime, filters.auditFrom, filters.auditTo) &&
        inDateRange(row.latestWarehouseTime, filters.latestWarehouseFrom, filters.latestWarehouseTo) &&
        row.totalPurchaseQty >= minQty &&
        row.totalPurchaseQty <= maxQty &&
        (!filters.color || row.skuItems.some((sku) => sku.color.includes(filters.color))) &&
        (filters.region === "全部" || row.region === filters.region) &&
        (filters.productionArea === "全部" || row.productionArea === filters.productionArea) &&
        matchBoolFilter(row.isFirstOrder, filters.isFirstOrder) &&
        matchBoolFilter(row.isUrgent, filters.isUrgent) &&
        matchBoolFilter(row.isOverQty, filters.isOverQty) &&
        matchBoolFilter(row.hasLogistics, filters.hasLogistics) &&
        matchBoolFilter(row.hasTransferRecord, filters.hasTransferRecord) &&
        matchBoolFilter(row.isCombinedOrder, filters.isCombinedOrder) &&
        matchBoolFilter(materialGenerated, filters.materialGenerated) &&
        (filters.supplierType === "全部" || row.supplierType === filters.supplierType) &&
        (filters.afterSaleStatus === "全部" || row.afterSaleStatus === filters.afterSaleStatus)
      );
    });
  }, [filters, rows, type]);

  const filteredSpus = useMemo(() => {
    const kw = form.spuSearch.trim().toLowerCase();
    if (!kw) return productCatalogSpus;
    return productCatalogSpus.filter((spu) => [spu.spu, spu.productName, ...spu.skuItems.map((sku) => sku.sku)].join(" ").toLowerCase().includes(kw));
  }, [form.spuSearch]);

  const selectedSkuItems = useMemo(() => {
    if (!form.selectedSpu) return [];
    return form.selectedSpu.skuItems
      .filter((sku) => form.skuDrafts[sku.sku]?.selected)
      .map((sku) => ({
        ...sku,
        needBom: form.purchaseType === "做货",
        bomNo: form.purchaseType === "做货" ? sku.bomNo ?? `BOM-${form.selectedSpu?.spu}-${sku.sku.split("-").slice(-2).join("-")}` : "",
        bomVersion: form.purchaseType === "做货" ? sku.bomVersion ?? "V1.0" : "",
        bomStatus: form.purchaseType === "做货" ? sku.bomStatus ?? "已匹配" : "未匹配",
        actualPurchasePrice: Number(form.skuDrafts[sku.sku]?.actualPurchasePrice || 0),
        actualPurchaseQty: Number(form.skuDrafts[sku.sku]?.actualPurchaseQty || 0),
        remark: form.skuDrafts[sku.sku]?.remark,
      }));
  }, [form]);

  const stats = useMemo(() => {
    const plannedQty = visibleRows.reduce((sum, row) => sum + row.totalPurchaseQty, 0);
    const amount = visibleRows.reduce((sum, row) => sum + row.totalAmount, 0);
    const arrivedQty = visibleRows.reduce((sum, row) => sum + row.stockFlow.arrivedQty, 0);
    const outboundQty = visibleRows.reduce((sum, row) => sum + row.stockFlow.outboundQty, 0);
    const waitingOutboundQty = visibleRows.reduce((sum, row) => sum + row.stockFlow.waitingOutboundQty, 0);
    return { plannedQty, amount, arrivedQty, outboundQty, waitingOutboundQty };
  }, [visibleRows]);

  const generationPreview = useMemo(() => {
    if (!generationOrder) return null;
    return buildMaterialAnalysisPreview(generationOrder, analysisRows.length + 1);
  }, [analysisRows.length, generationOrder]);

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 1800);
  };

  const validateMaterialGeneration = (order: ProductPurchaseOrder) => {
    if (order.purchaseType !== "做货") return "仅做货采购单可生成面辅料需求分析";
    if (order.materialStatus !== "未生成") return "当前采购单已生成面辅料需求分析";
    if (order.status === "草稿") return "请先保存并提交商品采购单";
    if (order.status === "已关闭" || String(order.status) === "已取消") return "已关闭或已取消采购单不允许生成面辅料需求分析";
    if (order.skuItems.length === 0) return "当前商品采购单没有 SKU 明细";
    if (order.skuItems.some((sku) => sku.actualPurchaseQty <= 0)) return "SKU采购数量必须大于0";
    if (order.skuItems.some((sku) => sku.needBom && sku.bomStatus !== "已匹配")) return "存在 SKU 未匹配 BOM，请先维护 BOM";
    return "";
  };

  const openMaterialAction = (order: ProductPurchaseOrder) => {
    if (order.purchaseType !== "做货") {
      showToast("仅做货采购单可生成面辅料需求分析");
      return;
    }
    if (order.materialStatus === "已生成" || order.materialStatus === "已下推") {
      showToast(`打开面辅料需求分析单：${order.relatedMaterialAnalysisNo || "已生成记录"}`);
      return;
    }
    const error = validateMaterialGeneration(order);
    if (error) {
      showToast(error);
      return;
    }
    if (order.status === "已发货") {
      showToast("采购单已发货，仍允许生成，请确认面辅料缺口");
    }
    setGenerationOrder(order);
  };

  const confirmGenerateMaterialAnalysis = () => {
    if (!generationOrder || !generationPreview) return;
    const now = new Date().toLocaleString("zh-CN", { hour12: false });
    const newAnalysis: MaterialRequirementAnalysisOrder = {
      analysisNo: generationPreview.analysisNo,
      sourceProductOrderNo: generationOrder.orderNo,
      sourcePurchaseType: "做货",
      spu: generationOrder.spu,
      productName: generationOrder.productName,
      skuCount: generationOrder.skuCount,
      totalPurchaseQty: generationPreview.totalPurchaseQty,
      bomNo: generationOrder.skuItems[0]?.bomNo ?? "-",
      bomVersion: generationPreview.bomVersion,
      materialKinds: generationPreview.materialTypeCount,
      bomDemandQty: generationPreview.bomRequiredTotalQty,
      stockQty: generationPreview.stockTotalQty,
      purchasingQty: generationPreview.purchasingTotalQty,
      suggestedPurchaseQty: generationPreview.suggestedPurchaseTotalQty,
      status: "已分析",
      creator: generationOrder.purchaser,
      createdAt: now,
      detailItems: generationPreview.lines.map((line) => ({
        materialCode: line.materialCode,
        materialName: line.materialName,
        category: line.category,
        usagePart: line.usagePart,
        sourceSku: line.sourceSkus.join("、"),
        skuPurchaseQty: line.skuPurchaseQty,
        usage: line.unitUsage,
        unitUsage: line.unitUsage,
        lossRate: `${Math.round(line.lossRate * 100)}%`,
        bomDemandQty: line.bomRequiredQty,
        bomRequiredQty: line.bomRequiredQty,
        stockQty: line.stockQty,
        purchasingQty: line.purchasingQty,
        suggestedPurchaseQty: line.suggestedPurchaseQty,
        unit: line.unit,
        suggestedSupplier: line.suggestedSupplier,
        targetWarehouse: line.targetWarehouse,
        isPushed: line.isPushed,
      })),
    };
    const updatedOrder: ProductPurchaseOrder = {
      ...generationOrder,
      materialStatus: "已生成",
      relatedMaterialAnalysisNo: generationPreview.analysisNo,
      materialGeneratedAt: now,
      updatedAt: now,
      operationLogs: [...(generationOrder.operationLogs ?? []), `生成面辅料需求分析：${generationPreview.analysisNo}`],
    };
    setAnalysisRows((current) => [newAnalysis, ...current]);
    setRows((current) => current.map((row) => (row.id === generationOrder.id ? updatedOrder : row)));
    if (detail?.id === generationOrder.id) setDetail(updatedOrder);
    setGenerationOrder(null);
    showToast(`已生成面辅料需求分析单：${generationPreview.analysisNo}`);
  };

  const updateForm = <Key extends keyof FormState>(key: Key, value: FormState[Key]) => setForm((current) => ({ ...current, [key]: value }));
  const updateFilter = <Key extends keyof ListFilters>(key: Key, value: ListFilters[Key]) => setFilters((current) => ({ ...current, [key]: value }));

  const resetFilters = () => {
    setFilters({ ...emptyListFilters, purchaseType: type ?? "全部" });
    setSelectedIds([]);
  };

  const toggleSelected = (id: string) => {
    setSelectedIds((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  };

  const toggleVisibleSelected = () => {
    const visibleIds = visibleRows.map((row) => row.id);
    setSelectedIds((current) => (visibleIds.every((id) => current.includes(id)) ? current.filter((id) => !visibleIds.includes(id)) : Array.from(new Set([...current, ...visibleIds]))));
  };

  const runBatchAction = (action: string, requiresSelection = true) => {
    if (requiresSelection && selectedIds.length === 0) {
      showToast("请先选择商品采购单");
      return;
    }
    setMoreOpen(false);
    showToast(`${action}已触发${requiresSelection ? `，共 ${selectedIds.length} 条` : ""}`);
  };

  const chooseSpu = (spu: ProductCatalogSpu) => {
    setForm((current) => ({
      ...current,
      selectedSpu: spu,
      spuSearch: `${spu.spu}｜${spu.productName}`,
      supplierName: spu.defaultSupplier,
      skuDrafts: buildDrafts(spu, current.purchaseType),
    }));
    setSpuOpen(false);
  };

  const changePurchaseType = (purchaseType: ProductPurchaseType) => {
    setForm((current) => ({
      ...current,
      purchaseType,
      skuDrafts: current.selectedSpu ? buildDrafts(current.selectedSpu, purchaseType) : {},
    }));
  };

  const clearSpu = () => {
    setForm((current) => ({ ...current, selectedSpu: undefined, spuSearch: "", supplierName: "", skuDrafts: {} }));
  };

  const openNew = () => {
    setEditing("new");
    setForm({ ...emptyForm, purchaseType: type ?? "做货" });
    setSpuOpen(false);
  };

  const openEdit = (order: ProductPurchaseOrder) => {
    const catalog = productCatalogSpus.find((spu) => spu.spu === order.spu);
    const skuDrafts = Object.fromEntries(
      (catalog?.skuItems ?? order.skuItems).map((sku) => {
        const current = order.skuItems.find((item) => item.sku === sku.sku);
        return [
          sku.sku,
          {
            selected: Boolean(current),
            actualPurchasePrice: String(current?.actualPurchasePrice ?? sku.actualPurchasePrice),
            actualPurchaseQty: String(current?.actualPurchaseQty ?? sku.suggestedPurchaseQty),
            remark: current?.remark ?? "",
          },
        ];
      }),
    );
    setEditing(order);
    setForm({
      purchaseType: order.purchaseType,
      purchaser: order.purchaser,
      targetWarehouse: order.targetWarehouse,
      expectedArrivalDate: order.expectedArrivalDate,
      isUrgent: order.isUrgent,
      isFirstOrder: order.isFirstOrder,
      productionArea: order.productionArea ?? "国内",
      purchaseRemark: order.purchaseRemark ?? "",
      spuSearch: `${order.spu}｜${order.productName}`,
      selectedSpu: catalog,
      supplierName: order.supplierName,
      skuDrafts,
    });
  };

  const toggleSku = (sku: string) => {
    setForm((current) => ({
      ...current,
      skuDrafts: {
        ...current.skuDrafts,
        [sku]: { ...current.skuDrafts[sku], selected: !current.skuDrafts[sku]?.selected },
      },
    }));
  };

  const updateSku = (sku: string, key: "actualPurchasePrice" | "actualPurchaseQty" | "remark", value: string) => {
    setForm((current) => ({
      ...current,
      skuDrafts: {
        ...current.skuDrafts,
        [sku]: { ...current.skuDrafts[sku], [key]: value },
      },
    }));
  };

  const saveOrder = (status: ProductPurchaseStatus) => {
    if (!editing) return;
    if (!form.purchaseType || !form.purchaser || !form.targetWarehouse || !form.expectedArrivalDate || !form.selectedSpu || !form.supplierName) {
      showToast("请填写采购类型、采购专员、目标仓库、预计到货时间、SPU和供应商");
      return;
    }
    if (form.purchaseType === "做货" && !form.productionArea) {
      showToast("做货采购需要选择做货区域");
      return;
    }
    if (selectedSkuItems.length === 0) {
      showToast("请至少勾选一个SKU并填写实际采购数量");
      return;
    }
    if (selectedSkuItems.some((sku) => sku.actualPurchaseQty <= 0 || sku.actualPurchasePrice < 0)) {
      showToast("SKU实际采购数量必须大于0，实际采购价不能小于0");
      return;
    }

    const totalPurchaseQty = selectedSkuItems.reduce((sum, sku) => sum + sku.actualPurchaseQty, 0);
    const totalAmount = orderTotal(selectedSkuItems);
    const existingOrder = editing === "new" ? null : editing;
    const newOrderNo = `GP-2026-${String(rows.length + 1).padStart(4, "0")}`;
    const arrivedQty = existingOrder?.stockFlow.arrivedQty ?? 0;
    const outboundQty = existingOrder?.stockFlow.outboundQty ?? 0;
    const inboundQty = existingOrder?.stockFlow.inboundQty ?? 0;
    const base: ProductPurchaseOrder = {
      id: editing === "new" ? `ppo-${Date.now()}` : existingOrder?.id ?? `ppo-${Date.now()}`,
      orderNo: editing === "new" ? newOrderNo : existingOrder?.orderNo ?? newOrderNo,
      purchaseOrderNo: editing === "new" ? newOrderNo : existingOrder?.purchaseOrderNo ?? newOrderNo,
      purchaseType: form.purchaseType,
      spu: form.selectedSpu.spu,
      productName: form.selectedSpu.productName,
      imageUrl: form.selectedSpu.imageUrl,
      skuCount: selectedSkuItems.length,
      totalPurchaseQty,
      totalAmount,
      supplierName: form.supplierName,
      supplierContact: existingOrder?.supplierContact ?? "周经理",
      supplierType: form.purchaseType === "做货" ? "做货供应商" : form.purchaseType === "成衣" ? "成衣供应商" : "样衣供应商",
      addressType: existingOrder?.addressType ?? "线下",
      externalProductId: existingOrder?.externalProductId ?? `EXT-${form.selectedSpu.spu}`,
      purchaseLink: existingOrder?.purchaseLink ?? `https://purchase.example.com/${form.selectedSpu.spu.toLowerCase()}`,
      supplierRemark: existingOrder?.supplierRemark ?? "",
      purchaser: form.purchaser,
      targetWarehouse: form.targetWarehouse,
      expectedArrivalDate: form.expectedArrivalDate,
      shippedAt: existingOrder?.shippedAt ?? "",
      signedAt: existingOrder?.signedAt ?? "",
      auditTime: status === "草稿" ? "" : new Date().toLocaleString("zh-CN", { hour12: false }),
      latestWarehouseTime: existingOrder?.latestWarehouseTime ?? form.expectedArrivalDate,
      logisticsType: existingOrder?.logisticsType ?? "",
      trackingNo: existingOrder?.trackingNo ?? "",
      isUrgent: form.isUrgent,
      isFirstOrder: form.isFirstOrder,
      isOverQty: totalPurchaseQty > 6000 ? "是" : "否",
      hasLogistics: existingOrder?.hasLogistics ?? "否",
      hasTransferRecord: existingOrder?.hasTransferRecord ?? "否",
      isCombinedOrder: existingOrder?.isCombinedOrder ?? "否",
      region: form.productionArea,
      productionArea: form.productionArea,
      afterSaleStatus: existingOrder?.afterSaleStatus ?? "正常",
      needBom: skuNeedBom(form.purchaseType),
      materialStatus: form.purchaseType === "做货" ? existingOrder?.materialStatus ?? "未生成" : "不需要",
      relatedMaterialAnalysisNo: form.purchaseType === "做货" ? existingOrder?.relatedMaterialAnalysisNo ?? "" : "",
      materialGeneratedAt: form.purchaseType === "做货" ? existingOrder?.materialGeneratedAt ?? "" : "",
      status,
      createdAt: editing === "new" ? new Date().toLocaleString("zh-CN", { hour12: false }) : existingOrder?.createdAt ?? new Date().toLocaleString("zh-CN", { hour12: false }),
      updatedAt: new Date().toLocaleString("zh-CN", { hour12: false }),
      operationLogs: existingOrder?.operationLogs ?? [],
      systemRemark: existingOrder?.systemRemark ?? "",
      productRemark: selectedSkuItems[0]?.remark ?? "",
      purchaseRemark: form.purchaseRemark,
      stockFlow: {
        purchaseQty: totalPurchaseQty,
        arrivedQty,
        outboundQty,
        inboundQty,
        waitingOutboundQty: Math.max(totalPurchaseQty - outboundQty, 0),
      },
      skuItems: selectedSkuItems,
    };

    setRows((current) => (editing === "new" ? [base, ...current] : current.map((row) => (row.id === editing.id ? base : row))));
    setEditing(null);
    showToast(status === "草稿" ? "商品采购单草稿已保存" : "商品采购单已保存并提交");
  };

  return (
    <div>
      <PageHeader
        title={type ? `${type}采购单` : "商品采购单"}
        desc="统一管理做货、成衣、样衣三类商品采购单。新增和编辑时统一选择SPU，再在SKU明细中勾选本次采购SKU并维护实际采购数量和价格。"
        extra={
          <button className="inline-flex h-8 items-center gap-1.5 rounded bg-brand px-3 text-sm text-white" onClick={openNew}>
            <Plus size={15} />
            新增商品采购单
          </button>
        }
      />

      <SearchBar>
        <div className="space-y-3">
          <div className="flex flex-wrap items-end gap-2">
            <Field label="采购单号 / SKU / SPU">
              <input className="h-8 w-80 rounded border px-2 text-sm outline-none focus:border-brand" value={filters.keyword} onChange={(event) => updateFilter("keyword", event.target.value)} placeholder="支持采购单号、SKU、SPU、商品名称模糊搜索" />
            </Field>
            <Field label="采购类型">
              <select className="h-8 rounded border px-2 text-sm" value={filters.purchaseType} onChange={(event) => updateFilter("purchaseType", event.target.value as ListFilters["purchaseType"])}>
                {["全部", "做货", "成衣", "样衣"].map((item) => <option key={item}>{item}</option>)}
              </select>
            </Field>
            <Field label="状态">
              <select className="h-8 rounded border px-2 text-sm" value={filters.status} onChange={(event) => updateFilter("status", event.target.value as ListFilters["status"])}>
                {["全部", ...purchaseStatuses].map((item) => <option key={item}>{item}</option>)}
              </select>
            </Field>
            <Field label="供应商">
              <select className="h-8 rounded border px-2 text-sm" value={filters.supplierName} onChange={(event) => updateFilter("supplierName", event.target.value)}>
                {supplierOptions.map((item) => <option key={item}>{item}</option>)}
              </select>
            </Field>
            <Field label="采购专员">
              <select className="h-8 rounded border px-2 text-sm" value={filters.purchaser} onChange={(event) => updateFilter("purchaser", event.target.value)}>
                {purchaserOptions.map((item) => <option key={item}>{item}</option>)}
              </select>
            </Field>
            <Field label="创建时间起">
              <input className="h-8 rounded border px-2 text-sm" type="date" value={filters.createdFrom} onChange={(event) => updateFilter("createdFrom", event.target.value)} />
            </Field>
            <Field label="创建时间止">
              <input className="h-8 rounded border px-2 text-sm" type="date" value={filters.createdTo} onChange={(event) => updateFilter("createdTo", event.target.value)} />
            </Field>
            <button className="inline-flex h-8 items-center gap-1 rounded bg-brand px-3 text-sm text-white">
              <Search size={14} />
              查询
            </button>
            <button className="inline-flex h-8 items-center gap-1 rounded border px-3 text-sm" onClick={resetFilters}>
              <RotateCcw size={14} />
              清除
            </button>
            <button className="h-8 rounded px-2 text-sm text-brand hover:bg-blue-50" onClick={() => setAdvancedOpen((current) => !current)}>
              {advancedOpen ? "收起高级筛选" : "展开高级筛选"}
            </button>
          </div>
          {advancedOpen && (
            <div className="flex flex-wrap items-end gap-2 border-t border-gray-100 pt-3">
              <Field label="到货时间起"><input className="h-8 rounded border px-2 text-sm" type="date" value={filters.arrivalFrom} onChange={(event) => updateFilter("arrivalFrom", event.target.value)} /></Field>
              <Field label="到货时间止"><input className="h-8 rounded border px-2 text-sm" type="date" value={filters.arrivalTo} onChange={(event) => updateFilter("arrivalTo", event.target.value)} /></Field>
              <Field label="发货时间起"><input className="h-8 rounded border px-2 text-sm" type="date" value={filters.shippedFrom} onChange={(event) => updateFilter("shippedFrom", event.target.value)} /></Field>
              <Field label="发货时间止"><input className="h-8 rounded border px-2 text-sm" type="date" value={filters.shippedTo} onChange={(event) => updateFilter("shippedTo", event.target.value)} /></Field>
              <Field label="审核时间起"><input className="h-8 rounded border px-2 text-sm" type="date" value={filters.auditFrom} onChange={(event) => updateFilter("auditFrom", event.target.value)} /></Field>
              <Field label="审核时间止"><input className="h-8 rounded border px-2 text-sm" type="date" value={filters.auditTo} onChange={(event) => updateFilter("auditTo", event.target.value)} /></Field>
              <Field label="最晚到仓起"><input className="h-8 rounded border px-2 text-sm" type="date" value={filters.latestWarehouseFrom} onChange={(event) => updateFilter("latestWarehouseFrom", event.target.value)} /></Field>
              <Field label="最晚到仓止"><input className="h-8 rounded border px-2 text-sm" type="date" value={filters.latestWarehouseTo} onChange={(event) => updateFilter("latestWarehouseTo", event.target.value)} /></Field>
              <Field label="最小数量"><input className="h-8 w-24 rounded border px-2 text-sm" value={filters.minQty} onChange={(event) => updateFilter("minQty", event.target.value)} /></Field>
              <Field label="最大数量"><input className="h-8 w-24 rounded border px-2 text-sm" value={filters.maxQty} onChange={(event) => updateFilter("maxQty", event.target.value)} /></Field>
              <Field label="商品颜色"><input className="h-8 w-28 rounded border px-2 text-sm" value={filters.color} onChange={(event) => updateFilter("color", event.target.value)} /></Field>
              {[
                ["区域", "region", ["全部", "国内", "印尼", "其他"]],
                ["做货区域", "productionArea", ["全部", "国内", "印尼", "其他"]],
                ["是否首单", "isFirstOrder", ["全部", "是", "否"]],
                ["是否加急", "isUrgent", ["全部", "是", "否"]],
                ["是否超量", "isOverQty", ["全部", "是", "否"]],
                ["是否有物流", "hasLogistics", ["全部", "是", "否"]],
                ["是否有转运", "hasTransferRecord", ["全部", "是", "否"]],
                ["是否组合单", "isCombinedOrder", ["全部", "是", "否"]],
                ["已生成面辅料", "materialGenerated", ["全部", "是", "否"]],
                ["供应商类型", "supplierType", ["全部", "做货供应商", "成衣供应商", "样衣供应商"]],
                ["售后状态", "afterSaleStatus", ["全部", "正常", "售后中", "已关闭"]],
              ].map(([label, key, options]) => (
                <Field key={String(key)} label={String(label)}>
                  <select className="h-8 rounded border px-2 text-sm" value={String(filters[key as keyof ListFilters])} onChange={(event) => updateFilter(key as keyof ListFilters, event.target.value as never)}>
                    {(options as string[]).map((item) => <option key={item}>{item}</option>)}
                  </select>
                </Field>
              ))}
            </div>
          )}
        </div>
      </SearchBar>

      <section className="mb-3 flex flex-wrap items-center gap-2 rounded border border-gray-200 bg-white p-3">
        <span className="mr-1 text-sm text-gray-500">已选 {selectedIds.length} 条</span>
        <button className="h-8 rounded border px-3 text-sm" onClick={toggleVisibleSelected}>全选当前页</button>
        <button className="inline-flex h-8 items-center gap-1 rounded bg-brand px-3 text-sm text-white" onClick={openNew}><Plus size={14} />新增商品采购单</button>
        <button className="inline-flex h-8 items-center gap-1 rounded bg-emerald-600 px-3 text-sm text-white" onClick={() => runBatchAction("批量核采购")}><PackageCheck size={14} />批量核采购</button>
        <button className="inline-flex h-8 items-center gap-1 rounded border px-3 text-sm" onClick={() => runBatchAction("导出采购单", false)}><Download size={14} />导出采购单</button>
        <button className="h-8 rounded border px-3 text-sm" onClick={() => runBatchAction("导出商品", false)}>导出商品</button>
        <button className="inline-flex h-8 items-center gap-1 rounded border px-3 text-sm" onClick={() => runBatchAction("批量设置采购员")}><UserRound size={14} />批量设置采购员</button>
        <button className="h-8 rounded border px-3 text-sm" onClick={() => runBatchAction("批量设置供应商")}>批量设置供应商</button>
        <button className="h-8 rounded border px-3 text-sm" onClick={() => runBatchAction("批量一键下单")}>批量一键下单</button>
        <div className="relative">
          <button className="inline-flex h-8 items-center gap-1 rounded border px-3 text-sm" onClick={() => setMoreOpen((current) => !current)}><MoreHorizontal size={14} />更多操作</button>
          {moreOpen && (
            <div className="absolute right-0 z-20 mt-1 w-52 rounded border border-gray-200 bg-white py-1 text-sm shadow-lg">
              {["批量更改采购类型", "批量驳回", "合并采购单", "创建组合生产采购单", "批量确认模板", "批量面辅料签收表", "批量交给售后", "批量创建样衣采购单", "模板下载"].map((action) => (
                <button key={action} className="block w-full px-3 py-2 text-left hover:bg-gray-50" onClick={() => runBatchAction(action, action !== "模板下载")}>{action}</button>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="mb-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-7">
        {[
          ["计划采购商品数", qty(stats.plannedQty)],
          ["计划采购商品金额", money(stats.amount)],
          ["到货商品数", qty(stats.arrivedQty)],
          ["已出货商品数", qty(stats.outboundQty)],
          ["等待出货商品数", qty(stats.waitingOutboundQty)],
          ["商品总值", money(stats.amount)],
          ["已选数量", qty(selectedIds.length)],
        ].map(([label, value]) => (
          <div key={label} className="rounded border border-gray-200 bg-white px-3 py-2">
            <div className="text-xs text-gray-500">{label}</div>
            <div className="mt-1 text-base font-semibold text-gray-900">{value}</div>
          </div>
        ))}
      </section>

      <div className="[&_th:last-child]:sticky [&_th:last-child]:right-0 [&_th:last-child]:z-20 [&_th:last-child]:w-[140px] [&_th:last-child]:min-w-[140px] [&_th:last-child]:border-l [&_th:last-child]:bg-gray-50 [&_td:last-child]:sticky [&_td:last-child]:right-0 [&_td:last-child]:z-10 [&_td:last-child]:w-[140px] [&_td:last-child]:min-w-[140px] [&_td:last-child]:border-l [&_td:last-child]:bg-white">
        <DataTable
          columns={[
          { key: "selected", title: "勾选", render: (row) => <input type="checkbox" checked={selectedIds.includes(row.id)} onChange={() => toggleSelected(row.id)} /> },
          { key: "image", title: "商品图片", render: (row) => <ProductImage src={row.imageUrl} name={row.productName} size="h-14 w-14" /> },
          { key: "orderNo", title: "商品采购单号", render: (row) => <button className="text-brand" onClick={() => setDetail(row)}>{row.orderNo}</button> },
          {
            key: "productInfo",
            title: "商品信息",
            render: (row) => (
              <div className="min-w-[220px] space-y-1">
                <button className="font-medium text-brand" onClick={() => setDetail(row)}>{row.spu}</button>
                <div className="text-gray-900">{row.productName}</div>
                <div className="text-xs text-gray-500">SKU：{row.skuItems[0]?.sku ?? "-"} · {row.skuItems[0]?.color ?? "-"} / {row.skuItems[0]?.size ?? "-"}</div>
                <div className="text-xs text-gray-500">申请人：{row.skuItems[0]?.applicant ?? "张三"} · 添加人：{row.skuItems[0]?.creator ?? "李四"}</div>
                <div className="text-xs text-gray-500">成本价：{money(row.skuItems[0]?.actualPurchasePrice ?? 0)} · 重量：{row.skuItems[0]?.weight ?? "0.35kg"}</div>
                {row.productRemark && <span className="inline-block rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-600">{row.productRemark}</span>}
              </div>
            ),
          },
          {
            key: "supplierInfo",
            title: "供应商信息",
            render: (row) => (
              <div className="min-w-[220px] space-y-1">
                <div className="font-medium text-gray-900">{row.supplierName}</div>
                <div className="text-xs text-gray-500">收件人：{row.supplierContact} · {row.supplierType}</div>
                <div className="text-xs text-gray-500">地址：{row.addressType} · 商品ID：{row.externalProductId}</div>
                <a className="text-xs text-brand" href={row.purchaseLink} onClick={(event) => event.preventDefault()}>商品链接</a>
                {row.supplierRemark && <span className="ml-2 rounded bg-amber-50 px-1.5 py-0.5 text-xs text-amber-700">{row.supplierRemark}</span>}
              </div>
            ),
          },
          {
            key: "purchaseType",
            title: "采购类型",
            render: (row) => (
              <div className="space-y-1">
                <span className={`inline-block rounded-full px-2 py-0.5 text-xs ${row.purchaseType === "做货" ? "bg-blue-100 text-blue-700" : row.purchaseType === "成衣" ? "bg-green-100 text-green-700" : "bg-purple-100 text-purple-700"}`}>{row.purchaseType}</span>
                <div className="text-xs text-gray-500">区域：{row.region}</div>
                <div className="text-xs text-gray-500">数量：{qty(row.totalPurchaseQty)}</div>
                <div className="text-xs text-gray-500">金额：{money(row.totalAmount)}</div>
              </div>
            ),
          },
          { key: "status", title: "状态", render: (row) => <StatusBadge status={row.status} /> },
          {
            key: "time",
            title: "时间",
            render: (row) => (
              <div className="min-w-[150px] space-y-1 text-xs text-gray-600">
                <div>创建：{dateOnly(row.createdAt) || "-"}</div>
                <div>到货：{dateOnly(row.expectedArrivalDate) || "-"}</div>
                <div>发货：{dateOnly(row.shippedAt) || "-"}</div>
                <div>签收：{dateOnly(row.signedAt) || "-"}</div>
              </div>
            ),
          },
          {
            key: "stockFlow",
            title: "库存流转",
            render: (row) => (
              <div className="min-w-[120px] space-y-1 text-xs text-gray-600">
                <div>采购：{qty(row.stockFlow.purchaseQty)}</div>
                <div>到货：{qty(row.stockFlow.arrivedQty)}</div>
                <div>入库：{qty(row.stockFlow.inboundQty)}</div>
                <div>出货：{qty(row.stockFlow.outboundQty)}</div>
                <div>待出：{qty(row.stockFlow.waitingOutboundQty)}</div>
              </div>
            ),
          },
          {
            key: "logistics",
            title: "物流信息",
            render: (row) => (
              <div className="min-w-[150px] space-y-1 text-xs text-gray-600">
                <div>方式：{row.logisticsType || "-"}</div>
                <div>单号：{row.trackingNo || "-"}</div>
                <div>发货：{dateOnly(row.shippedAt) || "-"}</div>
                <div>转运：{row.hasTransferRecord}</div>
              </div>
            ),
          },
          {
            key: "remarks",
            title: "备注",
            render: (row) => (
              <div className="min-w-[180px] space-y-1 text-xs text-gray-600">
                <div>系统：{row.systemRemark || "-"}</div>
                <div>商品：{row.productRemark || "-"}</div>
                <div>采购：{row.purchaseRemark || "-"}</div>
              </div>
            ),
          },
          {
            key: "op",
            title: "操作",
            render: (row) => (
              <div className="flex w-[116px] flex-col items-start gap-1.5 whitespace-nowrap text-xs">
                {row.purchaseType === "做货" && (
                  <button className={`text-left ${row.materialStatus === "未生成" ? "font-medium text-green-600" : "text-brand"}`} onClick={() => openMaterialAction(row)}>
                    {materialActionLabel(row)}
                  </button>
                )}
                <button className="text-left text-brand" onClick={() => setDetail(row)}>查看详情</button>
                <button className="text-left text-brand" onClick={() => openEdit(row)}>编辑</button>
                <button className="text-left text-brand" onClick={() => showToast("采购备注入口已预留")}>采购备注</button>
                <button className="text-left text-brand" onClick={() => showToast("日志记录入口已预留")}>日志记录</button>
              </div>
            ),
          },
          ]}
          rows={visibleRows}
        />
      </div>

      <DesignLogicCard
        sections={[
          { title: "页面定位", headers: ["项目", "说明"], rows: [["页面名称", "商品采购单"], ["所属模块", "商品采购"], ["页面目标", "统一创建和维护做货、成衣、样衣采购单"], ["核心规则", "三种采购类型统一选择SPU"], ["下游去向", "内部确认、面辅料需求分析、发货到货"]] },
          { title: "商品选择规则", headers: ["采购类型", "商品选择对象", "SKU明细展示", "是否需要BOM"], rows: [["做货", "SPU", "展示该SPU下所有SKU，可多选", "是"], ["成衣", "SPU", "展示该SPU下所有SKU，可多选", "否"], ["样衣", "SPU", "展示该SPU下所有SKU，可多选", "否"]] },
          { title: "弹窗交互规则", headers: ["场景", "规则", "结果"], rows: [["点击SPU输入框", "打开可搜索下拉列表", "按SPU/款号/商品名称模糊搜索"], ["选择SPU", "带出商品图片、商品名称、SKU明细", "供应商字段推荐默认供应商"], ["清空SPU", "清空SKU明细和供应商推荐", "等待重新选择"], ["保存并提交", "校验必填和SKU数量价格", "状态进入待确认"]] },
          { title: "SKU明细规则", headers: ["字段", "说明", "规则"], rows: [["图片", "SKU或SPU图片", "无图显示占位"], ["标准采购价", "系统建议价", "只读展示"], ["实际采购价", "本次采购价", "可编辑，不能小于0"], ["实际采购数量", "本次采购数量", "可编辑，必须大于0"], ["采购金额", "实际价 x 实际数量", "自动计算"]] },
          { title: "面辅料需求分析规则", headers: ["场景", "按钮/校验", "结果"], rows: [["做货且未生成", "列表和详情显示“生成面辅料需求分析”", "校验通过后打开生成确认弹窗"], ["做货且已生成/已下推", "显示“查看面辅料需求”", "提示关联分析单号，避免重复生成"], ["成衣/样衣", "面辅料状态为不需要", "不展示生成按钮"], ["生成校验", "采购单非草稿、SKU数量大于0、BOM全部已匹配", "不通过时提示原因并终止生成"], ["生成规则", "SKU数量 x 单件用量 x (1 + 损耗率)，再扣库存和采购中", "按物料+单位+仓库+供应商聚合生成分析单"]] },
        ]}
      />

      <DetailModal open={!!detail} title="商品采购单详情" onClose={() => setDetail(null)}>
        {detail && (
          <div className="space-y-4 text-sm">
            <div className="flex gap-4">
              <ProductImage src={detail.imageUrl} name={detail.productName} size="h-24 w-24" />
              <div className="grid flex-1 grid-cols-2 gap-2">
                <div><span className="text-gray-500">采购单号：</span>{detail.orderNo}</div>
                <div><span className="text-gray-500">采购类型：</span>{detail.purchaseType}</div>
                <div><span className="text-gray-500">SPU：</span>{detail.spu}</div>
                <div><span className="text-gray-500">商品名称：</span>{detail.productName}</div>
                <div><span className="text-gray-500">供应商：</span>{detail.supplierName}</div>
                <div><span className="text-gray-500">采购金额：</span>{money(detail.totalAmount)}</div>
                <div><span className="text-gray-500">面辅料状态：</span>{detail.materialStatus}</div>
                <div><span className="text-gray-500">关联分析单：</span>{detail.relatedMaterialAnalysisNo || "-"}</div>
              </div>
            </div>
            {detail.purchaseType === "做货" && (
              <div className="flex flex-wrap items-center justify-between gap-3 rounded border border-blue-100 bg-blue-50 p-3">
                <div>
                  <div className="font-medium text-gray-900">面辅料需求分析</div>
                  <div className="mt-1 text-xs text-gray-600">仅做货采购单参与 BOM 拆解；成衣、样衣默认不需要生成。</div>
                </div>
                <button className="h-8 rounded bg-brand px-3 text-xs text-white" onClick={() => openMaterialAction(detail)}>
                  {materialActionLabel(detail)}
                </button>
              </div>
            )}
            <DataTable
              columns={[
                { key: "image", title: "图片", render: (row) => <ProductImage src={row.imageUrl ?? detail.imageUrl} name={row.sku} size="h-10 w-10" /> },
                { key: "sku", title: "SKU" },
                { key: "productName", title: "商品名称" },
                { key: "color", title: "颜色" },
                { key: "size", title: "尺码" },
                { key: "standardPurchasePrice", title: "标准采购价", render: (row) => money(row.standardPurchasePrice) },
                { key: "actualPurchasePrice", title: "实际采购价", render: (row) => money(row.actualPurchasePrice) },
                { key: "actualPurchaseQty", title: "实际采购数量", render: (row) => qty(row.actualPurchaseQty) },
                { key: "amount", title: "采购金额", render: (row) => money(row.actualPurchasePrice * row.actualPurchaseQty) },
                { key: "needBom", title: "是否需要BOM", render: (row) => (row.needBom ? "是" : "否") },
                { key: "bomNo", title: "BOM编号", render: (row) => row.bomNo || "-" },
                { key: "bomVersion", title: "BOM版本", render: (row) => row.bomVersion || "-" },
                { key: "bomStatus", title: "BOM状态", render: (row) => <StatusBadge status={row.bomStatus || "未匹配"} /> },
              ]}
              rows={detail.skuItems}
            />
          </div>
        )}
      </DetailModal>

      <DetailModal open={!!generationOrder} title="生成面辅料需求分析" onClose={() => setGenerationOrder(null)}>
        {generationOrder && generationPreview && (
          <div className="space-y-4 text-sm">
            <section className="rounded border border-gray-200 bg-white p-3">
              <h3 className="mb-3 font-semibold text-gray-900">来源商品采购单信息</h3>
              <div className="grid gap-2 md:grid-cols-3">
                {[
                  ["商品采购单号", generationOrder.orderNo],
                  ["采购类型", generationOrder.purchaseType],
                  ["SPU / 款号", generationOrder.spu],
                  ["商品名称", generationOrder.productName],
                  ["SKU数量", generationPreview.skuTotal],
                  ["采购总数量", qty(generationPreview.totalPurchaseQty)],
                  ["供应商", generationOrder.supplierName],
                  ["目标仓库", generationOrder.targetWarehouse],
                  ["预计到货时间", generationOrder.expectedArrivalDate],
                ].map(([label, value]) => (
                  <div key={label} className="rounded bg-gray-50 px-3 py-2">
                    <div className="text-xs text-gray-500">{label}</div>
                    <div className="mt-1 font-medium text-gray-900">{value}</div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded border border-gray-200 bg-white p-3">
              <h3 className="mb-3 font-semibold text-gray-900">SKU 明细汇总</h3>
              <DataTable
                columns={[
                  { key: "sku", title: "SKU" },
                  { key: "color", title: "颜色" },
                  { key: "size", title: "尺码" },
                  { key: "actualPurchaseQty", title: "采购数量", render: (row) => qty(row.actualPurchaseQty) },
                  { key: "bomNo", title: "BOM编号", render: (row) => row.bomNo || "-" },
                  { key: "bomVersion", title: "BOM版本", render: (row) => row.bomVersion || "-" },
                  { key: "bomStatus", title: "BOM状态", render: (row) => <StatusBadge status={row.bomStatus || "未匹配"} /> },
                ]}
                rows={generationOrder.skuItems}
              />
            </section>

            <section className="rounded border border-gray-200 bg-white p-3">
              <h3 className="mb-3 font-semibold text-gray-900">BOM / 样板匹配情况</h3>
              <div className="grid gap-3 md:grid-cols-5">
                {[
                  ["SKU总数", generationPreview.skuTotal],
                  ["已匹配BOM SKU数", generationPreview.matchedSkuCount],
                  ["未匹配BOM SKU数", generationPreview.unmatchedSkuCount],
                  ["预计拆出物料种类数", generationPreview.materialTypeCount],
                  ["是否允许生成", generationPreview.unmatchedSkuCount === 0 ? "允许" : "不允许"],
                ].map(([label, value]) => (
                  <div key={label} className="rounded bg-gray-50 px-3 py-2">
                    <div className="text-xs text-gray-500">{label}</div>
                    <div className="mt-1 font-semibold text-gray-900">{value}</div>
                  </div>
                ))}
              </div>
              {generationPreview.unmatchedSkuCount > 0 && (
                <div className="mt-3 rounded border border-amber-200 bg-amber-50 p-2 text-xs text-amber-700">请先维护未匹配 SKU 的 BOM/样板，确认生成按钮已禁用。</div>
              )}
            </section>

            <section className="rounded border border-gray-200 bg-white p-3">
              <h3 className="mb-3 font-semibold text-gray-900">生成明细预览</h3>
              <div className="mb-3 grid gap-3 md:grid-cols-4">
                {[
                  ["分析单号", generationPreview.analysisNo],
                  ["BOM需求总数", qty(generationPreview.bomRequiredTotalQty)],
                  ["库存总数", qty(generationPreview.stockTotalQty)],
                  ["建议采购总数", qty(generationPreview.suggestedPurchaseTotalQty)],
                ].map(([label, value]) => (
                  <div key={label} className="rounded bg-gray-50 px-3 py-2">
                    <div className="text-xs text-gray-500">{label}</div>
                    <div className="mt-1 font-semibold text-gray-900">{value}</div>
                  </div>
                ))}
              </div>
              <DataTable
                columns={[
                  { key: "materialCode", title: "物料编码" },
                  { key: "materialName", title: "物料名称" },
                  { key: "category", title: "分类" },
                  { key: "usagePart", title: "使用部位" },
                  { key: "sourceSkus", title: "来源SKU", render: (row) => row.sourceSkus.join("、") },
                  { key: "bomRequiredQty", title: "BOM需求", render: (row) => qty(row.bomRequiredQty) },
                  { key: "stockQty", title: "库存", render: (row) => qty(row.stockQty) },
                  { key: "purchasingQty", title: "采购中", render: (row) => qty(row.purchasingQty) },
                  { key: "suggestedPurchaseQty", title: "建议采购", render: (row) => qty(row.suggestedPurchaseQty) },
                  { key: "unit", title: "单位" },
                  { key: "suggestedSupplier", title: "建议供应商" },
                ]}
                rows={generationPreview.lines}
              />
            </section>

            <section className="rounded border border-blue-100 bg-blue-50 p-3 text-sm text-blue-800">
              点击确认后，系统将根据当前商品采购单 SKU 明细和 BOM/样板生成面辅料需求分析单，并将商品采购单面辅料状态更新为“已生成”。
            </section>
            <div className="flex justify-end gap-2 border-t border-gray-200 pt-3">
              <button className="h-8 rounded border px-3 text-sm" onClick={() => setGenerationOrder(null)}>取消</button>
              <button className="h-8 rounded bg-brand px-3 text-sm text-white disabled:cursor-not-allowed disabled:bg-gray-300" disabled={generationPreview.unmatchedSkuCount > 0} onClick={confirmGenerateMaterialAnalysis}>确认生成</button>
            </div>
          </div>
        )}
      </DetailModal>

      <FormModal open={!!editing} onClose={() => setEditing(null)} title={editing === "new" ? "新增商品采购单" : "编辑商品采购单"} widthClass="w-[980px]">
        <div className="space-y-4 pb-14">
          <section className="rounded border border-gray-200 bg-white p-4">
            <h3 className="mb-3 text-sm font-semibold text-gray-900">基础信息</h3>
            <div className="grid gap-3 md:grid-cols-2">
              <Field label="采购类型">
                <select className="h-8 rounded border px-2 text-sm" value={form.purchaseType} onChange={(event) => changePurchaseType(event.target.value as ProductPurchaseType)}>
                  {["做货", "成衣", "样衣"].map((item) => <option key={item}>{item}</option>)}
                </select>
              </Field>
              <Field label="采购专员">
                <select className="h-8 rounded border px-2 text-sm" value={form.purchaser} onChange={(event) => updateForm("purchaser", event.target.value)}>
                  {purchasers.map((item) => <option key={item}>{item}</option>)}
                </select>
              </Field>
              <Field label="目标仓库">
                <select className="h-8 rounded border px-2 text-sm" value={form.targetWarehouse} onChange={(event) => updateForm("targetWarehouse", event.target.value)}>
                  {warehouses.map((item) => <option key={item}>{item}</option>)}
                </select>
              </Field>
              <Field label="预计到货时间">
                <input className="h-8 rounded border px-2 text-sm" type="date" value={form.expectedArrivalDate} onChange={(event) => updateForm("expectedArrivalDate", event.target.value)} />
              </Field>
              <Field label="是否加急">
                <select className="h-8 rounded border px-2 text-sm" value={form.isUrgent} onChange={(event) => updateForm("isUrgent", event.target.value as "是" | "否")}>
                  {["否", "是"].map((item) => <option key={item}>{item}</option>)}
                </select>
              </Field>
              <Field label="是否首单">
                <select className="h-8 rounded border px-2 text-sm" value={form.isFirstOrder} onChange={(event) => updateForm("isFirstOrder", event.target.value as "是" | "否")}>
                  {["否", "是"].map((item) => <option key={item}>{item}</option>)}
                </select>
              </Field>
              {form.purchaseType === "做货" && (
                <Field label="做货区域">
                  <select className="h-8 rounded border px-2 text-sm" value={form.productionArea} onChange={(event) => updateForm("productionArea", event.target.value as "国内" | "印尼" | "其他")}>
                    {["国内", "印尼", "其他"].map((item) => <option key={item}>{item}</option>)}
                  </select>
                </Field>
              )}
            </div>
          </section>

          <section className="rounded border border-gray-200 bg-white p-4">
            <h3 className="mb-3 text-sm font-semibold text-gray-900">商品选择</h3>
            <div className="relative">
              <Field label="SPU">
                <div className="flex h-9 items-center rounded border border-gray-200 bg-white focus-within:border-brand">
                  <input
                    className="h-full flex-1 px-2 text-sm outline-none"
                    value={form.spuSearch}
                    onFocus={() => setSpuOpen(true)}
                    onChange={(event) => {
                      updateForm("spuSearch", event.target.value);
                      setSpuOpen(true);
                      if (!event.target.value) clearSpu();
                    }}
                    placeholder="请选择或搜索 SPU / 款号 / 商品名称"
                  />
                  {form.selectedSpu && <button className="px-2 text-gray-400" onClick={clearSpu}><X size={15} /></button>}
                </div>
              </Field>
              {spuOpen && (
                <div className="absolute z-20 mt-1 max-h-72 w-full overflow-auto rounded border border-gray-200 bg-white shadow-lg">
                  {filteredSpus.map((spu) => (
                    <button key={spu.spu} className="flex w-full items-center gap-3 border-b border-gray-100 px-3 py-2 text-left hover:bg-blue-50" onMouseDown={(event) => event.preventDefault()} onClick={() => chooseSpu(spu)}>
                      <ProductImage src={spu.imageUrl} name={spu.productName} size="h-10 w-10" />
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-gray-900">{spu.spu}｜{spu.productName}</div>
                        <div className="text-xs text-gray-500">{spu.skuItems.length}个SKU</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            {form.selectedSpu && (
              <div className="mt-3 flex items-center gap-3 rounded bg-blue-50 p-3">
                <ProductImage src={form.selectedSpu.imageUrl} name={form.selectedSpu.productName} size="h-14 w-14" />
                <div>
                  <div className="text-sm font-medium text-gray-900">{form.selectedSpu.spu}｜{form.selectedSpu.productName}</div>
                  <div className="text-xs text-gray-500">已加载 {form.selectedSpu.skuItems.length} 个SKU，供应商字段已推荐默认供应商。</div>
                </div>
              </div>
            )}
          </section>

          <section className="rounded border border-gray-200 bg-white p-4">
            <h3 className="mb-3 text-sm font-semibold text-gray-900">供应商与采购信息</h3>
            <div className="grid gap-3 md:grid-cols-2">
              <Field label="供应商">
                <select className="h-8 rounded border px-2 text-sm" value={form.supplierName} onChange={(event) => updateForm("supplierName", event.target.value)}>
                  <option value="">请选择供应商</option>
                  {Array.from(new Set([form.selectedSpu?.defaultSupplier, ...suppliers].filter(Boolean) as string[])).map((item, index) => <option key={item} value={item}>{item}{index === 0 && form.selectedSpu ? "（推荐）" : ""}</option>)}
                </select>
              </Field>
              <Field label="采购备注">
                <input className="h-8 rounded border px-2 text-sm" value={form.purchaseRemark} onChange={(event) => updateForm("purchaseRemark", event.target.value)} placeholder="采购说明" />
              </Field>
            </div>
          </section>

          <section className="rounded border border-gray-200 bg-white p-4">
            <h3 className="mb-3 text-sm font-semibold text-gray-900">SKU 明细</h3>
            {!form.selectedSpu ? (
              <div className="rounded border border-dashed border-gray-200 bg-gray-50 p-8 text-center text-sm text-gray-500">请选择SPU后展示SKU明细。</div>
            ) : (
              <div className="overflow-x-auto rounded border border-gray-200">
                <table className="min-w-[1180px] text-left text-[13px]">
                  <thead className="bg-gray-50">
                    <tr>
                      {["选择", "图片", "SKU", "商品名称", "颜色", "尺码", "标准采购价", "实际采购价", "建议数量", "实际采购数量", "采购金额", "是否需要BOM", "备注"].map((header) => (
                        <th key={header} className="border-b border-gray-200 px-3 py-2 font-medium text-gray-700">{header}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {form.selectedSpu.skuItems.map((sku) => {
                      const draft = form.skuDrafts[sku.sku];
                      const actualPrice = Number(draft?.actualPurchasePrice || 0);
                      const actualQty = Number(draft?.actualPurchaseQty || 0);
                      return (
                        <tr key={sku.sku} className="border-b border-gray-100">
                          <td className="px-3 py-2"><input type="checkbox" checked={Boolean(draft?.selected)} onChange={() => toggleSku(sku.sku)} /></td>
                          <td className="px-3 py-2"><ProductImage src={sku.imageUrl ?? form.selectedSpu?.imageUrl} name={sku.sku} size="h-10 w-10" /></td>
                          <td className="px-3 py-2">{sku.sku}</td>
                          <td className="px-3 py-2">{sku.productName}</td>
                          <td className="px-3 py-2">{sku.color}</td>
                          <td className="px-3 py-2">{sku.size}</td>
                          <td className="px-3 py-2">{money(sku.standardPurchasePrice)}</td>
                          <td className="px-3 py-2"><input className="h-8 w-24 rounded border px-2" value={draft?.actualPurchasePrice ?? ""} onChange={(event) => updateSku(sku.sku, "actualPurchasePrice", event.target.value)} /></td>
                          <td className="px-3 py-2">{qty(sku.suggestedPurchaseQty)}</td>
                          <td className="px-3 py-2"><input className="h-8 w-24 rounded border px-2" value={draft?.actualPurchaseQty ?? ""} onChange={(event) => updateSku(sku.sku, "actualPurchaseQty", event.target.value)} /></td>
                          <td className="px-3 py-2">{money(actualPrice * actualQty)}</td>
                          <td className="px-3 py-2">{skuNeedBom(form.purchaseType)}</td>
                          <td className="px-3 py-2"><input className="h-8 w-40 rounded border px-2" value={draft?.remark ?? ""} onChange={(event) => updateSku(sku.sku, "remark", event.target.value)} placeholder="SKU备注" /></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="rounded border border-gray-200 bg-white p-4">
            <h3 className="mb-3 text-sm font-semibold text-gray-900">采购金额汇总</h3>
            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded bg-gray-50 p-3"><div className="text-xs text-gray-500">已选SKU数</div><div className="mt-1 text-lg font-semibold">{selectedSkuItems.length}</div></div>
              <div className="rounded bg-gray-50 p-3"><div className="text-xs text-gray-500">采购总数量</div><div className="mt-1 text-lg font-semibold">{qty(selectedSkuItems.reduce((sum, sku) => sum + sku.actualPurchaseQty, 0))}</div></div>
              <div className="rounded bg-gray-50 p-3"><div className="text-xs text-gray-500">采购总金额</div><div className="mt-1 text-lg font-semibold">{money(orderTotal(selectedSkuItems))}</div></div>
            </div>
          </section>
        </div>
        <div className="sticky bottom-0 -mx-4 mt-4 flex justify-end gap-2 border-t border-gray-200 bg-white px-4 py-3">
          <button className="h-8 rounded border px-3 text-sm" onClick={() => setEditing(null)}>取消</button>
          <button className="h-8 rounded border px-3 text-sm" onClick={() => saveOrder("草稿")}>保存草稿</button>
          <button className="h-8 rounded bg-brand px-3 text-sm text-white" onClick={() => saveOrder("待确认")}>保存并提交</button>
        </div>
      </FormModal>

      <Toast msg={toast} />
    </div>
  );
}

export default function ProductPurchaseOrder() {
  return <ProductPurchaseOrderView />;
}
