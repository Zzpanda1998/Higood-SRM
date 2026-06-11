import SimpleTablePage from "../SimpleTablePage";
import { inboundOrders } from "../../mock/inboundOrders";
export default function InboundManagement() { return <SimpleTablePage title="入库管理" desc="依据收货/质检结果执行入库，支持部分入库与已入库状态。" rows={inboundOrders} columns={[{ key: "inNo", title: "入库单号" }, { key: "grnNo", title: "收货单号" }, { key: "qcNo", title: "质检单号" }, { key: "poNo", title: "采购订单号" }, { key: "warehouse", title: "入库仓库" }, { key: "date", title: "入库日期" }, { key: "operator", title: "入库人" }, { key: "status", title: "入库状态" }]} />; }
