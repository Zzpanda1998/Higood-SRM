import { type Dispatch, type ReactNode, type SetStateAction, useMemo, useState } from "react";
import ConfirmModal from "../../components/common/ConfirmModal";
import DataTable from "../../components/common/DataTable";
import DetailModal from "../../components/common/DetailModal";
import PageHeader from "../../components/common/PageHeader";
import SearchBar from "../../components/common/SearchBar";
import StatusBadge from "../../components/common/StatusBadge";
import Toast from "../../components/common/Toast";
import { suppliers as initialSuppliers } from "../../mock/suppliers";
import type {
  Currency,
  DeliveryMethod,
  PaymentMethod,
  Supplier,
  SupplierLevel,
  SupplierStatus,
  SupplierType,
} from "../../types/supplier";

type FormValues = Omit<Supplier, "id" | "supplierCode" | "status" | "createdBy" | "createdAt" | "updatedAt">;
type Errors = Partial<Record<keyof FormValues, string>>;

const supplierTypes: SupplierType[] = ["面料供应商", "辅料供应商", "纱线供应商", "包材供应商", "成衣工厂", "样衣工厂", "综合供应商"];
const countries = ["中国", "印度尼西亚", "越南", "其他"];
const cities = ["广东广州", "广东深圳", "广东东莞", "浙江绍兴", "浙江杭州", "浙江宁波", "福建泉州", "江苏苏州", "山东青岛"];
const levels: SupplierLevel[] = ["A级", "B级", "C级", "临时供应商"];
const payments: PaymentMethod[] = ["预付", "月结", "到货后付款", "对账后付款"];
const currencies: Currency[] = ["RMB", "USD", "IDR"];
const deliveries: DeliveryMethod[] = ["供应商直发海外仓", "发至中国中转仓", "采购方自提", "货代上门提货"];
const requiredFields = new Set<keyof FormValues>([
  "supplierName",
  "shortName",
  "supplierType",
  "country",
  "city",
  "supplierLevel",
  "contactName",
  "contactPhone",
  "paymentMethod",
  "currency",
  "defaultDeliveryMethod",
]);

const emptyForm: FormValues = {
  supplierName: "",
  shortName: "",
  supplierType: "面料供应商",
  country: "中国",
  city: "广东广州",
  contactName: "",
  contactPhone: "",
  email: "",
  wechat: "",
  paymentMethod: "月结",
  currency: "RMB",
  defaultDeliveryMethod: "供应商直发海外仓",
  invoiceInfo: "",
  bankAccount: "",
  supplierLevel: "B级",
  totalPurchaseOrders: 0,
  totalPurchaseAmount: 0,
  onTimeDeliveryRate: 0,
  qualityPassRate: 0,
  recentPurchaseOrderNo: "",
  recentPurchaseDate: "",
  remark: "",
};

const now = () => new Date().toLocaleString("zh-CN", { hour12: false });
const nextCode = (rows: Supplier[]) => `SUP-2026-${String(rows.length + 1).padStart(4, "0")}`;

export default function SupplierManagement() {
  const [rows, setRows] = useState<Supplier[]>(initialSuppliers);
  const [keyword, setKeyword] = useState("");
  const [queryKeyword, setQueryKeyword] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [levelFilter, setLevelFilter] = useState("");
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [form, setForm] = useState<FormValues>(emptyForm);
  const [errors, setErrors] = useState<Errors>({});
  const [detail, setDetail] = useState<Supplier | null>(null);
  const [confirmRow, setConfirmRow] = useState<Supplier | null>(null);
  const [confirmAction, setConfirmAction] = useState<"enable" | "disable" | null>(null);
  const [toast, setToast] = useState("");

  const showToast = (m: string) => {
    setToast(m);
    window.setTimeout(() => setToast(""), 2200);
  };

  const filtered = useMemo(() => {
    return rows.filter((x) => {
      const kw = queryKeyword.trim();
      const hit =
        !kw ||
        [x.supplierCode, x.supplierName, x.shortName, x.contactName].some((v) => v.toLowerCase().includes(kw.toLowerCase()));
      const hitType = !typeFilter || x.supplierType === typeFilter;
      const hitStatus = !statusFilter || x.status === statusFilter;
      const hitLevel = !levelFilter || x.supplierLevel === levelFilter;
      return hit && hitType && hitStatus && hitLevel;
    });
  }, [rows, queryKeyword, typeFilter, statusFilter, levelFilter]);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm });
    setErrors({});
    setOpenForm(true);
  };

  const openEdit = (row: Supplier) => {
    setEditing(row);
    setForm({
      supplierName: row.supplierName,
      shortName: row.shortName,
      supplierType: row.supplierType,
      country: row.country,
      city: row.city,
      contactName: row.contactName,
      contactPhone: row.contactPhone,
      email: row.email ?? "",
      wechat: row.wechat ?? "",
      paymentMethod: row.paymentMethod,
      currency: row.currency,
      defaultDeliveryMethod: row.defaultDeliveryMethod,
      invoiceInfo: row.invoiceInfo ?? "",
      bankAccount: row.bankAccount ?? "",
      supplierLevel: row.supplierLevel ?? "B级",
      totalPurchaseOrders: row.totalPurchaseOrders ?? 0,
      totalPurchaseAmount: row.totalPurchaseAmount ?? 0,
      onTimeDeliveryRate: row.onTimeDeliveryRate ?? 0,
      qualityPassRate: row.qualityPassRate ?? 0,
      recentPurchaseOrderNo: row.recentPurchaseOrderNo ?? "",
      recentPurchaseDate: row.recentPurchaseDate ?? "",
      remark: row.remark ?? "",
    });
    setErrors({});
    setOpenForm(true);
  };

  const closeForm = () => {
    if (!window.confirm("当前内容未保存，确认关闭吗？")) return;
    setOpenForm(false);
  };

  const validate = (isEdit: boolean) => {
    const e: Errors = {};
    requiredFields.forEach((k) => {
      if (!String(form[k] ?? "").trim()) e[k] = `${selectFields.has(String(k)) ? "请选择" : "请输入"}${fieldLabel[k]}`;
    });
    if (String(form.contactPhone).trim().length < 6) e.contactPhone = "联系电话格式不正确";
    if (form.email && !String(form.email).includes("@")) e.email = "邮箱格式不正确";
    const sameName = rows.some((x) => x.supplierName === form.supplierName && (!isEdit || x.id !== editing?.id));
    const sameShort = rows.some((x) => x.shortName === form.shortName && (!isEdit || x.id !== editing?.id));
    if (sameName) e.supplierName = "供应商名称已存在";
    if (sameShort) e.shortName = "供应商简称已存在";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const saveCreate = (status: SupplierStatus) => {
    if (!validate(false)) return;
    const item: Supplier = {
      id: String(Date.now()),
      supplierCode: nextCode(rows),
      status,
      createdBy: "当前用户",
      createdAt: now(),
      updatedAt: now(),
      ...form,
    };
    setRows((s) => [item, ...s]);
    setOpenForm(false);
    showToast(status === "草稿" ? "供应商草稿已保存" : "供应商已启用");
  };

  const saveEdit = () => {
    if (!editing || !validate(true)) return;
    setRows((s) =>
      s.map((x) =>
        x.id === editing.id
          ? {
              ...x,
              ...form,
              status: x.status,
              updatedAt: now(),
            }
          : x,
      ),
    );
    setOpenForm(false);
    showToast("供应商信息已更新");
  };

  const confirmStatus = (row: Supplier, action: "enable" | "disable") => {
    setConfirmRow(row);
    setConfirmAction(action);
  };
  const doStatus = () => {
    if (!confirmRow || !confirmAction) return;
    const next = confirmAction === "enable" ? "已启用" : "已停用";
    setRows((s) => s.map((x) => (x.id === confirmRow.id ? { ...x, status: next, updatedAt: now() } : x)));
    if (detail?.id === confirmRow.id) setDetail({ ...detail, status: next, updatedAt: now() });
    setConfirmRow(null);
    setConfirmAction(null);
    showToast(next === "已启用" ? "供应商已启用" : "供应商已停用");
  };

  const actionButtons = (row: Supplier) => {
    const canDisable = row.status === "已启用" || row.status === "待审核";
    const canEnable = ["草稿", "待审核", "已驳回", "已停用"].includes(row.status);
    return (
      <div className="space-x-2 whitespace-nowrap text-xs">
        <button className="text-blue-600" onClick={() => setDetail(row)}>查看</button>
        <button className="text-blue-600" onClick={() => openEdit(row)}>编辑</button>
        {canEnable && <button className="text-green-600" onClick={() => confirmStatus(row, "enable")}>启用</button>}
        {canDisable && <button className="text-red-600" onClick={() => confirmStatus(row, "disable")}>停用</button>}
      </div>
    );
  };

  return (
    <div>
      <PageHeader title="商品供应商管理" desc="用于维护面料、辅料、纱线、包材、样衣、成衣等商品采购供应商资料，并作为采购申请、采购订单和供应商协同的基础数据。" />
      <SearchBar>
        <div className="flex flex-wrap items-center gap-2">
          <input className="h-8 w-72 rounded border px-2 text-sm" value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="搜索供应商编码 / 名称 / 简称 / 联系人" />
          <select className="h-8 rounded border px-2 text-sm" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}><option value="">全部类型</option>{supplierTypes.map((x) => <option key={x}>{x}</option>)}</select>
          <select className="h-8 rounded border px-2 text-sm" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}><option value="">全部状态</option>{["草稿", "待审核", "已启用", "已驳回", "已停用"].map((x) => <option key={x}>{x}</option>)}</select>
          <select className="h-8 rounded border px-2 text-sm" value={levelFilter} onChange={(e) => setLevelFilter(e.target.value)}><option value="">全部等级</option>{levels.map((x) => <option key={x}>{x}</option>)}</select>
          <button className="h-8 rounded bg-brand px-3 text-sm text-white" onClick={() => setQueryKeyword(keyword)}>查询</button>
          <button className="h-8 rounded border border-gray-300 px-3 text-sm" onClick={() => { setKeyword(""); setQueryKeyword(""); setTypeFilter(""); setStatusFilter(""); setLevelFilter(""); }}>清除</button>
          <button className="ml-auto h-8 rounded bg-brand px-3 text-sm text-white" onClick={openCreate}>新增供应商</button>
        </div>
      </SearchBar>
      <DataTable
        columns={[
          { key: "supplierCode", title: "供应商编码", render: (r) => <button className="text-blue-600" onClick={() => setDetail(r)}>{r.supplierCode}</button> },
          { key: "supplierName", title: "供应商名称" }, { key: "shortName", title: "供应商简称" }, { key: "supplierType", title: "供应商类型" }, { key: "country", title: "国家/地区" }, { key: "city", title: "省市" },
          { key: "contactName", title: "联系人" }, { key: "contactPhone", title: "联系电话" }, { key: "paymentMethod", title: "付款方式" }, { key: "currency", title: "币种" }, { key: "supplierLevel", title: "供应商等级" },
          { key: "status", title: "状态", render: (r) => <StatusBadge status={r.status} /> }, { key: "createdBy", title: "创建人" }, { key: "createdAt", title: "创建时间" }, { key: "op", title: "操作", render: actionButtons },
        ]}
        rows={filtered}
      />

      <div className="mt-3 rounded border border-gray-200 bg-white p-4">
        <h3 className="mb-3 font-semibold">设计逻辑说明</h3>

        <LogicSection
          title="一、页面定位"
          headers={["项目", "说明"]}
          rows={[
            ["页面名称", "商品供应商管理"],
            ["所属模块", "基础资料"],
            ["页面目标", "维护 SRM 采购供应商主数据"],
            ["业务作用", "为采购申请、采购订单、供应商确认、供应商发货、采购对账提供供应商数据"],
            ["核心限制", "只有已启用供应商可用于新建采购申请和采购订单"],
          ]}
        />

        <LogicSection
          title="二、核心业务规则"
          headers={["业务场景", "核心规则", "结果"]}
          rows={[
            ["新增供应商", "填写供应商基础资料、联系人信息、采购与财务信息", "生成新的供应商资料"],
            ["保存草稿", "资料未完全确认时临时保存", "状态为草稿，不参与正式采购"],
            ["保存并启用", "资料确认完整，可直接使用", "状态为已启用，可用于采购业务"],
            ["查看供应商", "点击供应商编码或查看按钮", "打开只读详情弹窗"],
            ["编辑供应商", "修改供应商基础资料", "更新资料，不改变供应商状态"],
            ["停用供应商", "已启用供应商不再合作或暂停合作", "状态变为已停用"],
            ["启用供应商", "草稿、驳回或停用供应商恢复可用", "状态变为已启用"],
          ]}
        />

        <LogicSection
          title="三、按钮交互规则"
          headers={["按钮", "出现位置", "点击后动作", "是否改变数据"]}
          rows={[
            ["新增供应商", "查询区右侧", "打开新增供应商弹窗", "否"],
            ["查询", "查询区", "按条件过滤供应商列表", "否"],
            ["清除", "查询区", "清空筛选条件，恢复全部列表", "否"],
            ["查看", "表格操作列 / 详情入口", "打开供应商详情弹窗", "否"],
            ["编辑", "表格操作列 / 详情弹窗", "打开编辑弹窗并带入当前数据", "否"],
            ["保存草稿", "新增弹窗", "新增供应商，状态为草稿", "是"],
            ["保存并启用", "新增弹窗", "新增供应商，状态为已启用", "是"],
            ["保存", "编辑弹窗", "更新供应商资料", "是"],
            ["停用", "表格操作列 / 详情弹窗", "弹出停用确认框", "否"],
            ["确认停用", "停用确认框", "状态改为已停用", "是"],
            ["启用", "表格操作列 / 详情弹窗", "弹出启用确认框", "否"],
            ["确认启用", "启用确认框", "状态改为已启用", "是"],
          ]}
        />

        <LogicSection
          title="四、状态下按钮规则"
          headers={["供应商状态", "可展示按钮", "不可展示按钮", "说明"]}
          rows={[
            ["草稿", "查看、编辑、启用", "停用", "草稿未正式启用，只能启用后参与采购"],
            ["待审核", "查看、编辑、启用、停用", "-", "MVP 预留状态，可启用或停用"],
            ["已启用", "查看、编辑、停用", "启用", "已启用供应商可参与采购业务"],
            ["已驳回", "查看、编辑、启用", "停用", "驳回后可编辑资料再启用"],
            ["已停用", "查看、编辑、启用", "停用", "停用后不能用于新建采购业务"],
          ]}
        />

        <LogicSection
          title="五、状态流转规则"
          headers={["当前状态", "触发动作", "目标状态", "业务说明"]}
          rows={[
            ["草稿", "启用", "已启用", "草稿资料确认后可启用"],
            ["待审核", "启用", "已启用", "MVP 阶段简化审批，可直接启用"],
            ["待审核", "驳回", "已驳回", "预留审批扩展"],
            ["已启用", "停用", "已停用", "暂停合作或不再使用"],
            ["已停用", "启用", "已启用", "恢复供应商使用"],
            ["已驳回", "启用", "已启用", "修改资料后恢复可用"],
          ]}
        />

        <LogicSection
          title="状态说明"
          headers={["状态", "含义", "是否可用于新建采购"]}
          rows={[
            ["草稿", "临时保存，资料未正式启用", "否"],
            ["待审核", "预留审核状态", "否"],
            ["已启用", "正常合作供应商", "是"],
            ["已驳回", "资料或合作条件未通过", "否"],
            ["已停用", "暂停合作或不再合作", "否"],
          ]}
        />

        <LogicSection
          title="六、查询筛选规则"
          headers={["筛选项", "匹配字段", "匹配方式", "说明"]}
          rows={[
            ["关键词", "供应商编码、供应商名称、供应商简称、联系人", "模糊匹配", "输入为空时不参与筛选"],
            ["供应商类型", "供应商类型", "精确匹配", "选择全部类型时不参与筛选"],
            ["供应商状态", "状态", "精确匹配", "选择全部状态时不参与筛选"],
            ["供应商等级", "供应商等级", "精确匹配", "选择全部等级时不参与筛选"],
          ]}
        />

        <LogicSection
          title="补充规则"
          headers={["场景", "规则"]}
          rows={[
            ["多条件同时存在", "使用 AND 关系过滤"],
            ["点击查询", "按当前条件刷新列表"],
            ["点击清除", "清空所有查询条件并恢复全部数据"],
            ["查询无结果", "表格展示空状态"],
          ]}
        />

        <LogicSection
          title="七、表单校验规则"
          headers={["字段", "是否必填", "校验规则", "错误提示"]}
          rows={[
            ["供应商名称", "是", "不可为空，不可重复", "请输入供应商名称 / 供应商名称已存在"],
            ["供应商简称", "是", "不可为空，不可重复", "请输入供应商简称 / 供应商简称已存在"],
            ["供应商类型", "是", "必须选择", "请选择供应商类型"],
            ["国家 / 地区", "是", "必须选择", "请选择国家 / 地区"],
            ["省市", "是", "必须选择", "请选择省市"],
            ["供应商等级", "是", "必须选择", "请选择供应商等级"],
            ["联系人", "是", "不可为空", "请输入联系人"],
            ["联系电话", "是", "至少 6 位", "联系电话格式不正确"],
            ["邮箱", "否", "填写时必须包含 @", "邮箱格式不正确"],
            ["付款方式", "是", "必须选择", "请选择付款方式"],
            ["币种", "是", "必须选择", "请选择币种"],
            ["默认交货方式", "是", "必须选择", "请选择默认交货方式"],
          ]}
        />

        <LogicSection
          title="重复校验规则"
          headers={["场景", "校验方式"]}
          rows={[
            ["新增供应商", "与全部供应商名称、简称比较"],
            ["编辑供应商", "排除当前供应商后再比较"],
            ["校验失败", "弹窗不关闭，数据不保存，字段下方展示错误提示"],
          ]}
        />

        <LogicSection
          title="八、异常与边界规则"
          headers={["场景", "处理规则"]}
          rows={[
            ["查询结果为空", "展示空状态，不展示空白表格"],
            ["新增弹窗取消", "关闭弹窗，不保存填写内容"],
            ["编辑弹窗取消", "关闭弹窗，不保存修改内容"],
            ["新增弹窗再次打开", "表单恢复为空"],
            ["编辑已停用供应商", "允许编辑资料，但保存后仍保持已停用"],
            ["停用供应商", "只限制后续新建业务，不影响历史单据"],
            ["启用 / 停用操作", "必须二次确认"],
            ["表单校验失败", "不允许保存，不关闭弹窗"],
            ["供应商编码", "系统生成，只读，不允许手动修改"],
          ]}
        />

        <LogicSection
          title="九、开发注意事项"
          headers={["注意事项", "要求"]}
          rows={[
            ["页面风格", "保持现有蓝白灰企业后台风格"],
            ["布局结构", "不破坏 Header、Sidebar、TabsNav"],
            ["表格展示", "字段较多时允许横向滚动"],
            ["弹窗层级", "弹窗不能被顶部导航或侧边栏遮挡"],
            ["数据联动", "新增、编辑、启用、停用后列表立即更新"],
            ["状态标签", "使用统一 StatusBadge 组件"],
            ["操作按钮", "所有按钮必须真实可点击"],
            ["禁止内容", "页面中不要出现 WMS 字段、WMS 按钮、WMS 编码"],
          ]}
        />
      </div>

      <SupplierFormModal
        open={openForm}
        onClose={closeForm}
        title={editing ? "编辑供应商" : "新增供应商"}
        footer={(
          <>
            <button className="h-9 rounded-md border border-gray-300 bg-white px-4 text-sm text-gray-700 transition hover:bg-gray-50" onClick={closeForm}>取消</button>
            {!editing && <button className="h-9 rounded-md border border-brand bg-blue-50 px-4 text-sm text-brand transition hover:bg-blue-100" onClick={() => saveCreate("草稿")}>保存草稿</button>}
            {!editing && <button className="h-9 rounded-md bg-brand px-5 text-sm font-medium text-white shadow-sm transition hover:opacity-90" onClick={() => saveCreate("已启用")}>保存并启用</button>}
            {editing && <button className="h-9 rounded-md bg-brand px-5 text-sm font-medium text-white shadow-sm transition hover:opacity-90" onClick={saveEdit}>保存</button>}
          </>
        )}
      >
        {editing && (
          <div className="rounded-lg border border-blue-100 bg-blue-50 px-4 py-3 text-sm text-blue-800">
            供应商编码：<span className="font-semibold">{editing.supplierCode}</span>
          </div>
        )}
        <SupplierFormSection title="一、基础信息" description="维护供应商主体、类型及所属区域资料">
          <div className="grid grid-cols-1 gap-x-5 gap-y-4 md:grid-cols-2">
            {renderInput("supplierName", "供应商名称", form, setForm, errors, "请输入工商登记或常用供应商名称")}
            {renderInput("shortName", "供应商简称", form, setForm, errors, "请输入便于业务识别的简称")}
            {renderSelect("supplierType", "供应商类型", form, setForm, errors, supplierTypes)}
            {renderSelect("country", "国家/地区", form, setForm, errors, countries)}
            {renderSelect("city", "省市", form, setForm, errors, cities)}
            {renderSelect("supplierLevel", "供应商等级", form, setForm, errors, levels)}
          </div>
        </SupplierFormSection>

        <SupplierFormSection title="二、联系人信息" description="用于采购沟通、订单确认及日常协同">
          <div className="grid grid-cols-1 gap-x-5 gap-y-4 md:grid-cols-2">
            {renderInput("contactName", "联系人", form, setForm, errors, "请输入主要业务联系人")}
            {renderInput("contactPhone", "联系电话", form, setForm, errors, "请输入手机号或固定电话")}
            {renderInput("email", "邮箱", form, setForm, errors, "例如 name@company.com")}
            {renderInput("wechat", "微信", form, setForm, errors, "请输入联系人微信号")}
          </div>
        </SupplierFormSection>

        <SupplierFormSection title="三、商务结算信息" description="用于采购付款、开票与财务对账">
          <div className="grid grid-cols-1 gap-x-5 gap-y-4 md:grid-cols-2">
            {renderSelect("paymentMethod", "付款方式", form, setForm, errors, payments)}
            {renderSelect("currency", "币种", form, setForm, errors, currencies)}
            {renderInput("invoiceInfo", "开票信息", form, setForm, errors, "请输入抬头、税号等开票资料")}
            {renderInput("bankAccount", "银行账户", form, setForm, errors, "请输入开户行及收款账号")}
          </div>
        </SupplierFormSection>

        <SupplierFormSection title="四、交付信息" description="设置新建采购业务时默认带入的交货方式">
          <div className="md:max-w-[calc(50%-10px)]">
            {renderSelect("defaultDeliveryMethod", "默认交货方式", form, setForm, errors, deliveries)}
          </div>
        </SupplierFormSection>

        <SupplierFormSection title="五、补充说明" description="记录合作偏好、特殊约定或其他业务备注">
          {renderTextArea("remark", "备注", form, setForm, errors, "请输入供应商合作说明或其他备注信息")}
        </SupplierFormSection>
      </SupplierFormModal>

      <DetailModal open={!!detail} onClose={() => setDetail(null)} title="供应商详情">
        {detail && (
          <div className="space-y-3 text-sm">
            <Section title="基础信息" pairs={[["供应商编码", detail.supplierCode], ["供应商名称", detail.supplierName], ["供应商简称", detail.shortName], ["供应商类型", detail.supplierType], ["国家/地区", detail.country], ["省市", detail.city], ["供应商等级", detail.supplierLevel || "-"], ["状态", detail.status], ["创建人", detail.createdBy], ["创建时间", detail.createdAt], ["更新时间", detail.updatedAt || "-"]]} />
            <Section title="联系人信息" pairs={[["联系人", detail.contactName], ["联系电话", detail.contactPhone], ["邮箱", detail.email || "-"], ["微信", detail.wechat || "-"]]} />
            <Section title="采购与财务信息" pairs={[["付款方式", detail.paymentMethod], ["币种", detail.currency], ["默认交货方式", detail.defaultDeliveryMethod], ["开票信息", detail.invoiceInfo || "-"], ["银行账户", detail.bankAccount || "-"]]} />
            <Section title="采购协同数据" pairs={[["累计采购订单数", String(detail.totalPurchaseOrders ?? 0)], ["累计采购金额", String(detail.totalPurchaseAmount ?? 0)], ["准时交付率", `${detail.onTimeDeliveryRate ?? 0}%`], ["质检合格率", `${detail.qualityPassRate ?? 0}%`], ["最近采购订单号", detail.recentPurchaseOrderNo || "-"], ["最近采购日期", detail.recentPurchaseDate || "-"]]} />
            <Section title="备注信息" pairs={[["备注", detail.remark || "-"]]} />
            <Section title="操作日志" pairs={[["2026-01-05", "创建供应商"], ["2026-03-08", "保存草稿"], ["2026-03-10", "启用供应商"], ["2026-04-15", "编辑供应商资料"], ["2026-05-12", "停用供应商"]]} />
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
        title={confirmAction === "enable" ? "确认启用供应商？" : "确认停用供应商？"}
        content={
          confirmAction === "enable"
            ? "启用后，该供应商可用于采购申请、采购订单和供应商协同。"
            : "停用后，该供应商将不能再用于新建采购申请和采购订单，但历史单据不受影响。"
        }
        confirmText={confirmAction === "enable" ? "确认启用" : "确认停用"}
      />

      <Toast msg={toast} />
    </div>
  );
}

const fieldLabel: Record<string, string> = {
  supplierName: "供应商名称",
  shortName: "供应商简称",
  supplierType: "供应商类型",
  country: "国家 / 地区",
  city: "省市",
  supplierLevel: "供应商等级",
  contactName: "联系人",
  contactPhone: "联系电话",
  paymentMethod: "付款方式",
  currency: "币种",
  defaultDeliveryMethod: "默认交货方式",
};

const selectFields = new Set(["supplierType", "country", "city", "supplierLevel", "paymentMethod", "currency", "defaultDeliveryMethod"]);

const controlClass = "h-10 w-full rounded-md border bg-white px-3 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 hover:border-gray-400 focus:border-brand focus:ring-2 focus:ring-blue-100";

function FieldLabel({ field, label }: { field: keyof FormValues; label: string }) {
  return (
    <div className="mb-1.5 text-sm font-medium text-gray-700">
      {requiredFields.has(field) && <span className="mr-1 text-red-500">*</span>}
      {label}
    </div>
  );
}

function renderInput(
  key: keyof FormValues,
  label: string,
  form: FormValues,
  setForm: Dispatch<SetStateAction<FormValues>>,
  errors: Errors,
  placeholder = "",
) {
  return (
    <label className="block">
      <FieldLabel field={key} label={label} />
      <input
        className={`${controlClass} ${errors[key] ? "border-red-500 focus:border-red-500 focus:ring-red-100" : "border-gray-300"}`}
        value={String(form[key] ?? "")}
        placeholder={placeholder}
        onChange={(e) => setForm((s) => ({ ...s, [key]: e.target.value }))}
      />
      {errors[key] && <div className="mt-1 text-xs text-red-500">{errors[key]}</div>}
    </label>
  );
}

function renderSelect(
  key: keyof FormValues,
  label: string,
  form: FormValues,
  setForm: Dispatch<SetStateAction<FormValues>>,
  errors: Errors,
  options: string[],
) {
  return (
    <label className="block">
      <FieldLabel field={key} label={label} />
      <select className={`${controlClass} ${errors[key] ? "border-red-500 focus:border-red-500 focus:ring-red-100" : "border-gray-300"}`} value={String(form[key] ?? "")} onChange={(e) => setForm((s) => ({ ...s, [key]: e.target.value }))}>
        {options.map((x) => <option key={x}>{x}</option>)}
      </select>
      {errors[key] && <div className="mt-1 text-xs text-red-500">{errors[key]}</div>}
    </label>
  );
}

function renderTextArea(
  key: keyof FormValues,
  label: string,
  form: FormValues,
  setForm: Dispatch<SetStateAction<FormValues>>,
  errors: Errors,
  placeholder = "",
) {
  return (
    <label className="block">
      <FieldLabel field={key} label={label} />
      <textarea
        className={`min-h-24 w-full resize-y rounded-md border bg-white px-3 py-2.5 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 hover:border-gray-400 focus:border-brand focus:ring-2 focus:ring-blue-100 ${errors[key] ? "border-red-500 focus:border-red-500 focus:ring-red-100" : "border-gray-300"}`}
        value={String(form[key] ?? "")}
        placeholder={placeholder}
        onChange={(e) => setForm((s) => ({ ...s, [key]: e.target.value }))}
      />
      {errors[key] && <div className="mt-1 text-xs text-red-500">{errors[key]}</div>}
    </label>
  );
}

function SupplierFormModal({
  open,
  onClose,
  title,
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/45 p-4" onMouseDown={onClose}>
      <div className="flex max-h-[80vh] w-[min(1080px,calc(100vw-32px))] flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl" onMouseDown={(event) => event.stopPropagation()}>
        <div className="flex shrink-0 items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            <p className="mt-1 text-xs text-gray-500">请按资料分类完整填写供应商信息，带 * 的字段为必填项</p>
          </div>
          <button className="rounded-md px-3 py-2 text-sm text-gray-500 transition hover:bg-gray-100 hover:text-gray-800" onClick={onClose}>关闭</button>
        </div>
        <div className="flex-1 space-y-4 overflow-y-auto bg-slate-50 p-5 md:p-6">{children}</div>
        <div className="flex shrink-0 justify-end gap-3 border-t border-gray-200 bg-white px-6 py-4 shadow-[0_-4px_12px_rgba(15,23,42,0.04)]">{footer}</div>
      </div>
    </div>
  );
}

function SupplierFormSection({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-start gap-3 border-b border-gray-100 pb-3">
        <span className="mt-0.5 h-5 w-1 shrink-0 rounded-full bg-brand" />
        <div>
          <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
          <p className="mt-1 text-xs text-gray-500">{description}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function Section({ title, pairs }: { title: string; pairs: [string, string][] }) {
  return (
    <div className="rounded border border-gray-200 p-3">
      <div className="mb-2 font-medium">{title}</div>
      <div className="grid grid-cols-2 gap-2">
        {pairs.map(([k, v]) => (
          <div key={`${title}-${k}`} className="text-gray-700">
            <span className="text-gray-500">{k}：</span>
            {v}
          </div>
        ))}
      </div>
    </div>
  );
}

function LogicSection({ title, headers, rows }: { title: string; headers: string[]; rows: string[][] }) {
  return (
    <div className="mb-4">
      <h4 className="mb-2 text-sm font-semibold text-gray-800">{title}</h4>
      <div className="overflow-x-auto rounded border border-gray-200">
        <table className="min-w-full text-left text-xs">
          <thead className="bg-gray-50">
            <tr>
              {headers.map((h) => (
                <th key={h} className="border-b border-gray-200 px-2 py-2 font-medium text-gray-700">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={`${title}-${i}`} className="border-b border-gray-100 last:border-b-0">
                {r.map((c, j) => (
                  <td key={`${title}-${i}-${j}`} className="px-2 py-2 text-gray-700">
                    {c}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
