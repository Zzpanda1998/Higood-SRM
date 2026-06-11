import { useMemo, useState } from "react";
import DataTable from "../../components/common/DataTable";
import DesignLogicCard from "../../components/common/DesignLogicCard";
import DetailModal from "../../components/common/DetailModal";
import PageHeader from "../../components/common/PageHeader";
import SearchBar from "../../components/common/SearchBar";
import StatusBadge from "../../components/common/StatusBadge";
import { materialTrackingOrders } from "../../mock/materialTrackingOrders";
import type { MaterialTrackingOrder as Row } from "../../types/materialTracking";

const statusOptions = ["全部状态", "待确认", "已确认", "备货中", "已发货", "在途", "已到仓", "已收货", "已入库", "异常"];

export default function MaterialTrackingOrder() {
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState("全部状态");
  const [detail, setDetail] = useState<Row | null>(null);

  const rows = useMemo(
    () =>
      materialTrackingOrders.filter((row) => {
        const matchKeyword = !keyword || [row.trackingNo, row.purchaseOrderNo, row.sourceNo, row.supplier, row.materialName].some((item) => item.includes(keyword));
        const matchStatus = status === "全部状态" || row.status === status;
        return matchKeyword && matchStatus;
      }),
    [keyword, status],
  );

  return (
    <div>
      <PageHeader title="ID面辅料单" desc="用于按采购单生成面辅料采购跟踪 ID，贯穿内部确认、备货、发货、在途、收货、质检、入库全过程。" />
      <SearchBar>
        <div className="flex flex-wrap items-center gap-2">
          <input className="h-8 w-96 rounded border px-2 text-sm" value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="搜索ID面辅料单 / 采购单 / 来源单 / 供应商 / 物料" />
          <select className="h-8 rounded border px-2 text-sm" value={status} onChange={(event) => setStatus(event.target.value)}>
            {statusOptions.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
          <button className="h-8 rounded bg-brand px-3 text-sm text-white">查询</button>
          <button
            className="h-8 rounded border px-3 text-sm"
            onClick={() => {
              setKeyword("");
              setStatus("全部状态");
            }}
          >
            清除
          </button>
        </div>
      </SearchBar>
      <DataTable
        columns={[
          { key: "trackingNo", title: "ID面辅料单号", render: (row) => <button className="text-brand" onClick={() => setDetail(row)}>{row.trackingNo}</button> },
          { key: "purchaseOrderNo", title: "采购单号" },
          { key: "sourceType", title: "来源类型" },
          { key: "sourceNo", title: "来源单号" },
          { key: "supplier", title: "供应商" },
          { key: "materialCategory", title: "物料分类" },
          { key: "materialName", title: "物料名称" },
          { key: "targetWarehouse", title: "目标仓库" },
          { key: "purchaseQty", title: "采购数量" },
          { key: "shippedQty", title: "已发货" },
          { key: "receivedQty", title: "已收货" },
          { key: "inboundQty", title: "已入库" },
          { key: "status", title: "状态", render: (row) => <StatusBadge status={row.status} /> },
          { key: "dueDate", title: "要求交期" },
          { key: "owner", title: "负责人" },
          { key: "op", title: "操作", render: (row) => <button className="text-xs text-brand" onClick={() => setDetail(row)}>查看</button> },
        ]}
        rows={rows}
      />
      <DesignLogicCard
        sections={[
          { title: "页面定位", headers: ["项目", "说明"], rows: [["页面名称", "ID面辅料单"], ["所属模块", "采购执行"], ["页面目标", "跟踪采购单维度的面辅料交付状态"], ["覆盖流程", "确认、备货、发货、在途、收货、入库"]] },
          { title: "核心规则", headers: ["场景", "规则", "结果"], rows: [["生成ID", "采购单提交后按物料维度生成 MF 编号", "形成跟踪单"], ["状态同步", "采购执行和到货协同更新数量", "跟踪单数量同步刷新"], ["异常识别", "交期、数量、质检问题标记", "记录异常标记"]] },
          { title: "查询规则", headers: ["筛选项", "匹配字段", "方式"], rows: [["关键词", "ID单号、采购单号、来源单号、供应商、物料", "模糊匹配"], ["状态", "当前状态", "精确匹配"]] },
        ]}
      />
      <DetailModal open={!!detail} title="ID面辅料单详情" onClose={() => setDetail(null)}>
        {detail && <div className="grid grid-cols-2 gap-3 text-sm">{Object.entries(detail).map(([key, value]) => <div key={key}><span className="text-gray-500">{key}：</span>{String(value ?? "-")}</div>)}</div>}
      </DetailModal>
    </div>
  );
}
