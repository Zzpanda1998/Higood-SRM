import { useMemo, useState, type ChangeEvent, type ReactNode } from "react";
import ConfirmModal from "../../components/common/ConfirmModal";
import DataTable from "../../components/common/DataTable";
import DesignLogicCard from "../../components/common/DesignLogicCard";
import DetailModal from "../../components/common/DetailModal";
import PageHeader from "../../components/common/PageHeader";
import SearchBar from "../../components/common/SearchBar";
import StatusBadge from "../../components/common/StatusBadge";
import Toast from "../../components/common/Toast";
import { materials as initialMaterials } from "../../mock/materials";
import { suppliers } from "../../mock/suppliers";
import type {
  BrandType,
  Currency,
  Material,
  MaterialCategory,
  MaterialCustomsInfo,
  MaterialDeclarationInfo,
  MaterialStatus,
  PurchaseRegion,
  TaxExemptionType,
  Unit,
} from "../../types/material";

type EditErrors = Record<string, string>;

const categories: MaterialCategory[] = ["面料", "辅料", "纱线", "包材", "耗材", "样衣", "成衣"];
const units: Unit[] = ["米", "码", "公斤", "KG", "个", "件", "卷", "箱", "包", "打"];
const currencies: Currency[] = ["RMB", "USD", "IDR"];
const purchaseRegions: PurchaseRegion[] = ["国内", "印尼", "其他"];
const brandTypes: BrandType[] = ["无品牌", "自有品牌", "授权品牌"];
const exemptionTypes: TaxExemptionType[] = ["照章征税", "全免", "其他"];
const supplierOptions = suppliers.map((supplier) => supplier.supplierName);
const specialAttributes = [
  "普货", "带电带磁", "带电", "带磁", "弱磁", "纯电池", "低功率电池", "高功率电池", "木制品", "纺织品",
  "皮具", "粉末", "食品", "纯液体", "带液体", "少量液体", "带游离液体", "危险品", "膏体", "管制刀具",
  "防疫用品", "仿牌", "敏感货", "车载产品", "充电设备", "金属",
];

const now = () => new Date().toLocaleString("zh-CN", { hour12: false });
const emptyDeclaration = (): MaterialDeclarationInfo => ({ brandType: "无品牌", specialAttributes: ["普货"] });
const emptyCustoms = (): MaterialCustomsInfo => ({ needCustomsDeclaration: true, taxExemptionType: "照章征税" });
const inputClass = "h-9 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

export default function MaterialManagement({
  title = "物料管理",
  description = "查看商品中心 PCS 同步到 PMS 的物料资料，并维护采购、申报和报关补充信息。",
  allowedCategories = categories,
}: {
  title?: string;
  description?: string;
  allowedCategories?: MaterialCategory[];
}) {
  const [rows, setRows] = useState<Material[]>(initialMaterials);
  const [kwInput, setKwInput] = useState("");
  const [kw, setKw] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [qcFilter, setQcFilter] = useState("");
  const [supplierFilter, setSupplierFilter] = useState("");
  const [editing, setEditing] = useState<Material | null>(null);
  const [draft, setDraft] = useState<Material | null>(null);
  const [errors, setErrors] = useState<EditErrors>({});
  const [detail, setDetail] = useState<Material | null>(null);
  const [confirmRow, setConfirmRow] = useState<Material | null>(null);
  const [confirmAction, setConfirmAction] = useState<"enable" | "disable" | null>(null);
  const [toast, setToast] = useState("");

  const filtered = useMemo(() => rows.filter((row) => {
    const hitKeyword = !kw.trim() || [row.materialCode, row.materialName, row.specification, row.color ?? "", row.colorCode ?? ""]
      .some((value) => value.toLowerCase().includes(kw.trim().toLowerCase()));
    return allowedCategories.includes(row.materialCategory)
      && hitKeyword
      && (!categoryFilter || row.materialCategory === categoryFilter)
      && (!statusFilter || row.status === statusFilter)
      && (!qcFilter || String(row.needInspection) === qcFilter)
      && (!supplierFilter || row.defaultSupplier === supplierFilter);
  }), [allowedCategories, categoryFilter, kw, qcFilter, rows, statusFilter, supplierFilter]);

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2200);
  };

  const openEdit = (row: Material) => {
    setEditing(row);
    setDraft(structuredClone({
      ...row,
      declarationInfo: row.declarationInfo ?? emptyDeclaration(),
      customsInfo: row.customsInfo ?? emptyCustoms(),
    }));
    setErrors({});
  };

  const updateDraft = <K extends keyof Material>(key: K, value: Material[K]) => {
    setDraft((current) => current ? { ...current, [key]: value } : current);
    setErrors((current) => ({ ...current, [key]: "" }));
  };

  const updateDeclaration = <K extends keyof MaterialDeclarationInfo>(key: K, value: MaterialDeclarationInfo[K]) => {
    setDraft((current) => current ? { ...current, declarationInfo: { ...(current.declarationInfo ?? emptyDeclaration()), [key]: value } } : current);
  };

  const updateCustoms = <K extends keyof MaterialCustomsInfo>(key: K, value: MaterialCustomsInfo[K]) => {
    setDraft((current) => current ? { ...current, customsInfo: { ...(current.customsInfo ?? emptyCustoms()), [key]: value } } : current);
    setErrors((current) => ({ ...current, [key]: "" }));
  };

  const handleImage = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!["image/png", "image/jpeg"].includes(file.type)) {
      setErrors((current) => ({ ...current, declarationImageUrl: "仅支持 png / jpg / jpeg" }));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrors((current) => ({ ...current, declarationImageUrl: "图片大小不能超过 5MB" }));
      return;
    }
    updateDeclaration("declarationImageUrl", file.name);
    setErrors((current) => ({ ...current, declarationImageUrl: "" }));
  };

  const validate = () => {
    if (!draft) return false;
    const next: EditErrors = {};
    if (!draft.materialCode) next.materialCode = "物料编码不能为空";
    if (!draft.materialCategory) next.materialCategory = "请选择物料分类";
    if (!draft.baseUnit) next.baseUnit = "请选择基础单位";
    if (!draft.purchaseUnit) next.purchaseUnit = "请选择采购单位";
    if (!draft.inventoryUnit) next.inventoryUnit = "请选择库存单位";
    if ((draft.referencePurchasePrice ?? 0) < 0) next.referencePurchasePrice = "默认采购价不能小于 0";
    if ((draft.customsInfo?.legalSecondUnitValue ?? 0) < 0) next.legalSecondUnitValue = "法定第二计量单位数值不能小于 0";
    if (draft.customsInfo?.needCustomsDeclaration) {
      if (!draft.customsInfo.chineseCustomsName?.trim()) next.chineseCustomsName = "请输入中文报关名";
      if (!draft.customsInfo.englishCustomsName?.trim()) next.englishCustomsName = "请输入英文报关名";
      if (!draft.customsInfo.transactionUnit) next.transactionUnit = "请选择成交单位";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const saveEdit = () => {
    if (!editing || !draft || !validate()) return;
    const saved: Material = {
      ...draft,
      materialCode: editing.materialCode,
      systemInfo: editing.systemInfo,
      createdBy: editing.createdBy,
      createdAt: editing.createdAt,
      updatedBy: "张三",
      updatedAt: now(),
    };
    setRows((current) => current.map((row) => row.id === editing.id ? saved : row));
    setEditing(null);
    setDraft(null);
    showToast("保存成功");
  };

  const resetFilters = () => {
    setKwInput("");
    setKw("");
    setCategoryFilter("");
    setStatusFilter("");
    setQcFilter("");
    setSupplierFilter("");
  };

  const doStatus = () => {
    if (!confirmRow || !confirmAction) return;
    const status: MaterialStatus = confirmAction === "enable" ? "已启用" : "已停用";
    setRows((current) => current.map((row) => row.id === confirmRow.id ? { ...row, status, updatedBy: "张三", updatedAt: now() } : row));
    if (detail?.id === confirmRow.id) setDetail({ ...detail, status, updatedBy: "张三", updatedAt: now() });
    setConfirmRow(null);
    setConfirmAction(null);
    showToast(status === "已启用" ? "物料已启用" : "物料已停用");
  };

  return (
    <div>
      <PageHeader title={title} desc={description} />

      <SearchBar>
        <div className="flex flex-wrap items-center gap-2">
          <input className="h-8 w-80 rounded border px-2 text-sm" value={kwInput} onChange={(event) => setKwInput(event.target.value)} placeholder="搜索物料编码 / 物料名称 / 规格型号 / 颜色 / 色号" />
          <select className="h-8 rounded border px-2 text-sm" value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}><option value="">全部分类</option>{allowedCategories.map((item) => <option key={item}>{item}</option>)}</select>
          <select className="h-8 rounded border px-2 text-sm" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="">全部状态</option>{["草稿", "已启用", "已停用"].map((item) => <option key={item}>{item}</option>)}</select>
          <select className="h-8 rounded border px-2 text-sm" value={qcFilter} onChange={(event) => setQcFilter(event.target.value)}><option value="">全部质检状态</option><option value="true">需质检</option><option value="false">无需质检</option></select>
          <select className="h-8 rounded border px-2 text-sm" value={supplierFilter} onChange={(event) => setSupplierFilter(event.target.value)}><option value="">全部供应商</option>{supplierOptions.map((item) => <option key={item}>{item}</option>)}</select>
          <button className="h-8 rounded bg-brand px-3 text-sm text-white" onClick={() => setKw(kwInput)}>查询</button>
          <button className="h-8 rounded border border-gray-300 px-3 text-sm" onClick={resetFilters}>清除</button>
        </div>
      </SearchBar>

      <DataTable
        columns={[
          { key: "materialCode", title: "物料编码", render: (row) => <button className="text-blue-600" onClick={() => setDetail(row)}>{row.materialCode}</button> },
          { key: "materialName", title: "物料名称" },
          { key: "materialCategory", title: "物料分类" },
          { key: "specification", title: "规格型号" },
          { key: "color", title: "颜色/色号", render: (row) => `${row.color || "-"}${row.colorCode ? ` / ${row.colorCode}` : ""}` },
          { key: "baseUnit", title: "单位" },
          { key: "purchaseUnit", title: "采购单位" },
          { key: "inventoryUnit", title: "库存单位" },
          { key: "defaultSupplier", title: "默认供应商" },
          { key: "needInspection", title: "是否需质检", render: (row) => <span className={`rounded-full px-2 py-0.5 text-xs ${row.needInspection ? "bg-orange-100 text-orange-700" : "bg-gray-100 text-gray-700"}`}>{row.needInspection ? "是" : "否"}</span> },
          { key: "status", title: "状态", render: (row) => <StatusBadge status={row.status} /> },
          { key: "createdBy", title: "创建人" },
          { key: "createdAt", title: "创建时间" },
          {
            key: "operation",
            title: "操作",
            render: (row) => <div className="space-x-2 whitespace-nowrap text-xs">
              <button className="text-blue-600" onClick={() => setDetail(row)}>查看</button>
              <button className="text-blue-600" onClick={() => openEdit(row)}>编辑</button>
              {row.status === "已启用"
                ? <button className="text-red-600" onClick={() => { setConfirmRow(row); setConfirmAction("disable"); }}>停用</button>
                : <button className="text-green-600" onClick={() => { setConfirmRow(row); setConfirmAction("enable"); }}>启用</button>}
            </div>,
          },
        ]}
        rows={filtered}
      />

      <DesignLogicCard sections={[
        {
          title: "页面定位",
          headers: ["项目", "说明"],
          rows: [
            ["页面名称", title],
            ["所属模块", "基础资料"],
            ["页面目标", "查看和维护商品中心同步过来的采购物料资料"],
            ["上游来源", "商品中心 PCS"],
            ["下游去向", "面辅料采购单、采购建议、报关申报、采购对账"],
            ["核心规则", "PMS 不新增物料，只编辑同步物料的采购、申报、报关补充信息"],
          ],
        },
        {
          title: "核心业务规则",
          headers: ["场景", "规则"],
          rows: [
            ["新增物料", "不允许，物料由商品中心 PCS 同步生成"],
            ["编辑物料", "仅维护 PMS 采购、申报、报关补充信息，不反写 PCS 主数据"],
            ["物料编码", "商品中心同步，不允许修改"],
            ["申报信息", "用于跨境申报和平台资料"],
            ["报关信息", "用于出口报关和进口清关"],
            ["停用 / 启用", "停用后不允许在新采购单中选择，启用后恢复可选"],
          ],
        },
      ]} />

      {draft && editing && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-[1px]">
          <div className="flex max-h-[calc(100vh-32px)] w-full max-w-[1160px] flex-col overflow-hidden rounded-xl border border-white/60 bg-slate-50 shadow-[0_24px_80px_rgba(15,23,42,0.28)]">
            <div className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
              <div>
                <h2 className="text-base font-semibold text-slate-900">修改物料信息</h2>
                <p className="mt-1 text-xs text-slate-500">维护 PMS 采购、申报与报关补充资料，物料编码及 PCS 来源信息保持只读。</p>
              </div>
              <button className="flex h-8 w-8 items-center justify-center rounded-md text-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700" aria-label="关闭修改物料信息" onClick={() => { setEditing(null); setDraft(null); }}>×</button>
            </div>
            <div className="flex-1 space-y-4 overflow-y-auto p-5">
              <FormSection index="01" title="基础信息" description="商品中心同步的核心资料及 PMS 采购状态">
                <Field label="物料编码" required error={errors.materialCode}><input className={`${inputClass} cursor-not-allowed bg-slate-100 text-slate-500`} value={draft.materialCode} disabled /></Field>
                <Field label="物料名称"><input className={inputClass} value={draft.materialName} onChange={(event) => updateDraft("materialName", event.target.value)} /></Field>
                <Field label="物料分类" required error={errors.materialCategory}><Select value={draft.materialCategory} options={categories} onChange={(value) => updateDraft("materialCategory", value as MaterialCategory)} /></Field>
                <Field label="规格型号"><input className={inputClass} value={draft.specification} onChange={(event) => updateDraft("specification", event.target.value)} /></Field>
                <Field label="颜色 / 色号"><div className="grid grid-cols-2 gap-2"><input className={inputClass} value={draft.color ?? ""} onChange={(event) => updateDraft("color", event.target.value)} placeholder="颜色" /><input className={inputClass} value={draft.colorCode ?? ""} onChange={(event) => updateDraft("colorCode", event.target.value)} placeholder="色号" /></div></Field>
                <Field label="状态"><Select value={draft.status} options={["草稿", "已启用", "已停用"]} onChange={(value) => updateDraft("status", value as MaterialStatus)} /></Field>
                <Field label="默认供应商"><Select value={draft.defaultSupplier ?? ""} options={supplierOptions} onChange={(value) => updateDraft("defaultSupplier", value)} allowEmpty /></Field>
                <Field label="是否需质检"><Radio value={draft.needInspection} onChange={(value) => updateDraft("needInspection", value)} /></Field>
              </FormSection>

              <FormSection index="02" title="采购与单位信息" description="采购计价、库存核算及单位换算设置">
                <Field label="基础单位" required error={errors.baseUnit}><Select value={draft.baseUnit} options={units} onChange={(value) => updateDraft("baseUnit", value as Unit)} /></Field>
                <Field label="采购单位" required error={errors.purchaseUnit}><Select value={draft.purchaseUnit} options={units} onChange={(value) => updateDraft("purchaseUnit", value as Unit)} /></Field>
                <Field label="库存单位" required error={errors.inventoryUnit}><Select value={draft.inventoryUnit} options={units} onChange={(value) => updateDraft("inventoryUnit", value as Unit)} /></Field>
                <Field label="单位换算关系"><input className={inputClass} value={draft.conversionRate ?? ""} onChange={(event) => updateDraft("conversionRate", event.target.value)} placeholder="例如：1卷=100米" /></Field>
                <Field label="默认采购价" error={errors.referencePurchasePrice}><input className={inputClass} type="number" min="0" value={draft.referencePurchasePrice ?? ""} onChange={(event) => updateDraft("referencePurchasePrice", event.target.value === "" ? undefined : Number(event.target.value))} /></Field>
                <Field label="默认币种"><Select value={draft.currency ?? "RMB"} options={currencies} onChange={(value) => updateDraft("currency", value as Currency)} /></Field>
                <Field label="默认采购区域"><Select value={draft.defaultPurchaseRegion ?? "国内"} options={purchaseRegions} onChange={(value) => updateDraft("defaultPurchaseRegion", value as PurchaseRegion)} /></Field>
                <Field label="备注" wide><textarea className="min-h-20 w-full rounded-md border border-slate-200 bg-white p-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100" value={draft.remark ?? ""} onChange={(event) => updateDraft("remark", event.target.value)} placeholder="填写采购相关补充说明" /></Field>
              </FormSection>

              <FormSection index="03" title="申报信息" description="跨境平台申报、清关品名及产品属性">
                <TextField label="中文清关名" value={draft.declarationInfo?.chineseClearanceName} onChange={(value) => updateDeclaration("chineseClearanceName", value)} />
                <TextField label="英文清关名" value={draft.declarationInfo?.englishClearanceName} onChange={(value) => updateDeclaration("englishClearanceName", value)} />
                <TextField label="材质英文" value={draft.declarationInfo?.materialEnglish} onChange={(value) => updateDeclaration("materialEnglish", value)} />
                <TextField label="用途英文" value={draft.declarationInfo?.usageEnglish} onChange={(value) => updateDeclaration("usageEnglish", value)} />
                <TextField label="织造方式" value={draft.declarationInfo?.weavingMethod} onChange={(value) => updateDeclaration("weavingMethod", value)} />
                <Field label="品牌类型"><Select value={draft.declarationInfo?.brandType ?? "无品牌"} options={brandTypes} onChange={(value) => updateDeclaration("brandType", value as BrandType)} /></Field>
                <TextField label="产品材质" value={draft.declarationInfo?.productMaterial} onChange={(value) => updateDeclaration("productMaterial", value)} />
                <TextField label="产品用途" value={draft.declarationInfo?.productUsage} onChange={(value) => updateDeclaration("productUsage", value)} />
                <TextField label="产品型号" value={draft.declarationInfo?.productModel} onChange={(value) => updateDeclaration("productModel", value)} />
                <TextField label="申报品牌名称" value={draft.declarationInfo?.declarationBrandName} onChange={(value) => updateDeclaration("declarationBrandName", value)} />
                <TextField label="品牌英文名称" value={draft.declarationInfo?.brandEnglishName} onChange={(value) => updateDeclaration("brandEnglishName", value)} />
                <Field label="产品申报图片" error={errors.declarationImageUrl}>
                  <label className="flex h-9 cursor-pointer items-center justify-between rounded-md border border-dashed border-blue-200 bg-blue-50/60 px-3 text-xs text-blue-700 transition hover:border-blue-400 hover:bg-blue-50">
                    <span className="truncate">{draft.declarationInfo?.declarationImageUrl || "选择申报图片"}</span>
                    <span className="ml-2 shrink-0 font-medium">上传</span>
                    <input className="hidden" type="file" accept=".png,.jpg,.jpeg,image/png,image/jpeg" onChange={handleImage} />
                  </label>
                  <div className="mt-1 text-[11px] text-slate-400">大小不超过 5MB，支持 png / jpg / jpeg</div>
                </Field>
                <Field label="特殊属性" wide>
                  <div className="grid grid-cols-4 gap-2 rounded-lg border border-slate-200 bg-slate-50/80 p-3 md:grid-cols-6">
                    {specialAttributes.map((attribute) => <label key={attribute} className={`flex cursor-pointer items-center gap-1.5 rounded px-2 py-1.5 text-xs transition ${(draft.declarationInfo?.specialAttributes ?? []).includes(attribute) ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-white"}`}><input className="accent-blue-600" type="checkbox" checked={(draft.declarationInfo?.specialAttributes ?? []).includes(attribute)} onChange={(event) => {
                      const current = draft.declarationInfo?.specialAttributes ?? [];
                      updateDeclaration("specialAttributes", event.target.checked ? [...current, attribute] : current.filter((item) => item !== attribute));
                    }} />{attribute}</label>)}
                  </div>
                </Field>
              </FormSection>

              <FormSection index="04" title="报关信息" description="出口报关、进口清关及海关计量资料">
                <TextField label="中文报关名" required={draft.customsInfo?.needCustomsDeclaration} error={errors.chineseCustomsName} value={draft.customsInfo?.chineseCustomsName} onChange={(value) => updateCustoms("chineseCustomsName", value)} />
                <TextField label="英文报关名" required={draft.customsInfo?.needCustomsDeclaration} error={errors.englishCustomsName} value={draft.customsInfo?.englishCustomsName} onChange={(value) => updateCustoms("englishCustomsName", value)} />
                <TextField label="原产国 / 地区" value={draft.customsInfo?.originCountryOrRegion} onChange={(value) => updateCustoms("originCountryOrRegion", value)} />
                <TextField label="境内货源地" value={draft.customsInfo?.domesticSourcePlace} onChange={(value) => updateCustoms("domesticSourcePlace", value)} />
                <Field label="征免"><Select value={draft.customsInfo?.taxExemptionType ?? "照章征税"} options={exemptionTypes} onChange={(value) => updateCustoms("taxExemptionType", value as TaxExemptionType)} /></Field>
                <TextField label="其他申报要素" value={draft.customsInfo?.otherDeclarationElements} onChange={(value) => updateCustoms("otherDeclarationElements", value)} />
                <TextField label="报关材质" value={draft.customsInfo?.customsMaterial} onChange={(value) => updateCustoms("customsMaterial", value)} />
                <TextField label="报关用途" value={draft.customsInfo?.customsUsage} onChange={(value) => updateCustoms("customsUsage", value)} />
                <TextField label="规格型号" value={draft.customsInfo?.customsSpecificationModel} onChange={(value) => updateCustoms("customsSpecificationModel", value)} />
                <Field label="是否报关" required><Radio value={draft.customsInfo?.needCustomsDeclaration ?? true} onChange={(value) => updateCustoms("needCustomsDeclaration", value)} /></Field>
                <Field label="成交单位" required={draft.customsInfo?.needCustomsDeclaration} error={errors.transactionUnit}><Select value={draft.customsInfo?.transactionUnit ?? ""} options={units} onChange={(value) => updateCustoms("transactionUnit", value)} allowEmpty /></Field>
                <Field label="法定第二计量单位"><Select value={draft.customsInfo?.legalSecondUnit ?? ""} options={units} onChange={(value) => updateCustoms("legalSecondUnit", value)} allowEmpty /></Field>
                <Field label="法定第二计量单位数值" error={errors.legalSecondUnitValue}><input className={inputClass} type="number" min="0" value={draft.customsInfo?.legalSecondUnitValue ?? ""} onChange={(event) => updateCustoms("legalSecondUnitValue", event.target.value === "" ? undefined : Number(event.target.value))} /></Field>
              </FormSection>

              <FormSection index="05" title="系统信息" description="PCS 同步来源及操作记录，仅供查看">
                {[
                  ["数据来源", draft.systemInfo?.dataSource ?? "商品中心同步"],
                  ["来源系统", draft.systemInfo?.sourceSystem ?? "PCS"],
                  ["来源商品编码", draft.systemInfo?.sourceProductCode ?? "-"],
                  ["同步时间", draft.systemInfo?.syncedAt ?? "-"],
                  ["创建人", draft.createdBy],
                  ["创建时间", draft.createdAt],
                  ["更新人", draft.updatedBy ?? draft.systemInfo?.updatedBy ?? "-"],
                  ["更新时间", draft.updatedAt ?? draft.systemInfo?.updatedAt ?? "-"],
                ].map(([label, value]) => <Field key={label} label={label}><div className="flex h-9 items-center rounded-md border border-slate-200 bg-slate-100 px-3 text-sm text-slate-500">{value}</div></Field>)}
              </FormSection>
            </div>
            <div className="flex shrink-0 items-center justify-between border-t border-slate-200 bg-white px-6 py-3">
              <span className="text-xs text-slate-400">保存内容仅更新 PMS 补充信息，不反写商品中心 PCS。</span>
              <div className="flex gap-2">
                <button className="h-9 rounded-md border border-slate-300 bg-white px-5 text-sm text-slate-600 transition hover:bg-slate-50" onClick={() => { setEditing(null); setDraft(null); }}>取消</button>
                <button className="h-9 rounded-md bg-blue-600 px-6 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700" onClick={saveEdit}>保存修改</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <DetailModal open={Boolean(detail)} onClose={() => setDetail(null)} title="查看物料信息">
        {detail && <div className="space-y-3 text-sm">
          <SummarySection title="基础信息" pairs={[["物料编码", detail.materialCode], ["物料名称", detail.materialName], ["物料分类", detail.materialCategory], ["规格型号", detail.specification], ["状态", detail.status], ["数据来源", detail.systemInfo?.dataSource ?? "商品中心同步"]]} />
          <SummarySection title="申报 / 报关" pairs={[["中文清关名", detail.declarationInfo?.chineseClearanceName ?? "-"], ["英文清关名", detail.declarationInfo?.englishClearanceName ?? "-"], ["中文报关名", detail.customsInfo?.chineseCustomsName ?? "-"], ["是否报关", detail.customsInfo?.needCustomsDeclaration === false ? "否" : "是"]]} />
          <div className="flex justify-end gap-2">
            <button className="rounded border px-3 py-1.5" onClick={() => setDetail(null)}>关闭</button>
            <button className="rounded border px-3 py-1.5" onClick={() => { setDetail(null); openEdit(detail); }}>编辑</button>
          </div>
        </div>}
      </DetailModal>

      <ConfirmModal
        open={Boolean(confirmRow && confirmAction)}
        onClose={() => { setConfirmRow(null); setConfirmAction(null); }}
        onConfirm={doStatus}
        title={confirmAction === "enable" ? "确认启用物料？" : "确认停用物料？"}
        content={confirmAction === "enable" ? "启用后，该物料可用于采购流程。" : "停用后，该物料不能再用于新采购单，历史单据不受影响。"}
        confirmText={confirmAction === "enable" ? "确认启用" : "确认停用"}
      />
      <Toast msg={toast} />
    </div>
  );
}

function FormSection({ index, title, description, children }: { index: string; title: string; description: string; children: ReactNode }) {
  return <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
    <div className="flex items-center gap-3 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white px-4 py-3">
      <span className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-600 text-xs font-semibold text-white">{index}</span>
      <div>
        <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
        <p className="mt-0.5 text-[11px] text-slate-400">{description}</p>
      </div>
    </div>
    <div className="grid grid-cols-2 gap-x-4 gap-y-3 p-4 lg:grid-cols-3">{children}</div>
  </section>;
}

function Field({ label, required, error, wide, children }: { label: string; required?: boolean; error?: string; wide?: boolean; children: ReactNode }) {
  return <label className={wide ? "col-span-full" : "block"}>
    <div className="mb-1.5 text-xs font-medium text-slate-600">{label}{required && <span className="ml-1 text-red-500">*</span>}</div>
    {children}
    {error && <div className="mt-1 text-xs text-red-500">{error}</div>}
  </label>;
}

function TextField({ label, value, onChange, required, error }: { label: string; value?: string; onChange: (value: string) => void; required?: boolean; error?: string }) {
  return <Field label={label} required={required} error={error}><input className={`${inputClass} ${error ? "border-red-500" : ""}`} value={value ?? ""} onChange={(event) => onChange(event.target.value)} /></Field>;
}

function Select({ value, options, labels, onChange, allowEmpty }: { value: string; options: readonly string[]; labels?: Record<string, string>; onChange: (value: string) => void; allowEmpty?: boolean }) {
  return <select className={inputClass} value={value} onChange={(event) => onChange(event.target.value)}>
    {allowEmpty && <option value="">请选择</option>}
    {options.map((option) => <option key={option} value={option}>{labels?.[option] ?? option}</option>)}
  </select>;
}

function Radio({ value, onChange }: { value: boolean; onChange: (value: boolean) => void }) {
  return <div className="flex h-9 items-center gap-2 rounded-md border border-slate-200 bg-slate-50 p-1 text-sm">
    <label className={`flex h-7 flex-1 cursor-pointer items-center justify-center gap-1 rounded transition ${value ? "bg-white font-medium text-blue-600 shadow-sm" : "text-slate-500"}`}><input className="sr-only" type="radio" checked={value} onChange={() => onChange(true)} />是</label>
    <label className={`flex h-7 flex-1 cursor-pointer items-center justify-center gap-1 rounded transition ${!value ? "bg-white font-medium text-blue-600 shadow-sm" : "text-slate-500"}`}><input className="sr-only" type="radio" checked={!value} onChange={() => onChange(false)} />否</label>
  </div>;
}

function SummarySection({ title, pairs }: { title: string; pairs: [string, string][] }) {
  return <section className="rounded border border-gray-200 p-3">
    <h3 className="mb-2 font-medium">{title}</h3>
    <div className="grid grid-cols-2 gap-2">{pairs.map(([label, value]) => <div key={label}><span className="text-gray-500">{label}：</span>{value}</div>)}</div>
  </section>;
}
