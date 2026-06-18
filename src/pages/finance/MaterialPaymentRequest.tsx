import { useEffect, useMemo, useState } from "react";
import { Download, FileText, Upload } from "lucide-react";
import DesignLogicCard from "../../components/common/DesignLogicCard";
import FormModal from "../../components/common/FormModal";
import PageHeader from "../../components/common/PageHeader";
import Toast from "../../components/common/Toast";
import { createMaterialPaymentRequestDraftFromRows, initialMaterialPaymentRequests } from "../../mock/materialPaymentRequests";
import type {
  MaterialActualPaymentRecord,
  MaterialPaymentApplyRecord,
  MaterialPaymentAttachment,
  MaterialPaymentCurrency,
  MaterialPaymentRequest as MaterialPaymentRequestType,
  MaterialPaymentSource,
} from "../../types/materialPaymentRequest";

type Mode = "list" | "create";

const inputClass = "h-8 rounded border border-gray-200 bg-white px-2 text-sm outline-none focus:border-blue-500";
const textareaClass = "rounded border border-gray-200 bg-white px-2 text-sm outline-none focus:border-blue-500";
const money = (value?: number) => (value ?? 0).toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const currencyOptions: MaterialPaymentCurrency[] = ["CNY", "USD", "IDR"];
const nowText = "2026-06-18 15:20";

const statusClass = (status: string) => {
  if (status === "已完成" || status === "已付款") return "bg-emerald-50 text-emerald-700";
  if (status === "部分请款" || status === "部分付款") return "bg-amber-50 text-amber-700";
  if (status === "已作废") return "bg-gray-100 text-gray-500";
  return "bg-blue-50 text-blue-700";
};

function SectionTitle({ children }: { children: string }) {
  return <h3 className="mb-3 border-l-4 border-blue-500 pl-2 text-sm font-semibold text-gray-900">{children}</h3>;
}

function FieldGrid({ rows }: { rows: Array<[string, string | number | undefined]> }) {
  return (
    <div className="grid gap-3 text-sm md:grid-cols-3">
      {rows.map(([label, value]) => (
        <div key={label} className="rounded border border-gray-100 bg-gray-50 px-3 py-2">
          <div className="text-xs text-gray-500">{label}</div>
          <div className="mt-1 min-h-5 font-medium text-gray-900">{value ?? "-"}</div>
        </div>
      ))}
    </div>
  );
}

function AttachmentCards({
  attachments,
  editable,
  onAction,
  onDelete,
}: {
  attachments: MaterialPaymentAttachment[];
  editable?: boolean;
  onAction: (message: string) => void;
  onDelete?: (id: string) => void;
}) {
  if (!attachments.length) return <div className="rounded border border-gray-200 bg-white py-10 text-center text-gray-400">暂无附件</div>;
  return (
    <div className="grid gap-3 md:grid-cols-3">
      {attachments.map((item) => (
        <div key={item.id} className="rounded border border-gray-200 bg-white p-3 text-sm">
          <div className="flex items-start gap-2">
            <div className="rounded bg-blue-50 p-2 text-blue-600"><FileText size={18} /></div>
            <div className="min-w-0 flex-1">
              <div className="truncate font-medium" title={item.name}>{item.name}</div>
              <div className="mt-1 text-xs text-gray-500">{item.type} · {item.size}</div>
              <div className="text-xs text-gray-500">上传人：{item.uploader}</div>
              <div className="text-xs text-gray-500">上传时间：{item.uploadedAt}</div>
            </div>
          </div>
          <div className="mt-3 flex gap-3 text-xs">
            <button className="text-blue-600" onClick={() => onAction(`预览 ${item.name}`)}>预览</button>
            <button className="text-blue-600" onClick={() => onAction(`下载 ${item.name}`)}>下载</button>
            {editable && <button className="text-red-600" onClick={() => onDelete?.(item.id)}>删除</button>}
          </div>
        </div>
      ))}
    </div>
  );
}

function SourceTable({ sources }: { sources: MaterialPaymentSource[] }) {
  const totals = currencyOptions
    .map((currency) => {
      const value = sources.filter((item) => item.currency === currency).reduce((sum, item) => sum + item.confirmedPayable, 0);
      return value > 0 ? `${currency} 确认应付合计：${money(value)}` : "";
    })
    .filter(Boolean);
  return (
    <div>
      <div className="overflow-x-auto border border-gray-200">
        <table className="min-w-[1500px] text-left text-xs">
          <thead className="bg-gray-50">
            <tr>{["对账单号", "面辅料采购单号", "来源商品采购单号", "供应商", "面辅料SKU", "物料名称", "币种", "确认应付金额", "已请款金额", "剩余可请款金额", "本次请款金额", "对账状态"].map((item) => <th key={item} className="border-b px-2 py-2 font-medium">{item}</th>)}</tr>
          </thead>
          <tbody>
            {sources.map((item) => (
              <tr key={`${item.reconciliationNo}-${item.materialSku}`} className="border-b last:border-0">
                <td className="px-2 py-2 font-medium text-blue-600">{item.reconciliationNo}</td>
                <td className="px-2 py-2">{item.materialPurchaseNo}</td>
                <td className="px-2 py-2">{item.sourceGoodsPurchaseNo ?? "-"}</td>
                <td className="px-2 py-2">{item.supplierName}</td>
                <td className="px-2 py-2">{item.materialSku}</td>
                <td className="px-2 py-2">{item.materialName}</td>
                <td className="px-2 py-2">{item.currency}</td>
                <td className="px-2 py-2 text-right">{money(item.confirmedPayable)}</td>
                <td className="px-2 py-2 text-right">{money(item.requestedAmount)}</td>
                <td className="px-2 py-2 text-right">{money(item.confirmedPayable - item.requestedAmount)}</td>
                <td className="px-2 py-2 text-right">{money(item.currentRequestAmount)}</td>
                <td className="px-2 py-2">{item.reconciliationStatus}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-2 flex flex-wrap gap-2 text-xs text-blue-700">
        {totals.map((item) => <span key={item} className="rounded bg-blue-50 px-2 py-1">{item}</span>)}
      </div>
    </div>
  );
}

function ApplyRecordsTable({ records }: { records: MaterialPaymentApplyRecord[] }) {
  if (!records.length) return <div className="rounded border border-gray-200 bg-white py-8 text-center text-gray-400">暂无请款记录</div>;
  return (
    <div className="overflow-x-auto border border-gray-200">
      <table className="min-w-[1100px] text-left text-xs">
        <thead className="bg-gray-50"><tr>{["请款记录号", "申请时间", "请款人", "付款类型", "请款金额", "币种", "付款状态", "付款时间", "付款人", "剩余付款金额", "备注"].map((item) => <th key={item} className="border-b px-2 py-2 font-medium">{item}</th>)}</tr></thead>
        <tbody>{records.map((record) => <tr key={record.id} className="border-b last:border-0">
          <td className="px-2 py-2 font-medium text-blue-600">{record.applyNo}</td>
          <td className="px-2 py-2">{record.appliedAt}</td>
          <td className="px-2 py-2">{record.applicant}</td>
          <td className="px-2 py-2">{record.applyType}</td>
          <td className="px-2 py-2 text-right">{money(record.applyAmount)}</td>
          <td className="px-2 py-2">{record.currency}</td>
          <td className="px-2 py-2"><span className={`rounded-full px-2 py-1 ${statusClass(record.paymentStatus)}`}>{record.paymentStatus}</span></td>
          <td className="px-2 py-2">{record.paidAt ?? "-"}</td>
          <td className="px-2 py-2">{record.payer ?? "-"}</td>
          <td className="px-2 py-2 text-right">{money(record.remainingAmount)}</td>
          <td className="px-2 py-2">{record.remark ?? "-"}</td>
        </tr>)}</tbody>
      </table>
    </div>
  );
}

function PaymentRecordsTable({ records }: { records: MaterialActualPaymentRecord[] }) {
  if (!records.length) return <div className="rounded border border-gray-200 bg-white py-8 text-center text-gray-400">暂无付款记录</div>;
  return (
    <div className="overflow-x-auto border border-gray-200">
      <table className="min-w-[1200px] text-left text-xs">
        <thead className="bg-gray-50"><tr>{["付款记录号", "请款单号", "请款记录号", "付款时间", "付款人", "收款人", "付款主体", "付款方式", "收款币种", "付款金额", "银行账号", "开户行", "SWIFT CODE", "付款凭证", "付款备注"].map((item) => <th key={item} className="border-b px-2 py-2 font-medium">{item}</th>)}</tr></thead>
        <tbody>{records.map((record) => <tr key={record.id} className="border-b last:border-0">
          <td className="px-2 py-2 font-medium text-blue-600">{record.paymentNo}</td>
          <td className="px-2 py-2">{record.requestNo}</td>
          <td className="px-2 py-2">{record.applyNo}</td>
          <td className="px-2 py-2">{record.paidAt}</td>
          <td className="px-2 py-2">{record.payer}</td>
          <td className="px-2 py-2">{record.payeeName}</td>
          <td className="px-2 py-2">{record.payerEntity}</td>
          <td className="px-2 py-2">{record.paymentMethod}</td>
          <td className="px-2 py-2">{record.currency}</td>
          <td className="px-2 py-2 text-right">{money(record.paidAmount)}</td>
          <td className="px-2 py-2">{record.bankAccount}</td>
          <td className="px-2 py-2">{record.bankName}</td>
          <td className="px-2 py-2">{record.swiftCode ?? "-"}</td>
          <td className="px-2 py-2">{record.voucher}</td>
          <td className="px-2 py-2">{record.paymentRemark ?? "-"}</td>
        </tr>)}</tbody>
      </table>
    </div>
  );
}

function PageLogic() {
  return (
    <DesignLogicCard sections={[
      {
        title: "页面功能说明",
        headers: ["说明项", "内容"],
        rows: [
          ["面辅料采购请款", "面辅料采购请款用于承接面辅料采购对账结果并生成供应商付款单。创建请款单后，用户可以多次申请付款。系统通过请款状态记录申请进度，通过付款状态记录财务付款进度。申请付款时，页面自动带出供应商收款信息、附件和历史请款记录。本次付款申请的币种只影响本次申请，不会改变付款单原始收款币种。"],
        ],
      },
      {
        title: "业务逻辑说明",
        headers: ["业务场景", "规则说明", "页面结果"],
        rows: [
          ["对账生成请款", "从面辅料采购对账勾选记录生成请款单", "进入创建面辅料采购请款单页面"],
          ["付款对象", "面辅料采购请款付款对象是供应商", "自动带出供应商收款信息"],
          ["采购信息展示", "请款单需要展示面辅料SKU、物料名称、采购数量等", "用户能确认付款对应哪批物料"],
          ["多次请款", "一张请款单可以多次申请付款", "通过请款记录展示每次申请"],
          ["未请款", "创建请款单但未申请付款", "请款状态显示未请款"],
          ["部分请款", "已申请部分金额", "请款状态显示部分请款"],
          ["已请款", "已申请完整金额", "请款状态显示已请款"],
          ["已完成", "全部金额已经付款完成", "请款状态和付款状态显示已完成"],
          ["付款记录", "保留财务实际付款结果", "付款记录展示银行付款信息"],
          ["操作日志", "记录用户操作", "展示创建、编辑、申请付款、上传附件等"],
          ["本次申请币种", "仅影响本次付款申请", "不改变请款单原始收款币种"],
        ],
      },
    ]} />
  );
}

function CreateView({
  draft,
  setDraft,
  onBack,
  onSave,
  onToast,
}: {
  draft: MaterialPaymentRequestType;
  setDraft: (draft: MaterialPaymentRequestType) => void;
  onBack: () => void;
  onSave: (draft: MaterialPaymentRequestType, action: "保存草稿" | "创建请款单") => void;
  onToast: (message: string) => void;
}) {
  const firstSource = draft.sources[0];
  const firstAmount = draft.amounts[0];
  const update = (key: keyof MaterialPaymentRequestType, value: string) => setDraft({ ...draft, [key]: value, updatedAt: nowText });
  const addAttachment = () => {
    const next: MaterialPaymentAttachment = { id: `mat-upload-${Date.now()}`, name: "supplier-invoice-20260618.pdf", type: "PDF", size: "1.2 MB", uploader: "张三", uploadedAt: nowText };
    setDraft({ ...draft, attachments: [next, ...draft.attachments], logs: [{ operatedAt: nowText, operator: "张三", action: "上传附件", content: "上传 supplier-invoice-20260618.pdf" }, ...draft.logs] });
  };
  return (
    <div>
      <PageHeader title="创建面辅料采购请款单" desc="从面辅料采购对账记录带出来源、供应商和采购信息，确认后生成供应商付款单。" />
      <div className="space-y-4">
        <section className="rounded border border-gray-200 bg-white p-4"><SectionTitle>一、来源对账信息</SectionTitle><SourceTable sources={draft.sources} /></section>
        <section className="rounded border border-gray-200 bg-white p-4">
          <SectionTitle>二、面辅料采购信息</SectionTitle>
          <FieldGrid rows={[
            ["面辅料采购单号", firstSource?.materialPurchaseNo],
            ["来源商品采购单号", firstSource?.sourceGoodsPurchaseNo],
            ["SPU", firstSource?.materialSku?.split("-")[0] ?? "FAB"],
            ["面辅料SKU", firstSource?.materialSku],
            ["物料名称", firstSource?.materialName],
            ["物料分类", firstSource?.materialCategory],
            ["规格 / 颜色", firstSource?.specification],
            ["基础单位", firstSource?.baseUnit],
            ["包装单位", firstSource?.packageUnit],
            ["采购基础数量", `${money(firstSource?.purchaseBaseQty)} ${firstSource?.baseUnit ?? ""}`],
            ["采购包装数量", `${money(firstSource?.purchasePackageQty)} ${firstSource?.packageUnit ?? ""}`],
            ["入库基础数量", `${money(firstSource?.inboundBaseQty)} ${firstSource?.baseUnit ?? ""}`],
            ["入库包装数量", `${money(firstSource?.inboundPackageQty)} ${firstSource?.packageUnit ?? ""}`],
            ["采购单价", money(firstSource?.purchaseUnitPrice)],
            ["采购货款", money(firstSource?.purchaseAmount)],
            ["调整金额", money(firstSource?.adjustmentAmount)],
            ["最终应付金额", `${money(firstSource?.finalPayableAmount)} ${firstSource?.currency ?? ""}`],
            ["供应商账单金额", money(firstSource?.supplierBillAmount)],
          ]} />
        </section>
        <section className="rounded border border-gray-200 bg-white p-4">
          <SectionTitle>三、收款人信息</SectionTitle>
          <div className="grid gap-3 md:grid-cols-3">
            <label className="grid gap-1"><span className="text-xs text-gray-500">收款人（单位）名称</span><input className={inputClass} value={draft.payeeName} onChange={(event) => update("payeeName", event.target.value)} /></label>
            <label className="grid gap-1"><span className="text-xs text-gray-500">收款人简称</span><input className={inputClass} value={draft.supplierShortName ?? ""} onChange={(event) => update("supplierShortName", event.target.value)} /></label>
            <label className="grid gap-1"><span className="text-xs text-gray-500">收款币种</span><select className={inputClass} value={draft.receivingCurrency} onChange={(event) => update("receivingCurrency", event.target.value)}>{currencyOptions.map((item) => <option key={item}>{item}</option>)}</select></label>
            <label className="grid gap-1"><span className="text-xs text-gray-500">开户行</span><input className={inputClass} value={draft.bankName} onChange={(event) => update("bankName", event.target.value)} /></label>
            <label className="grid gap-1"><span className="text-xs text-gray-500">银行账号</span><input className={inputClass} value={draft.bankAccount} onChange={(event) => update("bankAccount", event.target.value)} /></label>
            <label className="grid gap-1"><span className="text-xs text-gray-500">SWIFT CODE</span><input className={inputClass} value={draft.swiftCode ?? ""} onChange={(event) => update("swiftCode", event.target.value)} /></label>
            <label className="grid gap-1"><span className="text-xs text-gray-500">收款地址</span><input className={inputClass} value={draft.payeeAddress ?? ""} onChange={(event) => update("payeeAddress", event.target.value)} /></label>
            <label className="grid gap-1"><span className="text-xs text-gray-500">联系人</span><input className={inputClass} value={draft.contactName ?? ""} onChange={(event) => update("contactName", event.target.value)} /></label>
            <label className="grid gap-1"><span className="text-xs text-gray-500">联系电话</span><input className={inputClass} value={draft.contactPhone ?? ""} onChange={(event) => update("contactPhone", event.target.value)} /></label>
          </div>
        </section>
        <section className="rounded border border-gray-200 bg-white p-4">
          <SectionTitle>四、付款信息</SectionTitle>
          <div className="grid gap-3 md:grid-cols-4">
            <label className="grid gap-1"><span className="text-xs text-gray-500">付款类型</span><select className={inputClass} value={draft.paymentType} onChange={(event) => update("paymentType", event.target.value)}>{["面辅料采购货款", "面料采购款", "辅料采购款", "包材采购款", "样品材料款", "调整补款", "其他"].map((item) => <option key={item}>{item}</option>)}</select></label>
            <label className="grid gap-1"><span className="text-xs text-gray-500">付款日期</span><input className={inputClass} type="date" value={draft.paymentDate} onChange={(event) => update("paymentDate", event.target.value)} /></label>
            <label className="grid gap-1"><span className="text-xs text-gray-500">付款主体</span><input className={inputClass} value={draft.payerEntity} onChange={(event) => update("payerEntity", event.target.value)} /></label>
            <label className="grid gap-1"><span className="text-xs text-gray-500">付款方式</span><select className={inputClass} value={draft.paymentMethod} onChange={(event) => update("paymentMethod", event.target.value)}>{["银行付款", "现金", "其他"].map((item) => <option key={item}>{item}</option>)}</select></label>
            <label className="grid gap-1"><span className="text-xs text-gray-500">付款性质</span><select className={inputClass} value={draft.paymentNature} onChange={(event) => update("paymentNature", event.target.value)}>{["全款", "预付款", "尾款", "部分款"].map((item) => <option key={item}>{item}</option>)}</select></label>
            <label className="grid gap-1"><span className="text-xs text-gray-500">申请人</span><input className={inputClass} value={draft.applicant} onChange={(event) => update("applicant", event.target.value)} /></label>
            <label className="grid gap-1"><span className="text-xs text-gray-500">申请部门</span><input className={inputClass} value={draft.applicantDepartment} onChange={(event) => update("applicantDepartment", event.target.value)} /></label>
            <label className="grid gap-1"><span className="text-xs text-gray-500">备注</span><input className={inputClass} value={draft.internalRemark ?? ""} onChange={(event) => update("internalRemark", event.target.value)} /></label>
          </div>
        </section>
        <section className="rounded border border-gray-200 bg-white p-4"><SectionTitle>五、金额信息</SectionTitle><FieldGrid rows={[
          ["收款币种", firstAmount?.currency],
          ["付款单总付款金额", `${money(firstAmount?.requestAmount)} ${firstAmount?.currency ?? ""}`],
          ["已申请付款金额", `${money(firstAmount?.requestedBefore)} ${firstAmount?.currency ?? ""}`],
          ["已付款金额", `${money(firstAmount?.paidAmount)} ${firstAmount?.currency ?? ""}`],
          ["剩余付款金额", `${money(firstAmount?.remainingRequestable)} ${firstAmount?.currency ?? ""}`],
          ["汇率", firstAmount?.exchangeRate],
          ["折算本位币金额", money(firstAmount?.baseCurrencyAmount)],
          ["金额大写", firstAmount?.amountInWords],
        ]} /></section>
        <section className="rounded border border-gray-200 bg-white p-4">
          <SectionTitle>六、付款说明</SectionTitle>
          <div className="grid gap-3 md:grid-cols-3">
            <label className="grid gap-1 md:col-span-3"><span className="text-xs text-gray-500">付款说明</span><textarea className={`${textareaClass} min-h-24 py-2`} value={draft.paymentRemark} onChange={(event) => update("paymentRemark", event.target.value)} /></label>
            <label className="grid gap-1"><span className="text-xs text-gray-500">内部备注</span><textarea className={`${textareaClass} min-h-20 py-2`} value={draft.internalRemark ?? ""} onChange={(event) => update("internalRemark", event.target.value)} /></label>
            <label className="grid gap-1 md:col-span-2"><span className="text-xs text-gray-500">财务备注</span><textarea className={`${textareaClass} min-h-20 py-2`} value={draft.financeRemark ?? ""} onChange={(event) => update("financeRemark", event.target.value)} /></label>
          </div>
        </section>
        <section className="rounded border border-gray-200 bg-white p-4">
          <SectionTitle>七、附件</SectionTitle>
          <button className="mb-3 inline-flex h-8 items-center gap-1 rounded bg-[#009688] px-3 text-sm text-white" onClick={addAttachment}><Upload size={14} />上传附件</button>
          <AttachmentCards attachments={draft.attachments} editable onAction={onToast} onDelete={(id) => setDraft({ ...draft, attachments: draft.attachments.filter((item) => item.id !== id) })} />
          <div className="mt-2 text-xs text-gray-500">支持 PDF、PPT / PPTX、XLS / XLSX、JPG / JPEG / PNG / WEBP</div>
        </section>
        <PageLogic />
      </div>
      <div className="sticky bottom-0 mt-4 flex justify-end gap-2 border-t bg-[#f5f7fb] py-3">
        <button className="h-9 rounded border bg-white px-4 text-sm" onClick={onBack}>返回</button>
        <button className="h-9 rounded border border-blue-200 bg-blue-50 px-4 text-sm text-blue-700" onClick={() => onSave(draft, "保存草稿")}>保存草稿</button>
        <button className="h-9 rounded bg-blue-600 px-5 text-sm text-white" onClick={() => onSave(draft, "创建请款单")}>创建请款单</button>
      </div>
    </div>
  );
}

export default function MaterialPaymentRequest({
  initialMode = "list",
  initialDraft,
}: {
  initialMode?: Mode;
  initialDraft?: MaterialPaymentRequestType | null;
}) {
  const [rows, setRows] = useState(initialMaterialPaymentRequests);
  const [mode, setMode] = useState<Mode>(initialMode);
  const [createDraft, setCreateDraft] = useState<MaterialPaymentRequestType>(() => initialDraft ?? createMaterialPaymentRequestDraftFromRows([]));
  const [toast, setToast] = useState("");
  const [keyword, setKeyword] = useState("");
  const [supplier, setSupplier] = useState("");
  const [status, setStatus] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [currency, setCurrency] = useState("");
  const [applyTarget, setApplyTarget] = useState<MaterialPaymentRequestType | null>(null);
  const [recordModal, setRecordModal] = useState<{ type: "apply" | "payment" | "log"; row: MaterialPaymentRequestType } | null>(null);
  const [applyType, setApplyType] = useState<"全款" | "部分付款">("全款");
  const [applyCurrency, setApplyCurrency] = useState<MaterialPaymentCurrency>("CNY");
  const [applyAmount, setApplyAmount] = useState(0);
  const [applyRemark, setApplyRemark] = useState("");

  useEffect(() => {
    if (initialDraft) {
      setCreateDraft(initialDraft);
      setMode(initialMode);
    }
  }, [initialDraft, initialMode]);

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2400);
  };

  const filteredRows = useMemo(() => rows.filter((row) => {
    const text = [row.requestNo, row.sources.map((item) => item.reconciliationNo).join(","), row.sources.map((item) => item.materialPurchaseNo).join(","), row.sources.map((item) => item.sourceGoodsPurchaseNo).join(","), row.sources.map((item) => item.materialSku).join(","), row.supplierName].join(" ").toLowerCase();
    return (!keyword || text.includes(keyword.toLowerCase()))
      && (!supplier || row.supplierName.includes(supplier))
      && (!status || row.status === status)
      && (!paymentStatus || row.paymentStatus === paymentStatus)
      && (!currency || row.receivingCurrency === currency);
  }), [currency, keyword, paymentStatus, rows, status, supplier]);

  const openApply = (row: MaterialPaymentRequestType) => {
    const amountInfo = row.amounts[0];
    setApplyTarget(row);
    setApplyType("全款");
    setApplyCurrency(amountInfo?.currency ?? row.receivingCurrency);
    setApplyAmount(amountInfo?.remainingRequestable ?? 0);
    setApplyRemark("");
  };

  const confirmApply = () => {
    if (!applyTarget) return;
    const total = applyTarget.amounts.reduce((sum, item) => sum + item.requestAmount, 0);
    const requestedBefore = applyTarget.amounts.reduce((sum, item) => sum + item.requestedBefore, 0);
    const remaining = Math.max(total - requestedBefore, 0);
    if (applyAmount <= 0) return showToast("本次付款金额必须大于 0");
    if (applyAmount > remaining) return showToast("本次付款金额不能大于剩余付款金额");
    const nextRequested = requestedBefore + applyAmount;
    const record: MaterialPaymentApplyRecord = {
      id: `mat-apply-${Date.now()}`,
      applyNo: `REQ-MAT-${String(applyTarget.applyRecords.length + 1).padStart(3, "0")}`,
      appliedAt: nowText,
      applicant: "张三",
      applyType,
      currency: applyCurrency,
      applyAmount,
      paymentRemark: applyRemark || "面辅料采购付款申请",
      paymentStatus: "未付款",
      remainingAmount: Math.max(total - nextRequested, 0),
      remark: applyRemark,
    };
    setRows((current) => current.map((row) => {
      if (row.id !== applyTarget.id) return row;
      const nextAmounts = row.amounts.map((item, index) => index === 0 ? { ...item, requestedBefore: nextRequested, remainingRequestable: Math.max(total - nextRequested, 0) } : item);
      return {
        ...row,
        status: nextRequested >= total ? "已请款" : "部分请款",
        paymentStatus: row.paymentStatus === "未付款" ? "未付款" : row.paymentStatus,
        amounts: nextAmounts,
        applyRecords: [record, ...row.applyRecords],
        logs: [{ operatedAt: nowText, operator: "张三", action: "申请付款", content: `申请付款 ${money(applyAmount)} ${applyCurrency}` }, ...row.logs],
        updatedAt: nowText,
      };
    }));
    setApplyTarget(null);
    showToast("已生成请款记录");
  };

  const saveCreate = (draft: MaterialPaymentRequestType, action: "保存草稿" | "创建请款单") => {
    const next = {
      ...draft,
      id: `mat-pay-${Date.now()}`,
      status: "未请款" as const,
      paymentStatus: "未付款" as const,
      logs: [{ operatedAt: nowText, operator: "张三", action, content: action === "保存草稿" ? "保存面辅料采购请款单草稿" : "创建面辅料采购请款单" }, ...draft.logs],
      createdAt: draft.createdAt || nowText,
      updatedAt: nowText,
    };
    setRows((current) => [next, ...current]);
    setMode("list");
    showToast(action === "保存草稿" ? "草稿已保存" : "请款单已创建");
  };

  if (mode === "create") {
    return <><CreateView draft={createDraft} setDraft={setCreateDraft} onBack={() => setMode("list")} onSave={saveCreate} onToast={showToast} /><Toast msg={toast} /></>;
  }

  return (
    <div>
      <PageHeader
        title="面辅料采购请款"
        desc="管理面辅料采购对账后生成的请款单，支持创建请款、申请付款、请款记录、付款记录和操作日志。"
        extra={<div className="flex gap-2"><button className="inline-flex h-8 items-center gap-1 rounded border border-gray-200 bg-white px-3 text-sm" onClick={() => showToast("已导出当前筛选结果")}><Download size={14} />导出</button><button className="h-8 rounded bg-blue-600 px-4 text-sm text-white" onClick={() => { setCreateDraft(createMaterialPaymentRequestDraftFromRows([])); setMode("create"); }}>新增请款单</button></div>}
      />
      <section className="mb-2 flex flex-wrap items-end gap-2 border border-gray-200 bg-white px-3 py-2">
        <label className="grid gap-1 text-xs text-gray-500"><span>请款单号 / 来源对账 / 采购单 / SKU</span><input className={`${inputClass} w-[260px]`} value={keyword} onChange={(event) => setKeyword(event.target.value)} /></label>
        <label className="grid gap-1 text-xs text-gray-500"><span>供应商</span><input className={`${inputClass} w-[180px]`} value={supplier} onChange={(event) => setSupplier(event.target.value)} /></label>
        <label className="grid gap-1 text-xs text-gray-500"><span>收款币种</span><select className={`${inputClass} w-[100px]`} value={currency} onChange={(event) => setCurrency(event.target.value)}><option value="">全部</option>{currencyOptions.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label className="grid gap-1 text-xs text-gray-500"><span>请款状态</span><select className={`${inputClass} w-[110px]`} value={status} onChange={(event) => setStatus(event.target.value)}><option value="">全部</option>{["未请款", "部分请款", "已请款", "已完成", "已作废"].map((item) => <option key={item}>{item}</option>)}</select></label>
        <label className="grid gap-1 text-xs text-gray-500"><span>付款状态</span><select className={`${inputClass} w-[110px]`} value={paymentStatus} onChange={(event) => setPaymentStatus(event.target.value)}><option value="">全部</option>{["未付款", "部分付款", "已付款", "已完成"].map((item) => <option key={item}>{item}</option>)}</select></label>
        <button className="h-8 rounded bg-blue-600 px-4 text-sm text-white">查询</button>
        <button className="h-8 rounded border border-gray-200 px-3 text-sm" onClick={() => { setKeyword(""); setSupplier(""); setStatus(""); setPaymentStatus(""); setCurrency(""); }}>重置</button>
      </section>
      <section className="overflow-x-auto border border-gray-200 bg-white">
        <table className="min-w-[2100px] text-left text-xs">
          <thead className="bg-gray-50"><tr>{["请款单号", "付款类型", "面辅料供应商", "来源对账单号", "面辅料采购单号", "来源商品采购单号", "面辅料SKU", "物料名称", "付款主体", "收款币种", "请款总金额", "已申请付款金额", "已付款金额", "剩余付款金额", "请款状态", "付款状态", "申请人", "创建时间", "操作"].map((item) => <th key={item} className="whitespace-nowrap border-b px-2 py-2 font-medium">{item}</th>)}</tr></thead>
          <tbody>{filteredRows.map((row) => {
            const amountInfo = row.amounts[0];
            const firstSource = row.sources[0];
            return <tr key={row.id} className="border-b last:border-0 hover:bg-blue-50/30">
              <td className="px-2 py-2 font-medium text-blue-600">{row.requestNo}</td>
              <td className="px-2 py-2">{row.paymentType}</td>
              <td className="px-2 py-2">{row.supplierName}</td>
              <td className="px-2 py-2">{row.sources.map((item) => item.reconciliationNo).join("、")}</td>
              <td className="px-2 py-2">{row.sources.map((item) => item.materialPurchaseNo).join("、")}</td>
              <td className="px-2 py-2">{firstSource?.sourceGoodsPurchaseNo ?? "-"}</td>
              <td className="px-2 py-2">{row.sources.map((item) => item.materialSku).join("、")}</td>
              <td className="px-2 py-2">{row.sources.map((item) => item.materialName).join("、")}</td>
              <td className="px-2 py-2">{row.payerEntity}</td>
              <td className="px-2 py-2">{row.receivingCurrency}</td>
              <td className="px-2 py-2 text-right">{money(amountInfo?.requestAmount)} {amountInfo?.currency}</td>
              <td className="px-2 py-2 text-right">{money(amountInfo?.requestedBefore)}</td>
              <td className="px-2 py-2 text-right">{money(amountInfo?.paidAmount)}</td>
              <td className="px-2 py-2 text-right">{money(amountInfo?.remainingRequestable)}</td>
              <td className="px-2 py-2"><span className={`rounded-full px-2 py-1 ${statusClass(row.status)}`}>{row.status}</span></td>
              <td className="px-2 py-2"><span className={`rounded-full px-2 py-1 ${statusClass(row.paymentStatus)}`}>{row.paymentStatus}</span></td>
              <td className="px-2 py-2">{row.applicant}</td>
              <td className="px-2 py-2">{row.createdAt}</td>
              <td className="sticky right-0 min-w-[250px] border-l bg-white px-2 py-2 shadow-[-4px_0_8px_rgba(15,23,42,0.04)]">
                <div className="flex flex-wrap gap-x-3 gap-y-2">
                  <button className="text-blue-600" onClick={() => { setCreateDraft(row); setMode("create"); }}>查看</button>
                  <button className="text-blue-600" onClick={() => { setCreateDraft(row); setMode("create"); }}>编辑</button>
                  <button className="text-emerald-600" onClick={() => openApply(row)}>申请付款</button>
                  <button className="text-indigo-600" onClick={() => setRecordModal({ type: "payment", row })}>付款记录</button>
                  <button className="text-indigo-600" onClick={() => setRecordModal({ type: "apply", row })}>请款记录</button>
                  <button className="text-gray-600" onClick={() => setRecordModal({ type: "log", row })}>操作日志</button>
                </div>
              </td>
            </tr>;
          })}</tbody>
        </table>
      </section>
      <PageLogic />
      <FormModal open={Boolean(applyTarget)} onClose={() => setApplyTarget(null)} title="申请付款" widthClass="w-[980px]">
        {applyTarget && <div className="space-y-4 text-sm">
          <section><SectionTitle>一、付款单基础信息</SectionTitle><FieldGrid rows={[["请款单号", applyTarget.requestNo], ["来源对账单号", applyTarget.sources.map((item) => item.reconciliationNo).join("、")], ["面辅料采购单号", applyTarget.sources.map((item) => item.materialPurchaseNo).join("、")], ["来源商品采购单号", applyTarget.sources[0]?.sourceGoodsPurchaseNo], ["面辅料SKU", applyTarget.sources.map((item) => item.materialSku).join("、")], ["物料名称", applyTarget.sources.map((item) => item.materialName).join("、")], ["供应商", applyTarget.supplierName], ["付款类型", applyTarget.paymentType], ["付款主体", applyTarget.payerEntity], ["付款方式", applyTarget.paymentMethod], ["付款性质", applyTarget.paymentNature], ["申请人", applyTarget.applicant], ["创建时间", applyTarget.createdAt]]} /></section>
          <section><SectionTitle>二、收款信息</SectionTitle><FieldGrid rows={[["收款人（单位）名称", applyTarget.payeeName], ["收款币种", applyTarget.receivingCurrency], ["开户行", applyTarget.bankName], ["银行账号", applyTarget.bankAccount], ["SWIFT CODE", applyTarget.swiftCode], ["收款地址", applyTarget.payeeAddress], ["联系人", applyTarget.contactName], ["联系电话", applyTarget.contactPhone]]} /></section>
          <section><SectionTitle>三、金额信息</SectionTitle><FieldGrid rows={[["付款单总付款金额", money(applyTarget.amounts[0]?.requestAmount)], ["已申请付款金额", money(applyTarget.amounts[0]?.requestedBefore)], ["已付款金额", money(applyTarget.amounts[0]?.paidAmount)], ["剩余付款金额", money(applyTarget.amounts[0]?.remainingRequestable)], ["收款币种", applyTarget.amounts[0]?.currency], ["金额大写", applyTarget.amounts[0]?.amountInWords]]} /></section>
          <section><SectionTitle>四、附件信息</SectionTitle><AttachmentCards attachments={applyTarget.attachments} onAction={showToast} /></section>
          <section><SectionTitle>五、历史请款记录</SectionTitle><ApplyRecordsTable records={applyTarget.applyRecords} /></section>
          <section>
            <SectionTitle>六、本次付款申请</SectionTitle>
            <div className="rounded border border-blue-100 bg-blue-50 px-3 py-2 text-xs text-blue-800">本次付款申请币种仅用于本次申请，不会修改付款单原始收款币种。</div>
            <div className="mt-3 grid gap-3 md:grid-cols-3">
              <label className="grid gap-1"><span className="text-xs text-gray-500">付款类型</span><select className={inputClass} value={applyType} onChange={(event) => { const value = event.target.value as "全款" | "部分付款"; setApplyType(value); if (value === "全款") setApplyAmount(applyTarget.amounts[0]?.remainingRequestable ?? 0); }}><option>全款</option><option>部分付款</option></select></label>
              <label className="grid gap-1"><span className="text-xs text-gray-500">本次付款金额</span><input className={inputClass} type="number" value={applyAmount} onChange={(event) => setApplyAmount(Number(event.target.value))} disabled={applyType === "全款"} /></label>
              <label className="grid gap-1"><span className="text-xs text-gray-500">币种</span><select className={inputClass} value={applyCurrency} onChange={(event) => setApplyCurrency(event.target.value as MaterialPaymentCurrency)}>{currencyOptions.map((item) => <option key={item}>{item}</option>)}</select></label>
              <label className="grid gap-1"><span className="text-xs text-gray-500">付款日期</span><input className={inputClass} type="date" defaultValue="2026-06-18" /></label>
              <label className="grid gap-1 md:col-span-2"><span className="text-xs text-gray-500">付款说明 / 财务备注</span><input className={inputClass} value={applyRemark} onChange={(event) => setApplyRemark(event.target.value)} /></label>
            </div>
          </section>
          <div className="flex justify-end gap-2 border-t pt-3"><button className="h-8 rounded border px-4" onClick={() => setApplyTarget(null)}>取消</button><button className="h-8 rounded bg-blue-600 px-4 text-white" onClick={confirmApply}>确认申请付款</button></div>
        </div>}
      </FormModal>
      <FormModal open={Boolean(recordModal)} onClose={() => setRecordModal(null)} title={recordModal?.type === "payment" ? "付款记录" : recordModal?.type === "apply" ? "请款记录" : "操作日志"} widthClass="w-[1050px]">
        {recordModal?.type === "payment" && <PaymentRecordsTable records={recordModal.row.paymentRecords} />}
        {recordModal?.type === "apply" && <ApplyRecordsTable records={recordModal.row.applyRecords} />}
        {recordModal?.type === "log" && <div className="overflow-x-auto border border-gray-200"><table className="min-w-[900px] text-left text-xs"><thead className="bg-gray-50"><tr>{["操作时间", "操作人", "操作类型", "操作内容", "备注"].map((item) => <th key={item} className="border-b px-2 py-2 font-medium">{item}</th>)}</tr></thead><tbody>{recordModal.row.logs.map((log, index) => <tr key={index} className="border-b last:border-0"><td className="px-2 py-2">{log.operatedAt}</td><td className="px-2 py-2">{log.operator}</td><td className="px-2 py-2">{log.action}</td><td className="px-2 py-2">{log.content}</td><td className="px-2 py-2">{log.remark ?? "-"}</td></tr>)}</tbody></table></div>}
      </FormModal>
      <Toast msg={toast} />
    </div>
  );
}
