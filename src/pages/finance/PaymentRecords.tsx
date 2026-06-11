import SimpleTablePage from "../SimpleTablePage";
import { statements } from "../../mock/statements";
export default function PaymentRecords() { return <SimpleTablePage title="付款记录" desc="财务付款执行与回溯记录。" rows={statements.map((x) => ({ ...x, paidDate: x.status === "已付款" ? "2026-06-01" : "-", voucher: x.status === "已付款" ? "PAY-2026-0001" : "-" }))} columns={[{ key: "stNo", title: "对账单号" }, { key: "supplier", title: "供应商" }, { key: "amount", title: "金额" }, { key: "status", title: "状态" }, { key: "paidDate", title: "付款日期" }, { key: "voucher", title: "付款凭证" }]} />; }
