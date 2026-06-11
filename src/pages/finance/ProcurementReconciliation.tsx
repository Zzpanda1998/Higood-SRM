import { useMemo, useState, type Dispatch, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type SetStateAction } from "react";
import { CheckCircle2, Download, Eye, FilePlus2, Plus, Search, Send, Trash2 } from "lucide-react";
import PageHeader from "../../components/common/PageHeader";
import DesignLogicCard from "../../components/common/DesignLogicCard";
import FormModal from "../../components/common/FormModal";
import type { PayableDetail, PaymentRecord, ReconciliationOrder } from "../../types/finance";

export type ReconciliationView = "应付明细池" | "面辅料采购对账" | "物流费用对账" | "对账单管理" | "付款记录";

type Props = {
  view: ReconciliationView;
  payables: PayableDetail[];
  setPayables: Dispatch<SetStateAction<PayableDetail[]>>;
  orders: ReconciliationOrder[];
  setOrders: Dispatch<SetStateAction<ReconciliationOrder[]>>;
  payments: PaymentRecord[];
  setPayments: Dispatch<SetStateAction<PaymentRecord[]>>;
};

const money = (value: number, currency = "") => `${currency ? `${currency} ` : ""}${value.toLocaleString("zh-CN", { maximumFractionDigits: 2 })}`;
const statusClass = (status: string) => {
  if (["已付款", "已确认", "已对账"].includes(status)) return "bg-emerald-50 text-emerald-700";
  if (["对账中", "待确认", "部分付款"].includes(status)) return "bg-amber-50 text-amber-700";
  if (status === "已作废") return "bg-gray-100 text-gray-500";
  return "bg-blue-50 text-blue-700";
};
const Badge = ({ value }: { value: string }) => <span className={`whitespace-nowrap rounded-full px-2 py-0.5 text-xs ${statusClass(value)}`}>{value}</span>;
const Button = ({ children, onClick, primary = false, disabled = false }: { children: ReactNode; onClick?: () => void; primary?: boolean; disabled?: boolean }) => (
  <button disabled={disabled} onClick={onClick} className={`inline-flex h-8 items-center gap-1.5 rounded px-3 text-sm disabled:cursor-not-allowed disabled:opacity-40 ${primary ? "bg-blue-600 text-white hover:bg-blue-700" : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"}`}>{children}</button>
);
const Input = (props: InputHTMLAttributes<HTMLInputElement>) => <input {...props} className="h-8 rounded border border-gray-200 px-2 text-sm outline-none focus:border-blue-500" />;
const Select = (props: SelectHTMLAttributes<HTMLSelectElement>) => <select {...props} className="h-8 rounded border border-gray-200 bg-white px-2 text-sm outline-none focus:border-blue-500" />;

const logicSections = [{
  title: "采购对账模块定位",
  headers: ["项目", "说明"],
  rows: [["核心目标", "汇总采购、物流、税费等应付数据，生成对账单并记录付款"], ["上游来源", "面辅料采购单、国内物流跟踪、头程物流"], ["下游去向", "对账单、付款记录"]],
}, {
  title: "核心业务链路",
  headers: ["步骤", "说明"],
  rows: [["1", "上游单据按费用类型拆分生成应付明细"], ["2", "按同一对账对象、同一币种勾选生成对账单"], ["3", "录入对方金额、调整金额和差异原因后确认"], ["4", "登记付款并回写对账单与应付明细状态"]],
}];

export default function ProcurementReconciliation({ view, payables, setPayables, orders, setOrders, payments, setPayments }: Props) {
  const [keyword, setKeyword] = useState("");
  const [feeType, setFeeType] = useState("");
  const [status, setStatus] = useState("");
  const [currency, setCurrency] = useState("");
  const [sourceType, setSourceType] = useState("");
  const [settlementObject, setSettlementObject] = useState("");
  const [createdFrom, setCreatedFrom] = useState("");
  const [createdTo, setCreatedTo] = useState("");
  const [amountMin, setAmountMin] = useState("");
  const [amountMax, setAmountMax] = useState("");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [detailOrder, setDetailOrder] = useState<ReconciliationOrder | null>(null);
  const [paymentOrder, setPaymentOrder] = useState<ReconciliationOrder | null>(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentRecord["paymentMethod"]>("银行转账");
  const [paymentTime, setPaymentTime] = useState("2026-06-11T10:00");
  const [paymentVoucher, setPaymentVoucher] = useState("");
  const [paymentRemark, setPaymentRemark] = useState("");

  const filteredPayables = useMemo(() => payables.filter((row) => {
    const scoped = view === "面辅料采购对账" ? row.feeType === "面辅料采购货款" : view === "物流费用对账" ? row.feeType !== "面辅料采购货款" : true;
    const text = `${row.payableNo}${row.sourceNo}${row.logisticsNo ?? ""}${row.linkedPurchaseNo ?? ""}${row.settlementObjectName}${row.sku ?? ""}`.toLowerCase();
    const amountValid = (!amountMin || row.amount >= Number(amountMin)) && (!amountMax || row.amount <= Number(amountMax));
    const date = row.createdAt.slice(0, 10);
    const dateValid = (!createdFrom || date >= createdFrom) && (!createdTo || date <= createdTo);
    return scoped && (!keyword || text.includes(keyword.toLowerCase())) && (!feeType || row.feeType === feeType) && (!sourceType || row.sourceType === sourceType) && (!settlementObject || row.settlementObjectName.includes(settlementObject)) && (!status || row.reconciliationStatus === status) && (!currency || row.currency === currency) && amountValid && dateValid;
  }), [amountMax, amountMin, createdFrom, createdTo, currency, feeType, keyword, payables, settlementObject, sourceType, status, view]);

  const filteredOrders = useMemo(() => orders.filter((row) => {
    const text = `${row.reconciliationNo}${row.settlementObjectName}`.toLowerCase();
    const date = row.createdAt.slice(0, 10);
    return (!keyword || text.includes(keyword.toLowerCase())) && (!status || row.status === status) && (!currency || row.currency === currency) && (!createdFrom || date >= createdFrom) && (!createdTo || date <= createdTo);
  }), [createdFrom, createdTo, currency, keyword, orders, status]);

  const filteredPayments = useMemo(() => payments.filter((row) => {
    const text = `${row.paymentNo}${row.reconciliationNo}${row.settlementObjectName}`.toLowerCase();
    const date = row.paymentTime.slice(0, 10);
    return (!keyword || text.includes(keyword.toLowerCase())) && (!currency || row.currency === currency) && (!paymentMethodFilter || row.paymentMethod === paymentMethodFilter) && (!createdFrom || date >= createdFrom) && (!createdTo || date <= createdTo);
  }), [createdFrom, createdTo, currency, keyword, paymentMethodFilter, payments]);

  const notify = (text: string) => {
    setMessage(text);
    window.setTimeout(() => setMessage(""), 2600);
  };

  const createOrder = () => {
    const rows = payables.filter((row) => selected.includes(row.id));
    if (!rows.length) return notify("请先选择应付明细");
    if (new Set(rows.map((row) => row.settlementObjectName)).size > 1) return notify("不同对账对象不能生成同一张对账单");
    if (new Set(rows.map((row) => row.currency)).size > 1) return notify("不同币种不能生成同一张对账单");
    if (rows.some((row) => row.reconciliationStatus !== "未对账")) return notify("仅未对账明细可以生成对账单");
    if (rows.some((row) => row.amount === 0) && !window.confirm("选中明细包含 0 金额，确认继续？")) return;
    const no = `REC-202606-${String(orders.length + 1).padStart(4, "0")}`;
    const systemAmount = rows.reduce((sum, row) => sum + row.amount, 0);
    const first = rows[0];
    const reconciliationType = first.feeType === "面辅料采购货款" ? "面辅料采购" : first.feeType === "国内物流费" ? "国内物流" : first.feeType === "头程物流费" ? "头程物流" : "税费清关";
    const next: ReconciliationOrder = {
      id: `rec-${Date.now()}`,
      reconciliationNo: no,
      reconciliationType,
      settlementObjectName: first.settlementObjectName,
      settlementObjectType: first.settlementObjectType,
      currency: first.currency,
      systemAmount,
      adjustmentAmount: 0,
      finalPayableAmount: systemAmount,
      paidAmount: 0,
      unpaidAmount: systemAmount,
      status: "草稿",
      periodStart: rows.map((row) => row.businessDate ?? row.createdAt.slice(0, 10)).sort()[0],
      periodEnd: rows.map((row) => row.businessDate ?? row.createdAt.slice(0, 10)).sort().at(-1),
      details: rows.map((row) => ({
        id: `detail-${row.id}`,
        reconciliationNo: no,
        payableNo: row.payableNo,
        sourceType: row.sourceType,
        sourceNo: row.sourceNo,
        sku: row.sku,
        feeType: row.feeType,
        quantity: row.quantity,
        unitPrice: row.unitPrice,
        systemAmount: row.amount,
        adjustmentAmount: 0,
        finalAmount: row.amount,
      })),
      createdAt: "2026-06-11 10:00",
      createdBy: "当前用户",
    };
    setOrders((current) => [next, ...current]);
    setPayables((current) => current.map((row) => selected.includes(row.id) ? { ...row, reconciliationStatus: "对账中", reconciliationNo: no } : row));
    setSelected([]);
    setDetailOrder(next);
    notify(`已生成对账单 ${no}`);
  };

  const voidSelected = () => {
    if (!selected.length) return notify("请先选择应付明细");
    setPayables((current) => current.map((row) => selected.includes(row.id) && row.reconciliationStatus === "未对账" ? { ...row, reconciliationStatus: "已作废" } : row));
    setSelected([]);
    notify("未对账明细已作废");
  };

  const updateDetail = (id: string, field: "counterpartyAmount" | "adjustmentAmount" | "differenceReason", value: string) => {
    if (!detailOrder) return;
    const details = detailOrder.details.map((item) => {
      if (item.id !== id) return item;
      const next = { ...item, [field]: field === "differenceReason" ? value : Number(value || 0) };
      next.differenceAmount = (next.counterpartyAmount ?? next.systemAmount) - next.systemAmount;
      next.finalAmount = next.systemAmount + next.adjustmentAmount;
      return next;
    });
    const nextOrder = {
      ...detailOrder,
      details,
      counterpartyAmount: details.reduce((sum, item) => sum + (item.counterpartyAmount ?? item.systemAmount), 0),
      differenceAmount: details.reduce((sum, item) => sum + (item.differenceAmount ?? 0), 0),
      adjustmentAmount: details.reduce((sum, item) => sum + item.adjustmentAmount, 0),
      finalPayableAmount: details.reduce((sum, item) => sum + item.finalAmount, 0),
      unpaidAmount: details.reduce((sum, item) => sum + item.finalAmount, 0) - detailOrder.paidAmount,
    };
    setDetailOrder(nextOrder);
    setOrders((current) => current.map((item) => item.id === nextOrder.id ? nextOrder : item));
  };

  const toggleDifferenceConfirmed = (id: string, checked: boolean) => {
    if (!detailOrder) return;
    const nextOrder = {
      ...detailOrder,
      details: detailOrder.details.map((item) => item.id === id ? { ...item, differenceConfirmed: checked } : item),
    };
    setDetailOrder(nextOrder);
    setOrders((current) => current.map((item) => item.id === nextOrder.id ? nextOrder : item));
  };

  const changeOrderStatus = (order: ReconciliationOrder, nextStatus: ReconciliationOrder["status"]) => {
    if (nextStatus === "已确认" && order.details.some((item) => (item.differenceAmount ?? 0) !== 0 && !item.differenceConfirmed)) {
      notify("存在未确认差异，请先勾选“确认差异”");
      return;
    }
    const next = { ...order, status: nextStatus };
    setOrders((current) => current.map((item) => item.id === order.id ? next : item));
    setDetailOrder(next);
    const payableStatus = nextStatus === "已确认" ? "已对账" : nextStatus === "已作废" ? "已作废" : "对账中";
    setPayables((current) => current.map((item) => item.reconciliationNo === order.reconciliationNo ? { ...item, reconciliationStatus: payableStatus } : item));
    notify(`对账单状态已更新为${nextStatus}`);
  };

  const savePayment = () => {
    if (!paymentOrder) return;
    const amount = Number(paymentAmount);
    if (!amount || amount <= 0 || amount > paymentOrder.unpaidAmount) return notify("付款金额必须大于 0 且不能超过未付金额");
    const paidAmount = paymentOrder.paidAmount + amount;
    const unpaidAmount = Math.max(0, paymentOrder.finalPayableAmount - paidAmount);
    const nextStatus = unpaidAmount === 0 ? "已付款" : "部分付款";
    setOrders((current) => current.map((item) => item.id === paymentOrder.id ? { ...item, paidAmount, unpaidAmount, status: nextStatus } : item));
    setDetailOrder((current) => current?.id === paymentOrder.id ? { ...current, paidAmount, unpaidAmount, status: nextStatus } : current);
    setPayables((current) => current.map((item) => item.reconciliationNo === paymentOrder.reconciliationNo ? { ...item, reconciliationStatus: nextStatus } : item));
    setPayments((current) => [{
      id: `payment-${Date.now()}`,
      paymentNo: `PMT-202606-${String(current.length + 1).padStart(4, "0")}`,
      reconciliationNo: paymentOrder.reconciliationNo,
      settlementObjectName: paymentOrder.settlementObjectName,
      currency: paymentOrder.currency,
      paymentAmount: amount,
      paymentMethod,
      paymentTime: paymentTime.replace("T", " "),
      paymentVoucher: paymentVoucher || undefined,
      paidBy: "当前用户",
      createdAt: "2026-06-11 10:00",
      remark: paymentRemark,
    }, ...current]);
    setPaymentOrder(null);
    setPaymentAmount("");
    setPaymentVoucher("");
    setPaymentRemark("");
    notify(`付款已登记，对账单状态变为${nextStatus}`);
  };

  const clearFilters = () => {
    setKeyword("");
    setFeeType("");
    setCurrency("");
    setStatus("");
    setSourceType("");
    setSettlementObject("");
    setCreatedFrom("");
    setCreatedTo("");
    setAmountMin("");
    setAmountMax("");
    setPaymentMethodFilter("");
  };

  const renderFilters = (mode: "payable" | "order" | "payment" = "payable") => (
    <div className="mb-3 rounded border border-gray-200 bg-white p-3">
      <div className="flex flex-wrap items-end gap-2">
        <label className="grid gap-1 text-xs text-gray-500"><span>{mode === "order" ? "对账单号 / 对账对象" : mode === "payment" ? "付款单号 / 对账单号 / 付款对象" : view === "面辅料采购对账" ? "采购单号 / SKU" : view === "物流费用对账" ? "来源单号 / 物流单号" : "应付明细号 / 来源单据号"}</span><Input value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="请输入关键词" /></label>
        {mode === "payable" && view !== "面辅料采购对账" && <label className="grid gap-1 text-xs text-gray-500"><span>费用类型</span><Select value={feeType} onChange={(event) => setFeeType(event.target.value)}><option value="">全部</option>{["面辅料采购货款", "国内物流费", "头程物流费", "所得税", "增值税", "关税", "罚款", "清关费用"].filter((item) => view !== "物流费用对账" || item !== "面辅料采购货款").map((item) => <option key={item}>{item}</option>)}</Select></label>}
        {mode === "payable" && view === "应付明细池" && <label className="grid gap-1 text-xs text-gray-500"><span>来源单据类型</span><Select value={sourceType} onChange={(event) => setSourceType(event.target.value)}><option value="">全部</option><option>面辅料采购单</option><option>国内物流单</option><option>头程物流单</option></Select></label>}
        {mode === "payable" && <label className="grid gap-1 text-xs text-gray-500"><span>{view === "面辅料采购对账" ? "供应商" : "对账对象"}</span><Input value={settlementObject} onChange={(event) => setSettlementObject(event.target.value)} placeholder="请输入名称" /></label>}
        <label className="grid gap-1 text-xs text-gray-500"><span>币种</span><Select value={currency} onChange={(event) => setCurrency(event.target.value)}><option value="">全部</option><option>RMB</option><option>USD</option><option>IDR</option></Select></label>
        {mode !== "payment" && <label className="grid gap-1 text-xs text-gray-500"><span>状态</span><Select value={status} onChange={(event) => setStatus(event.target.value)}><option value="">全部</option>{(mode === "order" ? ["草稿", "待确认", "已确认", "部分付款", "已付款", "已作废"] : ["未对账", "对账中", "已对账", "部分付款", "已付款", "已作废"]).map((item) => <option key={item}>{item}</option>)}</Select></label>}
        {mode === "payment" && <label className="grid gap-1 text-xs text-gray-500"><span>付款方式</span><Select value={paymentMethodFilter} onChange={(event) => setPaymentMethodFilter(event.target.value)}><option value="">全部</option><option>银行转账</option><option>现金</option><option>其他</option></Select></label>}
        <label className="grid gap-1 text-xs text-gray-500"><span>{mode === "payment" ? "付款日期起" : "创建日期起"}</span><Input type="date" value={createdFrom} onChange={(event) => setCreatedFrom(event.target.value)} /></label>
        <label className="grid gap-1 text-xs text-gray-500"><span>{mode === "payment" ? "付款日期止" : "创建日期止"}</span><Input type="date" value={createdTo} onChange={(event) => setCreatedTo(event.target.value)} /></label>
        {mode === "payable" && view === "应付明细池" && <><label className="grid gap-1 text-xs text-gray-500"><span>最小金额</span><Input type="number" value={amountMin} onChange={(event) => setAmountMin(event.target.value)} /></label><label className="grid gap-1 text-xs text-gray-500"><span>最大金额</span><Input type="number" value={amountMax} onChange={(event) => setAmountMax(event.target.value)} /></label></>}
        <Button primary><Search size={14} />查询</Button>
        <Button onClick={clearFilters}>清除</Button>
      </div>
    </div>
  );

  const renderPayables = () => (
    <>
      {renderFilters("payable")}
      <div className="mb-3 flex flex-wrap gap-2">
        <Button primary onClick={createOrder}><FilePlus2 size={14} />生成对账单</Button>
        {view === "应付明细池" && <Button onClick={voidSelected}><Trash2 size={14} />作废</Button>}
        <Button onClick={() => notify("已按当前筛选结果导出")}><Download size={14} />导出</Button>
        <span className="self-center text-xs text-gray-500">已选 {selected.length} 条</span>
      </div>
      <div className="overflow-x-auto rounded border border-gray-200 bg-white">
        <table className="min-w-[1750px] text-left text-[13px]">
          <thead className="bg-gray-50"><tr>{(view === "面辅料采购对账"
            ? ["", "应付明细号", "面辅料采购单号", "供应商", "面辅料 SKU", "实际采购数量", "实际采购单价", "实际采购金额", "币种", "对账状态", "采购时间", "创建时间", "操作"]
            : view === "物流费用对账"
              ? ["", "应付明细号", "费用类型", "来源单据类型", "来源单据号", "对账对象", "物流单号", "关联采购单", "SKU", "数量 / 重量", "金额", "币种", "本币金额", "状态", "操作"]
              : ["", "应付明细号", "费用类型", "来源单据类型", "来源单据号", "来源明细号", "对账对象类型", "对账对象", "SKU / 物料", "数量", "单价", "金额", "币种", "汇率", "本币金额", "状态", "创建时间", "备注"]
          ).map((item) => <th key={item} className="whitespace-nowrap border-b px-3 py-2.5 font-medium text-gray-700">{item}</th>)}</tr></thead>
          <tbody>{filteredPayables.map((row) => <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50">
            <td className="px-3 py-2"><input type="checkbox" checked={selected.includes(row.id)} onChange={(event) => setSelected((current) => event.target.checked ? [...current, row.id] : current.filter((id) => id !== row.id))} /></td>
            <td className="whitespace-nowrap px-3 py-2 font-medium text-blue-600">{row.payableNo}</td>
            {view === "面辅料采购对账" ? <>
              <td className="px-3 py-2">{row.sourceNo}</td><td className="px-3 py-2">{row.settlementObjectName}</td><td className="px-3 py-2">{row.sku ?? "-"}</td><td className="px-3 py-2">{row.quantity ?? "-"}</td><td className="px-3 py-2">{row.unitPrice ?? "-"}</td><td className="px-3 py-2 font-medium">{money(row.amount)}</td><td className="px-3 py-2">{row.currency}</td><td className="px-3 py-2"><Badge value={row.reconciliationStatus} /></td><td className="px-3 py-2">{row.businessDate ?? "-"}</td><td className="whitespace-nowrap px-3 py-2">{row.createdAt}</td><td className="whitespace-nowrap px-3 py-2"><button className="text-blue-600" onClick={() => notify(row.reconciliationNo ? `关联对账单：${row.reconciliationNo}` : `来源单据：${row.sourceNo}`)}><Eye size={14} className="mr-1 inline" />查看</button></td>
            </> : view === "物流费用对账" ? <>
              <td className="px-3 py-2">{row.feeType}</td><td className="px-3 py-2">{row.sourceType}</td><td className="px-3 py-2">{row.sourceNo}</td><td className="px-3 py-2">{row.settlementObjectName}</td><td className="px-3 py-2">{row.logisticsNo ?? "-"}</td><td className="px-3 py-2">{row.linkedPurchaseNo ?? "-"}</td><td className="px-3 py-2">{row.sku ?? "-"}</td><td className="px-3 py-2">{row.weight ? `${row.weight} kg` : row.quantity ?? "-"}</td><td className="px-3 py-2 font-medium">{money(row.amount)}</td><td className="px-3 py-2">{row.currency}</td><td className="px-3 py-2">{money(row.localAmount ?? row.amount)}</td><td className="px-3 py-2"><Badge value={row.reconciliationStatus} /></td><td className="whitespace-nowrap px-3 py-2"><button className="text-blue-600" onClick={() => notify(row.reconciliationNo ? `关联对账单：${row.reconciliationNo}` : `来源单据：${row.sourceNo}`)}><Eye size={14} className="mr-1 inline" />查看</button></td>
            </> : <>
              <td className="px-3 py-2">{row.feeType}</td><td className="px-3 py-2">{row.sourceType}</td><td className="px-3 py-2">{row.sourceNo}</td><td className="px-3 py-2">{row.sourceLineNo ?? "-"}</td><td className="px-3 py-2">{row.settlementObjectType}</td><td className="px-3 py-2">{row.settlementObjectName}</td><td className="px-3 py-2">{row.sku ?? "-"}</td><td className="px-3 py-2">{row.quantity ?? "-"}</td><td className="px-3 py-2">{row.unitPrice ?? "-"}</td><td className="px-3 py-2 font-medium">{money(row.amount)}</td><td className="px-3 py-2">{row.currency}</td><td className="px-3 py-2">{row.exchangeRate ?? "-"}</td><td className="px-3 py-2">{money(row.localAmount ?? row.amount)}</td><td className="px-3 py-2"><Badge value={row.reconciliationStatus} /></td><td className="whitespace-nowrap px-3 py-2">{row.createdAt}</td><td className="px-3 py-2">{row.remark ?? "-"}</td>
            </>}
          </tr>)}</tbody>
        </table>
      </div>
    </>
  );

  const renderOrders = () => (
    <>
      {renderFilters("order")}
      <div className="mb-3 flex gap-2"><Button onClick={() => notify("已导出对账单列表")}><Download size={14} />导出</Button></div>
      <div className="overflow-x-auto rounded border border-gray-200 bg-white">
        <table className="min-w-[1800px] text-left text-[13px]">
          <thead className="bg-gray-50"><tr>{["对账单号", "类型", "对账对象", "币种", "系统应付金额", "对方金额", "差异金额", "调整金额", "最终应付金额", "已付金额", "未付金额", "状态", "对账周期", "创建人", "创建时间", "备注", "操作"].map((item) => <th key={item} className="whitespace-nowrap border-b px-3 py-2.5 font-medium text-gray-700">{item}</th>)}</tr></thead>
          <tbody>{filteredOrders.map((row) => <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50">
            <td className="px-3 py-2 font-medium text-blue-600">{row.reconciliationNo}</td><td className="px-3 py-2">{row.reconciliationType}</td><td className="px-3 py-2">{row.settlementObjectName}</td><td className="px-3 py-2">{row.currency}</td>
            <td className="px-3 py-2">{money(row.systemAmount)}</td><td className="px-3 py-2">{money(row.counterpartyAmount ?? row.systemAmount)}</td><td className="px-3 py-2">{money(row.differenceAmount ?? 0)}</td><td className="px-3 py-2">{money(row.adjustmentAmount)}</td><td className="px-3 py-2 font-medium">{money(row.finalPayableAmount)}</td><td className="px-3 py-2">{money(row.paidAmount)}</td><td className="px-3 py-2">{money(row.unpaidAmount)}</td><td className="px-3 py-2"><Badge value={row.status} /></td><td className="whitespace-nowrap px-3 py-2">{row.periodStart ?? "-"} ~ {row.periodEnd ?? "-"}</td><td className="px-3 py-2">{row.createdBy}</td><td className="whitespace-nowrap px-3 py-2">{row.createdAt}</td><td className="px-3 py-2">{row.remark ?? "-"}</td>
            <td className="whitespace-nowrap px-3 py-2">
              <button className="mr-3 text-blue-600" onClick={() => setDetailOrder(row)}><Eye size={14} className="mr-1 inline" />{["草稿", "待确认"].includes(row.status) ? "编辑" : "详情"}</button>
              {row.status === "草稿" && <button className="mr-3 text-blue-600" onClick={() => changeOrderStatus(row, "待确认")}><Send size={14} className="mr-1 inline" />提交</button>}
              {row.status === "待确认" && <button className="mr-3 text-blue-600" onClick={() => changeOrderStatus(row, "已确认")}><CheckCircle2 size={14} className="mr-1 inline" />确认</button>}
              {["已确认", "部分付款"].includes(row.status) && <button className="mr-3 text-blue-600" onClick={() => { setPaymentOrder(row); setPaymentAmount(String(row.unpaidAmount)); }}><Plus size={14} className="mr-1 inline" />付款</button>}
              {["草稿", "待确认"].includes(row.status) && <button className="mr-3 text-red-600" onClick={() => changeOrderStatus(row, "已作废")}><Trash2 size={14} className="mr-1 inline" />作废</button>}
              <button className="text-gray-600" onClick={() => notify(`已导出 ${row.reconciliationNo}`)}><Download size={14} className="mr-1 inline" />导出</button>
            </td>
          </tr>)}</tbody>
        </table>
      </div>
    </>
  );

  const renderPayments = () => (
    <>
      {renderFilters("payment")}
      <div className="overflow-x-auto rounded border border-gray-200 bg-white">
        <table className="min-w-[1250px] text-left text-[13px]">
          <thead className="bg-gray-50"><tr>{["付款单号", "对账单号", "付款对象", "付款金额", "币种", "付款方式", "付款时间", "付款凭证", "付款人", "备注", "创建时间"].map((item) => <th key={item} className="border-b px-3 py-2.5 font-medium text-gray-700">{item}</th>)}</tr></thead>
          <tbody>{filteredPayments.map((row) => <tr key={row.id} className="border-b border-gray-100 hover:bg-gray-50">
            <td className="px-3 py-2 font-medium text-blue-600">{row.paymentNo}</td><td className="px-3 py-2">{row.reconciliationNo}</td><td className="px-3 py-2">{row.settlementObjectName}</td><td className="px-3 py-2 font-medium">{money(row.paymentAmount)}</td><td className="px-3 py-2">{row.currency}</td><td className="px-3 py-2">{row.paymentMethod}</td><td className="px-3 py-2">{row.paymentTime}</td><td className="px-3 py-2">{row.paymentVoucher ?? "-"}</td><td className="px-3 py-2">{row.paidBy}</td><td className="px-3 py-2">{row.remark || "-"}</td><td className="px-3 py-2">{row.createdAt}</td>
          </tr>)}</tbody>
        </table>
      </div>
    </>
  );

  const descriptions: Record<ReconciliationView, string> = {
    应付明细池: "统一汇总面辅料采购、国内物流、头程物流及税费清关应付明细",
    面辅料采购对账: "仅处理面辅料供应商采购货款，按供应商与币种生成对账单",
    物流费用对账: "处理国内物流、头程物流、税费、罚款和清关费用",
    对账单管理: "统一查看对账单、处理差异、确认对账并发起付款",
    付款记录: "记录对账单付款情况并追踪付款凭证",
  };

  return (
    <div>
      <PageHeader title={view} desc={descriptions[view]} />
      {message && <div className="fixed right-5 top-16 z-[80] rounded bg-gray-900 px-4 py-2 text-sm text-white shadow-lg">{message}</div>}
      {view === "对账单管理" ? renderOrders() : view === "付款记录" ? renderPayments() : renderPayables()}
      <DesignLogicCard sections={logicSections} />

      <FormModal open={Boolean(detailOrder)} onClose={() => setDetailOrder(null)} title={`对账单详情 ${detailOrder?.reconciliationNo ?? ""}`} widthClass="w-[920px]">
        {detailOrder && <div className="space-y-4">
          <div className="grid grid-cols-6 gap-3 rounded bg-gray-50 p-3 text-sm"><div>对账对象<br /><b>{detailOrder.settlementObjectName}</b></div><div>币种<br /><b>{detailOrder.currency}</b></div><div>系统金额<br /><b>{money(detailOrder.systemAmount)}</b></div><div>差异金额<br /><b>{money(detailOrder.differenceAmount ?? 0)}</b></div><div>最终应付<br /><b>{money(detailOrder.finalPayableAmount)}</b></div><div>状态<br /><Badge value={detailOrder.status} /></div></div>
          <div className="overflow-x-auto rounded border"><table className="min-w-[1550px] text-left text-xs"><thead className="bg-gray-50"><tr>{["应付明细号", "来源类型", "来源单据号", "SKU", "费用类型", "数量", "单价", "系统金额", "对方金额", "差异金额", "调整金额", "最终金额", "差异原因", "确认差异", "备注"].map((item) => <th key={item} className="whitespace-nowrap border-b px-2 py-2">{item}</th>)}</tr></thead><tbody>{detailOrder.details.map((item) => <tr key={item.id} className="border-b">
            <td className="px-2 py-2">{item.payableNo}</td><td className="px-2 py-2">{item.sourceType}</td><td className="px-2 py-2">{item.sourceNo}</td><td className="px-2 py-2">{item.sku ?? "-"}</td><td className="px-2 py-2">{item.feeType}</td><td className="px-2 py-2">{item.quantity ?? "-"}</td><td className="px-2 py-2">{item.unitPrice ?? "-"}</td><td className="px-2 py-2">{money(item.systemAmount)}</td>
            <td className="px-2 py-2"><Input type="number" disabled={!["草稿", "待确认"].includes(detailOrder.status)} value={item.counterpartyAmount ?? ""} onChange={(event) => updateDetail(item.id, "counterpartyAmount", event.target.value)} /></td><td className="px-2 py-2">{money(item.differenceAmount ?? 0)}</td>
            <td className="px-2 py-2"><Input type="number" disabled={!["草稿", "待确认"].includes(detailOrder.status)} value={item.adjustmentAmount} onChange={(event) => updateDetail(item.id, "adjustmentAmount", event.target.value)} /></td><td className="px-2 py-2 font-medium">{money(item.finalAmount)}</td>
            <td className="px-2 py-2"><Input disabled={!["草稿", "待确认"].includes(detailOrder.status)} value={item.differenceReason ?? ""} onChange={(event) => updateDetail(item.id, "differenceReason", event.target.value)} /></td><td className="px-2 py-2 text-center"><input type="checkbox" disabled={!["草稿", "待确认"].includes(detailOrder.status) || (item.differenceAmount ?? 0) === 0} checked={Boolean(item.differenceConfirmed)} onChange={(event) => toggleDifferenceConfirmed(item.id, event.target.checked)} /></td><td className="px-2 py-2">{item.remark ?? "-"}</td>
          </tr>)}</tbody></table></div>
          <div className="flex justify-end gap-2">
            {detailOrder.status === "草稿" && <Button primary onClick={() => changeOrderStatus(detailOrder, "待确认")}>提交确认</Button>}
            {detailOrder.status === "待确认" && <Button primary onClick={() => changeOrderStatus(detailOrder, "已确认")}>确认对账</Button>}
            {["已确认", "部分付款"].includes(detailOrder.status) && <Button primary onClick={() => { setPaymentOrder(detailOrder); setPaymentAmount(String(detailOrder.unpaidAmount)); }}>新增付款</Button>}
            {["草稿", "待确认"].includes(detailOrder.status) && <Button onClick={() => changeOrderStatus(detailOrder, "已作废")}>作废</Button>}
          </div>
        </div>}
      </FormModal>

      <FormModal open={Boolean(paymentOrder)} onClose={() => setPaymentOrder(null)} title="新增付款" widthClass="w-[560px]">
        {paymentOrder && <div className="space-y-4 text-sm">
          <div className="rounded bg-blue-50 p-3 text-blue-900">对账单 {paymentOrder.reconciliationNo} · {paymentOrder.settlementObjectName}<br />未付金额：<b>{money(paymentOrder.unpaidAmount, paymentOrder.currency)}</b></div>
          <label className="grid gap-1"><span>付款金额</span><Input type="number" value={paymentAmount} onChange={(event) => setPaymentAmount(event.target.value)} /></label>
          <label className="grid gap-1"><span>付款方式</span><Select value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value as PaymentRecord["paymentMethod"])}><option>银行转账</option><option>现金</option><option>其他</option></Select></label>
          <label className="grid gap-1"><span>付款时间</span><Input type="datetime-local" value={paymentTime} onChange={(event) => setPaymentTime(event.target.value)} /></label>
          <label className="grid gap-1"><span>付款凭证</span><Input value={paymentVoucher} onChange={(event) => setPaymentVoucher(event.target.value)} placeholder="附件编号或凭证编号" /></label>
          <label className="grid gap-1"><span>备注</span><Input value={paymentRemark} onChange={(event) => setPaymentRemark(event.target.value)} /></label>
          <div className="flex justify-end gap-2"><Button onClick={() => setPaymentOrder(null)}>取消</Button><Button primary onClick={savePayment}>保存付款</Button></div>
        </div>}
      </FormModal>
    </div>
  );
}
