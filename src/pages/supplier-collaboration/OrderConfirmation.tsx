import SimpleTablePage from "../SimpleTablePage";
import { supplierConfirmations } from "../../mock/supplierConfirmations";

export default function OrderConfirmation() {
  return (
    <SimpleTablePage
      title="订单确认"
      desc="展示待供应商确认的商品采购单和面辅料采购单。"
      rows={supplierConfirmations}
      columns={[
        { key: "documentNo", title: "单据号" },
        { key: "documentType", title: "单据类型" },
        { key: "purchaseType", title: "采购类型" },
        { key: "supplier", title: "供应商" },
        { key: "purchaseQty", title: "采购数量" },
        { key: "expectedDate", title: "预计交期" },
        { key: "status", title: "状态" },
      ]}
    />
  );
}
