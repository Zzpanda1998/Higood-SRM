import SimpleTablePage from "../SimpleTablePage";
import { inspections } from "../../mock/inspections";
export default function InspectionManagement() { return <SimpleTablePage title="质检管理" desc="基础质检流程：质检结果为合格、部分合格、不合格。" rows={inspections} columns={[{ key: "qcNo", title: "质检单号" }, { key: "grnNo", title: "收货单号" }, { key: "poNo", title: "采购订单号" }, { key: "supplier", title: "供应商" }, { key: "material", title: "物料名称" }, { key: "recvQty", title: "收货数量" }, { key: "result", title: "质检结果" }, { key: "inspector", title: "质检人" }, { key: "date", title: "质检日期" }]} />; }
