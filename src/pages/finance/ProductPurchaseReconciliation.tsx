import PmsListPage from "../pms/PmsListPage";
import { productReconciliation } from "../../mock/reconciliation";

export default function ProductPurchaseReconciliation() {
  return (
    <PmsListPage
      title="商品采购对账"
      desc="适用于成衣采购和样衣采购，根据入库数量和采购单价生成应付金额。"
      rows={productReconciliation}
      columns={[
        { key: "statementNo", title: "对账单号" },
        { key: "sourceOrderNo", title: "来源商品采购单" },
        { key: "purchaseType", title: "采购类型" },
        { key: "supplier", title: "供应商" },
        { key: "inboundQty", title: "入库数量" },
        { key: "unitPrice", title: "单价" },
        { key: "payableAmount", title: "应付金额" },
        { key: "status", title: "状态", status: true },
      ]}
      primaryActionText="生成商品对账"
      logic={{
        module: "采购对账",
        upstream: "成衣/样衣商品采购单、入库结果",
        downstream: "内部复核、付款记录",
        rules: [
          ["适用范围", "成衣采购、样衣采购", "商品采购单直接进入对账"],
          ["金额计算", "入库数量 x 单价", "生成应付金额"],
          ["对账确认", "内部复核后可付款", "形成付款记录"],
        ],
      }}
    />
  );
}
