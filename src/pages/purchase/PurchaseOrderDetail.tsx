import DataTable from "../../components/common/DataTable";
import PageHeader from "../../components/common/PageHeader";
import ProgressSteps from "../../components/common/ProgressSteps";
import { purchaseOrders } from "../../mock/purchaseOrders";

export default function PurchaseOrderDetail() {
  const order = purchaseOrders[1];
  return (
    <div>
      <PageHeader title={`采购订单详情 - ${order.orderNo}`} desc="流程进度：创建订单 → 内部确认 → 标记发货 → 在途 → 仓库收货 → 质检入库 → 完成" />
      <div className="mb-3 rounded border border-gray-200 bg-white p-3 text-sm">
        <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
          <div>供应商：{order.supplier}</div><div>采购类型：{order.purchaseType}</div><div>目标仓库：{order.targetWarehouse}</div><div>当前状态：{order.status}</div>
        </div>
      </div>
      <ProgressSteps steps={["创建订单", "内部确认", "标记发货", "在途", "仓库收货", "质检入库", "完成"]} current={3} />
      <DataTable columns={[{ key: "code", title: "物料编码" }, { key: "name", title: "物料名称" }, { key: "spec", title: "规格型号" }, { key: "color", title: "颜色/色号" }, { key: "qty", title: "采购数量" }, { key: "price", title: "单价" }, { key: "amount", title: "金额" }, { key: "shipped", title: "已发货" }, { key: "received", title: "已收货" }, { key: "inbound", title: "已入库" }]} rows={[{ code: "FAB-2026-0002", name: "220g 涤棉卫衣布", spec: "220g", color: "黑色/BK01", qty: 9000, price: 24, amount: 216000, shipped: 6000, received: 5000, inbound: 5000 }]} />
    </div>
  );
}
