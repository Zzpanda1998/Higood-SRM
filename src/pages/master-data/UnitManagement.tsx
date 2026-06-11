import { type Dispatch, type SetStateAction, useMemo, useState } from "react";
import ConfirmModal from "../../components/common/ConfirmModal";
import DataTable from "../../components/common/DataTable";
import DetailModal from "../../components/common/DetailModal";
import FormModal from "../../components/common/FormModal";
import PageHeader from "../../components/common/PageHeader";
import SearchBar from "../../components/common/SearchBar";
import StatusBadge from "../../components/common/StatusBadge";
import Toast from "../../components/common/Toast";
import { units as initialUnits } from "../../mock/units";
import type { ApplicableMaterial, Unit, UnitStatus, UnitType } from "../../types/unit";

type UnitForm = Omit<Unit, "id" | "unitCode" | "status" | "referencedMaterialCount" | "referencedPurchaseOrderCount" | "recentUsedTime" | "createdBy" | "createdAt" | "updatedAt">;
type Errors = Partial<Record<keyof UnitForm, string>>;

const unitTypes: UnitType[] = ["长度", "重量", "数量", "包装", "面积", "体积"];
const materialOptions: ApplicableMaterial[] = ["面料", "辅料", "纱线", "包材", "耗材", "样衣", "成衣"];
const precisionOptions = [0, 1, 2, 3];
const now = () => new Date().toLocaleString("zh-CN", { hour12: false });

const emptyForm: UnitForm = {
  unitName: "",
  unitSymbol: "",
  unitType: "数量",
  isBaseUnit: true,
  applicableMaterials: [],
  decimalPrecision: 0,
  remark: "",
};

export default function UnitManagement() {
  const [rows, setRows] = useState<Unit[]>(initialUnits);
  const [kwInput, setKwInput] = useState("");
  const [kw, setKw] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [baseFilter, setBaseFilter] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Unit | null>(null);
  const [form, setForm] = useState<UnitForm>(emptyForm);
  const [errors, setErrors] = useState<Errors>({});
  const [detail, setDetail] = useState<Unit | null>(null);
  const [confirmRow, setConfirmRow] = useState<Unit | null>(null);
  const [confirmAction, setConfirmAction] = useState<"enable" | "disable" | null>(null);
  const [toast, setToast] = useState("");

  const filtered = useMemo(
    () =>
      rows.filter((x) => {
        const hitKw =
          !kw.trim() ||
          [x.unitCode, x.unitName, x.unitSymbol].some((v) => v.toLowerCase().includes(kw.trim().toLowerCase()));
        const hitType = !typeFilter || x.unitType === typeFilter;
        const hitStatus = !statusFilter || x.status === statusFilter;
        const hitBase = !baseFilter || String(x.isBaseUnit) === baseFilter;
        return hitKw && hitType && hitStatus && hitBase;
      }),
    [rows, kw, typeFilter, statusFilter, baseFilter],
  );

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(""), 2200);
  };

  const resetFilters = () => {
    setKwInput("");
    setKw("");
    setTypeFilter("");
    setStatusFilter("");
    setBaseFilter("");
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm });
    setErrors({});
    setFormOpen(true);
  };

  const openEdit = (row: Unit) => {
    setEditing(row);
    setForm({
      unitName: row.unitName,
      unitSymbol: row.unitSymbol,
      unitType: row.unitType,
      isBaseUnit: row.isBaseUnit,
      applicableMaterials: row.applicableMaterials,
      decimalPrecision: row.decimalPrecision,
      remark: row.remark ?? "",
    });
    setErrors({});
    setFormOpen(true);
  };

  const validate = (isEdit: boolean) => {
    const e: Errors = {};
    if (!form.unitName.trim()) e.unitName = "请输入单位名称";
    if (!form.unitSymbol.trim()) e.unitSymbol = "请输入英文缩写";
    if (!form.unitType) e.unitType = "请选择单位类型";
    if (form.isBaseUnit === undefined) e.isBaseUnit = "请选择是否基础单位";
    if (form.decimalPrecision === undefined || !precisionOptions.includes(Number(form.decimalPrecision))) e.decimalPrecision = "请选择小数精度";

    const sameName = rows.some((x) => x.unitName === form.unitName && (!isEdit || x.id !== editing?.id));
    const sameSymbol = rows.some((x) => x.unitSymbol === form.unitSymbol && (!isEdit || x.id !== editing?.id));
    if (sameName) e.unitName = "单位名称已存在";
    if (sameSymbol) e.unitSymbol = "英文缩写已存在";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const nextCode = () => `U-${String(rows.length + 1).padStart(3, "0")}`;

  const createUnit = () => {
    if (!validate(false)) return;
    const item: Unit = {
      id: String(Date.now()),
      unitCode: nextCode(),
      status: "已启用",
      referencedMaterialCount: 0,
      referencedPurchaseOrderCount: 0,
      recentUsedTime: "",
      createdBy: "当前用户",
      createdAt: now(),
      updatedAt: now(),
      ...form,
    };
    setRows((s) => [item, ...s]);
    setFormOpen(false);
    showToast("单位已新增");
  };

  const saveEdit = () => {
    if (!editing || !validate(true)) return;
    setRows((s) => s.map((x) => (x.id === editing.id ? { ...x, ...form, status: x.status, updatedAt: now() } : x)));
    setFormOpen(false);
    showToast("单位信息已更新");
  };

  const confirmStatus = (row: Unit, action: "enable" | "disable") => {
    setConfirmRow(row);
    setConfirmAction(action);
  };

  const doStatus = () => {
    if (!confirmRow || !confirmAction) return;
    const status: UnitStatus = confirmAction === "enable" ? "已启用" : "已停用";
    setRows((s) => s.map((x) => (x.id === confirmRow.id ? { ...x, status, updatedAt: now() } : x)));
    if (detail?.id === confirmRow.id) setDetail({ ...detail, status, updatedAt: now() });
    setConfirmRow(null);
    setConfirmAction(null);
    showToast(status === "已启用" ? "单位已启用" : "单位已停用");
  };

  return (
    <div>
      <PageHeader title="单位管理" desc="用于维护 SRM 系统中的计量单位基础字典，供物料档案、采购申请、采购订单、供应商发货和采购对账引用。" />
      <SearchBar>
        <div className="flex flex-wrap items-center gap-2">
          <input className="h-8 w-72 rounded border px-2 text-sm" value={kwInput} onChange={(e) => setKwInput(e.target.value)} placeholder="搜索单位编码 / 单位名称 / 英文缩写" />
          <select className="h-8 rounded border px-2 text-sm" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="">全部类型</option>
            {unitTypes.map((x) => <option key={x}>{x}</option>)}
          </select>
          <select className="h-8 rounded border px-2 text-sm" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">全部状态</option>
            <option>已启用</option>
            <option>已停用</option>
          </select>
          <select className="h-8 rounded border px-2 text-sm" value={baseFilter} onChange={(e) => setBaseFilter(e.target.value)}>
            <option value="">全部</option>
            <option value="true">是</option>
            <option value="false">否</option>
          </select>
          <button className="h-8 rounded bg-brand px-3 text-sm text-white" onClick={() => setKw(kwInput)}>查询</button>
          <button className="h-8 rounded border border-gray-300 px-3 text-sm" onClick={resetFilters}>清除</button>
          <button className="ml-auto h-8 rounded bg-brand px-3 text-sm text-white" onClick={openCreate}>新增单位</button>
        </div>
      </SearchBar>

      <DataTable
        columns={[
          { key: "unitCode", title: "单位编码", render: (r) => <button className="text-blue-600" onClick={() => setDetail(r)}>{r.unitCode}</button> },
          { key: "unitName", title: "单位名称" },
          { key: "unitSymbol", title: "英文缩写" },
          { key: "unitType", title: "单位类型" },
          { key: "isBaseUnit", title: "是否基础单位", render: (r) => <BaseBadge value={r.isBaseUnit} /> },
          { key: "applicableMaterials", title: "适用物料", render: (r) => r.applicableMaterials.join("、") || "-" },
          { key: "decimalPrecision", title: "小数精度" },
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
                {r.status === "已启用" ? (
                  <button className="text-red-600" onClick={() => confirmStatus(r, "disable")}>停用</button>
                ) : (
                  <button className="text-green-600" onClick={() => confirmStatus(r, "enable")}>启用</button>
                )}
              </div>
            ),
          },
        ]}
        rows={filtered}
      />

      <DesignLogic />

      <FormModal open={formOpen} onClose={() => setFormOpen(false)} title={editing ? "编辑单位" : "新增单位"} widthClass="w-[560px]">
        {editing && <div className="mb-3 rounded bg-gray-50 px-3 py-2 text-sm">单位编码：{editing.unitCode}</div>}
        {editing && (editing.referencedMaterialCount || editing.referencedPurchaseOrderCount) ? (
          <div className="mb-3 rounded border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
            当前单位已被引用，修改名称和英文缩写会影响后续展示口径。
          </div>
        ) : null}
        <div className="grid grid-cols-2 gap-3 text-sm">
          {renderInput("unitName", "单位名称", form, setForm, errors, true)}
          {renderInput("unitSymbol", "英文缩写", form, setForm, errors, true)}
          {renderSelect("unitType", "单位类型", form, setForm, errors, unitTypes, true)}
          {renderBoolean("isBaseUnit", "是否基础单位", form, setForm, errors, true)}
          {renderSelect("decimalPrecision", "小数精度", form, setForm, errors, precisionOptions.map(String), true)}
          <div className="col-span-2">
            <div className="mb-1 text-xs text-gray-600">适用物料</div>
            <div className="flex flex-wrap gap-2 rounded border border-gray-300 p-2">
              {materialOptions.map((m) => (
                <label key={m} className="flex items-center gap-1 text-xs">
                  <input
                    type="checkbox"
                    checked={form.applicableMaterials.includes(m)}
                    onChange={(e) =>
                      setForm((s) => ({
                        ...s,
                        applicableMaterials: e.target.checked ? [...s.applicableMaterials, m] : s.applicableMaterials.filter((x) => x !== m),
                      }))
                    }
                  />
                  {m}
                </label>
              ))}
            </div>
          </div>
          <div className="col-span-2">{renderInput("remark", "备注", form, setForm, errors)}</div>
        </div>
        <div className="mt-4 flex justify-end gap-2 border-t pt-3">
          <button className="rounded border border-gray-300 px-3 py-1.5 text-sm" onClick={() => setFormOpen(false)}>取消</button>
          {!editing && <button className="rounded bg-brand px-3 py-1.5 text-sm text-white" onClick={createUnit}>保存并启用</button>}
          {editing && <button className="rounded bg-brand px-3 py-1.5 text-sm text-white" onClick={saveEdit}>保存</button>}
        </div>
      </FormModal>

      <DetailModal open={!!detail} onClose={() => setDetail(null)} title="单位详情">
        {detail && (
          <div className="space-y-3 text-sm">
            <Section title="基础信息" pairs={[["单位编码", detail.unitCode], ["单位名称", detail.unitName], ["英文缩写", detail.unitSymbol], ["单位类型", detail.unitType], ["是否基础单位", detail.isBaseUnit ? "是" : "否"], ["小数精度", String(detail.decimalPrecision)], ["状态", detail.status], ["创建人", detail.createdBy], ["创建时间", detail.createdAt], ["更新时间", detail.updatedAt || "-"]]} />
            <Section title="适用范围" pairs={[["适用物料", detail.applicableMaterials.join("、") || "-"], ["使用说明", "单位换算关系在物料档案中维护"]]} />
            <Section title="引用情况" pairs={[["被物料引用数量", String(detail.referencedMaterialCount ?? 0)], ["被采购订单引用数量", String(detail.referencedPurchaseOrderCount ?? 0)], ["最近引用时间", detail.recentUsedTime || "-"]]} />
            <Section title="备注信息" pairs={[["备注", detail.remark || "-"]]} />
            <Section title="操作日志" pairs={[["2026-01-02", "创建单位"], ["2026-03-10", "编辑单位"], ["2026-04-12", "启用单位"], ["2026-05-20", "停用单位"]]} />
            <div className="flex justify-end gap-2">
              <button className="rounded border border-gray-300 px-3 py-1.5 text-sm" onClick={() => setDetail(null)}>关闭</button>
              <button className="rounded border border-gray-300 px-3 py-1.5 text-sm" onClick={() => { setDetail(null); openEdit(detail); }}>编辑</button>
              {detail.status === "已启用" ? (
                <button className="rounded bg-red-600 px-3 py-1.5 text-sm text-white" onClick={() => confirmStatus(detail, "disable")}>停用</button>
              ) : (
                <button className="rounded bg-green-600 px-3 py-1.5 text-sm text-white" onClick={() => confirmStatus(detail, "enable")}>启用</button>
              )}
            </div>
          </div>
        )}
      </DetailModal>

      <ConfirmModal
        open={!!confirmRow && !!confirmAction}
        onClose={() => { setConfirmRow(null); setConfirmAction(null); }}
        onConfirm={doStatus}
        title={confirmAction === "enable" ? "确认启用单位？" : "确认停用单位？"}
        content={confirmAction === "enable" ? "启用后，该单位可用于物料档案、采购申请、采购订单和供应商发货。" : "停用后，该单位将不能再用于新建物料、采购申请和采购订单，但历史数据不受影响。"}
        confirmText={confirmAction === "enable" ? "确认启用" : "确认停用"}
      />
      <Toast msg={toast} />
    </div>
  );
}

function BaseBadge({ value }: { value: boolean }) {
  return <span className={`rounded-full px-2 py-0.5 text-xs ${value ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700"}`}>{value ? "是" : "否"}</span>;
}

function RequiredLabel({ text, required }: { text: string; required?: boolean }) {
  return <div className="mb-1 text-xs text-gray-600">{text}{required && <span className="ml-1 text-red-500">*</span>}</div>;
}

function renderInput(key: keyof UnitForm, label: string, form: UnitForm, setForm: Dispatch<SetStateAction<UnitForm>>, errors: Errors, required = false) {
  return (
    <label className="block">
      <RequiredLabel text={label} required={required} />
      <input className={`h-8 w-full rounded border px-2 text-sm ${errors[key] ? "border-red-500" : "border-gray-300"}`} value={String(form[key] ?? "")} onChange={(e) => setForm((s) => ({ ...s, [key]: e.target.value }))} />
      {errors[key] && <div className="mt-1 text-xs text-red-500">{errors[key]}</div>}
    </label>
  );
}

function renderSelect(key: keyof UnitForm, label: string, form: UnitForm, setForm: Dispatch<SetStateAction<UnitForm>>, errors: Errors, options: string[], required = false) {
  return (
    <label className="block">
      <RequiredLabel text={label} required={required} />
      <select
        className={`h-8 w-full rounded border px-2 text-sm ${errors[key] ? "border-red-500" : "border-gray-300"}`}
        value={String(form[key] ?? "")}
        onChange={(e) => setForm((s) => ({ ...s, [key]: key === "decimalPrecision" ? Number(e.target.value) : e.target.value }))}
      >
        <option value="">请选择</option>
        {options.map((x) => <option key={x}>{x}</option>)}
      </select>
      {errors[key] && <div className="mt-1 text-xs text-red-500">{errors[key]}</div>}
    </label>
  );
}

function renderBoolean(key: keyof UnitForm, label: string, form: UnitForm, setForm: Dispatch<SetStateAction<UnitForm>>, errors: Errors, required = false) {
  const raw = form[key];
  return (
    <label className="block">
      <RequiredLabel text={label} required={required} />
      <select
        className={`h-8 w-full rounded border px-2 text-sm ${errors[key] ? "border-red-500" : "border-gray-300"}`}
        value={raw === undefined ? "" : raw ? "true" : "false"}
        onChange={(e) => setForm((s) => ({ ...s, [key]: e.target.value === "" ? undefined : e.target.value === "true" }))}
      >
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

function DesignLogic() {
  return (
    <div className="mt-3 rounded border border-gray-200 bg-white p-4">
      <h3 className="mb-3 font-semibold">设计逻辑说明</h3>
      <LogicTable title="一、页面定位" headers={["项目", "说明"]} rows={[["页面名称", "单位管理"], ["所属模块", "基础资料"], ["页面目标", "维护 SRM 系统计量单位字典"], ["业务作用", "为物料、采购申请、采购订单、发货和对账提供单位选项"], ["核心限制", "只有已启用单位可被业务单据选择"], ["设计边界", "只维护单位本身，不维护物料换算关系"]]} />
      <LogicTable title="二、核心业务规则" headers={["业务场景", "核心规则", "结果"]} rows={[["新增单位", "填写单位名称、缩写、类型等信息", "生成新的单位字典"], ["编辑单位", "修改单位基础信息", "更新单位资料，不改变状态"], ["查看单位", "点击单位编码或查看按钮", "打开只读详情弹窗"], ["停用单位", "单位不再用于新建业务", "状态变为已停用"], ["启用单位", "停用单位恢复使用", "状态变为已启用"], ["单位引用", "物料档案选择单位", "只能选择已启用单位"], ["单位换算", "按物料维护换算关系", "不在单位管理中维护"]]} />
      <LogicTable title="三、按钮交互规则" headers={["按钮", "出现位置", "点击后动作", "是否改变数据"]} rows={[["新增单位", "查询区右侧", "打开新增单位弹窗", "否"], ["查询", "查询区", "按条件过滤单位列表", "否"], ["清除", "查询区", "清空筛选条件，恢复全部列表", "否"], ["查看", "表格操作列 / 编码入口", "打开单位详情弹窗", "否"], ["编辑", "表格操作列 / 详情弹窗", "打开编辑弹窗并带入当前数据", "否"], ["保存并启用", "新增弹窗", "新增单位，状态为已启用", "是"], ["保存", "编辑弹窗", "更新单位资料", "是"], ["停用", "表格操作列 / 详情弹窗", "弹出停用确认框", "否"], ["确认停用", "停用确认框", "状态改为已停用", "是"], ["启用", "表格操作列 / 详情弹窗", "弹出启用确认框", "否"], ["确认启用", "启用确认框", "状态改为已启用", "是"]]} />
      <LogicTable title="四、不同状态下的按钮规则" headers={["单位状态", "可展示按钮", "不可展示按钮", "说明"]} rows={[["已启用", "查看、编辑、停用", "启用", "已启用单位可被业务引用"], ["已停用", "查看、编辑、启用", "停用", "停用后不可用于新建业务"]]} />
      <LogicTable title="五、状态流转规则" headers={["当前状态", "触发动作", "目标状态", "业务说明"]} rows={[["已启用", "停用", "已停用", "单位不再用于新建业务"], ["已停用", "启用", "已启用", "单位恢复可用"]]} />
      <LogicTable title="状态说明" headers={["状态", "含义", "是否可用于新建业务"]} rows={[["已启用", "当前可用单位", "是"], ["已停用", "当前不可用单位", "否"]]} />
      <LogicTable title="六、查询筛选规则" headers={["筛选项", "匹配字段", "匹配方式", "说明"]} rows={[["关键词", "单位编码、单位名称、英文缩写", "模糊匹配", "输入为空时不参与筛选"], ["单位类型", "单位类型", "精确匹配", "选择全部类型时不参与筛选"], ["状态", "状态", "精确匹配", "选择全部状态时不参与筛选"], ["是否基础单位", "是否基础单位", "精确匹配", "选择全部时不参与筛选"]]} />
      <LogicTable title="补充规则" headers={["场景", "规则"]} rows={[["多条件同时存在", "使用 AND 关系过滤"], ["点击查询", "按当前条件刷新列表"], ["点击清除", "清空所有查询条件并恢复全部数据"], ["查询无结果", "表格展示空状态"]]} />
      <LogicTable title="七、表单校验规则" headers={["字段", "是否必填", "校验规则", "错误提示"]} rows={[["单位名称", "是", "不可为空，不可重复", "请输入单位名称 / 单位名称已存在"], ["英文缩写", "是", "不可为空，不可重复", "请输入英文缩写 / 英文缩写已存在"], ["单位类型", "是", "必须选择", "请选择单位类型"], ["是否基础单位", "是", "必须选择", "请选择是否基础单位"], ["小数精度", "是", "必须选择，范围 0-3", "请选择小数精度"]]} />
      <LogicTable title="重复校验规则" headers={["场景", "校验方式"]} rows={[["新增单位", "单位名称、英文缩写不能重复"], ["编辑单位", "排除当前单位后再比较"], ["校验失败", "弹窗不关闭，数据不保存，字段下方展示错误提示"]]} />
      <LogicTable title="八、异常与边界规则" headers={["场景", "处理规则"]} rows={[["查询结果为空", "展示空状态，不展示空白表格"], ["新增弹窗取消", "关闭弹窗，不保存填写内容"], ["编辑弹窗取消", "关闭弹窗，不保存修改内容"], ["新增弹窗再次打开", "表单恢复为空"], ["编辑已停用单位", "允许编辑资料，但保存后仍保持已停用"], ["停用单位", "只限制后续新建业务，不影响历史单据"], ["已被引用的单位", "不建议随意修改名称和缩写"], ["启用 / 停用操作", "必须二次确认"], ["表单校验失败", "不允许保存，不关闭弹窗"], ["单位编码", "系统生成，只读，不允许手动修改"]]} />
      <LogicTable title="九、开发注意事项" headers={["注意事项", "要求"]} rows={[["页面风格", "保持现有蓝白灰企业后台风格"], ["布局结构", "不破坏 Header、Sidebar、TabsNav"], ["表格展示", "保持紧凑表格风格"], ["弹窗层级", "弹窗不能被顶部导航或侧边栏遮挡"], ["数据联动", "新增、编辑、启用、停用后列表立即更新"], ["状态标签", "使用统一 StatusBadge 组件"], ["操作按钮", "所有按钮必须真实可点击"], ["单位换算", "不在单位管理维护，放在物料管理中"], ["删除单位", "不提供删除功能，避免历史数据断裂"]]} />
    </div>
  );
}
