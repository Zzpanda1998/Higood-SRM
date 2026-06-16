import { useMemo, useState } from "react";
import { Calculator, Copy, Download, Edit, Eye, FileText, Plus, Search, Upload } from "lucide-react";
import DataTable from "../../components/common/DataTable";
import FormModal from "../../components/common/FormModal";
import PageHeader from "../../components/common/PageHeader";
import Toast from "../../components/common/Toast";

type Category = "面料" | "辅料" | "包材" | "耗材" | "纱线" | "成衣" | "样衣";
type Archive = {
  id: string;
  supplier: string;
  supplierCode: string;
  sku: string;
  name: string;
  category: Category;
  spu: string;
  region: string;
  baseUnit: string;
  purchaseUnit: string;
  packageUnit: string;
  boxUnit: string;
  price: number;
  currency: string;
  moq: number;
  leadDays: number;
  packagingMethod: string;
  basePerPackage: number;
  packagesPerBox: number;
  packageWeight: number;
  packageVolume: number;
  boxWeight: number;
  boxVolume: number;
  boxLength: number;
  boxWidth: number;
  boxHeight: number;
  allowIrregular: boolean;
  logisticsProvider: string;
  shippingMethod: string;
  shipAddress: string;
  receiveWarehouse: string;
  directOverseas: boolean;
  firstLegCarrier: string;
  firstLegChannel: string;
  isDefault: boolean;
  qcRequired: boolean;
  buyer: string;
  status: "启用" | "停用";
  updatedAt: string;
  remark: string;
};

const archives: Archive[] = [
  {
    id: "SSA-001",
    supplier: "广州华盛面料",
    supplierCode: "SUP-FAB-GZ01",
    sku: "FAB-001",
    name: "180g纯棉针织布",
    category: "面料",
    spu: "FAB-COTTON-180",
    region: "CN",
    baseUnit: "米",
    purchaseUnit: "米",
    packageUnit: "卷",
    boxUnit: "箱",
    price: 8.5,
    currency: "RMB",
    moq: 300,
    leadDays: 7,
    packagingMethod: "卷装",
    basePerPackage: 50,
    packagesPerBox: 5,
    packageWeight: 2,
    packageVolume: 0.06,
    boxWeight: 10,
    boxVolume: 0.3,
    boxLength: 80,
    boxWidth: 45,
    boxHeight: 35,
    allowIrregular: true,
    logisticsProvider: "顺丰",
    shippingMethod: "快递",
    shipAddress: "广州市番禺区华盛纺织园",
    receiveWarehouse: "国内中转仓",
    directOverseas: false,
    firstLegCarrier: "海派优选",
    firstLegChannel: "广州海派印尼线",
    isDefault: true,
    qcRequired: true,
    buyer: "王采购",
    status: "启用",
    updatedAt: "2026-06-15 10:20",
    remark: "常规卷长 50 米，允许尾卷不足整卷。",
  },
  {
    id: "SSA-002",
    supplier: "义乌小料供应商",
    supplierCode: "SUP-ACC-YW01",
    sku: "ACC-001",
    name: "白色纽扣",
    category: "辅料",
    spu: "ACC-BTN-WHITE",
    region: "CN",
    baseUnit: "个",
    purchaseUnit: "个",
    packageUnit: "包",
    boxUnit: "箱",
    price: 0.08,
    currency: "RMB",
    moq: 5000,
    leadDays: 5,
    packagingMethod: "包装",
    basePerPackage: 100,
    packagesPerBox: 20,
    packageWeight: 0.18,
    packageVolume: 0.01,
    boxWeight: 3.6,
    boxVolume: 0.16,
    boxLength: 45,
    boxWidth: 35,
    boxHeight: 25,
    allowIrregular: false,
    logisticsProvider: "中通",
    shippingMethod: "快递",
    shipAddress: "义乌国际商贸城三区",
    receiveWarehouse: "国内中转仓",
    directOverseas: false,
    firstLegCarrier: "空运快线",
    firstLegChannel: "义乌空运雅加达线",
    isDefault: true,
    qcRequired: false,
    buyer: "李采购",
    status: "启用",
    updatedAt: "2026-06-14 16:45",
    remark: "按包报价，箱规固定。",
  },
  {
    id: "SSA-003",
    supplier: "广州成衣工厂A",
    supplierCode: "SUP-GMT-GZ01",
    sku: "DRESS-BLUE-M",
    name: "蓝色连衣裙 M",
    category: "成衣",
    spu: "DRESS-BLUE",
    region: "CN",
    baseUnit: "件",
    purchaseUnit: "件",
    packageUnit: "箱",
    boxUnit: "箱",
    price: 68,
    currency: "RMB",
    moq: 100,
    leadDays: 12,
    packagingMethod: "箱装",
    basePerPackage: 30,
    packagesPerBox: 1,
    packageWeight: 12,
    packageVolume: 0.5,
    boxWeight: 12,
    boxVolume: 0.5,
    boxLength: 60,
    boxWidth: 45,
    boxHeight: 40,
    allowIrregular: false,
    logisticsProvider: "货拉拉",
    shippingMethod: "送货上门",
    shipAddress: "广州市白云区成衣工业园",
    receiveWarehouse: "国内成衣仓",
    directOverseas: false,
    firstLegCarrier: "海派优选",
    firstLegChannel: "广州海派菲律宾线",
    isDefault: true,
    qcRequired: true,
    buyer: "陈采购",
    status: "启用",
    updatedAt: "2026-06-12 09:15",
    remark: "不可混色混码装箱。",
  },
];

const categories: Category[] = ["面料", "辅料", "包材", "耗材", "纱线", "成衣", "样衣"];
const baseUnits = ["米", "码", "个", "件", "条", "kg", "包"];
const packageUnits = ["卷", "包", "袋", "盒", "箱", "托"];
const statuses = ["全部", "启用", "停用"];
const fmt = (value: number) => Number.isInteger(value) ? String(value) : value.toFixed(2).replace(/\.?0+$/, "");
const ceilDiv = (value: number, divisor: number) => divisor > 0 ? Math.ceil(value / divisor) : 0;

function calcByBase(record: Archive, baseQty: number) {
  const packageQty = record.category === "成衣" ? ceilDiv(baseQty, record.basePerPackage) : baseQty / record.basePerPackage;
  const boxQty = ceilDiv(packageQty, record.packagesPerBox);
  return { baseQty, packageQty, boxQty };
}

function calcByPackage(record: Archive, packageQty: number) {
  const baseQty = packageQty * record.basePerPackage;
  const boxQty = ceilDiv(packageQty, record.packagesPerBox);
  return { baseQty, packageQty, boxQty };
}

function calcByBox(record: Archive, boxQty: number) {
  const packageQty = boxQty * record.packagesPerBox;
  const baseQty = packageQty * record.basePerPackage;
  return { baseQty, packageQty, boxQty };
}

export default function SupplierSupplyArchiveDemo() {
  const [filters, setFilters] = useState({ supplier: "", sku: "", name: "", category: "", baseUnit: "", packageUnit: "", isDefault: "", status: "全部" });
  const [selectedId, setSelectedId] = useState("SSA-001");
  const [activeModule, setActiveModule] = useState("采购联动");
  const [mode, setMode] = useState<"base" | "package" | "box">("base");
  const [fabricQty, setFabricQty] = useState(500);
  const [garmentQty, setGarmentQty] = useState(300);
  const [manualFields, setManualFields] = useState<string[]>([]);
  const [modal, setModal] = useState<"" | "add" | "edit" | "view" | "import" | "product" | "logistics">("");
  const [toast, setToast] = useState("");

  const selected = archives.find((item) => item.id === selectedId) ?? archives[0];
  const fabricArchive = archives[0];
  const garmentArchive = archives[2];
  const selectedInput = mode === "base" ? fabricQty : mode === "package" ? 12 : 3;
  const fabricCalc = mode === "base" ? calcByBase(fabricArchive, fabricQty) : mode === "package" ? calcByPackage(fabricArchive, selectedInput) : calcByBox(fabricArchive, selectedInput);
  const garmentCalc = calcByBase(garmentArchive, garmentQty);
  const purchaseSnapshot = {
    totalWeight: fabricCalc.boxQty * fabricArchive.boxWeight,
    totalVolume: fabricCalc.boxQty * fabricArchive.boxVolume,
    payable: fabricCalc.baseQty * fabricArchive.price,
    actualBaseQty: 498,
    actualPackageQty: 11,
    actualBoxQty: 2,
  };

  const filtered = useMemo(() => archives.filter((row) => (
    (!filters.supplier || row.supplier.includes(filters.supplier))
    && (!filters.sku || row.sku.toLowerCase().includes(filters.sku.toLowerCase()))
    && (!filters.name || row.name.includes(filters.name))
    && (!filters.category || row.category === filters.category)
    && (!filters.baseUnit || row.baseUnit === filters.baseUnit)
    && (!filters.packageUnit || row.packageUnit === filters.packageUnit)
    && (!filters.isDefault || (filters.isDefault === "是") === row.isDefault)
    && (filters.status === "全部" || row.status === filters.status)
  )), [filters]);

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 1800);
  };
  const markManual = (field: string) => setManualFields((current) => current.includes(field) ? current : [...current, field]);
  const updateFilter = (key: keyof typeof filters, value: string) => setFilters((current) => ({ ...current, [key]: value }));

  return (
    <div>
      <PageHeader
        title="供应商供货档案"
        desc="维护供应商与商品 / 物料之间的供货规则，包括采购价、基础单位、包装单位、装箱规则和默认物流配置。"
        extra={<button className="inline-flex h-8 items-center gap-1 rounded bg-brand px-3 text-sm text-white" onClick={() => setModal("add")}><Plus size={15} />新增供货档案</button>}
      />

      <section className="mb-3 rounded border border-gray-200 bg-white p-3">
        <div className="grid grid-cols-2 gap-2 lg:grid-cols-4 xl:grid-cols-8">
          <Select label="供应商" value={filters.supplier} onChange={(value) => updateFilter("supplier", value)} options={["", ...archives.map((item) => item.supplier)]} placeholder="全部供应商" />
          <Input label="商品 / 物料SKU" value={filters.sku} onChange={(value) => updateFilter("sku", value)} placeholder="输入 SKU" />
          <Input label="商品 / 物料名称" value={filters.name} onChange={(value) => updateFilter("name", value)} placeholder="输入名称" />
          <Select label="物料分类" value={filters.category} onChange={(value) => updateFilter("category", value)} options={["", ...categories]} placeholder="全部分类" />
          <Select label="基础单位" value={filters.baseUnit} onChange={(value) => updateFilter("baseUnit", value)} options={["", ...baseUnits]} placeholder="全部" />
          <Select label="包装单位" value={filters.packageUnit} onChange={(value) => updateFilter("packageUnit", value)} options={["", ...packageUnits]} placeholder="全部" />
          <Select label="默认供应商" value={filters.isDefault} onChange={(value) => updateFilter("isDefault", value)} options={["", "是", "否"]} placeholder="全部" />
          <Select label="状态" value={filters.status} onChange={(value) => updateFilter("status", value)} options={statuses} />
        </div>
        <div className="mt-3 flex flex-wrap gap-2 border-t border-gray-100 pt-3">
          <button className="inline-flex h-8 items-center gap-1 rounded bg-brand px-3 text-sm text-white" onClick={() => showToast("已按当前条件查询 Mock 档案")}><Search size={14} />查询</button>
          <button className="h-8 rounded border border-gray-300 px-3 text-sm" onClick={() => setFilters({ supplier: "", sku: "", name: "", category: "", baseUnit: "", packageUnit: "", isDefault: "", status: "全部" })}>重置</button>
          <button className="inline-flex h-8 items-center gap-1 rounded border border-blue-300 px-3 text-sm text-blue-700" onClick={() => setModal("import")}><Upload size={14} />导入</button>
          <button className="inline-flex h-8 items-center gap-1 rounded border border-blue-300 px-3 text-sm text-blue-700" onClick={() => showToast("前端 Demo：已展示导出字段，不生成真实文件")}><Download size={14} />导出</button>
        </div>
      </section>

      <DataTable
        rows={filtered}
        columns={[
          { key: "supplier", title: "供应商", render: (row: Archive) => <button className="text-blue-600" onClick={() => setSelectedId(row.id)}>{row.supplier}</button> },
          { key: "sku", title: "商品 / 物料SKU" },
          { key: "name", title: "商品 / 物料名称" },
          { key: "category", title: "分类" },
          { key: "baseUnit", title: "基础单位" },
          { key: "purchaseUnit", title: "采购单位" },
          { key: "packageUnit", title: "包装单位" },
          { key: "price", title: "默认采购价", render: (row: Archive) => `${row.price} ${row.currency}` },
          { key: "moq", title: "MOQ" },
          { key: "leadDays", title: "交期天数", render: (row: Archive) => `${row.leadDays} 天` },
          { key: "rule", title: "包装规则", render: (row: Archive) => `${fmt(row.basePerPackage)}${row.baseUnit}/${row.packageUnit}，${fmt(row.packagesPerBox)}${row.packageUnit}/${row.boxUnit}` },
          { key: "boxBase", title: "每箱基础数量", render: (row: Archive) => `${fmt(row.basePerPackage * row.packagesPerBox)}${row.baseUnit}` },
          { key: "boxWeight", title: "单箱重量", render: (row: Archive) => `${row.boxWeight} KG` },
          { key: "boxVolume", title: "单箱体积", render: (row: Archive) => `${row.boxVolume} m³` },
          { key: "logisticsProvider", title: "默认物流商" },
          { key: "firstLegChannel", title: "默认头程渠道" },
          { key: "isDefault", title: "默认供应商", render: (row: Archive) => <Badge tone={row.isDefault ? "green" : "gray"}>{row.isDefault ? "是" : "否"}</Badge> },
          { key: "status", title: "状态", render: (row: Archive) => <Badge tone={row.status === "启用" ? "green" : "red"}>{row.status}</Badge> },
          { key: "updatedAt", title: "更新时间" },
          {
            key: "operation",
            title: "操作",
            render: (row: Archive) => (
              <div className="flex whitespace-nowrap text-xs">
                <button className="mr-2 inline-flex items-center gap-1 text-blue-600" onClick={() => { setSelectedId(row.id); setModal("view"); }}><Eye size={13} />查看</button>
                <button className="mr-2 inline-flex items-center gap-1 text-blue-600" onClick={() => { setSelectedId(row.id); setModal("edit"); }}><Edit size={13} />编辑</button>
                <button className="mr-2 inline-flex items-center gap-1 text-blue-600" onClick={() => showToast(`已复制 ${row.sku} 的供货档案草稿`)}><Copy size={13} />复制</button>
                <button className={row.status === "启用" ? "text-red-600" : "text-green-600"} onClick={() => showToast(`${row.status === "启用" ? "停用" : "启用"}操作仅做前端演示`)}>{row.status === "启用" ? "停用" : "启用"}</button>
              </div>
            ),
          },
        ]}
      />

      <section className="mt-3 grid gap-3 xl:grid-cols-[360px_minmax(0,1fr)]">
        <div className="rounded border border-gray-200 bg-white p-4">
          <div className="mb-3 text-sm font-semibold text-gray-900">当前选中档案详情预览</div>
          <div className="space-y-2 text-sm">
            <Info label="供应商" value={selected.supplier} />
            <Info label="SKU" value={`${selected.sku} / ${selected.name}`} />
            <Info label="基础单位" value={selected.baseUnit} />
            <Info label="采购单位" value={selected.purchaseUnit} />
            <Info label="包装单位" value={selected.packageUnit} />
            <Info label="包装规则" value={`${fmt(selected.basePerPackage)}${selected.baseUnit}/${selected.packageUnit}，${fmt(selected.packagesPerBox)}${selected.packageUnit}/${selected.boxUnit}`} />
            <Info label="单箱重量 / 体积" value={`${selected.boxWeight} KG / ${selected.boxVolume} m³`} />
            <Info label="默认物流" value={`${selected.logisticsProvider}，${selected.firstLegChannel}`} />
          </div>
        </div>

        <div className="rounded border border-gray-200 bg-white p-4">
          <div className="mb-3 flex flex-wrap gap-2">
            {["采购联动", "物料档案", "商品采购单", "面辅料采购单", "需求分析", "物流信息", "收货入库", "采购对账"].map((item) => (
              <button key={item} className={`h-8 rounded px-3 text-sm ${activeModule === item ? "bg-brand text-white" : "border border-gray-200 bg-white text-gray-700"}`} onClick={() => setActiveModule(item)}>{item}</button>
            ))}
          </div>
          {activeModule === "采购联动" && <LinkagePanel record={fabricArchive} calc={fabricCalc} mode={mode} setMode={setMode} quantity={fabricQty} setQuantity={(value) => { setFabricQty(value); markManual("采购基础数量"); }} manualFields={manualFields} markManual={markManual} />}
          {activeModule === "物料档案" && <MaterialArchivePanel />}
          {activeModule === "商品采购单" && <ProductPurchasePanel record={garmentArchive} quantity={garmentQty} setQuantity={setGarmentQty} calc={garmentCalc} openDetail={() => setModal("product")} />}
          {activeModule === "面辅料采购单" && <MaterialPurchasePanel record={fabricArchive} calc={fabricCalc} mode={mode} />}
          {activeModule === "需求分析" && <RequirementPanel record={fabricArchive} calc={fabricCalc} />}
          {activeModule === "物流信息" && <LogisticsPanel record={fabricArchive} calc={fabricCalc} totalWeight={purchaseSnapshot.totalWeight} totalVolume={purchaseSnapshot.totalVolume} openModal={() => setModal("logistics")} />}
          {activeModule === "收货入库" && <ReceiptPanel record={fabricArchive} snapshot={purchaseSnapshot} />}
          {activeModule === "采购对账" && <ReconciliationPanel record={fabricArchive} snapshot={purchaseSnapshot} />}
        </div>
      </section>

      <LogicCard />

      <ArchiveModal open={["add", "edit", "view"].includes(modal)} mode={modal || "view"} record={selected} onClose={() => setModal("")} />
      <ImportModal open={modal === "import"} onClose={() => setModal("")} />
      <ProductDetailModal open={modal === "product"} onClose={() => setModal("")} record={garmentArchive} calc={garmentCalc} />
      <HeadLogisticsModal open={modal === "logistics"} onClose={() => setModal("")} record={fabricArchive} calc={fabricCalc} />
      <Toast msg={toast} />
    </div>
  );
}

function LinkagePanel({ record, calc, mode, setMode, quantity, setQuantity, manualFields, markManual }: { record: Archive; calc: ReturnType<typeof calcByBase>; mode: "base" | "package" | "box"; setMode: (mode: "base" | "package" | "box") => void; quantity: number; setQuantity: (value: number) => void; manualFields: string[]; markManual: (field: string) => void }) {
  return (
    <div className="grid gap-4 lg:grid-cols-[330px_minmax(0,1fr)]">
      <div className="rounded border border-blue-100 bg-blue-50 p-3">
        <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-blue-900"><Calculator size={16} />三种录入模式</div>
        <div className="mb-3 grid grid-cols-3 gap-1 rounded bg-white p-1 text-xs">
          {[["base", "按基础数量"], ["package", "按包装数量"], ["box", "按箱数"]].map(([key, label]) => (
            <button key={key} className={`h-8 rounded ${mode === key ? "bg-brand text-white" : "text-gray-600"}`} onClick={() => setMode(key as "base" | "package" | "box")}>{label}</button>
          ))}
        </div>
        {mode === "base" && <Input label={`采购基础数量（${record.baseUnit}）`} type="number" value={String(quantity)} onChange={(value) => setQuantity(Number(value || 0))} />}
        {mode === "package" && <div className="rounded border border-gray-200 bg-white p-3 text-sm">输入采购包装数量：12 {record.packageUnit}</div>}
        {mode === "box" && <div className="rounded border border-gray-200 bg-white p-3 text-sm">输入采购箱数：3 {record.boxUnit}</div>}
        <div className="mt-3 rounded border border-green-200 bg-green-50 px-3 py-2 text-xs leading-5 text-green-800">已匹配供应商供货档案，已自动带出采购价、基础单位、包装单位和装箱规则。</div>
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Metric title="基础单位" value={record.baseUnit} />
        <Metric title="包装单位" value={record.packageUnit} />
        <Metric title="每包装基础数量" value={`${fmt(record.basePerPackage)} ${record.baseUnit}/${record.packageUnit}`} />
        <Metric title="每箱包装数" value={`${fmt(record.packagesPerBox)} ${record.packageUnit}/${record.boxUnit}`} />
        <Metric title="采购基础数量" value={`${fmt(calc.baseQty)} ${record.baseUnit}`} mark={manualFields.includes("采购基础数量")} />
        <Metric title="预计包装数量" value={`${fmt(calc.packageQty)} ${record.packageUnit}`} />
        <Metric title="预计箱数" value={`${fmt(calc.boxQty)} ${record.boxUnit}`} />
        <Metric title="默认头程渠道" value={record.firstLegChannel} />
        <button className="rounded border border-blue-300 px-3 py-2 text-sm text-blue-700" onClick={() => markManual("预计箱数")}>手动修改预计箱数</button>
        <button className="rounded border border-blue-300 px-3 py-2 text-sm text-blue-700" onClick={() => markManual("每包装基础数量")}>手动调整包装规则</button>
      </div>
    </div>
  );
}

function MaterialArchivePanel() {
  const rows = [
    ["基础单位", "米 / 个 / 条 / kg / 件，用于库存、BOM 和采购需求最小核算"],
    ["默认采购单位", "物料标准参考值，供应商供货档案存在时优先使用供货档案"],
    ["默认包装单位", "卷 / 包 / 袋 / 盒 / 箱"],
    ["标准每包装基础数量", "面料 50 米/卷，纽扣 100 个/包"],
    ["标准每箱包装数", "5 卷/箱，20 包/箱"],
    ["是否允许不规则包装数量", "面料允许尾卷，辅料和成衣通常不允许"],
  ];
  return <SimpleRows title="商品 / 物料档案新增分组：单位与标准包装信息" rows={rows} />;
}

function ProductPurchasePanel({ record, quantity, setQuantity, calc, openDetail }: { record: Archive; quantity: number; setQuantity: (value: number) => void; calc: ReturnType<typeof calcByBase>; openDetail: () => void }) {
  return (
    <div className="space-y-3">
      <div className="grid gap-3 md:grid-cols-4">
        <Input label="SKU" value={record.sku} onChange={() => undefined} />
        <Input label="供应商" value={record.supplier} onChange={() => undefined} />
        <Input label={`采购数量（${record.baseUnit}）`} type="number" value={String(quantity)} onChange={(value) => setQuantity(Number(value || 0))} />
        <Metric title="本次采购价" value={`${record.price} ${record.currency}/${record.baseUnit}`} />
      </div>
      <DataTable rows={[{ ...record, quantity, boxes: calc.boxQty }]} columns={[
        { key: "sku", title: "SKU" },
        { key: "name", title: "商品名称" },
        { key: "supplier", title: "供应商" },
        { key: "quantity", title: "采购数量", render: (row) => `${row.quantity}${record.baseUnit}` },
        { key: "baseUnit", title: "基础单位" },
        { key: "purchaseUnit", title: "采购单位" },
        { key: "price", title: "默认采购价", render: (row) => `${row.price} ${row.currency}` },
        { key: "basePerPackage", title: "每箱件数", render: (row) => `${row.basePerPackage} 件` },
        { key: "boxes", title: "预计箱数", render: (row) => `${row.boxes} 箱` },
        { key: "boxWeight", title: "单箱重量", render: (row) => `${row.boxWeight} KG` },
        { key: "boxVolume", title: "单箱体积", render: (row) => `${row.boxVolume} m³` },
        { key: "firstLegChannel", title: "默认头程渠道" },
      ]} />
      <button className="rounded bg-brand px-3 py-2 text-sm text-white" onClick={openDetail}>查看采购单详情快照</button>
    </div>
  );
}

function MaterialPurchasePanel({ record, calc, mode }: { record: Archive; calc: ReturnType<typeof calcByBase>; mode: string }) {
  return (
    <div className="space-y-3">
      <div className="rounded border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">面辅料采购单保存本次采购包装快照：后续供应商供货档案变化，不影响历史采购单展示。</div>
      <div className="grid gap-3 md:grid-cols-4">
        <Metric title="录入模式" value={mode === "base" ? "按基础数量" : mode === "package" ? "按包装数量" : "按箱数"} />
        <Metric title="采购基础数量" value={`${fmt(calc.baseQty)} ${record.baseUnit}`} />
        <Metric title="采购包装数量" value={`${fmt(calc.packageQty)} ${record.packageUnit}`} />
        <Metric title="预计箱数" value={`${fmt(calc.boxQty)} ${record.boxUnit}`} />
        <Metric title="包装规则" value={`${record.basePerPackage}${record.baseUnit}/${record.packageUnit}，${record.packagesPerBox}${record.packageUnit}/${record.boxUnit}`} />
        <Metric title="单包装重量" value={`${record.packageWeight} KG`} />
        <Metric title="单箱重量" value={`${record.boxWeight} KG`} />
        <Metric title="单箱体积" value={`${record.boxVolume} m³`} />
      </div>
    </div>
  );
}

function RequirementPanel({ record, calc }: { record: Archive; calc: ReturnType<typeof calcByBase> }) {
  return <SimpleRows title="面辅料需求分析下推采购单" rows={[
    ["BOM 需求", `${fmt(calc.baseQty)} ${record.baseUnit}`],
    ["基础单位来源", "从物料档案带出"],
    ["默认供应商", `${record.supplier}（从供应商供货档案取默认）`],
    ["是否已维护供货档案", "是"],
    ["下推结果", `${fmt(calc.packageQty)} ${record.packageUnit}，${fmt(calc.boxQty)} ${record.boxUnit}`],
    ["未维护提示", "未维护供货档案，请手动填写包装规则"],
  ]} />;
}

function LogisticsPanel({ record, calc, totalWeight, totalVolume, openModal }: { record: Archive; calc: ReturnType<typeof calcByBase>; totalWeight: number; totalVolume: number; openModal: () => void }) {
  return (
    <div className="space-y-3">
      <div className="grid gap-3 md:grid-cols-4">
        <Metric title="采购基础数量" value={`${fmt(calc.baseQty)} ${record.baseUnit}`} />
        <Metric title="采购包装数量" value={`${fmt(calc.packageQty)} ${record.packageUnit}`} />
        <Metric title="预计箱数" value={`${fmt(calc.boxQty)} ${record.boxUnit}`} />
        <Metric title="预计重量" value={`${fmt(totalWeight)} KG`} />
        <Metric title="预计体积" value={`${fmt(totalVolume)} m³`} />
        <Metric title="每包装基础数量" value={`${record.basePerPackage}${record.baseUnit}/${record.packageUnit}`} />
        <Metric title="每箱包装数" value={`${record.packagesPerBox}${record.packageUnit}/${record.boxUnit}`} />
        <Metric title="默认头程渠道" value={record.firstLegChannel} />
      </div>
      <button className="inline-flex rounded bg-brand px-3 py-2 text-sm text-white" onClick={openModal}>加入头程物流单</button>
    </div>
  );
}

function ReceiptPanel({ record, snapshot }: { record: Archive; snapshot: { actualBaseQty: number; actualPackageQty: number; actualBoxQty: number } }) {
  const rollRows = [
    { rollNo: "R-001", meters: 50, weight: 2, boxNo: "BOX-01", remark: "标准卷" },
    { rollNo: "R-002", meters: 48, weight: 1.9, boxNo: "BOX-01", remark: "尾卷" },
    { rollNo: "R-003", meters: 50, weight: 2, boxNo: "BOX-01", remark: "标准卷" },
  ];
  return (
    <div className="space-y-3">
      <DataTable rows={rollRows} columns={[
        { key: "rollNo", title: "卷号" },
        { key: "meters", title: "实际米数", render: (row) => `${row.meters} 米` },
        { key: "weight", title: "实际重量", render: (row) => `${row.weight} KG` },
        { key: "boxNo", title: "箱号" },
        { key: "remark", title: "备注" },
      ]} />
      <div className="grid gap-3 md:grid-cols-4">
        <Metric title="预计卷数" value="10 卷" />
        <Metric title="实际卷数" value={`${snapshot.actualPackageQty} ${record.packageUnit}`} />
        <Metric title="预计总米数" value="500 米" />
        <Metric title="实际总米数" value={`${snapshot.actualBaseQty} 米`} />
        <Metric title="预计箱数" value="2 箱" />
        <Metric title="实际箱数" value={`${snapshot.actualBoxQty} 箱`} />
        <Metric title="差异米数" value="-2 米" />
        <Metric title="差异卷数" value="+1 卷" />
      </div>
    </div>
  );
}

function ReconciliationPanel({ record, snapshot }: { record: Archive; snapshot: { payable: number; actualBaseQty: number; actualPackageQty: number } }) {
  const actualAmount = snapshot.actualBaseQty * record.price;
  return <SimpleRows title="面辅料采购对账：单位、包装和金额换算" rows={[
    ["基础单位 / 包装单位", `${record.baseUnit} / ${record.packageUnit}`],
    ["采购基础数量 / 包装数量", `500 ${record.baseUnit} / 10 ${record.packageUnit}`],
    ["实际入库基础数量 / 包装数量", `${snapshot.actualBaseQty} ${record.baseUnit} / ${snapshot.actualPackageQty} ${record.packageUnit}`],
    ["单价", `${record.price} ${record.currency}/${record.baseUnit}`],
    ["供应商包装报价换算", `400 RMB/${record.packageUnit} ÷ ${record.basePerPackage}${record.baseUnit}/${record.packageUnit} = 8 RMB/${record.baseUnit}`],
    ["预计采购货款", `${fmt(snapshot.payable)} ${record.currency}`],
    ["实际供应商账单金额", `${fmt(actualAmount)} ${record.currency}`],
    ["调整金额", "-17 RMB"],
    ["最终应付金额", `${fmt(actualAmount - 17)} ${record.currency}`],
    ["差异金额", `${fmt(actualAmount - snapshot.payable)} ${record.currency}`],
  ]} />;
}

function ArchiveModal({ open, mode, record, onClose }: { open: boolean; mode: string; record: Archive; onClose: () => void }) {
  const readonly = mode === "view";
  return (
    <FormModal open={open} onClose={onClose} title={mode === "add" ? "新增供应商供货档案" : mode === "edit" ? "编辑供应商供货档案" : "查看供应商供货档案"} widthClass="w-[1120px]" sectionTitle="供货档案分组信息">
      <div className="space-y-4">
        <FormSection title="一、基础关系" rows={[["供应商", record.supplier], ["商品 / 物料SKU", record.sku], ["商品 / 物料名称", record.name], ["物料分类", record.category], ["SPU", record.spu], ["采购区域", record.region], ["是否默认供应商", record.isDefault ? "是" : "否"], ["状态", record.status]]} readonly={readonly} />
        <FormSection title="二、单位信息" rows={[["基础单位", record.baseUnit], ["采购单位", record.purchaseUnit], ["包装单位", record.packageUnit], ["箱单位", record.boxUnit]]} readonly={readonly} />
        <FormSection title="三、采购信息" rows={[["默认采购价", `${record.price} ${record.currency}`], ["MOQ / 起订量", `${record.moq} ${record.baseUnit}`], ["交期天数", `${record.leadDays} 天`], ["是否需要质检", record.qcRequired ? "是" : "否"], ["默认采购员", record.buyer]]} readonly={readonly} />
        <FormSection title="四、包装 / 装箱规则" rows={[["包装方式", record.packagingMethod], ["每包装单位基础数量", `${record.basePerPackage} ${record.baseUnit}/${record.packageUnit}`], ["每箱包装数", `${record.packagesPerBox} ${record.packageUnit}/${record.boxUnit}`], ["每箱基础数量", `${record.basePerPackage * record.packagesPerBox} ${record.baseUnit}`], ["单包装重量", `${record.packageWeight} KG`], ["单包装体积", `${record.packageVolume} m³`], ["单箱重量", `${record.boxWeight} KG`], ["单箱体积", `${record.boxVolume} m³`], ["箱规", `${record.boxLength} × ${record.boxWidth} × ${record.boxHeight} cm`], ["是否允许不规则包装数量", record.allowIrregular ? "是" : "否"], ["包装备注", record.remark]]} readonly={readonly} />
        <FormSection title="五、默认物流配置" rows={[["默认国内物流商", record.logisticsProvider], ["默认发货方式", record.shippingMethod], ["默认发货地址", record.shipAddress], ["默认收货仓", record.receiveWarehouse], ["是否直发海外仓", record.directOverseas ? "是" : "否"], ["默认头程物流商", record.firstLegCarrier], ["默认头程渠道", record.firstLegChannel]]} readonly={readonly} />
      </div>
    </FormModal>
  );
}

function ImportModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const headers = ["供应商名称", "供应商编码", "商品 / 物料SKU", "基础单位", "采购单位", "包装单位", "默认采购价", "币种", "MOQ", "交期天数", "包装方式", "每包装单位基础数量", "每箱包装数", "每箱基础数量", "单包装重量", "单箱重量", "单箱体积", "箱规长", "箱规宽", "箱规高", "默认国内物流商", "默认头程物流商", "默认头程渠道", "是否默认供应商", "状态", "备注"];
  return (
    <FormModal open={open} onClose={onClose} title="导入供应商供货档案" widthClass="w-[900px]" sectionTitle="导入模板字段预览">
      <div className="mb-3 rounded border border-blue-100 bg-blue-50 px-3 py-2 text-sm text-blue-800">这里只做前端 Demo：按钮展示模板字段，不执行真实上传、解析或保存。</div>
      <div className="flex flex-wrap gap-2">
        {headers.map((item) => <span key={item} className="rounded border border-gray-200 bg-gray-50 px-2 py-1 text-xs text-gray-700">{item}</span>)}
      </div>
    </FormModal>
  );
}

function ProductDetailModal({ open, onClose, record, calc }: { open: boolean; onClose: () => void; record: Archive; calc: ReturnType<typeof calcByBase> }) {
  return (
    <FormModal open={open} onClose={onClose} title="商品采购单详情" widthClass="w-[860px]" sectionTitle="SKU 明细快照">
      <SimpleRows title="商品采购单保存的是本次采购快照，后续供应商供货档案变化不会影响历史采购单展示。" rows={[
        ["SKU", record.sku],
        ["商品名称", record.name],
        ["采购数量", `${fmt(calc.baseQty)} ${record.baseUnit}`],
        ["基础单位 / 采购单位", `${record.baseUnit} / ${record.purchaseUnit}`],
        ["供应商", record.supplier],
        ["采购价", `${record.price} ${record.currency}`],
        ["每箱件数", `${record.basePerPackage} 件`],
        ["预计箱数", `${fmt(calc.boxQty)} 箱`],
        ["单箱重量 / 体积", `${record.boxWeight} KG / ${record.boxVolume} m³`],
        ["默认物流商 / 头程渠道", `${record.logisticsProvider} / ${record.firstLegChannel}`],
      ]} />
    </FormModal>
  );
}

function HeadLogisticsModal({ open, onClose, record, calc }: { open: boolean; onClose: () => void; record: Archive; calc: ReturnType<typeof calcByBase> }) {
  return (
    <FormModal open={open} onClose={onClose} title="加入头程物流单" widthClass="w-[780px]" sectionTitle="本次转运包装信息">
      <SimpleRows title="头程物流继承采购单包装快照" rows={[
        ["基础单位 / 包装单位", `${record.baseUnit} / ${record.packageUnit}`],
        ["采购包装数量", `${fmt(calc.packageQty)} ${record.packageUnit}`],
        ["已转运包装数量", `0 ${record.packageUnit}`],
        ["待转运包装数量", `${fmt(calc.packageQty)} ${record.packageUnit}`],
        ["本次转运包装数量", `${fmt(calc.packageQty)} ${record.packageUnit}`],
        ["预计箱数", `${fmt(calc.boxQty)} ${record.boxUnit}`],
        ["本次转运箱数", `${fmt(calc.boxQty)} ${record.boxUnit}`],
      ]} />
    </FormModal>
  );
}

function LogicCard() {
  return (
    <section className="mt-4 rounded border border-gray-200 bg-white p-4">
      <h2 className="mb-3 text-base font-semibold text-gray-900">业务逻辑说明</h2>
      <DataTable rows={[
        { rule: "基础单位", desc: "用于库存、BOM、采购需求核算，例如米、个、条、kg、件。" },
        { rule: "包装单位", desc: "用于供应商交货、物流、收货，例如卷、包、袋、盒、箱。" },
        { rule: "供应商供货档案", desc: "维护某供应商如何供应某商品 / 物料，采购单优先读取该档案。" },
        { rule: "正向计算", desc: "输入基础数量，计算包装数量和箱数。" },
        { rule: "反向计算", desc: "输入包装数量或箱数，反推基础数量。" },
        { rule: "采购单快照", desc: "采购单保存本次包装规则，不受后续档案变更影响。" },
      ]} columns={[{ key: "rule", title: "规则" }, { key: "desc", title: "说明" }]} />
    </section>
  );
}

function FormSection({ title, rows, readonly }: { title: string; rows: string[][]; readonly: boolean }) {
  return (
    <section>
      <h3 className="mb-2 text-sm font-semibold text-gray-900">{title}</h3>
      <div className="grid gap-3 md:grid-cols-3">
        {rows.map(([label, value]) => (
          <label key={label} className="grid gap-1 text-xs text-gray-500">
            {label}
            <input className="h-9 rounded border border-gray-200 bg-white px-3 text-sm text-gray-800 disabled:bg-gray-50" value={value} disabled={readonly} readOnly />
          </label>
        ))}
      </div>
    </section>
  );
}

function SimpleRows({ title, rows }: { title: string; rows: string[][] }) {
  return (
    <div>
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900"><FileText size={16} />{title}</div>
      <DataTable rows={rows.map(([field, desc]) => ({ field, desc }))} columns={[{ key: "field", title: "字段 / 规则" }, { key: "desc", title: "说明 / 展示值" }]} />
    </div>
  );
}

function Metric({ title, value, mark }: { title: string; value: string; mark?: boolean }) {
  return (
    <div className="rounded border border-gray-200 bg-white p-3">
      <div className="mb-1 flex items-center justify-between text-xs text-gray-500">
        <span>{title}</span>
        {mark && <span className="rounded bg-orange-100 px-1.5 py-0.5 text-[11px] text-orange-700">已手动调整</span>}
      </div>
      <div className="text-base font-semibold text-gray-900">{value}</div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between gap-4 border-b border-gray-100 pb-2 last:border-0"><span className="shrink-0 text-gray-500">{label}</span><span className="text-right text-gray-900">{value}</span></div>;
}

function Badge({ children, tone }: { children: string; tone: "green" | "red" | "gray" }) {
  const cls = tone === "green" ? "bg-green-100 text-green-700" : tone === "red" ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-700";
  return <span className={`rounded-full px-2 py-0.5 text-xs ${cls}`}>{children}</span>;
}

function Input({ label, value, onChange, placeholder, type = "text" }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; type?: string }) {
  return <label className="grid gap-1 text-xs text-gray-500">{label}<input className="h-8 rounded border border-gray-200 px-2 text-sm text-gray-800 outline-none focus:border-brand" type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} /></label>;
}

function Select({ label, value, onChange, options, placeholder }: { label: string; value: string; onChange: (value: string) => void; options: string[]; placeholder?: string }) {
  return <label className="grid gap-1 text-xs text-gray-500">{label}<select className="h-8 rounded border border-gray-200 px-2 text-sm text-gray-800 outline-none focus:border-brand" value={value} onChange={(event) => onChange(event.target.value)}>{options.map((option) => <option key={option} value={option}>{option || placeholder || "全部"}</option>)}</select></label>;
}
