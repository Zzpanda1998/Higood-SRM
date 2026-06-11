import { useMemo, useState } from "react";
import DataTable from "../../components/common/DataTable";
import DesignLogicCard from "../../components/common/DesignLogicCard";
import DetailModal from "../../components/common/DetailModal";
import PageHeader from "../../components/common/PageHeader";
import SearchBar from "../../components/common/SearchBar";
import StatusBadge from "../../components/common/StatusBadge";
import Toast from "../../components/common/Toast";
import { replenishmentPlans as initialRows } from "../../mock/replenishmentPlans";
import type { ReplenishmentPlan as Row } from "../../types/procurementPlan";

export default function ReplenishmentPlan() {
  const [rows, setRows] = useState<Row[]>(initialRows);
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState("全部状态");
  const [detail, setDetail] = useState<Row | null>(null);
  const [toast, setToast] = useState("");

  const filtered = useMemo(() => rows.filter((row) => {
    const matchKeyword = !keyword || [row.planNo, row.materialName, row.recommendedSupplier, row.targetWarehouse].some((item) => item.includes(keyword));
    const matchStatus = status === "全部状态" || row.status === status;
    return matchKeyword && matchStatus;
  }), [keyword, rows, status]);

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(""), 1800);
  };
  const updateStatus = (id: string, next: Row["status"], msg: string) => {
    setRows((list) => list.map((row) => (row.id === id ? { ...row, status: next } : row)));
    showToast(msg);
  };
  const addDraft = () => {
    const next: Row = {
      id: String(Date.now()),
      planNo: `RP-2026-${String(rows.length + 1).padStart(4, "0")}`,
      materialCategory: "面料",
      materialName: "新增补货物料",
      targetWarehouse: "印尼雅加达面辅料仓",
      plannedQty: 1000,
      unit: "米",
      demandDate: "2026-07-01",
      recommendedSupplier: "广州华盛面料有限公司",
      status: "草稿",
      creator: "采购员",
      createdAt: new Date().toLocaleString("zh-CN", { hour12: false }),
    };
    setRows((list) => [next, ...list]);
    showToast("补货计划草稿已新增");
  };

  return (
    <div>
      <PageHeader title="补货计划" desc="用于根据面料、纱线、包材、耗材等基础库存需求生成采购补货计划，并向采购单管理传递来源单据。" />
      <SearchBar>
        <div className="flex flex-wrap items-center gap-2">
          <input className="h-8 w-80 rounded border px-2 text-sm" value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="搜索计划号 / 物料 / 供应商 / 仓库" />
          <select className="h-8 rounded border px-2 text-sm" value={status} onChange={(e) => setStatus(e.target.value)}>
            {["全部状态", "草稿", "待确认", "已确认", "已转采购单", "已关闭"].map((item) => <option key={item}>{item}</option>)}
          </select>
          <button className="h-8 rounded bg-brand px-3 text-sm text-white">查询</button>
          <button className="h-8 rounded border px-3 text-sm" onClick={() => { setKeyword(""); setStatus("全部状态"); }}>清除</button>
          <button className="ml-auto h-8 rounded bg-brand px-3 text-sm text-white" onClick={addDraft}>新增补货计划</button>
        </div>
      </SearchBar>
      <DataTable columns={[
        { key: "planNo", title: "补货计划号", render: (row) => <button className="text-brand" onClick={() => setDetail(row)}>{row.planNo}</button> },
        { key: "materialCategory", title: "物料分类" },
        { key: "materialName", title: "物料名称" },
        { key: "targetWarehouse", title: "需求仓库" },
        { key: "plannedQty", title: "计划数量" },
        { key: "unit", title: "单位" },
        { key: "demandDate", title: "需求日期" },
        { key: "recommendedSupplier", title: "建议供应商" },
        { key: "status", title: "状态", render: (row) => <StatusBadge status={row.status} /> },
        { key: "creator", title: "创建人" },
        { key: "op", title: "操作", render: (row) => (
          <div className="space-x-2 whitespace-nowrap text-xs">
            <button className="text-brand" onClick={() => setDetail(row)}>查看</button>
            {row.status === "草稿" && <button className="text-brand" onClick={() => updateStatus(row.id, "待确认", "补货计划已提交确认")}>提交</button>}
            {row.status === "待确认" && <button className="text-green-600" onClick={() => updateStatus(row.id, "已确认", "补货计划已确认")}>确认</button>}
            {row.status === "已确认" && <button className="text-green-600" onClick={() => updateStatus(row.id, "已转采购单", "已生成采购单")}>转采购单</button>}
            {row.status !== "已关闭" && <button className="text-red-600" onClick={() => updateStatus(row.id, "已关闭", "补货计划已关闭")}>关闭</button>}
          </div>
        ) },
      ]} rows={filtered} />
      <DesignLogicCard sections={[
        { title: "页面定位", headers: ["项目", "说明"], rows: [["页面名称", "补货计划"], ["所属模块", "采购计划"], ["页面目标", "管理面料、纱线、包材、耗材补货需求"], ["下游单据", "采购单管理、ID面辅料单"]] },
        { title: "核心规则", headers: ["场景", "规则", "结果"], rows: [["新增计划", "生成 RP 编号", "状态为草稿"], ["确认计划", "需求数量和供应商明确", "允许转采购单"], ["转采购单", "携带来源单号", "采购单记录来源类型"]] },
        { title: "状态流转", headers: ["当前状态", "动作", "目标状态"], rows: [["草稿", "提交", "待确认"], ["待确认", "确认", "已确认"], ["已确认", "转采购单", "已转采购单"], ["任意未完成状态", "关闭", "已关闭"]] },
      ]} />
      <DetailModal open={!!detail} title="补货计划详情" onClose={() => setDetail(null)}>
        {detail && <div className="grid grid-cols-2 gap-3 text-sm text-gray-700">{Object.entries(detail).map(([key, value]) => <div key={key}><span className="text-gray-500">{key}：</span>{String(value ?? "-")}</div>)}</div>}
      </DetailModal>
      <Toast msg={toast} />
    </div>
  );
}
