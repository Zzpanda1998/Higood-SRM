import { useMemo, useState } from "react";
import DataTable from "../../components/common/DataTable";
import DesignLogicCard from "../../components/common/DesignLogicCard";
import DetailModal from "../../components/common/DetailModal";
import PageHeader from "../../components/common/PageHeader";
import SearchBar from "../../components/common/SearchBar";
import StatusBadge from "../../components/common/StatusBadge";
import Toast from "../../components/common/Toast";
import { accessoryRequirementAnalysis as initialRows } from "../../mock/accessoryRequirementAnalysis";
import type { AccessoryRequirementAnalysis as Row } from "../../types/accessoryAnalysis";

export default function AccessoryRequirementAnalysis() {
  const [rows, setRows] = useState<Row[]>(initialRows);
  const [keyword, setKeyword] = useState("");
  const [detail, setDetail] = useState<Row | null>(null);
  const [toast, setToast] = useState("");
  const filtered = useMemo(() => rows.filter((row) => !keyword || [row.analysisNo, row.garmentPlanNo, row.bomNo, row.styleNo, row.productName].some((item) => item.includes(keyword))), [keyword, rows]);
  const setStatus = (id: string, status: Row["status"], msg: string) => {
    setRows((list) => list.map((row) => (row.id === id ? { ...row, status } : row)));
    setToast(msg);
    window.setTimeout(() => setToast(""), 1800);
  };

  return (
    <div>
      <PageHeader title="辅料需求分析" desc="用于根据成衣采购计划与BOM用量计算辅料缺口，并形成可转采购单的辅料需求。" />
      <SearchBar><div className="flex gap-2"><input className="h-8 w-96 rounded border px-2 text-sm" value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="搜索分析单 / 成衣计划 / BOM / 款号 / 商品" /><button className="h-8 rounded bg-brand px-3 text-sm text-white">查询</button><button className="h-8 rounded border px-3 text-sm" onClick={() => setKeyword("")}>清除</button></div></SearchBar>
      <DataTable columns={[
        { key: "analysisNo", title: "分析单号", render: (row) => <button className="text-brand" onClick={() => setDetail(row)}>{row.analysisNo}</button> },
        { key: "garmentPlanNo", title: "成衣计划号" }, { key: "bomNo", title: "BOM单号" }, { key: "styleNo", title: "款号" }, { key: "productName", title: "商品名称" }, { key: "accessoryKinds", title: "辅料种类" }, { key: "requiredQty", title: "需求数量" }, { key: "shortageQty", title: "缺口数量" }, { key: "suggestedSupplier", title: "建议供应商" }, { key: "status", title: "状态", render: (row) => <StatusBadge status={row.status} /> },
        { key: "op", title: "操作", render: (row) => <div className="space-x-2 whitespace-nowrap text-xs"><button className="text-brand" onClick={() => setDetail(row)}>查看</button>{row.status === "待分析" && <button className="text-brand" onClick={() => setStatus(row.id, "已分析", "辅料需求已分析")}>分析</button>}{row.status === "已分析" && <button className="text-green-600" onClick={() => setStatus(row.id, "已确认", "辅料需求已确认")}>确认</button>}{row.status === "已确认" && <button className="text-green-600" onClick={() => setStatus(row.id, "已转采购单", "已转采购单")}>转采购单</button>}</div> },
      ]} rows={filtered} />
      <DesignLogicCard sections={[
        { title: "页面定位", headers: ["项目", "说明"], rows: [["页面名称", "辅料需求分析"], ["所属模块", "采购计划"], ["页面目标", "按成衣计划与BOM计算辅料采购缺口"], ["下游单据", "采购单管理、ID面辅料单"]] },
        { title: "核心规则", headers: ["场景", "规则", "结果"], rows: [["需求计算", "成衣数量 x BOM单耗 x 损耗率", "得到总需求"], ["缺口计算", "总需求 - 可用库存 - 已采购未到", "得到采购建议"], ["转采购单", "按供应商和物料汇总", "生成采购来源"]] },
      ]} />
      <DetailModal open={!!detail} title="辅料需求分析详情" onClose={() => setDetail(null)}>{detail && <div className="grid grid-cols-2 gap-3 text-sm">{Object.entries(detail).map(([key, value]) => <div key={key}><span className="text-gray-500">{key}：</span>{String(value ?? "-")}</div>)}</div>}</DetailModal>
      <Toast msg={toast} />
    </div>
  );
}
