import { useMemo, useState } from "react";
import DataTable from "../../components/common/DataTable";
import DesignLogicCard from "../../components/common/DesignLogicCard";
import DetailModal from "../../components/common/DetailModal";
import PageHeader from "../../components/common/PageHeader";
import SearchBar from "../../components/common/SearchBar";
import StatusBadge from "../../components/common/StatusBadge";
import Toast from "../../components/common/Toast";
import { purchaseOrders as initialRows } from "../../mock/purchaseOrders";
import type { PurchaseOrder as Row } from "../../types/entities";

const statusOptions = ["全部状态", "草稿", "待确认", "已确认", "备货中", "已发货", "在途", "部分收货", "质检中", "部分入库", "已入库", "已完成"];

export default function PurchaseOrder() {
  const [rows, setRows] = useState<Row[]>(initialRows);
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState("全部状态");
  const [detail, setDetail] = useState<Row | null>(null);
  const [toast, setToast] = useState("");

  const filtered = useMemo(
    () =>
      rows.filter((row) => {
        const matchKeyword = !keyword || [row.orderNo, row.sourceNo ?? "", row.supplier, row.purchaseType, row.sourceItem ?? ""].some((item) => item.includes(keyword));
        const matchStatus = status === "全部状态" || row.status === status;
        return matchKeyword && matchStatus;
      }),
    [keyword, rows, status],
  );

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(""), 1800);
  };

  const submit = (id: string) => {
    setRows((list) => list.map((row) => (row.id === id ? { ...row, status: "待确认", materialTrackingGenerated: true, materialTrackingNo: row.materialTrackingNo ?? `MF-2026-${String(Number(row.id) + 10).padStart(4, "0")}` } : row)));
    showToast("采购单已提交确认，并生成ID面辅料单");
  };

  return (
    <div>
      <PageHeader title="采购单管理" desc="用于管理 PMS 采购执行单，承接补货计划、成衣采购计划和辅料需求分析，并驱动内部确认、采购跟踪、到货、收货、入库和对账。" />
      <SearchBar>
        <div className="flex flex-wrap items-center gap-2">
          <input className="h-8 w-96 rounded border px-2 text-sm" value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="搜索采购单号 / 来源单号 / 供应商 / 物料" />
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
          <button className="ml-auto h-8 rounded bg-brand px-3 text-sm text-white" onClick={() => showToast("新增采购单入口已预留")}>新增采购单</button>
        </div>
      </SearchBar>
      <DataTable
        columns={[
          { key: "orderNo", title: "采购单号", render: (row) => <button className="text-brand" onClick={() => setDetail(row)}>{row.orderNo}</button> },
          { key: "sourceType", title: "来源类型" },
          { key: "sourceNo", title: "来源单号" },
          { key: "sourceItem", title: "来源物料/款式" },
          { key: "supplier", title: "供应商" },
          { key: "purchaseType", title: "采购类型" },
          { key: "targetWarehouse", title: "目标仓库" },
          { key: "skuCount", title: "物料种类数" },
          { key: "qty", title: "采购数量" },
          { key: "shippedQty", title: "已发货数量" },
          { key: "receivedQty", title: "已收货数量" },
          { key: "inboundQty", title: "已入库数量" },
          { key: "amount", title: "订单金额" },
          { key: "materialTrackingNo", title: "ID面辅料单" },
          { key: "materialTrackingGenerated", title: "已生成ID", render: (row) => (row.materialTrackingGenerated ? <StatusBadge status="已生成" /> : <StatusBadge status="未生成" />) },
          { key: "status", title: "状态", render: (row) => <StatusBadge status={row.status} /> },
          { key: "creator", title: "创建人" },
          {
            key: "op",
            title: "操作",
            render: (row) => (
              <div className="space-x-2 whitespace-nowrap text-xs">
                <button className="text-brand" onClick={() => setDetail(row)}>查看</button>
                {row.status === "草稿" && <button className="text-brand" onClick={() => submit(row.id)}>提交确认</button>}
                {row.status !== "已完成" && <button className="text-red-600" onClick={() => showToast("关闭操作已预留二次确认")}>关闭</button>}
              </div>
            ),
          },
        ]}
        rows={filtered}
      />
      <DesignLogicCard
        sections={[
          { title: "页面定位", headers: ["项目", "说明"], rows: [["页面名称", "采购单管理"], ["所属模块", "采购执行"], ["页面目标", "承接采购计划并驱动内部采购流程"], ["来源单据", "补货计划、成衣采购计划、辅料需求分析"]] },
          { title: "核心规则", headers: ["场景", "规则", "结果"], rows: [["来源记录", "采购单必须保留来源类型和来源单号", "方便追溯计划来源"], ["提交采购单", "状态变为待确认", "生成ID面辅料单"], ["数量同步", "发货、收货、入库数量从采购跟踪和到货结果回写", "采购状态实时更新"]] },
          { title: "按钮规则", headers: ["按钮", "出现位置", "动作"], rows: [["查看", "表格操作列", "打开采购单详情"], ["提交确认", "草稿采购单", "提交内部确认并生成ID面辅料单"], ["关闭", "未完成采购单", "预留二次确认关闭"]] },
        ]}
      />
      <DetailModal open={!!detail} title="采购单详情" onClose={() => setDetail(null)}>
        {detail && <div className="grid grid-cols-2 gap-3 text-sm">{Object.entries(detail).map(([key, value]) => <div key={key}><span className="text-gray-500">{key}：</span>{String(value ?? "-")}</div>)}</div>}
      </DetailModal>
      <Toast msg={toast} />
    </div>
  );
}
