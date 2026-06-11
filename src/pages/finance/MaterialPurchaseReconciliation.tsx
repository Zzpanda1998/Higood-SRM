import PmsListPage from "../pms/PmsListPage";
import { materialReconciliation } from "../../mock/reconciliation";

export default function MaterialPurchaseReconciliation() {
  return (
    <PmsListPage
      title="面辅料采购对账"
      desc="适用于面辅料采购单，根据面辅料入库数量和采购单价生成应付金额。"
      rows={materialReconciliation}
      columns={[
        { key: "statementNo", title: "对账单号" },
        { key: "sourceOrderNo", title: "来源面辅料采购单" },
        { key: "supplier", title: "供应商" },
        { key: "inboundQty", title: "入库数量" },
        { key: "unitPrice", title: "单价" },
        { key: "payableAmount", title: "应付金额" },
        { key: "status", title: "状态", status: true },
      ]}
      primaryActionText="生成面辅料对账"
      logic={{
        module: "采购对账",
        upstream: "面辅料采购单、入库结果",
        downstream: "内部复核、付款记录",
        rules: [
          ["适用范围", "面辅料采购单", "做货材料采购进入对账"],
          ["金额计算", "入库数量 x 单价", "生成应付金额"],
          ["状态推进", "待确认 -> 已确认 -> 已付款", "完成采购闭环"],
        ],
      }}
    />
  );
}
