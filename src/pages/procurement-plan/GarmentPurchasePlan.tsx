import { useMemo, useState } from "react";
import DataTable from "../../components/common/DataTable";
import DesignLogicCard from "../../components/common/DesignLogicCard";
import DetailModal from "../../components/common/DetailModal";
import PageHeader from "../../components/common/PageHeader";
import SearchBar from "../../components/common/SearchBar";
import StatusBadge from "../../components/common/StatusBadge";
import Toast from "../../components/common/Toast";
import { garmentPurchasePlans as initialRows } from "../../mock/garmentPurchasePlans";
import type { GarmentPurchasePlan as Row } from "../../types/procurementPlan";

export default function GarmentPurchasePlan() {
  const [rows, setRows] = useState<Row[]>(initialRows);
  const [keyword, setKeyword] = useState("");
  const [detail, setDetail] = useState<Row | null>(null);
  const [toast, setToast] = useState("");
  const filtered = useMemo(() => rows.filter((row) => !keyword || [row.planNo, row.styleNo, row.productName, row.targetFactory].some((item) => item.includes(keyword))), [keyword, rows]);
  const showToast = (msg: string) => { setToast(msg); window.setTimeout(() => setToast(""), 1800); };
  const setStatus = (id: string, status: Row["status"], msg: string) => {
    setRows((list) => list.map((row) => (row.id === id ? { ...row, status } : row)));
    showToast(msg);
  };

  return (
    <div>
      <PageHeader title="成衣采购计划" desc="用于承接成衣采购需求，匹配打板/BOM后生成辅料需求分析，是辅料采购链路的起点。" />
      <SearchBar>
        <div className="flex flex-wrap items-center gap-2">
          <input className="h-8 w-80 rounded border px-2 text-sm" value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="搜索计划号 / 款号 / 商品 / 工厂" />
          <button className="h-8 rounded bg-brand px-3 text-sm text-white">查询</button>
          <button className="h-8 rounded border px-3 text-sm" onClick={() => setKeyword("")}>清除</button>
        </div>
      </SearchBar>
      <DataTable columns={[
        { key: "planNo", title: "成衣计划号", render: (row) => <button className="text-brand" onClick={() => setDetail(row)}>{row.planNo}</button> },
        { key: "styleNo", title: "款号" },
        { key: "productName", title: "商品名称" },
        { key: "season", title: "季节" },
        { key: "brand", title: "品牌" },
        { key: "orderQty", title: "计划数量" },
        { key: "deliveryDate", title: "交付日期" },
        { key: "targetFactory", title: "目标工厂" },
        { key: "bomNo", title: "BOM单号" },
        { key: "status", title: "状态", render: (row) => <StatusBadge status={row.status} /> },
        { key: "op", title: "操作", render: (row) => <div className="space-x-2 whitespace-nowrap text-xs"><button className="text-brand" onClick={() => setDetail(row)}>查看</button>{row.status === "已确认" && <button className="text-brand" onClick={() => setStatus(row.id, "已匹配BOM", "已匹配BOM")}>匹配BOM</button>}{row.status === "已匹配BOM" && <button className="text-green-600" onClick={() => setStatus(row.id, "已生成辅料需求", "已生成辅料需求分析")}>生成辅料需求</button>}</div> },
      ]} rows={filtered} />
      <DesignLogicCard sections={[
        { title: "页面定位", headers: ["项目", "说明"], rows: [["页面名称", "成衣采购计划"], ["所属模块", "采购计划"], ["页面目标", "承接成衣订单计划并推动 BOM 匹配"], ["下游单据", "辅料需求分析"]] },
        { title: "核心规则", headers: ["场景", "规则", "结果"], rows: [["匹配BOM", "按款号绑定启用 BOM", "计划状态变为已匹配BOM"], ["生成辅料需求", "按 BOM 用量和计划数量计算需求", "形成 ARA 分析单"], ["关闭计划", "不再参与采购生成", "保留历史记录"]] },
      ]} />
      <DetailModal open={!!detail} title="成衣采购计划详情" onClose={() => setDetail(null)}>{detail && <div className="grid grid-cols-2 gap-3 text-sm">{Object.entries(detail).map(([key, value]) => <div key={key}><span className="text-gray-500">{key}：</span>{String(value ?? "-")}</div>)}</div>}</DetailModal>
      <Toast msg={toast} />
    </div>
  );
}
