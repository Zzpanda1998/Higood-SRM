import { useMemo, useState } from "react";
import DataTable from "../../components/common/DataTable";
import DesignLogicCard from "../../components/common/DesignLogicCard";
import DetailModal from "../../components/common/DetailModal";
import PageHeader from "../../components/common/PageHeader";
import SearchBar from "../../components/common/SearchBar";
import StatusBadge from "../../components/common/StatusBadge";
import Toast from "../../components/common/Toast";
import { boms as initialRows } from "../../mock/boms";
import type { Bom as Row } from "../../types/bom";

export default function BomManagement() {
  const [rows, setRows] = useState<Row[]>(initialRows);
  const [keyword, setKeyword] = useState("");
  const [detail, setDetail] = useState<Row | null>(null);
  const [toast, setToast] = useState("");
  const filtered = useMemo(() => rows.filter((row) => !keyword || [row.bomNo, row.styleNo, row.sampleNo, row.productName].some((item) => item.includes(keyword))), [keyword, rows]);
  const update = (id: string, status: Row["status"]) => {
    setRows((list) => list.map((row) => (row.id === id ? { ...row, status } : row)));
    setToast(status === "已启用" ? "BOM已启用" : "BOM已停用");
    window.setTimeout(() => setToast(""), 1800);
  };

  return (
    <div>
      <PageHeader title="打板/BOM管理" desc="用于维护款式打板结果和物料清单，为成衣采购计划和辅料需求分析提供用量依据。" />
      <SearchBar><div className="flex gap-2"><input className="h-8 w-80 rounded border px-2 text-sm" value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="搜索BOM单号 / 款号 / 样衣单 / 商品" /><button className="h-8 rounded bg-brand px-3 text-sm text-white">查询</button><button className="h-8 rounded border px-3 text-sm" onClick={() => setKeyword("")}>清除</button></div></SearchBar>
      <DataTable columns={[
        { key: "bomNo", title: "BOM单号", render: (row) => <button className="text-brand" onClick={() => setDetail(row)}>{row.bomNo}</button> },
        { key: "styleNo", title: "款号" }, { key: "sampleNo", title: "样衣单号" }, { key: "productName", title: "商品名称" }, { key: "version", title: "版本" }, { key: "itemCount", title: "物料项数" }, { key: "owner", title: "负责人" }, { key: "status", title: "状态", render: (row) => <StatusBadge status={row.status} /> },
        { key: "op", title: "操作", render: (row) => <div className="space-x-2 whitespace-nowrap text-xs"><button className="text-brand" onClick={() => setDetail(row)}>查看</button>{row.status !== "已启用" && <button className="text-green-600" onClick={() => update(row.id, "已启用")}>启用</button>}{row.status === "已启用" && <button className="text-red-600" onClick={() => update(row.id, "已停用")}>停用</button>}</div> },
      ]} rows={filtered} />
      <DesignLogicCard sections={[
        { title: "页面定位", headers: ["项目", "说明"], rows: [["页面名称", "打板/BOM管理"], ["所属模块", "采购计划"], ["页面目标", "维护款式物料用量清单"], ["核心限制", "只有已启用 BOM 可参与辅料需求分析"]] },
        { title: "按钮规则", headers: ["按钮", "动作", "结果"], rows: [["查看", "打开 BOM 明细", "只读展示物料用量"], ["启用", "启用 BOM 版本", "可被采购计划匹配"], ["停用", "停用 BOM 版本", "不再用于新分析"]] },
      ]} />
      <DetailModal open={!!detail} title="BOM详情" onClose={() => setDetail(null)}>
        {detail && <div className="space-y-3 text-sm"><div className="grid grid-cols-2 gap-3">{Object.entries(detail).filter(([key]) => key !== "items").map(([key, value]) => <div key={key}><span className="text-gray-500">{key}：</span>{String(value ?? "-")}</div>)}</div><DataTable columns={[{ key: "materialCode", title: "物料编码" }, { key: "materialName", title: "物料名称" }, { key: "category", title: "分类" }, { key: "usage", title: "单件用量" }, { key: "unit", title: "单位" }, { key: "lossRate", title: "损耗率" }]} rows={detail.items} /></div>}
      </DetailModal>
      <Toast msg={toast} />
    </div>
  );
}
