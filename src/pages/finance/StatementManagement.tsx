import SimpleTablePage from "../SimpleTablePage";
import { statements } from "../../mock/statements";
export default function StatementManagement() { return <SimpleTablePage title="对账单管理" desc="基于已入库数量生成对账单，内部复核后财务付款并完成。" rows={statements} columns={[{ key: "stNo", title: "对账单号" }, { key: "supplier", title: "供应商" }, { key: "period", title: "对账周期" }, { key: "currency", title: "币种" }, { key: "amount", title: "对账金额" }, { key: "status", title: "对账状态" }, { key: "creator", title: "创建人" }, { key: "date", title: "创建日期" }]} />; }
