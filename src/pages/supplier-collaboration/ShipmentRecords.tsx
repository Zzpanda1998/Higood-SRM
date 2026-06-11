import SimpleTablePage from "../SimpleTablePage";
import { shipments } from "../../mock/shipments";

export default function ShipmentRecords() {
  return (
    <SimpleTablePage
      title="发货记录"
      desc="查看历史发货数据，偏只读展示。"
      rows={shipments.map((item) => ({ ...item, actualArrival: item.recvQty > 0 ? item.eta : "-" }))}
      columns={[
        { key: "asnNo", title: "发货单号" },
        { key: "sourceNo", title: "来源单据号" },
        { key: "sourceType", title: "来源类型" },
        { key: "supplier", title: "供应商" },
        { key: "shipDate", title: "发货日期" },
        { key: "eta", title: "预计到达日期" },
        { key: "actualArrival", title: "实际到达日期" },
        { key: "mode", title: "物流方式" },
        { key: "logisticsNo", title: "物流单号" },
        { key: "shipQty", title: "发货数量" },
        { key: "recvQty", title: "收货数量" },
        { key: "status", title: "状态" },
      ]}
    />
  );
}
