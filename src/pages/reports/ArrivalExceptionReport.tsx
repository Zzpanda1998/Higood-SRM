import PageHeader from "../../components/common/PageHeader";
import StatCard from "../../components/common/StatCard";
import { reportCards } from "../../mock/reports";
export default function ArrivalExceptionReport() { const x = reportCards.arrivalException; return <div><PageHeader title="到货异常报表" desc="统计收货短少、多收、破损和物料错误等异常。" /><div className="grid grid-cols-2 gap-3 md:grid-cols-5"><StatCard title="本月异常收货数量" value={x.abnormalCount} /><StatCard title="短少数量" value={x.shortage} /><StatCard title="多收数量" value={x.overage} /><StatCard title="破损数量" value={x.damaged} /><StatCard title="物料错误数量" value={x.wrong} /></div></div>; }
