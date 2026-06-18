import { Fragment, useMemo, useState, type ReactNode } from "react";
import DesignLogicCard from "../../components/common/DesignLogicCard";
import DetailModal from "../../components/common/DetailModal";
import PageHeader from "../../components/common/PageHeader";
import SearchBar from "../../components/common/SearchBar";
import Toast from "../../components/common/Toast";
import type { Dispatch, SetStateAction } from "react";
import {
  getPurchasingQtyBreakdown,
  type ProductPurchaseSuggestion as Suggestion,
  type ProductPurchaseSuggestionSku,
} from "../../mock/productPurchaseSuggestions";
import {
  productCatalogSpus,
  productPurchaseOrders,
  type ProductPurchaseOrder,
  type ProductPurchaseSku,
} from "../../mock/productPurchaseOrders";
import { suppliers } from "../../mock/suppliers";
import { warehouses } from "../../mock/warehouses";

type Filters = {
  area: string;
  purchaseType: string;
  isProduction: string;
  mainSku: string;
  keyword: string;
  minQty: string;
  maxQty: string;
  firstOrder: string;
  remark: string;
};

const initialFilters: Filters = {
  area: "全部区域",
  purchaseType: "全部",
  isProduction: "全部",
  mainSku: "",
  keyword: "",
  minQty: "",
  maxQty: "",
  firstOrder: "全部",
  remark: "全部",
};

type GenerateSkuDraft = {
  sku: string;
  selected: boolean;
  purchaseQty: number;
  unitPrice: number;
  remark: string;
  suggestedTestStore: string;
};

type GenerateForm = {
  supplierName: string;
  purchaseAddress: string;
  regions: string[];
  regionPrice: number;
  purchaser: string;
  targetWarehouse: string;
  expectedArrivalDate: string;
  isUrgent: "是" | "否";
  isFirstOrder: "是" | "否";
  purchaseBusinessType: "" | "爆款" | "热销";
  purchaseRemark: string;
  skuDrafts: GenerateSkuDraft[];
};

const purchaserOptions = ["采购员", "王采购", "陈采购"];
const regionOptions = ["ID", "CN"];
const enabledWarehouses = warehouses.filter((item) => item.enabled && item.availableForPurchaseOrder);
const supplierOptions = Array.from(new Set([...productCatalogSpus.map((item) => item.defaultSupplier), ...suppliers.filter((item) => item.status === "已启用").map((item) => item.supplierName)]));

function currentDateTime() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
}

function PurchaseOrderModal({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-[1px]">
      <div className="flex max-h-[85vh] w-[min(1180px,calc(100vw-32px))] flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl">
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-gray-200 px-5">
          <h2 className="text-base font-semibold text-gray-900">{title}</h2>
          <button className="rounded-md px-3 py-1.5 text-sm text-gray-500 transition hover:bg-gray-100 hover:text-gray-800" onClick={onClose} aria-label="关闭">关闭</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function FormField({ label, required, children }: { label: string; required?: boolean; children: ReactNode }) {
  return (
    <label className="space-y-1">
      <span className="text-xs text-gray-600">{required && <span className="mr-1 text-red-500">*</span>}{label}</span>
      {children}
    </label>
  );
}

function ProductImage({ imageUrl, name, size = "sm" }: { imageUrl?: string; name: string; size?: "sm" | "lg" }) {
  const dimension = size === "lg" ? "h-28 w-28" : "h-12 w-12";
  if (!imageUrl) {
    return (
      <div className={`${dimension} flex shrink-0 items-center justify-center rounded-md border border-gray-200 bg-gray-100 text-xs text-gray-400`}>
        无图
      </div>
    );
  }
  return <img src={imageUrl} alt={name} className={`${dimension} shrink-0 rounded-md border border-gray-200 object-cover`} />;
}

function getSkuPurchasingQuantities(item: ProductPurchaseSuggestionSku) {
  if (item.skuPurchaseOrderQty !== undefined && item.skuHeadLogisticsQty !== undefined) {
    return {
      purchaseOrderQty: item.skuPurchaseOrderQty,
      headLogisticsQty: item.skuHeadLogisticsQty,
    };
  }
  return getPurchasingQtyBreakdown(item.purchasingQty, item.transitQty);
}

function SkuSuggestionTable({
  items,
  fallbackImage,
  productName,
}: {
  items: ProductPurchaseSuggestionSku[];
  fallbackImage?: string;
  productName: string;
}) {
  const headerClass = "border-b border-r border-gray-200 px-3 py-2 text-center font-medium text-gray-700 last:border-r-0";
  const cellClass = "border-r border-gray-100 px-3 py-2.5 text-center last:border-r-0";
  return (
    <div className="overflow-x-auto rounded border border-gray-200 bg-white">
      <table className="min-w-[1500px] text-left text-[13px]">
        <thead className="bg-gray-50">
          <tr>
            {["商品图片", "SKU", "商品名称", "颜色", "尺码", "COD与非COD已支付件数", "待发货数量", "KOL申请数量", "实时库存数量"].map((header) => (
              <th key={header} rowSpan={2} className={headerClass}>{header}</th>
            ))}
            <th colSpan={2} className={`${headerClass} bg-blue-50 text-brand`}>采购中数量</th>
            <th rowSpan={2} className={headerClass}>SKU折前需求缺口</th>
            <th rowSpan={2} className={headerClass}>SKU折后建议采购</th>
          </tr>
          <tr>
            <th className={`${headerClass} min-w-32 bg-blue-50/70`}>采购下单中数量</th>
            <th className={`${headerClass} min-w-40 bg-blue-50/70`}>采购头程运输中数量</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const purchasingQuantities = getSkuPurchasingQuantities(item);
            return (
              <tr key={item.sku} className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50">
                <td className={cellClass}><ProductImage imageUrl={item.imageUrl ?? fallbackImage} name={productName} /></td>
                <td className={`${cellClass} whitespace-nowrap font-medium text-gray-800`}>{item.sku}</td>
                <td className={cellClass}>{item.productName ?? productName}</td>
                <td className={cellClass}>{item.color}</td>
                <td className={cellClass}>{item.size}</td>
                <td className={cellClass}>{Math.trunc(item.paidQty ?? 0)}</td>
                <td className={cellClass}>{Math.trunc(item.pendingDeliveryQty ?? 0)}</td>
                <td className={cellClass}>{Math.trunc(item.kolApplicationQty ?? 0)}</td>
                <td className={cellClass}>{Math.trunc(item.realTimeStockQty ?? item.stockQty ?? 0)}</td>
                <td className={`${cellClass} bg-blue-50/20`}>{Math.trunc(purchasingQuantities.purchaseOrderQty ?? 0)}</td>
                <td className={`${cellClass} bg-blue-50/20`}>{Math.trunc(purchasingQuantities.headLogisticsQty ?? 0)}</td>
                <td className={cellClass}>{Math.trunc(item.rawGapQty ?? 0)}</td>
                <td className={`${cellClass} font-semibold text-red-600`}>{Math.trunc(item.suggestedQty ?? 0)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function ProductPurchaseSuggestion({
  rows,
  setRows,
}: {
  rows: Suggestion[];
  setRows: Dispatch<SetStateAction<Suggestion[]>>;
}) {
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [expanded, setExpanded] = useState<string[]>(["1"]);
  const [selected, setSelected] = useState<string[]>([]);
  const [detail, setDetail] = useState<Suggestion | null>(null);
  const [generateTarget, setGenerateTarget] = useState<Suggestion | null>(null);
  const [generateForm, setGenerateForm] = useState<GenerateForm | null>(null);
  const [toast, setToast] = useState("");
  const closeGenerateForm = () => {
    if (!window.confirm("当前内容未保存，确认关闭吗？")) return;
    setGenerateTarget(null);
    setGenerateForm(null);
  };

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const keyword = filters.keyword.trim();
      const matchArea = filters.area === "全部区域" || row.area === filters.area;
      const matchType = filters.purchaseType === "全部" || row.purchaseType === filters.purchaseType;
      const matchProduction = filters.isProduction === "全部" || row.needProduction === (filters.isProduction === "是");
      const matchMainSku = !filters.mainSku || row.mainSku.includes(filters.mainSku);
      const matchKeyword =
        !keyword ||
        row.spu.includes(keyword) ||
        row.mainSku.includes(keyword) ||
        row.productName.includes(keyword) ||
        row.skuItems.some((item) => item.sku.includes(keyword));
      const minQty = filters.minQty === "" ? Number.NEGATIVE_INFINITY : Number(filters.minQty);
      const maxQty = filters.maxQty === "" ? Number.POSITIVE_INFINITY : Number(filters.maxQty);
      const matchQty = row.suggestedQty >= minQty && row.suggestedQty <= maxQty;
      const matchFirstOrder = filters.firstOrder === "全部" || row.firstOrder === filters.firstOrder;
      const hasRemark = Boolean(row.productRemark);
      const matchRemark = filters.remark === "全部" || (filters.remark === "有备注" ? hasRemark : !hasRemark);
      return matchArea && matchType && matchProduction && matchMainSku && matchKeyword && matchQty && matchFirstOrder && matchRemark;
    });
  }, [filters, rows]);

  const stats = useMemo(() => {
    const skuItems = filteredRows.flatMap((row) => row.skuItems);
    return {
      spuCount: new Set(filteredRows.map((row) => row.spu)).size,
      skuCount: skuItems.length,
      pendingDeliveryQty: skuItems.reduce((sum, item) => sum + item.pendingDeliveryQty, 0),
      kolApplicationQty: skuItems.reduce((sum, item) => sum + (item.kolApplicationQty ?? 0), 0),
      realTimeStockQty: skuItems.reduce((sum, item) => sum + (item.realTimeStockQty ?? item.stockQty), 0),
      purchasingQty: skuItems.reduce((sum, item) => sum + item.purchasingQty, 0),
      rawGapQty: skuItems.reduce((sum, item) => sum + (item.rawGapQty ?? 0), 0),
      suggestedQty: skuItems.reduce((sum, item) => sum + item.suggestedQty, 0),
      totalPaidQty: filteredRows.reduce((sum, row) => sum + row.codPaidQty + row.nonCodPaidQty, 0),
    };
  }, [filteredRows]);

  const updateFilter = (key: keyof Filters, value: string) => setFilters((current) => ({ ...current, [key]: value }));
  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 1800);
  };
  const toggleExpand = (id: string) => setExpanded((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  const toggleSelect = (id: string) => setSelected((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]));
  const selectedRows = rows.filter((row) => selected.includes(row.id));

  const toggleNeedProduction = (target: Suggestion) => {
    const nextNeedProduction = !target.needProduction;
    const updatedAt = currentDateTime();
    setRows((current) => current.map((row) => row.id === target.id ? {
      ...row,
      needProduction: nextNeedProduction,
      isProduction: nextNeedProduction ? "是" : "否",
      updatedAt,
    } : row));
    setSelected((current) => current.filter((id) => id !== target.id));
    if (generateTarget?.id === target.id) {
      setGenerateTarget(null);
      setGenerateForm(null);
    }
    showToast(nextNeedProduction ? `${target.spu} 已恢复需要做货` : `${target.spu} 已设置为不需要做货`);
  };

  const handleGenerate = (target?: Suggestion) => {
    const targetRows = target ? [target] : selectedRows;
    if (targetRows.length === 0) {
      showToast("请先勾选需要生成采购单的商品");
      return;
    }
    if (targetRows.length > 1) {
      showToast("一次仅支持选择一个 SPU 生成商品采购单");
      return;
    }
    const row = targetRows[0];
    if (!row.needProduction) {
      showToast("当前 SPU 已设置为不需要做货，不能生成商品采购单");
      return;
    }
    if (row.status !== "待生成") {
      showToast("当前商品没有待生成的采购建议");
      return;
    }
    const catalog = productCatalogSpus.find((item) => item.spu === row.spu);
    const defaultWarehouse = enabledWarehouses.find((item) => item.country === "印度尼西亚") ?? enabledWarehouses[0];
    setGenerateTarget(row);
    setGenerateForm({
      supplierName: catalog?.defaultSupplier ?? supplierOptions[0] ?? "",
      purchaseAddress: "",
      regions: ["ID"],
      regionPrice: 0,
      purchaser: "采购员",
      targetWarehouse: defaultWarehouse?.warehouseName ?? "",
      expectedArrivalDate: "",
      isUrgent: "否",
      isFirstOrder: row.firstOrder,
      purchaseBusinessType: "",
      purchaseRemark: row.productRemark ?? "",
      skuDrafts: row.skuItems.map((item) => {
        const catalogSku = catalog?.skuItems.find((sku) => sku.sku === item.sku);
        return {
          sku: item.sku,
          selected: item.suggestedQty > 0,
          purchaseQty: item.suggestedQty,
          unitPrice: catalogSku?.actualPurchasePrice ?? catalogSku?.standardPurchasePrice ?? 0,
          remark: "",
          suggestedTestStore: "",
        };
      }),
    });
    setSelected([row.id]);
  };

  const updateGenerateForm = <K extends keyof GenerateForm>(key: K, value: GenerateForm[K]) => {
    setGenerateForm((current) => current ? { ...current, [key]: value } : current);
  };

  const updateSkuDraft = (sku: string, patch: Partial<GenerateSkuDraft>) => {
    setGenerateForm((current) => current ? {
      ...current,
      skuDrafts: current.skuDrafts.map((item) => item.sku === sku ? { ...item, ...patch } : item),
    } : current);
  };

  const changePurchaseBusinessType = (purchaseBusinessType: GenerateForm["purchaseBusinessType"]) => {
    if (!generateTarget) return;
    const coefficient = purchaseBusinessType === "爆款" ? 0.7 : purchaseBusinessType === "热销" ? 0.6 : 1;
    setGenerateForm((current) => current ? {
      ...current,
      purchaseBusinessType,
      skuDrafts: current.skuDrafts.map((draft) => {
        const source = generateTarget.skuItems.find((item) => item.sku === draft.sku);
        return {
          ...draft,
          purchaseQty: Math.ceil((source?.suggestedQty ?? 0) * coefficient),
        };
      }),
    } : current);
  };

  const confirmGenerate = () => {
    if (!generateTarget || !generateForm) return;
    if (!generateForm.supplierName || !generateForm.purchaser || !generateForm.targetWarehouse || generateForm.regions.length === 0) {
      showToast("请完整填写供应商、区域、采购专员和目标仓库");
      return;
    }
    const selectedDrafts = generateForm.skuDrafts.filter((item) => item.selected && item.purchaseQty > 0);
    if (selectedDrafts.length === 0) {
      showToast("请至少勾选一条采购数量大于 0 的 SKU");
      return;
    }
    const catalog = productCatalogSpus.find((item) => item.spu === generateTarget.spu);
    const orderNo = `GP-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
    const skuItems: ProductPurchaseSku[] = selectedDrafts.map((draft) => {
      const source = generateTarget.skuItems.find((item) => item.sku === draft.sku)!;
      const catalogSku = catalog?.skuItems.find((item) => item.sku === draft.sku);
      const standardPrice = catalogSku?.standardPurchasePrice ?? draft.unitPrice;
      return {
        sku: source.sku,
        imageUrl: source.imageUrl ?? generateTarget.imageUrl,
        productName: source.productName ?? generateTarget.productName,
        color: source.color,
        size: source.size,
        applicant: generateTarget.creator,
        creator: generateForm.purchaser,
        standardPurchasePrice: standardPrice,
        actualPurchasePrice: draft.unitPrice,
        suggestedPurchaseQty: source.suggestedQty,
        actualPurchaseQty: draft.purchaseQty,
        suggestedTestStore: draft.suggestedTestStore,
        needBom: generateTarget.purchaseType === "做货",
        bomStatus: generateTarget.purchaseType === "做货" ? "未匹配" : undefined,
        remark: draft.remark,
      };
    });
    const totalPurchaseQty = skuItems.reduce((sum, item) => sum + item.actualPurchaseQty, 0);
    const totalAmount = skuItems.reduce((sum, item) => sum + item.actualPurchaseQty * item.actualPurchasePrice, 0);
    const supplier = suppliers.find((item) => item.supplierName === generateForm.supplierName);
    const now = new Date();
    const nowText = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    const order: ProductPurchaseOrder = {
      id: `ppo-generated-${Date.now()}`,
      orderNo,
      purchaseOrderNo: orderNo,
      purchaseType: generateTarget.purchaseType,
      spu: generateTarget.spu,
      productName: generateTarget.productName,
      imageUrl: generateTarget.imageUrl,
      skuCount: skuItems.length,
      totalPurchaseQty,
      totalAmount,
      supplierName: generateForm.supplierName,
      supplierContact: supplier?.contactName ?? "",
      supplierType: generateTarget.purchaseType === "做货" ? "做货供应商" : generateTarget.purchaseType === "成衣" ? "成衣供应商" : "样衣供应商",
      addressType: "线下",
      externalProductId: generateTarget.spu,
      purchaseLink: generateForm.purchaseAddress,
      purchaser: generateForm.purchaser,
      targetWarehouse: generateForm.targetWarehouse,
      expectedArrivalDate: generateForm.expectedArrivalDate,
      isUrgent: generateForm.isUrgent,
      isFirstOrder: generateForm.isFirstOrder,
      isOverQty: "否",
      hasLogistics: "否",
      hasTransferRecord: "否",
      isCombinedOrder: "否",
      region: generateForm.regions.includes("ID") ? "印尼" : "国内",
      productionArea: generateForm.regions.includes("ID") ? "印尼" : "国内",
      afterSaleStatus: "正常",
      needBom: generateTarget.purchaseType === "做货" ? "是" : "否",
      materialStatus: generateTarget.purchaseType === "做货" ? "未生成" : "不需要",
      status: "待采购",
      createdAt: nowText,
      updatedAt: nowText,
      operationLogs: [`由商品采购建议 ${generateTarget.suggestionNo} 生成`],
      systemRemark: generateForm.purchaseBusinessType ? `采购类型：${generateForm.purchaseBusinessType}` : "",
      productRemark: generateTarget.productRemark,
      purchaseRemark: generateForm.purchaseRemark,
      sourceSuggestionNo: generateTarget.suggestionNo,
      purchaseBusinessType: generateForm.purchaseBusinessType || undefined,
      purchaseRegions: generateForm.regions,
      regionPrice: generateForm.regionPrice,
      stockFlow: { purchaseQty: totalPurchaseQty, arrivedQty: 0, outboundQty: 0, inboundQty: 0, waitingOutboundQty: 0 },
      skuItems,
    };
    productPurchaseOrders.unshift(order);
    setRows((current) =>
      current.map((row) =>
        row.id === generateTarget.id
          ? {
              ...row,
              status: "已生成" as const,
              relatedPurchaseOrderNo: orderNo,
              updatedAt: nowText,
              skuItems: row.skuItems.map((item) => ({
                ...item,
                status: selectedDrafts.some((draft) => draft.sku === item.sku) ? "已生成" as const : item.status,
              })),
            }
          : row,
      ),
    );
    setGenerateTarget(null);
    setGenerateForm(null);
    showToast(`商品采购单 ${orderNo} 已生成`);
  };

  return (
    <div>
      <PageHeader title="商品采购建议" desc="采购建议按 SKU 计算，SPU 仅汇总展示折前需求缺口与折后建议采购数量。" />

      <SearchBar>
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <select className="h-8 rounded border px-2 text-sm" value={filters.area} onChange={(event) => updateFilter("area", event.target.value)}>
              {["全部区域", "印尼", "中国"].map((item) => <option key={item}>{item}</option>)}
            </select>
            <select className="h-8 rounded border px-2 text-sm" value={filters.purchaseType} onChange={(event) => updateFilter("purchaseType", event.target.value)}>
              {["全部", "做货", "成衣", "样衣"].map((item) => <option key={item}>{item}</option>)}
            </select>
            <select className="h-8 rounded border px-2 text-sm" value={filters.isProduction} onChange={(event) => updateFilter("isProduction", event.target.value)}>
              {["全部", "是", "否"].map((item) => <option key={item}>{item}</option>)}
            </select>
            <input className="h-8 w-48 rounded border px-2 text-sm" value={filters.keyword} onChange={(event) => updateFilter("keyword", event.target.value)} placeholder="SPU / SKU / 商品名称" />
            <button className="h-8 rounded bg-brand px-3 text-sm text-white">查询</button>
            <button className="h-8 rounded border px-3 text-sm" onClick={() => { setFilters(initialFilters); setSelected([]); }}>清除</button>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <input className="h-8 w-40 rounded border px-2" value={filters.mainSku} onChange={(event) => updateFilter("mainSku", event.target.value)} placeholder="主SKU" />
            <input className="h-8 w-24 rounded border px-2" type="number" value={filters.minQty} onChange={(event) => updateFilter("minQty", event.target.value)} placeholder="最小数量" />
            <input className="h-8 w-24 rounded border px-2" type="number" value={filters.maxQty} onChange={(event) => updateFilter("maxQty", event.target.value)} placeholder="最大数量" />
            <select className="h-8 rounded border px-2" value={filters.firstOrder} onChange={(event) => updateFilter("firstOrder", event.target.value)}>
              {["全部", "是", "否"].map((item) => <option key={item}>{item}</option>)}
            </select>
            <select className="h-8 rounded border px-2" value={filters.remark} onChange={(event) => updateFilter("remark", event.target.value)}>
              {["全部", "有备注", "无备注"].map((item) => <option key={item}>{item}</option>)}
            </select>
            <button className="h-8 rounded border px-3 text-sm" onClick={() => showToast("导出SKU商品功能已预留")}>导出SKU商品</button>
            <button className="h-8 rounded border px-3 text-sm" onClick={() => showToast("导出SPU商品功能已预留")}>导出SPU商品</button>
            <button className="h-8 rounded bg-brand px-3 text-sm text-white" onClick={() => handleGenerate()}>生成采购单</button>
          </div>
        </div>
      </SearchBar>

      <div className="mb-3 grid grid-cols-2 gap-2 md:grid-cols-4 xl:grid-cols-8">
        {[
          ["SPU数", stats.spuCount],
          ["SKU数", stats.skuCount],
          ["COD与非COD已支付件数", stats.totalPaidQty],
          ["总KOL申请", stats.kolApplicationQty],
          ["总采购中", stats.purchasingQty],
          ["总实时库存", stats.realTimeStockQty],
          ["总折前需求缺口", stats.rawGapQty],
          ["总折后建议采购", stats.suggestedQty],
        ].map(([label, value]) => (
          <div key={label} className="rounded border border-gray-200 bg-white px-3 py-2">
            <div className="text-xs text-gray-500">{label}</div>
            <div className="mt-1 text-base font-semibold text-gray-900">{value}</div>
          </div>
        ))}
      </div>

      <div className="overflow-x-auto rounded border border-gray-200 bg-white">
        <table className="min-w-[1620px] text-left text-[13px]">
          <thead className="bg-gray-50">
            <tr>
              {["", "商品图片", "SPU / 款号", "商品名称", "SKU数量", "COD与非COD已支付件数", "SPU待发货数量", "SPU KOL申请数量", "SPU实时库存总数"].map((header) => (
                <th key={header} rowSpan={2} className="border-b border-r border-gray-200 px-3 py-2.5 text-center font-medium text-gray-700 last:border-r-0">{header}</th>
              ))}
              <th colSpan={2} className="border-b border-r border-gray-200 bg-blue-50 px-3 py-2.5 text-center font-medium text-brand">采购中数量</th>
              {["SPU折前需求缺口", "SPU折后建议采购", "更新时间", "操作"].map((header) => (
                <th key={header} rowSpan={2} className="border-b border-r border-gray-200 px-3 py-2.5 text-center font-medium text-gray-700 last:border-r-0">{header}</th>
              ))}
            </tr>
            <tr>
              <th className="min-w-32 border-b border-r border-gray-200 bg-blue-50/70 px-3 py-2 text-center font-medium text-gray-700">采购下单中数量</th>
              <th className="min-w-40 border-b border-r border-gray-200 bg-blue-50/70 px-3 py-2 text-center font-medium text-gray-700">采购头程运输中数量</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((row) => (
              <Fragment key={row.id}>
                <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-3 py-2.5"><input type="checkbox" checked={selected.includes(row.id)} onChange={() => toggleSelect(row.id)} /></td>
                  <td className="px-3 py-2.5"><ProductImage imageUrl={row.imageUrl} name={row.productName} /></td>
                  <td className="px-3 py-2.5"><button className="text-brand" onClick={() => setDetail(row)}>{row.spu}</button></td>
                  <td className="px-3 py-2.5 text-gray-800">{row.productName}</td>
                  <td className="px-3 py-2.5">{row.skuCount}</td>
                  <td className="px-3 py-2.5 font-medium">{row.totalPaidQty ?? row.codPaidQty + row.nonCodPaidQty}</td>
                  <td className="px-3 py-2.5">{row.pendingDeliveryQty}</td>
                  <td className="px-3 py-2.5">{row.skuItems.reduce((sum, item) => sum + (item.kolApplicationQty ?? 0), 0)}</td>
                  <td className="px-3 py-2.5">{row.stockQty}</td>
                  <td className="bg-blue-50/20 px-3 py-2.5 text-center">{Math.trunc(row.spuPurchaseOrderQty ?? 0)}</td>
                  <td className="bg-blue-50/20 px-3 py-2.5 text-center">{Math.trunc(row.spuHeadLogisticsQty ?? 0)}</td>
                  <td className="px-3 py-2.5">{row.rawGapQty ?? 0}</td>
                  <td className="px-3 py-2.5 font-semibold text-red-600">{row.suggestedQty}</td>
                  <td className="whitespace-nowrap px-3 py-2.5 text-gray-600">{row.updatedAt || "-"}</td>
                  <td className="px-3 py-2.5">
                    <div className="space-x-2 whitespace-nowrap text-xs">
                      <button className="text-brand" onClick={() => toggleExpand(row.id)}>查看SKU</button>
                      {row.needProduction && row.status === "待生成" && <button className="text-green-600" onClick={() => handleGenerate(row)}>生成商品采购单</button>}
                      <button className={row.needProduction ? "text-red-600" : "text-green-600"} onClick={() => toggleNeedProduction(row)}>
                        {row.needProduction ? "设置不需要做货" : "恢复需要做货"}
                      </button>
                      {row.relatedPurchaseOrderNo && <button className="text-brand" onClick={() => showToast(`关联采购单：${row.relatedPurchaseOrderNo}`)}>查看采购单</button>}
                    </div>
                  </td>
                </tr>
                {expanded.includes(row.id) && (
                  <tr className="border-b border-gray-100 bg-blue-50/40">
                    <td colSpan={15} className="px-12 py-3">
                      <SkuSuggestionTable items={row.skuItems} fallbackImage={row.imageUrl} productName={row.productName} />
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
            {filteredRows.length === 0 && <tr><td colSpan={15} className="p-8 text-center text-gray-400">暂无数据</td></tr>}
          </tbody>
        </table>
      </div>

      <DesignLogicCard sections={[
        { title: "页面定位", headers: ["项目", "说明"], rows: [["页面名称", "商品采购建议"], ["所属模块", "采购建议"], ["计算维度", "采购建议必须按SKU计算，SPU仅做SKU汇总展示"], ["上游来源", "待发货数量、KOL申请数量、采购下单中数量、采购头程运输中数量、实时库存数量"], ["下游去向", "商品采购单"]] },
        { title: "核心业务规则", headers: ["业务场景", "核心规则", "结果"], rows: [["采购中数量拆分", "总采购中数量 = 采购下单中数量 + 采购头程运输中数量；两部分互斥", "主表与SKU表按二级表头分别展示"], ["SKU折前需求缺口", "skuRawGapQty = Math.max(0, 待发货数量 + KOL申请数量 - 总采购中数量 - 实时库存数量)", "展示未乘0.7前的缺口"], ["SKU折后建议采购", "skuSuggestedPurchaseQty = Math.ceil(skuRawGapQty × 0.7)", "作为默认生成商品采购单数量"], ["SPU折前汇总", "SPU折前需求缺口 = 所属SKU折前需求缺口之和", "仅汇总，不直接计算SPU缺口"], ["SPU折后汇总", "SPU折后建议采购 = 所属SKU折后建议采购之和", "作为SPU层级展示值"], ["更新时间", "采购建议重新计算、KOL数量变化或人工操作成功时更新updatedAt", "格式YYYY-MM-DD HH:mm，空值显示-"], ["是否需要做货", "needProduction 为 false 时保留SPU数据，但排除在需要做货范围外", "不默认生成商品采购单，可随时恢复"], ["支付件数", "COD与非COD已支付件数 = COD已支付件数 + 非COD已支付件数", "SKU展示合计，SPU汇总所属SKU合计"], ["主列表精简", "不展示转运中、瑕疵品、最后入库、最后出库和状态", "保留采购建议核心字段"]] },
        { title: "按钮交互规则", headers: ["按钮", "出现位置", "点击后动作", "是否改变数据"], rows: [["查询", "查询区", "按筛选条件刷新列表", "否"], ["清除", "查询区", "清空筛选条件，恢复全部列表", "否"], ["导出SKU商品", "查询区", "展示预留提示", "否"], ["导出SPU商品", "查询区", "展示预留提示", "否"], ["查看SKU", "表格操作列", "展开SKU明细", "否"], ["设置不需要做货", "SPU操作列", "将needProduction设为false并更新updatedAt", "是"], ["恢复需要做货", "SPU操作列", "将needProduction设为true并更新updatedAt", "是"], ["生成采购单", "查询区/操作列", "仅needProduction为true时打开生成商品采购单弹窗", "否"], ["确认生成", "弹窗底部", "生成商品采购单、回写关联单号并更新updatedAt", "是"]] },
        { title: "生成商品采购单规则", headers: ["场景", "处理规则", "数据结果"], rows: [["默认带入", "供应商取商品默认供应商，区域默认ID，区域价格默认0，采购专员默认张三，仓库默认印尼可用采购仓", "减少重复录入"], ["采购类型", "Radio非必填，默认不选；可选爆款（70%）或热销（60%）", "不选择也允许生成采购单"], ["建议采购数量", "SKU折后建议采购始终读取商品采购建议已计算结果并保持只读", "切换采购类型时不变化"], ["本次采购数量", "未选类型时等于SKU折后建议采购；爆款按×0.7、热销按×0.6并向上取整", "用户可手动修改；切换类型时按所选系数刷新"], ["重置采购类型", "清空采购类型，并将本次采购数量恢复为SKU折后建议采购", "不影响建议采购数量、价格和其他输入"], ["SKU金额", "金额=本次采购数量×价格", "随数量和价格实时更新"], ["数据带入", "带入SPU、商品、供应商、仓库、区域、可选采购类型、价格、金额、采购备注及所选SKU明细", "商品采购单数据源新增待采购订单"]] },
        { title: "状态流转规则", headers: ["当前状态", "触发动作", "目标状态", "说明"], rows: [["待生成", "确认生成商品采购单", "已生成", "生成GP编号"], ["无需采购", "建议数量小于等于0", "无需采购", "不建议生成采购单"], ["异常", "数据缺失或计算异常", "异常", "进入人工处理"]] },
        { title: "查询筛选规则", headers: ["筛选项", "匹配字段", "匹配方式", "说明"], rows: [["区域", "area", "精确匹配", "全部区域不参与筛选"], ["采购类型", "purchaseType", "精确匹配", "做货/成衣/样衣"], ["是否做货", "needProduction", "布尔匹配", "是仅显示需要做货，否仅显示不需要做货"], ["主SKU", "mainSku", "模糊匹配", "支持输入部分SKU"], ["关键词", "SPU、SKU、商品名称", "模糊匹配", "覆盖主表和SKU明细"], ["折后建议采购数量", "suggestedQty", "区间匹配", "不提供状态及入出库时间筛选"]] },
        { title: "异常与边界规则", headers: ["场景", "处理规则"], rows: [["无图片", "显示灰色无图占位"], ["未勾选生成", "提示先勾选商品"], ["不需要做货SPU", "保留数据和计算结果，隐藏行内生成入口；批量生成时提示不可生成"], ["已生成商品", "不重复生成采购单"], ["查询无结果", "展示空状态"], ["字段较多", "表格横向滚动"]] },
        { title: "开发注意事项", headers: ["注意事项", "要求"], rows: [["修改范围", "仅商品采购建议页面"], ["图片字段", "不能删除、隐藏或只显示URL"], ["基础资料", "不修改供应商、物料、仓库、单位"], ["页面风格", "保持蓝白灰企业后台风格"], ["数据方式", "使用mock数据和React state"]] },
      ]} />

      <DetailModal open={!!detail} title="商品采购建议详情" onClose={() => setDetail(null)}>
        {detail && (
          <div className="space-y-4 text-sm">
            <div className="flex gap-4">
              <ProductImage imageUrl={detail.imageUrl} name={detail.productName} size="lg" />
              <div className="grid flex-1 grid-cols-2 gap-3">
                <div><span className="text-gray-500">SPU / 款号：</span>{detail.spu}</div>
                <div><span className="text-gray-500">主SKU：</span>{detail.mainSku}</div>
                <div><span className="text-gray-500">商品名称：</span>{detail.productName}</div>
                <div><span className="text-gray-500">采购类型：</span>{detail.purchaseType}</div>
                <div><span className="text-gray-500">区域：</span>{detail.area}</div>
                <div><span className="text-gray-500">SPU折前缺口：</span>{detail.rawGapQty ?? 0}</div>
                <div><span className="text-gray-500">SPU折后建议：</span>{detail.suggestedQty}</div>
                <div><span className="text-gray-500">商品备注：</span>{detail.productRemark || "-"}</div>
              </div>
            </div>
            <SkuSuggestionTable items={detail.skuItems} fallbackImage={detail.imageUrl} productName={detail.productName} />
          </div>
        )}
      </DetailModal>

      <PurchaseOrderModal open={!!generateTarget && !!generateForm} title="生成商品采购单" onClose={closeGenerateForm}>
        {generateTarget && generateForm && (() => {
          const catalog = productCatalogSpus.find((item) => item.spu === generateTarget.spu);
          const selectedDrafts = generateForm.skuDrafts.filter((item) => item.selected);
          const selectedPurchaseQty = selectedDrafts.reduce((sum, item) => sum + item.purchaseQty, 0);
          const averageCost = catalog?.skuItems.length
            ? catalog.skuItems.reduce((sum, item) => sum + item.standardPurchasePrice, 0) / catalog.skuItems.length
            : 0;
          return (
            <>
              <div className="flex-1 space-y-4 overflow-y-auto bg-gray-50 p-5 text-sm">
                <section className="rounded border border-gray-200 bg-white p-4">
                  <div className="mb-3 text-sm font-semibold text-gray-900">商品信息</div>
                  <div className="flex gap-4">
                    <ProductImage imageUrl={generateTarget.imageUrl} name={generateTarget.productName} size="lg" />
                    <div className="grid flex-1 grid-cols-2 gap-x-8 gap-y-3 md:grid-cols-3">
                      {[
                        ["SPU / 款号", generateTarget.spu],
                        ["商品名称", generateTarget.productName],
                        ["选品人", generateTarget.creator || "-"],
                        ["参考成本价", averageCost ? `¥${averageCost.toFixed(2)}` : "-"],
                        ["SKU数量", generateTarget.skuCount],
                        ["SKU折后建议采购总数", generateTarget.suggestedQty],
                      ].map(([label, value]) => (
                        <div key={label}>
                          <div className="text-xs text-gray-500">{label}</div>
                          <div className="mt-1 font-medium text-gray-900">{value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>

                <section className="rounded border border-gray-200 bg-white p-4">
                  <div className="mb-3 text-sm font-semibold text-gray-900">采购基础信息</div>
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                    <FormField label="采购供应商名称" required>
                      <select className="h-9 w-full rounded border border-gray-300 px-2" value={generateForm.supplierName} onChange={(event) => updateGenerateForm("supplierName", event.target.value)}>
                        {supplierOptions.map((item) => <option key={item}>{item}</option>)}
                      </select>
                    </FormField>
                    <FormField label="采购地址">
                      <input className="h-9 w-full rounded border border-gray-300 px-2" value={generateForm.purchaseAddress} onChange={(event) => updateGenerateForm("purchaseAddress", event.target.value)} placeholder="采购链接或线下地址" />
                    </FormField>
                    <FormField label="区域" required>
                      <div className="flex h-9 items-center gap-4 rounded border border-gray-300 px-3">
                        {regionOptions.map((region) => (
                          <label key={region} className="flex items-center gap-1.5">
                            <input type="checkbox" checked={generateForm.regions.includes(region)} onChange={() => updateGenerateForm("regions", generateForm.regions.includes(region) ? generateForm.regions.filter((item) => item !== region) : [...generateForm.regions, region])} />
                            {region}
                          </label>
                        ))}
                      </div>
                    </FormField>
                    <FormField label="区域价格">
                      <input className="h-9 w-full rounded border border-gray-300 px-2" type="number" min={0} value={generateForm.regionPrice} onChange={(event) => updateGenerateForm("regionPrice", Math.max(0, Number(event.target.value)))} />
                    </FormField>
                    <FormField label="采购专员" required>
                      <select className="h-9 w-full rounded border border-gray-300 px-2" value={generateForm.purchaser} onChange={(event) => updateGenerateForm("purchaser", event.target.value)}>
                        {purchaserOptions.map((item) => <option key={item}>{item}</option>)}
                      </select>
                    </FormField>
                    <FormField label="目标仓库" required>
                      <select className="h-9 w-full rounded border border-gray-300 px-2" value={generateForm.targetWarehouse} onChange={(event) => updateGenerateForm("targetWarehouse", event.target.value)}>
                        {enabledWarehouses.map((item) => <option key={item.id}>{item.warehouseName}</option>)}
                      </select>
                    </FormField>
                    <FormField label="预计到货时间">
                      <input className="h-9 w-full rounded border border-gray-300 px-2" type="date" value={generateForm.expectedArrivalDate} onChange={(event) => updateGenerateForm("expectedArrivalDate", event.target.value)} />
                    </FormField>
                    <FormField label="是否加急">
                      <select className="h-9 w-full rounded border border-gray-300 px-2" value={generateForm.isUrgent} onChange={(event) => updateGenerateForm("isUrgent", event.target.value as "是" | "否")}>
                        <option>否</option><option>是</option>
                      </select>
                    </FormField>
                    <FormField label="是否首单">
                      <select className="h-9 w-full rounded border border-gray-300 px-2" value={generateForm.isFirstOrder} onChange={(event) => updateGenerateForm("isFirstOrder", event.target.value as "是" | "否")}>
                        <option>否</option><option>是</option>
                      </select>
                    </FormField>
                  </div>
                </section>

                <section className="rounded border border-gray-200 bg-white p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="text-sm font-semibold text-gray-900">采购类型</div>
                    <div className="text-xs text-gray-500">切换类型仅刷新本次采购数量，SKU折后建议采购保持不变</div>
                  </div>
                  <div className="flex items-center gap-3">
                    {(["爆款", "热销"] as const).map((type) => (
                      <label key={type} className={`flex cursor-pointer items-center gap-2 rounded border px-4 py-2 ${generateForm.purchaseBusinessType === type ? "border-brand bg-blue-50 text-brand" : "border-gray-200"}`}>
                        <input type="radio" name="purchaseBusinessType" checked={generateForm.purchaseBusinessType === type} onChange={() => changePurchaseBusinessType(type)} />
                        {type === "爆款" ? "爆款（70%）" : "热销（60%）"}
                      </label>
                    ))}
                    <button
                      className="h-9 rounded border border-gray-300 px-3 text-gray-600 hover:bg-gray-50"
                      onClick={() => changePurchaseBusinessType("")}
                      disabled={!generateForm.purchaseBusinessType}
                    >
                      重置
                    </button>
                  </div>
                </section>

                <section className="rounded border border-gray-200 bg-white">
                  <div className="flex items-center justify-between border-b px-4 py-3">
                    <div>
                      <div className="font-semibold text-gray-900">SKU采购明细</div>
                      <div className="mt-1 text-xs text-gray-500">已选 {selectedDrafts.length} 个 SKU，本次采购合计 {selectedPurchaseQty}</div>
                    </div>
                    <label className="flex items-center gap-2 text-xs text-gray-600">
                      <input
                        type="checkbox"
                        checked={generateForm.skuDrafts.length > 0 && generateForm.skuDrafts.every((item) => item.selected)}
                        onChange={(event) => updateGenerateForm("skuDrafts", generateForm.skuDrafts.map((item) => ({ ...item, selected: event.target.checked })))}
                      />
                      全选
                    </label>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-[1280px] text-left text-xs">
                      <thead className="bg-gray-50 text-gray-600">
                        <tr>
                          {["", "商品图片", "SKU编码", "出货条码", "颜色尺码", "区域", "SKU折后建议采购数量", "本次采购数量", "价格", "金额", "建议测试店铺", "备注"].map((item) => <th key={item} className="border-b px-3 py-2 font-medium">{item}</th>)}
                        </tr>
                      </thead>
                      <tbody>
                        {generateTarget.skuItems.map((item) => {
                          const draft = generateForm.skuDrafts.find((sku) => sku.sku === item.sku)!;
                          return (
                            <tr key={item.sku} className="border-b border-gray-100">
                              <td className="px-3 py-2"><input type="checkbox" checked={draft.selected} onChange={(event) => updateSkuDraft(item.sku, { selected: event.target.checked })} /></td>
                              <td className="px-3 py-2"><ProductImage imageUrl={item.imageUrl ?? generateTarget.imageUrl} name={generateTarget.productName} /></td>
                              <td className="px-3 py-2 font-medium text-gray-900">{item.sku}</td>
                              <td className="px-3 py-2 text-gray-600">OUT-{item.sku.replaceAll("-", "")}</td>
                              <td className="px-3 py-2">{item.color} / {item.size}</td>
                              <td className="px-3 py-2">ID</td>
                              <td className="px-3 py-2 font-semibold text-red-600">{item.suggestedQty}</td>
                              <td className="px-3 py-2"><input className="h-8 w-24 rounded border px-2" type="number" min={0} value={draft.purchaseQty} onChange={(event) => updateSkuDraft(item.sku, { purchaseQty: Math.max(0, Number(event.target.value)) })} /></td>
                              <td className="px-3 py-2"><input className="h-8 w-24 rounded border px-2" type="number" min={0} step="0.01" value={draft.unitPrice} onChange={(event) => updateSkuDraft(item.sku, { unitPrice: Math.max(0, Number(event.target.value)) })} /></td>
                              <td className="px-3 py-2 font-medium text-gray-900">¥{(draft.purchaseQty * draft.unitPrice).toFixed(2)}</td>
                              <td className="px-3 py-2"><input className="h-8 w-32 rounded border px-2" value={draft.suggestedTestStore} onChange={(event) => updateSkuDraft(item.sku, { suggestedTestStore: event.target.value })} placeholder="店铺名称" /></td>
                              <td className="px-3 py-2"><input className="h-8 w-36 rounded border px-2" value={draft.remark} onChange={(event) => updateSkuDraft(item.sku, { remark: event.target.value })} placeholder="SKU备注" /></td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </section>

                <section className="rounded border border-gray-200 bg-white p-4">
                  <FormField label="采购备注">
                    <textarea className="min-h-20 w-full rounded border border-gray-300 p-2" value={generateForm.purchaseRemark} onChange={(event) => updateGenerateForm("purchaseRemark", event.target.value)} placeholder="填写本次采购说明" />
                  </FormField>
                </section>
              </div>
              <div className="flex h-16 shrink-0 items-center justify-between border-t bg-white px-5">
                <div className="text-sm text-gray-600">已选 <span className="font-semibold text-gray-900">{selectedDrafts.length}</span> 个 SKU，采购合计 <span className="font-semibold text-red-600">{selectedPurchaseQty}</span></div>
                <div className="flex gap-2">
                  <button className="h-9 rounded border px-4" onClick={closeGenerateForm}>取消</button>
                  <button className="h-9 rounded bg-brand px-4 text-white" onClick={confirmGenerate}>确认生成商品采购单</button>
                </div>
              </div>
            </>
          );
        })()}
      </PurchaseOrderModal>
      <Toast msg={toast} />
    </div>
  );
}
