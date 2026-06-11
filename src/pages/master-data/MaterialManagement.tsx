import { type Dispatch, type SetStateAction, useMemo, useState } from "react";
import ConfirmModal from "../../components/common/ConfirmModal";
import DataTable from "../../components/common/DataTable";
import DetailModal from "../../components/common/DetailModal";
import FormModal from "../../components/common/FormModal";
import PageHeader from "../../components/common/PageHeader";
import SearchBar from "../../components/common/SearchBar";
import StatusBadge from "../../components/common/StatusBadge";
import Toast from "../../components/common/Toast";
import { materials as initialMaterials } from "../../mock/materials";
import { suppliers } from "../../mock/suppliers";
import type { Currency, Material, MaterialCategory, MaterialPurpose, MaterialStatus, Unit } from "../../types/material";

type FormValues = Omit<Material, "id" | "materialCode" | "status" | "createdBy" | "createdAt" | "updatedAt" | "needInspection"> & {
  needInspection?: boolean;
};
type Errors = Partial<Record<keyof FormValues, string>>;

const categories: MaterialCategory[] = ["面料", "辅料", "纱线", "包材", "耗材", "样衣", "成衣"];
const purposes: MaterialPurpose[] = ["生产用", "包装用", "样衣开发", "成衣采购", "日常耗材"];
const units: Unit[] = ["米", "码", "公斤", "个", "件", "卷", "箱", "包", "打"];
const currencies: Currency[] = ["RMB", "USD", "IDR"];
const categoryPrefix: Record<MaterialCategory, string> = { 面料: "FAB", 辅料: "ACC", 纱线: "YAR", 包材: "PKG", 耗材: "CON", 样衣: "SAM", 成衣: "GAR" };
const supplierOptions = suppliers.map((s) => s.supplierName);

const emptyForm: FormValues = {
  materialName: "",
  materialCategory: "面料",
  specification: "",
  materialPurpose: undefined,
  styleNo: "",
  composition: "",
  weight: "",
  width: "",
  color: "",
  colorCode: "",
  size: "",
  baseUnit: "米",
  purchaseUnit: "米",
  inventoryUnit: "米",
  conversionRate: "",
  defaultSupplier: "",
  referencePurchasePrice: undefined,
  currency: "RMB",
  minPurchaseQty: undefined,
  purchaseLeadTime: undefined,
  needInspection: undefined,
  inspectionRequirement: "",
  batchManagement: false,
  colorSizeManagement: false,
  totalPurchaseOrders: 0,
  totalPurchaseQty: 0,
  totalPurchaseAmount: 0,
  recentPurchaseOrderNo: "",
  recentPurchaseDate: "",
  remark: "",
};

const now = () => new Date().toLocaleString("zh-CN", { hour12: false });

export default function MaterialManagement() {
  const [rows, setRows] = useState<Material[]>(initialMaterials);
  const [kwInput, setKwInput] = useState("");
  const [kw, setKw] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [qcFilter, setQcFilter] = useState("");
  const [supplierFilter, setSupplierFilter] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Material | null>(null);
  const [form, setForm] = useState<FormValues>(emptyForm);
  const [errors, setErrors] = useState<Errors>({});
  const [detail, setDetail] = useState<Material | null>(null);
  const [confirmRow, setConfirmRow] = useState<Material | null>(null);
  const [confirmAction, setConfirmAction] = useState<"enable" | "disable" | null>(null);
  const [toast, setToast] = useState("");

  const filtered = useMemo(
    () =>
      rows.filter((x) => {
        const hitKw =
          !kw.trim() ||
          [x.materialCode, x.materialName, x.specification, x.color ?? "", x.colorCode ?? ""].some((v) =>
            v.toLowerCase().includes(kw.trim().toLowerCase()),
          );
        const hitCat = !categoryFilter || x.materialCategory === categoryFilter;
        const hitStatus = !statusFilter || x.status === statusFilter;
        const hitQc = !qcFilter || String(x.needInspection) === qcFilter;
        const hitSup = !supplierFilter || x.defaultSupplier === supplierFilter;
        return hitKw && hitCat && hitStatus && hitQc && hitSup;
      }),
    [rows, kw, categoryFilter, statusFilter, qcFilter, supplierFilter],
  );

  const showToast = (m: string) => {
    setToast(m);
    window.setTimeout(() => setToast(""), 2200);
  };

  const resetFilters = () => {
    setKwInput("");
    setKw("");
    setCategoryFilter("");
    setStatusFilter("");
    setQcFilter("");
    setSupplierFilter("");
  };

  const openCreate = () => {
    setEditing(null);
    setErrors({});
    setForm({ ...emptyForm });
    setFormOpen(true);
  };

  const openEdit = (row: Material) => {
    setEditing(row);
    setErrors({});
    setForm({
      materialName: row.materialName,
      materialCategory: row.materialCategory,
      specification: row.specification,
      materialPurpose: row.materialPurpose,
      styleNo: row.styleNo,
      composition: row.composition,
      weight: row.weight,
      width: row.width,
      color: row.color,
      colorCode: row.colorCode,
      size: row.size,
      baseUnit: row.baseUnit,
      purchaseUnit: row.purchaseUnit,
      inventoryUnit: row.inventoryUnit,
      conversionRate: row.conversionRate,
      defaultSupplier: row.defaultSupplier,
      referencePurchasePrice: row.referencePurchasePrice,
      currency: row.currency,
      minPurchaseQty: row.minPurchaseQty,
      purchaseLeadTime: row.purchaseLeadTime,
      needInspection: row.needInspection,
      inspectionRequirement: row.inspectionRequirement,
      batchManagement: row.batchManagement,
      colorSizeManagement: row.colorSizeManagement,
      totalPurchaseOrders: row.totalPurchaseOrders,
      totalPurchaseQty: row.totalPurchaseQty,
      totalPurchaseAmount: row.totalPurchaseAmount,
      recentPurchaseOrderNo: row.recentPurchaseOrderNo,
      recentPurchaseDate: row.recentPurchaseDate,
      remark: row.remark,
    });
    setFormOpen(true);
  };

  const validate = (isEdit: boolean) => {
    const e: Errors = {};
    const required: (keyof FormValues)[] = [
      "materialName",
      "materialCategory",
      "specification",
      "materialPurpose",
      "baseUnit",
      "purchaseUnit",
      "inventoryUnit",
      "needInspection",
    ];

    required.forEach((k) => {
      if (k === "needInspection") {
        if (form.needInspection === undefined) e.needInspection = "请选择是否需要质检";
        return;
      }
      if (!String(form[k] ?? "").trim()) e[k] = `${selectFields.has(String(k)) ? "请选择" : "请输入"}${fieldLabel[k]}`;
    });

    if (form.referencePurchasePrice !== undefined && Number(form.referencePurchasePrice) < 0) e.referencePurchasePrice = "参考采购价不能小于 0";
    if (form.minPurchaseQty !== undefined && Number(form.minPurchaseQty) < 0) e.minPurchaseQty = "最小采购量不能小于 0";
    if (form.purchaseLeadTime !== undefined && Number(form.purchaseLeadTime) < 0) e.purchaseLeadTime = "采购提前期不能小于 0";

    const dup = rows.some(
      (x) =>
        x.materialName === form.materialName &&
        x.specification === form.specification &&
        (x.color ?? "") === (form.color ?? "") &&
        (x.colorCode ?? "") === (form.colorCode ?? "") &&
        (!isEdit || x.id !== editing?.id),
    );
    if (dup) e.materialName = "当前物料名称、规格、颜色 / 色号已存在";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const nextCode = (category: MaterialCategory) => {
    const prefix = categoryPrefix[category];
    const count = rows.filter((x) => x.materialCode.startsWith(`${prefix}-2026-`)).length + 1;
    return `${prefix}-2026-${String(count).padStart(4, "0")}`;
  };

  const createMaterial = (status: MaterialStatus) => {
    if (!validate(false)) return;
    const item: Material = {
      id: String(Date.now()),
      materialCode: nextCode(form.materialCategory),
      status,
      createdBy: "当前用户",
      createdAt: now(),
      updatedAt: now(),
      ...form,
      needInspection: form.needInspection ?? false,
    };
    setRows((s) => [item, ...s]);
    setFormOpen(false);
    showToast(status === "草稿" ? "物料草稿已保存" : "物料已启用");
  };

  const saveEdit = () => {
    if (!editing || !validate(true)) return;
    setRows((s) =>
      s.map((x) =>
        x.id === editing.id ? { ...x, ...form, needInspection: form.needInspection ?? false, status: x.status, updatedAt: now() } : x,
      ),
    );
    setFormOpen(false);
    showToast("物料信息已更新");
  };

  const doStatus = () => {
    if (!confirmRow || !confirmAction) return;
    const next: MaterialStatus = confirmAction === "enable" ? "已启用" : "已停用";
    setRows((s) => s.map((x) => (x.id === confirmRow.id ? { ...x, status: next, updatedAt: now() } : x)));
    if (detail?.id === confirmRow.id) setDetail({ ...detail, status: next, updatedAt: now() });
    setConfirmRow(null);
    setConfirmAction(null);
    showToast(next === "已启用" ? "物料已启用" : "物料已停用");
  };

  return (
    <div>
      <PageHeader title="物料管理" desc="用于维护面料、辅料、纱线、包材、耗材、样衣、成衣等采购物料档案，并作为采购申请、采购订单、供应商发货和采购对账的基础数据。" />
      <SearchBar>
        <div className="flex flex-wrap items-center gap-2">
          <input className="h-8 w-80 rounded border px-2 text-sm" value={kwInput} onChange={(e) => setKwInput(e.target.value)} placeholder="搜索物料编码 / 物料名称 / 规格型号 / 颜色 / 色号" />
          <select className="h-8 rounded border px-2 text-sm" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}><option value="">全部分类</option>{categories.map((x) => <option key={x}>{x}</option>)}</select>
          <select className="h-8 rounded border px-2 text-sm" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}><option value="">全部状态</option>{["草稿", "已启用", "已停用"].map((x) => <option key={x}>{x}</option>)}</select>
          <select className="h-8 rounded border px-2 text-sm" value={qcFilter} onChange={(e) => setQcFilter(e.target.value)}><option value="">全部</option><option value="true">是</option><option value="false">否</option></select>
          <select className="h-8 rounded border px-2 text-sm" value={supplierFilter} onChange={(e) => setSupplierFilter(e.target.value)}><option value="">全部供应商</option>{supplierOptions.map((x) => <option key={x}>{x}</option>)}</select>
          <button className="h-8 rounded bg-brand px-3 text-sm text-white" onClick={() => setKw(kwInput)}>查询</button>
          <button className="h-8 rounded border border-gray-300 px-3 text-sm" onClick={resetFilters}>清除</button>
          <button className="ml-auto h-8 rounded bg-brand px-3 text-sm text-white" onClick={openCreate}>新增物料</button>
        </div>
      </SearchBar>

      <DataTable
        columns={[
          { key: "materialCode", title: "物料编码", render: (r) => <button className="text-blue-600" onClick={() => setDetail(r)}>{r.materialCode}</button> },
          { key: "materialName", title: "物料名称" },
          { key: "materialCategory", title: "物料分类" },
          { key: "specification", title: "规格型号" },
          { key: "color", title: "颜色/色号", render: (r) => `${r.color || "-"}${r.colorCode ? ` / ${r.colorCode}` : ""}` },
          { key: "baseUnit", title: "单位" },
          { key: "purchaseUnit", title: "采购单位" },
          { key: "inventoryUnit", title: "库存单位" },
          { key: "defaultSupplier", title: "默认供应商" },
          { key: "needInspection", title: "是否需质检", render: (r) => <span className={`rounded-full px-2 py-0.5 text-xs ${r.needInspection ? "bg-orange-100 text-orange-700" : "bg-gray-100 text-gray-700"}`}>{r.needInspection ? "是" : "否"}</span> },
          { key: "status", title: "状态", render: (r) => <StatusBadge status={r.status} /> },
          { key: "createdBy", title: "创建人" },
          { key: "createdAt", title: "创建时间" },
          {
            key: "op",
            title: "操作",
            render: (r) => (
              <div className="space-x-2 whitespace-nowrap text-xs">
                <button className="text-blue-600" onClick={() => setDetail(r)}>查看</button>
                <button className="text-blue-600" onClick={() => openEdit(r)}>编辑</button>
                {r.status !== "已启用" && <button className="text-green-600" onClick={() => { setConfirmRow(r); setConfirmAction("enable"); }}>启用</button>}
                {r.status === "已启用" && <button className="text-red-600" onClick={() => { setConfirmRow(r); setConfirmAction("disable"); }}>停用</button>}
              </div>
            ),
          },
        ]}
        rows={filtered}
      />

      <div className="mt-3 rounded border border-gray-200 bg-white p-4">
        <h3 className="mb-3 font-semibold">设计逻辑说明</h3>
        <LogicTable
          title="七、表单校验规则"
          headers={["字段", "是否必填", "校验规则", "错误提示"]}
          rows={[
            ["物料名称", "是", "不可为空", "请输入物料名称"],
            ["物料分类", "是", "必须选择", "请选择物料分类"],
            ["规格型号", "是", "不可为空", "请输入规格型号"],
            ["物料用途", "是", "必须选择", "请选择物料用途"],
            ["基础单位", "是", "必须选择", "请选择基础单位"],
            ["采购单位", "是", "必须选择", "请选择采购单位"],
            ["库存单位", "是", "必须选择", "请选择库存单位"],
            ["是否需要质检", "是", "必须选择", "请选择是否需要质检"],
            ["参考采购价", "否", "必须大于等于 0", "参考采购价不能小于 0"],
            ["最小采购量", "否", "必须大于等于 0", "最小采购量不能小于 0"],
            ["采购提前期", "否", "必须大于等于 0", "采购提前期不能小于 0"],
          ]}
        />
        <LogicTable
          title="重复校验规则"
          headers={["场景", "校验方式"]}
          rows={[
            ["新增物料", "物料名称 + 规格型号 + 颜色 / 色号不能重复"],
            ["编辑物料", "排除当前物料后再比较"],
            ["校验失败", "弹窗不关闭，数据不保存，字段下方展示错误提示"],
          ]}
        />
      </div>

      <FormModal open={formOpen} onClose={() => setFormOpen(false)} title={editing ? "编辑物料" : "新增物料"} widthClass="w-[760px]">
        {editing && <div className="mb-3 rounded bg-gray-50 px-3 py-2 text-sm">物料编码：{editing.materialCode}</div>}
        <div className="grid grid-cols-2 gap-3 text-sm">
          {renderInput("materialName", "物料名称", form, setForm, errors, true)}
          {renderSelect("materialCategory", "物料分类", form, setForm, errors, categories, true)}
          {renderInput("specification", "规格型号", form, setForm, errors, true)}
          {renderSelect("materialPurpose", "物料用途", form, setForm, errors, purposes, true)}
          {renderInput("styleNo", "款号", form, setForm, errors)}
          {renderInput("composition", "成分", form, setForm, errors)}
          {renderInput("weight", "克重", form, setForm, errors)}
          {renderInput("width", "幅宽", form, setForm, errors)}
          {renderInput("color", "颜色", form, setForm, errors)}
          {renderInput("colorCode", "色号", form, setForm, errors)}
          {renderInput("size", "尺码", form, setForm, errors)}
          {renderSelect("baseUnit", "基础单位", form, setForm, errors, units, true)}
          {renderSelect("purchaseUnit", "采购单位", form, setForm, errors, units, true)}
          {renderSelect("inventoryUnit", "库存单位", form, setForm, errors, units, true)}
          {renderInput("conversionRate", "换算关系", form, setForm, errors)}
          {renderSelect("defaultSupplier", "默认供应商", form, setForm, errors, supplierOptions)}
          {renderNumber("referencePurchasePrice", "参考采购价", form, setForm, errors)}
          {renderSelect("currency", "币种", form, setForm, errors, currencies)}
          {renderNumber("minPurchaseQty", "最小采购量", form, setForm, errors)}
          {renderNumber("purchaseLeadTime", "采购提前期", form, setForm, errors)}
          {renderBoolean("needInspection", "是否需要质检", form, setForm, errors, true)}
          {renderInput("inspectionRequirement", "质检要求", form, setForm, errors)}
          {renderBoolean("batchManagement", "启用批次管理", form, setForm, errors)}
          {renderBoolean("colorSizeManagement", "启用颜色尺码", form, setForm, errors)}
          <div className="col-span-2">{renderInput("remark", "备注", form, setForm, errors)}</div>
        </div>
        <div className="sticky bottom-0 mt-4 flex justify-end gap-2 border-t bg-white pt-3">
          <button className="rounded border border-gray-300 px-3 py-1.5 text-sm" onClick={() => setFormOpen(false)}>取消</button>
          {!editing && <button className="rounded border border-gray-300 px-3 py-1.5 text-sm" onClick={() => createMaterial("草稿")}>保存草稿</button>}
          {!editing && <button className="rounded bg-brand px-3 py-1.5 text-sm text-white" onClick={() => createMaterial("已启用")}>保存并启用</button>}
          {editing && <button className="rounded bg-brand px-3 py-1.5 text-sm text-white" onClick={saveEdit}>保存</button>}
        </div>
      </FormModal>

      <DetailModal open={!!detail} onClose={() => setDetail(null)} title="物料详情">
        {detail && (
          <div className="space-y-3 text-sm">
            <Section title="基础信息" pairs={[["物料编码", detail.materialCode], ["物料名称", detail.materialName], ["物料分类", detail.materialCategory], ["规格型号", detail.specification], ["物料用途", detail.materialPurpose || "-"], ["状态", detail.status]]} />
            <div className="flex justify-end gap-2">
              <button className="rounded border border-gray-300 px-3 py-1.5 text-sm" onClick={() => setDetail(null)}>关闭</button>
              <button className="rounded border border-gray-300 px-3 py-1.5 text-sm" onClick={() => { setDetail(null); openEdit(detail); }}>编辑</button>
              {detail.status === "已启用" ? (
                <button className="rounded bg-red-600 px-3 py-1.5 text-sm text-white" onClick={() => { setConfirmRow(detail); setConfirmAction("disable"); }}>停用</button>
              ) : (
                <button className="rounded bg-green-600 px-3 py-1.5 text-sm text-white" onClick={() => { setConfirmRow(detail); setConfirmAction("enable"); }}>启用</button>
              )}
            </div>
          </div>
        )}
      </DetailModal>

      <ConfirmModal
        open={!!confirmRow && !!confirmAction}
        onClose={() => { setConfirmRow(null); setConfirmAction(null); }}
        onConfirm={doStatus}
        title={confirmAction === "enable" ? "确认启用物料？" : "确认停用物料？"}
        content={confirmAction === "enable" ? "启用后，该物料可用于采购申请、采购订单和供应商协同。" : "停用后，该物料将不能再用于新建采购申请和采购订单，但历史单据不受影响。"}
        confirmText={confirmAction === "enable" ? "确认启用" : "确认停用"}
      />
      <Toast msg={toast} />
    </div>
  );
}

const fieldLabel: Record<string, string> = {
  materialName: "物料名称",
  materialCategory: "物料分类",
  specification: "规格型号",
  materialPurpose: "物料用途",
  baseUnit: "基础单位",
  purchaseUnit: "采购单位",
  inventoryUnit: "库存单位",
  needInspection: "是否需要质检",
};
const selectFields = new Set(["materialCategory", "materialPurpose", "baseUnit", "purchaseUnit", "inventoryUnit", "needInspection"]);

function Label({ text, required }: { text: string; required?: boolean }) {
  return (
    <div className="mb-1 text-xs text-gray-600">
      {text}
      {required && <span className="ml-1 text-red-500">*</span>}
    </div>
  );
}

function renderInput(key: keyof FormValues, label: string, form: FormValues, setForm: Dispatch<SetStateAction<FormValues>>, errors: Errors, required = false) {
  return (
    <label className="block">
      <Label text={label} required={required} />
      <input className={`h-8 w-full rounded border px-2 text-sm ${errors[key] ? "border-red-500" : "border-gray-300"}`} value={String(form[key] ?? "")} onChange={(e) => setForm((s) => ({ ...s, [key]: e.target.value }))} />
      {errors[key] && <div className="mt-1 text-xs text-red-500">{errors[key]}</div>}
    </label>
  );
}

function renderNumber(key: keyof FormValues, label: string, form: FormValues, setForm: Dispatch<SetStateAction<FormValues>>, errors: Errors) {
  return (
    <label className="block">
      <Label text={label} />
      <input type="number" className={`h-8 w-full rounded border px-2 text-sm ${errors[key] ? "border-red-500" : "border-gray-300"}`} value={form[key] === undefined ? "" : String(form[key])} onChange={(e) => setForm((s) => ({ ...s, [key]: e.target.value === "" ? undefined : Number(e.target.value) }))} />
      {errors[key] && <div className="mt-1 text-xs text-red-500">{errors[key]}</div>}
    </label>
  );
}

function renderSelect(key: keyof FormValues, label: string, form: FormValues, setForm: Dispatch<SetStateAction<FormValues>>, errors: Errors, options: string[], required = false) {
  return (
    <label className="block">
      <Label text={label} required={required} />
      <select className={`h-8 w-full rounded border px-2 text-sm ${errors[key] ? "border-red-500" : "border-gray-300"}`} value={String(form[key] ?? "")} onChange={(e) => setForm((s) => ({ ...s, [key]: e.target.value }))}>
        <option value="">请选择</option>
        {options.map((x) => <option key={x}>{x}</option>)}
      </select>
      {errors[key] && <div className="mt-1 text-xs text-red-500">{errors[key]}</div>}
    </label>
  );
}

function renderBoolean(key: keyof FormValues, label: string, form: FormValues, setForm: Dispatch<SetStateAction<FormValues>>, errors: Errors, required = false) {
  const raw = form[key];
  return (
    <label className="block">
      <Label text={label} required={required} />
      <select className={`h-8 w-full rounded border px-2 text-sm ${errors[key] ? "border-red-500" : "border-gray-300"}`} value={raw === undefined ? "" : raw ? "true" : "false"} onChange={(e) => setForm((s) => ({ ...s, [key]: e.target.value === "" ? undefined : e.target.value === "true" }))}>
        <option value="">请选择</option>
        <option value="true">是</option>
        <option value="false">否</option>
      </select>
      {errors[key] && <div className="mt-1 text-xs text-red-500">{errors[key]}</div>}
    </label>
  );
}

function Section({ title, pairs }: { title: string; pairs: [string, string][] }) {
  return (
    <div className="rounded border border-gray-200 p-3">
      <div className="mb-2 font-medium">{title}</div>
      <div className="grid grid-cols-2 gap-2">{pairs.map(([k, v]) => <div key={`${title}-${k}`}><span className="text-gray-500">{k}：</span>{v}</div>)}</div>
    </div>
  );
}

function LogicTable({ title, headers, rows }: { title: string; headers: string[]; rows: string[][] }) {
  return (
    <div className="mb-4">
      <h4 className="mb-2 text-sm font-semibold text-gray-800">{title}</h4>
      <div className="overflow-x-auto rounded border border-gray-200">
        <table className="min-w-full text-left text-xs">
          <thead className="bg-gray-50"><tr>{headers.map((h) => <th key={h} className="border-b border-gray-200 px-2 py-2 font-medium text-gray-700">{h}</th>)}</tr></thead>
          <tbody>{rows.map((r, i) => <tr key={`${title}-${i}`} className="border-b border-gray-100 last:border-b-0">{r.map((c, j) => <td key={`${title}-${i}-${j}`} className="px-2 py-2 text-gray-700">{c}</td>)}</tr>)}</tbody>
        </table>
      </div>
    </div>
  );
}
