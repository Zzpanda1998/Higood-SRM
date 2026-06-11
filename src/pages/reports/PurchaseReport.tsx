import PageHeader from "../../components/common/PageHeader";
import StatCard from "../../components/common/StatCard";
import { reportCards } from "../../mock/reports";
export default function PurchaseReport() { return <div><PageHeader title="采购订单报表" desc="按采购类型、供应商、状态统计采购订单情况。" /><div className="grid grid-cols-2 gap-3 md:grid-cols-4"><StatCard title="本月采购订单数量" value={reportCards.purchase.monthOrders} /><StatCard title="本月采购金额" value={reportCards.purchase.monthAmount} /><StatCard title="面料采购单数" value={reportCards.purchase.byType[0][1]} /><StatCard title="辅料采购单数" value={reportCards.purchase.byType[1][1]} /></div></div>; }
