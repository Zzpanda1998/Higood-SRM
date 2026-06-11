import DataTable from "../../components/common/DataTable";
import PageHeader from "../../components/common/PageHeader";
import StatCard from "../../components/common/StatCard";
import StatusBadge from "../../components/common/StatusBadge";
import { productPurchaseOrders } from "../../mock/productPurchaseOrders";

export default function Dashboard() {
  return (
    <div>
      <PageHeader title="采购管理系统 PMS" desc="商品采购 · 做货拆BOM · 面辅料采购 · 采购执行 · 到货入库 · 采购对账闭环" />
      <div className="mb-3 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        <StatCard title="待生成采购建议" value={5} />
        <StatCard title="做货采购单" value={6} />
        <StatCard title="待拆BOM单据" value={3} />
        <StatCard title="面辅料采购单" value={8} />
        <StatCard title="待内部确认" value={4} />
        <StatCard title="待对账单据" value={6} />
      </div>
      <div className="mb-3 rounded border border-gray-200 bg-white p-3">
        <div className="mb-2 font-medium">核心流程提醒</div>
        <ul className="grid grid-cols-1 gap-1 text-sm text-red-600 md:grid-cols-2">
          <li>做货采购单未生成面辅料需求：GP-2026-0003</li>
          <li>面辅料采购单待内部确认：ID-MP-2026-0003</li>
          <li>面辅料建议采购量异常：MRA-2026-0006</li>
          <li>到货计划预计到货临近：ASN-2026-0001</li>
        </ul>
      </div>
      <DataTable
        columns={[
          { key: "purchaseOrderNo", title: "商品采购单号", render: (row) => <span className="text-brand">{row.purchaseOrderNo}</span> },
          { key: "purchaseType", title: "采购类型" },
          { key: "displayDimension", title: "展示维度" },
          { key: "productName", title: "商品名称" },
          { key: "totalPurchaseQty", title: "采购数量" },
          { key: "supplierName", title: "供应商" },
          { key: "materialStatus", title: "面辅料状态" },
          { key: "status", title: "状态", render: (row) => <StatusBadge status={row.status} /> },
          { key: "op", title: "操作", render: () => <button className="text-brand">查看</button> },
        ]}
        rows={productPurchaseOrders.slice(0, 8)}
      />
    </div>
  );
}
