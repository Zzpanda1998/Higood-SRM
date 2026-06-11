import SimpleTablePage from "../SimpleTablePage";
import { arrivalPlans } from "../../mock/arrivalPlans";

export default function ArrivalPlan() {
  return (
    <SimpleTablePage
      title="到货计划"
      desc="采购执行中标记发货后生成到货计划，用于仓库到货准备和收货衔接。"
      rows={arrivalPlans}
      columns={[
        { key: "arrNo", title: "到货计划号" },
        { key: "asnNo", title: "来源发货单" },
        { key: "poNo", title: "来源采购单" },
        { key: "supplier", title: "供应商" },
        { key: "warehouse", title: "目标仓库" },
        { key: "eta", title: "预计到货日期" },
        { key: "expectedQty", title: "预计到货数量" },
        { key: "status", title: "状态" },
      ]}
    />
  );
}
