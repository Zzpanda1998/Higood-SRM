import SimpleTablePage from "../SimpleTablePage";
import { shipments } from "../../mock/shipments";

export default function ShipmentManagement() {
  return (
    <SimpleTablePage
      title="发货管理"
      desc="供应商确认后创建发货记录，并驱动到货计划。"
      rows={shipments}
      columns={[
        { key: "asnNo", title: "发货单号" },
        { key: "sourceNo", title: "来源单据号" },
        { key: "sourceType", title: "来源类型" },
        { key: "supplier", title: "供应商" },
        { key: "shipQty", title: "发货数量" },
        { key: "mode", title: "物流方式" },
        { key: "logisticsNo", title: "物流单号" },
        { key: "eta", title: "预计到货日期" },
        { key: "status", title: "状态" },
      ]}
    />
  );
}
