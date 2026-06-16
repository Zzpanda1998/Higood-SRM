import { useMemo, useState } from "react";
import DataTable from "../../components/common/DataTable";
import DetailModal from "../../components/common/DetailModal";
import PageHeader from "../../components/common/PageHeader";
import SearchBar from "../../components/common/SearchBar";
import StatusBadge from "../../components/common/StatusBadge";
import Toast from "../../components/common/Toast";

type ProductKind = "garment" | "sample";
type ProductStatus = "启用" | "停用";
type ProductCategory = "成衣" | "样衣";

type ProductSkuRecord = {
  id: string;
  imageUrl: string;
  spu: string;
  sku: string;
  productName: string;
  color: string;
  size: string;
  productCategory: ProductCategory;
  baseUnit: string;
  purchaseUnit: string;
  defaultSupplier: string;
  standardPurchasePrice: number;
  currency: string;
  defaultPurchaseRegion: string;
  defaultPackingUnit: string;
  piecesPerBox: number;
  standardBoxWeight: string;
  standardBoxVolume: string;
  cartonSize: string;
  status: ProductStatus;
  sourceSystem: string;
  createdAt: string;
  updatedAt: string;
  syncedAt: string;
};

type Filters = {
  sku: string;
  spu: string;
  productName: string;
  color: string;
  size: string;
  supplier: string;
  status: string;
  createdFrom: string;
  createdTo: string;
};

const emptyFilters: Filters = {
  sku: "",
  spu: "",
  productName: "",
  color: "",
  size: "",
  supplier: "",
  status: "",
  createdFrom: "",
  createdTo: "",
};

const imagePaths = {
  dress: "/mock/products/hg-hd-2603.svg",
  tee: "/mock/products/hg-ts-2601.svg",
  pants: "/mock/products/hg-pt-2602.svg",
  jacket: "/mock/products/hg-jk-2605.svg",
};

const mockRows: ProductSkuRecord[] = [
  {
    id: "GAR-001",
    imageUrl: imagePaths.dress,
    spu: "DRESS2606001",
    sku: "DRESS2606001-BLUE-M",
    productName: "蓝色碎花连衣裙",
    color: "Blue",
    size: "M",
    productCategory: "成衣",
    baseUnit: "件",
    purchaseUnit: "件",
    defaultSupplier: "广州成衣工厂A",
    standardPurchasePrice: 38.5,
    currency: "CNY",
    defaultPurchaseRegion: "华南",
    defaultPackingUnit: "箱",
    piecesPerBox: 50,
    standardBoxWeight: "12.5 kg",
    standardBoxVolume: "0.18 m³",
    cartonSize: "60*45*40 cm",
    status: "启用",
    sourceSystem: "商品中心",
    createdAt: "2026-06-10 09:20:00",
    updatedAt: "2026-06-15 09:45:00",
    syncedAt: "2026-06-15 10:30:00",
  },
  {
    id: "GAR-002",
    imageUrl: imagePaths.tee,
    spu: "TSHIRT2606002",
    sku: "TSHIRT2606002-WHITE-L",
    productName: "白色基础圆领T恤",
    color: "White",
    size: "L",
    productCategory: "成衣",
    baseUnit: "件",
    purchaseUnit: "件",
    defaultSupplier: "佛山针织成衣厂",
    standardPurchasePrice: 22.8,
    currency: "CNY",
    defaultPurchaseRegion: "华南",
    defaultPackingUnit: "箱",
    piecesPerBox: 80,
    standardBoxWeight: "15 kg",
    standardBoxVolume: "0.16 m³",
    cartonSize: "58*42*36 cm",
    status: "启用",
    sourceSystem: "商品中心",
    createdAt: "2026-06-11 14:05:00",
    updatedAt: "2026-06-15 09:50:00",
    syncedAt: "2026-06-15 10:32:00",
  },
  {
    id: "GAR-003",
    imageUrl: imagePaths.pants,
    spu: "PANTS2606003",
    sku: "PANTS2606003-KHAKI-S",
    productName: "卡其色休闲长裤",
    color: "Khaki",
    size: "S",
    productCategory: "成衣",
    baseUnit: "件",
    purchaseUnit: "件",
    defaultSupplier: "东莞梭织成衣厂",
    standardPurchasePrice: 45,
    currency: "CNY",
    defaultPurchaseRegion: "华南",
    defaultPackingUnit: "箱",
    piecesPerBox: 40,
    standardBoxWeight: "14.2 kg",
    standardBoxVolume: "0.2 m³",
    cartonSize: "62*46*42 cm",
    status: "启用",
    sourceSystem: "商品中心",
    createdAt: "2026-06-12 11:12:00",
    updatedAt: "2026-06-15 09:55:00",
    syncedAt: "2026-06-15 10:35:00",
  },
  {
    id: "GAR-004",
    imageUrl: imagePaths.jacket,
    spu: "JACKET2606004",
    sku: "JACKET2606004-BLACK-M",
    productName: "黑色轻薄夹克",
    color: "Black",
    size: "M",
    productCategory: "成衣",
    baseUnit: "件",
    purchaseUnit: "件",
    defaultSupplier: "杭州外套成衣厂",
    standardPurchasePrice: 72,
    currency: "CNY",
    defaultPurchaseRegion: "华东",
    defaultPackingUnit: "箱",
    piecesPerBox: 30,
    standardBoxWeight: "16.8 kg",
    standardBoxVolume: "0.24 m³",
    cartonSize: "65*48*45 cm",
    status: "停用",
    sourceSystem: "商品中心",
    createdAt: "2026-06-13 16:28:00",
    updatedAt: "2026-06-15 10:05:00",
    syncedAt: "2026-06-15 10:40:00",
  },
  {
    id: "SAM-001",
    imageUrl: imagePaths.dress,
    spu: "SAMPLE2606001",
    sku: "SAMPLE2606001-WHITE-S",
    productName: "白色蕾丝样衣",
    color: "White",
    size: "S",
    productCategory: "样衣",
    baseUnit: "件",
    purchaseUnit: "件",
    defaultSupplier: "样衣开发工厂B",
    standardPurchasePrice: 58,
    currency: "CNY",
    defaultPurchaseRegion: "华南",
    defaultPackingUnit: "箱",
    piecesPerBox: 20,
    standardBoxWeight: "8 kg",
    standardBoxVolume: "0.12 m³",
    cartonSize: "50*40*35 cm",
    status: "启用",
    sourceSystem: "商品中心",
    createdAt: "2026-06-10 10:05:00",
    updatedAt: "2026-06-15 10:20:00",
    syncedAt: "2026-06-15 11:00:00",
  },
  {
    id: "SAM-002",
    imageUrl: imagePaths.tee,
    spu: "SAMPLE2606002",
    sku: "SAMPLE2606002-PINK-M",
    productName: "粉色印花样衣",
    color: "Pink",
    size: "M",
    productCategory: "样衣",
    baseUnit: "件",
    purchaseUnit: "件",
    defaultSupplier: "广州快速打样中心",
    standardPurchasePrice: 49.5,
    currency: "CNY",
    defaultPurchaseRegion: "华南",
    defaultPackingUnit: "箱",
    piecesPerBox: 24,
    standardBoxWeight: "8.6 kg",
    standardBoxVolume: "0.13 m³",
    cartonSize: "52*40*36 cm",
    status: "启用",
    sourceSystem: "商品中心",
    createdAt: "2026-06-11 13:35:00",
    updatedAt: "2026-06-15 10:25:00",
    syncedAt: "2026-06-15 11:05:00",
  },
  {
    id: "SAM-003",
    imageUrl: imagePaths.pants,
    spu: "SAMPLE2606003",
    sku: "SAMPLE2606003-DENIM-L",
    productName: "牛仔水洗样衣",
    color: "Denim",
    size: "L",
    productCategory: "样衣",
    baseUnit: "件",
    purchaseUnit: "件",
    defaultSupplier: "东莞样衣开发室",
    standardPurchasePrice: 66,
    currency: "CNY",
    defaultPurchaseRegion: "华南",
    defaultPackingUnit: "箱",
    piecesPerBox: 18,
    standardBoxWeight: "9.2 kg",
    standardBoxVolume: "0.15 m³",
    cartonSize: "55*42*38 cm",
    status: "启用",
    sourceSystem: "商品中心",
    createdAt: "2026-06-12 15:42:00",
    updatedAt: "2026-06-15 10:30:00",
    syncedAt: "2026-06-15 11:08:00",
  },
  {
    id: "SAM-004",
    imageUrl: imagePaths.jacket,
    spu: "SAMPLE2606004",
    sku: "SAMPLE2606004-GREEN-M",
    productName: "绿色机能夹克样衣",
    color: "Green",
    size: "M",
    productCategory: "样衣",
    baseUnit: "件",
    purchaseUnit: "件",
    defaultSupplier: "杭州样衣工作室",
    standardPurchasePrice: 89,
    currency: "CNY",
    defaultPurchaseRegion: "华东",
    defaultPackingUnit: "箱",
    piecesPerBox: 16,
    standardBoxWeight: "10.5 kg",
    standardBoxVolume: "0.18 m³",
    cartonSize: "58*44*40 cm",
    status: "停用",
    sourceSystem: "商品中心",
    createdAt: "2026-06-13 17:18:00",
    updatedAt: "2026-06-15 10:38:00",
    syncedAt: "2026-06-15 11:10:00",
  },
];

const pageConfig = {
  garment: {
    title: "成衣列表",
    description: "展示由商品中心同步过来的成衣商品资料，仅用于查看成衣基础信息和采购相关参考信息。",
    category: "成衣" as ProductCategory,
    skuLabel: "成衣SKU",
    detailTitle: "查看成衣信息",
    logicRows: [
      ["数据来源", "成衣数据由商品中心同步"],
      ["数据范围", "只展示商品分类为成衣的数据"],
      ["是否允许新增", "不允许"],
      ["是否允许编辑", "不允许"],
      ["是否允许删除", "不允许"],
      ["PMS用途", "用于采购单选择、供应商供货档案关联、包装规则参考"],
    ],
  },
  sample: {
    title: "样衣列表",
    description: "展示由商品中心同步过来的样衣资料，仅用于查看样衣基础信息和采购参考信息。",
    category: "样衣" as ProductCategory,
    skuLabel: "样衣SKU",
    detailTitle: "查看样衣信息",
    logicRows: [
      ["数据来源", "样衣数据由商品中心同步"],
      ["数据范围", "只展示商品分类为样衣的数据"],
      ["是否允许新增", "不允许"],
      ["是否允许编辑", "不允许"],
      ["是否允许删除", "不允许"],
      ["PMS用途", "用于样衣采购、KOL采购需求、供应商供货档案关联"],
    ],
  },
};

const includes = (value: string, keyword: string) => value.toLowerCase().includes(keyword.trim().toLowerCase());

const inDateRange = (value: string, from: string, to: string) => {
  const date = value.slice(0, 10);
  return (!from || date >= from) && (!to || date <= to);
};

const money = (row: ProductSkuRecord) => `${row.currency} ${row.standardPurchasePrice.toFixed(2)}`;

export default function ProductSkuListPage({ kind }: { kind: ProductKind }) {
  const config = pageConfig[kind];
  const [draftFilters, setDraftFilters] = useState<Filters>(emptyFilters);
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [detail, setDetail] = useState<ProductSkuRecord | null>(null);
  const [toast, setToast] = useState("");

  const rows = useMemo(() => mockRows.filter((row) => row.productCategory === config.category), [config.category]);
  const filtered = useMemo(
    () =>
      rows.filter((row) => {
        const hitSku = !filters.sku || includes(row.sku, filters.sku);
        const hitSpu = !filters.spu || includes(row.spu, filters.spu);
        const hitName = !filters.productName || includes(row.productName, filters.productName);
        const hitColor = !filters.color || includes(row.color, filters.color);
        const hitSize = !filters.size || includes(row.size, filters.size);
        const hitSupplier = !filters.supplier || includes(row.defaultSupplier, filters.supplier);
        const hitStatus = !filters.status || row.status === filters.status;
        const hitCreatedAt = inDateRange(row.createdAt, filters.createdFrom, filters.createdTo);
        return hitSku && hitSpu && hitName && hitColor && hitSize && hitSupplier && hitStatus && hitCreatedAt;
      }),
    [filters, rows],
  );

  const setFilterValue = (key: keyof Filters, value: string) => {
    setDraftFilters((current) => ({ ...current, [key]: value }));
  };

  const resetFilters = () => {
    setDraftFilters(emptyFilters);
    setFilters(emptyFilters);
  };

  const exportRows = () => {
    const headers = ["商品图片", "SPU", config.skuLabel, "商品名称", "颜色", "尺码", "商品分类", "基础单位", "默认采购单位", "默认供应商", "标准采购价", "状态", "创建时间", "更新时间"];
    const csvRows = filtered.map((row) =>
      [
        row.imageUrl,
        row.spu,
        row.sku,
        row.productName,
        row.color,
        row.size,
        row.productCategory,
        row.baseUnit,
        row.purchaseUnit,
        row.defaultSupplier,
        row.standardPurchasePrice,
        row.status,
        row.createdAt,
        row.updatedAt,
      ]
        .map((value) => `"${String(value).replace(/"/g, '""')}"`)
        .join(","),
    );
    const blob = new Blob([`\uFEFF${headers.join(",")}\n${csvRows.join("\n")}`], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${config.title}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    setToast(`${config.title}已导出 ${filtered.length} 条数据`);
    setTimeout(() => setToast(""), 2200);
  };

  return (
    <div>
      <PageHeader title={config.title} desc={config.description} />

      <SearchBar>
        <div className="grid grid-cols-1 gap-2 xl:grid-cols-[repeat(8,minmax(0,1fr))_auto]">
          <input className="h-8 rounded border px-2 text-sm" value={draftFilters.sku} onChange={(event) => setFilterValue("sku", event.target.value)} placeholder={config.skuLabel} />
          <input className="h-8 rounded border px-2 text-sm" value={draftFilters.spu} onChange={(event) => setFilterValue("spu", event.target.value)} placeholder="SPU" />
          <input className="h-8 rounded border px-2 text-sm" value={draftFilters.productName} onChange={(event) => setFilterValue("productName", event.target.value)} placeholder="商品名称" />
          <input className="h-8 rounded border px-2 text-sm" value={draftFilters.color} onChange={(event) => setFilterValue("color", event.target.value)} placeholder="颜色" />
          <input className="h-8 rounded border px-2 text-sm" value={draftFilters.size} onChange={(event) => setFilterValue("size", event.target.value)} placeholder="尺码" />
          <input className="h-8 rounded border px-2 text-sm" value={draftFilters.supplier} onChange={(event) => setFilterValue("supplier", event.target.value)} placeholder="默认供应商" />
          <select className="h-8 rounded border px-2 text-sm" value={draftFilters.status} onChange={(event) => setFilterValue("status", event.target.value)}>
            <option value="">全部状态</option>
            <option>启用</option>
            <option>停用</option>
          </select>
          <div className="flex min-w-[230px] items-center gap-1">
            <input className="h-8 min-w-0 rounded border px-2 text-sm" type="date" value={draftFilters.createdFrom} onChange={(event) => setFilterValue("createdFrom", event.target.value)} />
            <span className="text-xs text-gray-400">至</span>
            <input className="h-8 min-w-0 rounded border px-2 text-sm" type="date" value={draftFilters.createdTo} onChange={(event) => setFilterValue("createdTo", event.target.value)} />
          </div>
          <div className="flex items-center gap-2">
            <button className="h-8 rounded bg-brand px-3 text-sm text-white" onClick={() => setFilters(draftFilters)}>查询</button>
            <button className="h-8 rounded border border-gray-300 px-3 text-sm text-gray-700" onClick={resetFilters}>重置</button>
            <button className="h-8 rounded border border-blue-300 px-3 text-sm text-brand" onClick={exportRows}>导出</button>
          </div>
        </div>
      </SearchBar>

      <DataTable
        columns={[
          { key: "imageUrl", title: "商品图片", render: (row: ProductSkuRecord) => <ProductImage row={row} /> },
          { key: "spu", title: "SPU" },
          { key: "sku", title: config.skuLabel, render: (row: ProductSkuRecord) => <button className="text-blue-600 hover:text-blue-700" onClick={() => setDetail(row)}>{row.sku}</button> },
          { key: "productName", title: "商品名称" },
          { key: "color", title: "颜色" },
          { key: "size", title: "尺码" },
          { key: "productCategory", title: "商品分类" },
          { key: "baseUnit", title: "基础单位" },
          { key: "purchaseUnit", title: "默认采购单位" },
          { key: "defaultSupplier", title: "默认供应商" },
          { key: "standardPurchasePrice", title: "标准采购价", render: (row: ProductSkuRecord) => money(row) },
          { key: "status", title: "状态", render: (row: ProductSkuRecord) => <StatusBadge status={row.status} /> },
          { key: "createdAt", title: "创建时间" },
          { key: "updatedAt", title: "更新时间" },
          { key: "op", title: "操作", render: (row: ProductSkuRecord) => <button className="text-blue-600 hover:text-blue-700" onClick={() => setDetail(row)}>查看</button> },
        ]}
        rows={filtered}
      />

      <div className="mt-3 flex items-center justify-between rounded border border-gray-200 bg-white px-3 py-2 text-xs text-gray-500">
        <span>共 {filtered.length} 条，每页 20 条</span>
        <span>第 1 / 1 页</span>
      </div>

      <BusinessLogic rows={config.logicRows} />

      <DetailModal open={!!detail} onClose={() => setDetail(null)} title={config.detailTitle} widthClass="w-[min(1040px,calc(100vw-32px))]">
        {detail && (
          <div className="space-y-3 text-sm">
            <DetailSection
              title="一、基础信息"
              image={detail}
              pairs={[
                ["SPU", detail.spu],
                [config.skuLabel, detail.sku],
                ["商品名称", detail.productName],
                ["商品分类", detail.productCategory],
                ["颜色", detail.color],
                ["尺码", detail.size],
                ["状态", detail.status],
              ]}
            />
            <DetailSection
              title="二、采购参考信息"
              pairs={[
                ["基础单位", detail.baseUnit],
                ["默认采购单位", detail.purchaseUnit],
                ["默认供应商", detail.defaultSupplier],
                ["标准采购价", money(detail)],
                ["币种", detail.currency],
                ["默认采购区域", detail.defaultPurchaseRegion],
              ]}
            />
            <DetailSection
              title="三、包装参考信息"
              pairs={[
                ["默认包装单位", detail.defaultPackingUnit],
                ["每箱件数", `${detail.piecesPerBox}`],
                ["标准单箱重量", detail.standardBoxWeight],
                ["标准单箱体积", detail.standardBoxVolume],
                ["箱规尺寸", detail.cartonSize],
              ]}
            />
            <DetailSection
              title="四、系统信息"
              pairs={[
                ["来源系统", detail.sourceSystem],
                ["创建时间", detail.createdAt],
                ["更新时间", detail.updatedAt],
                ["同步时间", detail.syncedAt],
              ]}
            />
            <div className="flex justify-end">
              <button className="rounded border border-gray-300 px-4 py-1.5 text-sm text-gray-700" onClick={() => setDetail(null)}>关闭</button>
            </div>
          </div>
        )}
      </DetailModal>

      <Toast msg={toast} />
    </div>
  );
}

function ProductImage({ row }: { row: ProductSkuRecord }) {
  return (
    <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded border border-gray-200 bg-slate-50">
      <img src={row.imageUrl} alt={row.productName} className="h-full w-full object-cover" />
    </div>
  );
}

function DetailSection({ title, pairs, image }: { title: string; pairs: [string, string][]; image?: ProductSkuRecord }) {
  return (
    <section className="rounded-lg border border-gray-200 bg-white p-3">
      <div className="mb-3 font-medium text-gray-900">{title}</div>
      <div className="grid grid-cols-2 gap-x-6 gap-y-2">
        {image && (
          <div className="col-span-2 flex items-center gap-3">
            <span className="w-24 shrink-0 text-gray-500">商品图片</span>
            <ProductImage row={image} />
          </div>
        )}
        {pairs.map(([label, value]) => (
          <div key={`${title}-${label}`} className="flex min-w-0">
            <span className="w-24 shrink-0 text-gray-500">{label}</span>
            <span className="min-w-0 break-words text-gray-800">{value}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function BusinessLogic({ rows }: { rows: string[][] }) {
  return (
    <section className="mt-3 rounded border border-gray-200 bg-white p-4">
      <h3 className="mb-3 font-semibold text-gray-900">业务逻辑说明</h3>
      <div className="overflow-x-auto rounded border border-gray-200">
        <table className="min-w-full text-left text-xs">
          <thead className="bg-gray-50">
            <tr>
              <th className="border-b border-gray-200 px-3 py-2 font-medium text-gray-700">规则</th>
              <th className="border-b border-gray-200 px-3 py-2 font-medium text-gray-700">说明</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(([rule, description]) => (
              <tr key={rule} className="border-b border-gray-100 last:border-b-0">
                <td className="w-44 px-3 py-2 text-gray-700">{rule}</td>
                <td className="px-3 py-2 text-gray-700">{description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
