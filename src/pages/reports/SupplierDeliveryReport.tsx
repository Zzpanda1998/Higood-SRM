import SimpleTablePage from "../SimpleTablePage";
import { reportCards } from "../../mock/reports";
export default function SupplierDeliveryReport() { return <SimpleTablePage title="供应商交付报表" desc="跟踪供应商准时交付率、质检合格率与异常次数。" rows={reportCards.supplierDelivery} columns={[{ key: "supplier", title: "供应商名称" }, { key: "orders", title: "订单数量" }, { key: "onTimeRate", title: "准时交付率(%)" }, { key: "qcRate", title: "质检合格率(%)" }, { key: "abnormal", title: "异常次数" }, { key: "score", title: "综合评分" }]} />; }
