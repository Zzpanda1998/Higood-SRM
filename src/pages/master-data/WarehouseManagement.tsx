import { useMemo, useState } from "react";
import DataTable from "../../components/common/DataTable";
import DetailModal from "../../components/common/DetailModal";
import PageHeader from "../../components/common/PageHeader";
import SearchBar from "../../components/common/SearchBar";
import StatusBadge from "../../components/common/StatusBadge";
import Toast from "../../components/common/Toast";
import { warehouses as initialWarehouses } from "../../mock/warehouses";
import type { Warehouse } from "../../types/warehouse";

const warehouseTypes = ["面辅料仓", "加工仓", "成衣仓", "样衣仓", "中转仓", "退货仓"];
const warehouseAttrs = ["自建", "第三方", "合作仓"];
const countries = ["中国", "印度尼西亚"];

const now = () => new Date().toLocaleString("zh-CN", { hour12: false });

export default function WarehouseManagement() {
  const [rows, setRows] = useState<Warehouse[]>(initialWarehouses);
  const [keywordInput, setKeywordInput] = useState("");
  const [keyword, setKeyword] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [attrFilter, setAttrFilter] = useState("");
  const [countryFilter, setCountryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loadingSync, setLoadingSync] = useState(false);
  const [toast, setToast] = useState("");
  const [detail, setDetail] = useState<Warehouse | null>(null);

  const filtered = useMemo(() => {
    return rows.filter((x) => {
      const hitKeyword =
        !keyword.trim() ||
        [x.warehouseCode, x.warehouseName, x.city, x.manager].some((v) => v.toLowerCase().includes(keyword.trim().toLowerCase()));
      const hitType = !typeFilter || x.warehouseType === typeFilter;
      const hitAttr = !attrFilter || x.warehouseAttribute === attrFilter;
      const hitCountry = !countryFilter || x.country === countryFilter;
      const hitStatus = !statusFilter || (statusFilter === "已启用" ? x.enabled : !x.enabled);
      return hitKeyword && hitType && hitAttr && hitCountry && hitStatus;
    });
  }, [rows, keyword, typeFilter, attrFilter, countryFilter, statusFilter]);

  const resetFilters = () => {
    setKeywordInput("");
    setKeyword("");
    setTypeFilter("");
    setAttrFilter("");
    setCountryFilter("");
    setStatusFilter("");
  };

  const refreshSync = () => {
    setLoadingSync(true);
    setTimeout(() => {
      const syncTime = now();
      setRows((s) => s.map((x) => ({ ...x, lastSyncTime: syncTime, syncStatus: "已同步", syncRemark: "" })));
      setLoadingSync(false);
      setToast("仓库资料已从 WMS 刷新");
      setTimeout(() => setToast(""), 2200);
    }, 800);
  };

  return (
    <div>
      <PageHeader title="仓库管理" desc="用于查看从 WMS 同步过来的仓库基础资料，SRM 仅引用仓库信息，不在本页面维护仓库主数据。" />
      <SearchBar>
        <div className="flex flex-wrap items-center gap-2">
          <input className="h-8 w-80 rounded border px-2 text-sm" value={keywordInput} onChange={(e) => setKeywordInput(e.target.value)} placeholder="搜索仓库编码 / 仓库名称 / 城市 / 负责人" />
          <select className="h-8 rounded border px-2 text-sm" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}><option value="">全部类型</option>{warehouseTypes.map((x) => <option key={x}>{x}</option>)}</select>
          <select className="h-8 rounded border px-2 text-sm" value={attrFilter} onChange={(e) => setAttrFilter(e.target.value)}><option value="">全部属性</option>{warehouseAttrs.map((x) => <option key={x}>{x}</option>)}</select>
          <select className="h-8 rounded border px-2 text-sm" value={countryFilter} onChange={(e) => setCountryFilter(e.target.value)}><option value="">全部国家</option>{countries.map((x) => <option key={x}>{x}</option>)}</select>
          <select className="h-8 rounded border px-2 text-sm" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}><option value="">全部状态</option><option>已启用</option><option>已停用</option></select>
          <button className="h-8 rounded bg-brand px-3 text-sm text-white" onClick={() => setKeyword(keywordInput)}>查询</button>
          <button className="h-8 rounded border border-gray-300 px-3 text-sm" onClick={resetFilters}>清除</button>
          <button className="ml-auto h-8 rounded border border-blue-300 px-3 text-sm text-brand" onClick={refreshSync} disabled={loadingSync}>{loadingSync ? "同步中..." : "刷新同步"}</button>
        </div>
      </SearchBar>

      <DataTable
        columns={[
          { key: "warehouseCode", title: "仓库编码", render: (r) => <button className="text-blue-600" onClick={() => setDetail(r)}>{r.warehouseCode}</button> },
          { key: "warehouseName", title: "仓库名称" },
          { key: "warehouseType", title: "仓库类型" },
          { key: "warehouseAttribute", title: "仓库属性" },
          { key: "ownerEntity", title: "主体" },
          { key: "country", title: "国家" },
          { key: "timezone", title: "时区" },
          { key: "city", title: "城市" },
          { key: "manager", title: "仓库负责人" },
          { key: "contactPhone", title: "联系电话" },
          { key: "receivingAddress", title: "收货地址" },
          { key: "enabled", title: "是否启用", render: (r) => <StatusBadge status={r.enabled ? "已启用" : "已停用"} /> },
          { key: "sourceSystem", title: "来源系统", render: () => <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700">WMS</span> },
          { key: "lastSyncTime", title: "最后同步时间" },
          { key: "op", title: "操作", render: (r) => <button className="text-blue-600" onClick={() => setDetail(r)}>查看</button> },
        ]}
        rows={filtered}
      />

      <div className="mt-3 rounded border border-gray-200 bg-white p-4">
        <h3 className="mb-3 font-semibold">设计逻辑说明</h3>
        <LogicTable title="一、页面定位" headers={["项目", "说明"]} rows={[["页面名称", "仓库管理"], ["所属模块", "基础资料"], ["页面目标", "查看从 WMS 同步的仓库资料"], ["业务作用", "为采购申请、采购订单、供应商发货提供目标仓选择"], ["数据来源", "WMS 仓储物流系统"], ["核心限制", "SRM 只读引用，不允许新增、编辑、删除仓库"]]} />
        <LogicTable title="二、核心业务规则" headers={["业务场景", "核心规则", "结果"]} rows={[["查看仓库", "点击仓库编码或查看按钮", "打开只读详情弹窗"], ["引用仓库", "新建采购业务时选择仓库", "仅可选择已启用仓库"], ["刷新同步", "点击刷新同步按钮", "更新最后同步时间"], ["仓库维护", "仓库主数据由 WMS 维护", "SRM 不提供编辑入口"], ["仓库停用", "WMS 停用后同步到 SRM", "SRM 不可用于新建业务"]]} />
        <LogicTable title="三、按钮交互规则" headers={["按钮", "出现位置", "点击后动作", "是否改变仓库资料"]} rows={[["查询", "查询区", "按条件过滤仓库列表", "否"], ["清除", "查询区", "清空筛选条件，恢复全部列表", "否"], ["刷新同步", "查询区", "模拟从 WMS 刷新仓库资料", "仅更新同步时间"], ["查看", "表格操作列 / 编码入口", "打开仓库详情弹窗", "否"], ["关闭", "详情弹窗", "关闭详情弹窗", "否"]]} />
        <LogicTable title="四、禁止操作规则" headers={["操作", "是否允许", "原因"]} rows={[["新增仓库", "否", "仓库主数据由 WMS 维护"], ["编辑仓库", "否", "避免 SRM 与 WMS 数据不一致"], ["删除仓库", "否", "仓库删除需在 WMS 管控"], ["启用仓库", "否", "仓库状态由 WMS 控制"], ["停用仓库", "否", "仓库状态由 WMS 控制"], ["修改是否启用", "否", "SRM 页面只读展示"]]} />
        <LogicTable title="五、状态规则" headers={["状态", "含义", "是否可用于新建采购"]} rows={[["已启用", "WMS 中正常启用的仓库", "是"], ["已停用", "WMS 中已停用的仓库", "否"]]} />
        <LogicTable title="同步状态" headers={["同步状态", "含义", "页面处理"]} rows={[["已同步", "仓库资料已从 WMS 正常同步", "正常展示"], ["同步异常", "最近一次同步异常", "展示异常标签"]]} />
        <LogicTable title="六、查询筛选规则" headers={["筛选项", "匹配字段", "匹配方式", "说明"]} rows={[["关键词", "仓库编码、仓库名称、城市、负责人", "模糊匹配", "输入为空时不参与筛选"], ["仓库类型", "仓库类型", "精确匹配", "选择全部类型时不参与筛选"], ["仓库属性", "仓库属性", "精确匹配", "选择全部属性时不参与筛选"], ["国家", "国家", "精确匹配", "选择全部国家时不参与筛选"], ["状态", "是否启用", "精确匹配", "选择全部状态时不参与筛选"]]} />
        <LogicTable title="补充规则" headers={["场景", "规则"]} rows={[["多条件同时存在", "使用 AND 关系过滤"], ["点击查询", "按当前条件刷新列表"], ["点击清除", "清空所有查询条件并恢复全部数据"], ["查询无结果", "表格展示空状态"]]} />
        <LogicTable title="七、字段对齐规则" headers={["SRM 字段", "WMS 对应字段", "说明"]} rows={[["仓库编码", "仓库编码", "保持一致"], ["仓库名称", "仓库名称", "保持一致"], ["仓库类型", "仓库类型", "保持一致"], ["仓库属性", "仓库属性", "保持一致"], ["主体", "主体", "保持一致"], ["国家", "国家", "保持一致"], ["时区", "时区", "保持一致"], ["城市", "城市", "保持一致"], ["仓库负责人", "负责人", "保持一致"], ["联系电话", "联系电话", "保持一致"], ["收货地址", "地址", "保持一致"], ["是否启用", "是否启用", "只读展示"], ["最后同步时间", "同步时间", "SRM 记录"]]} />
        <LogicTable title="八、异常与边界规则" headers={["场景", "处理规则"]} rows={[["查询结果为空", "展示空状态"], ["仓库已停用", "不允许被采购申请和采购订单选择"], ["仓库状态变更", "只能通过 WMS 同步更新"], ["点击刷新同步失败", "展示同步异常提示"], ["是否启用字段", "如用开关展示必须禁用"], ["查看详情", "详情页只读，不提供编辑入口"], ["历史单据引用停用仓", "历史单据继续展示原仓库信息"]]} />
        <LogicTable title="九、开发注意事项" headers={["注意事项", "要求"]} rows={[["页面风格", "保持现有蓝白灰企业后台风格"], ["布局结构", "不破坏 Header、Sidebar、TabsNav"], ["表格展示", "字段较多时允许横向滚动"], ["弹窗层级", "弹窗不能被顶部导航或侧边栏遮挡"], ["数据来源", "仓库数据按 WMS 同步数据展示"], ["操作按钮", "不展示新增、编辑、删除、启用、停用"], ["状态展示", "使用统一 StatusBadge 或禁用开关"], ["刷新同步", "点击后更新最后同步时间并提示成功"], ["只读原则", "SRM 不维护仓库主数据"]]} />
      </div>

      <DetailModal open={!!detail} onClose={() => setDetail(null)} title="仓库详情">
        {detail && (
          <div className="space-y-3 text-sm">
            <Section title="基础信息" pairs={[["仓库编码", detail.warehouseCode], ["仓库名称", detail.warehouseName], ["仓库类型", detail.warehouseType], ["仓库属性", detail.warehouseAttribute], ["主体", detail.ownerEntity], ["状态", detail.enabled ? "已启用" : "已停用"], ["来源系统", detail.sourceSystem], ["最后同步时间", detail.lastSyncTime]]} />
            <Section title="地址信息" pairs={[["国家", detail.country], ["时区", detail.timezone], ["城市", detail.city], ["收货地址", detail.receivingAddress], ["邮编", detail.postalCode || "-"]]} />
            <Section title="联系人信息" pairs={[["仓库负责人", detail.manager], ["联系电话", detail.contactPhone || "-"], ["邮箱", detail.email || "-"]]} />
            <Section title="SRM 引用信息" pairs={[["可用于采购申请", detail.availableForPurchaseRequest ? "是" : "否"], ["可用于采购订单", detail.availableForPurchaseOrder ? "是" : "否"], ["可用于供应商发货目标仓", detail.availableForShipment ? "是" : "否"], ["关联采购订单数量", String(detail.relatedPurchaseOrderCount ?? 0)], ["最近引用时间", detail.recentUsedTime || "-"]]} />
            <Section title="同步信息" pairs={[["来源系统", detail.sourceSystem], ["来源仓库编码", detail.sourceWarehouseCode], ["最后同步时间", detail.lastSyncTime], ["同步状态", detail.syncStatus], ["同步备注", detail.syncRemark || "-"]]} />
            <Section title="备注信息" pairs={[["备注", detail.remark || "-"]]} />
            <div className="flex justify-end"><button className="rounded border border-gray-300 px-3 py-1.5 text-sm" onClick={() => setDetail(null)}>关闭</button></div>
          </div>
        )}
      </DetailModal>

      <Toast msg={toast} />
    </div>
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
