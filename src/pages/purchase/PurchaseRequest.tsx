import SimpleTablePage from "../SimpleTablePage";
import { purchaseRequests } from "../../mock/purchaseRequests";
export default function PurchaseRequest() { return <SimpleTablePage title="采购申请管理" desc="用于内部发起采购需求、审批、驳回和转采购订单。" rows={purchaseRequests} columns={[{ key: "reqNo", title: "采购申请单号" }, { key: "date", title: "申请日期" }, { key: "applicant", title: "申请人" }, { key: "dept", title: "申请部门" }, { key: "warehouse", title: "需求仓库" }, { key: "demandDate", title: "需求日期" }, { key: "reason", title: "申请原因" }, { key: "status", title: "状态" }]} />; }
