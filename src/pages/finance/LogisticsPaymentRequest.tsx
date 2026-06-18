import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Banknote,
  Download,
  Eye,
  FileImage,
  FileSpreadsheet,
  FileText,
  FileType,
  Plus,
  ReceiptText,
  Save,
  Search,
  Trash2,
  Upload,
} from "lucide-react";
import DesignLogicCard from "../../components/common/DesignLogicCard";
import FormModal from "../../components/common/FormModal";
import PageHeader from "../../components/common/PageHeader";
import Toast from "../../components/common/Toast";
import { paymentRequestStore, upsertLogisticsPaymentRequest } from "../../mock/logisticsPaymentRequests";
import type {
  LogisticsActualPaymentRecord,
  LogisticsPaymentApplyRecord,
  LogisticsPaymentAttachment,
  LogisticsPaymentRequest as PaymentRequest,
} from "../../types/logisticsPaymentRequest";

const inputClass = "h-8 rounded border border-gray-200 bg-white px-2 text-sm outline-none focus:border-blue-500";
const money = (value: number) => value.toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const nowText = "2026-06-18 10:30";

const fileIcon = (type: LogisticsPaymentAttachment["type"]) => {
  if (type === "Excel") return <FileSpreadsheet size={18} />;
  if (type === "Image") return <FileImage size={18} />;
  if (type === "PPT") return <FileType size={18} />;
  return <FileText size={18} />;
};

const statusClass = (status: string) => {
  if (["已完成"].includes(status)) return "bg-emerald-100 text-emerald-800";
  if (["已请款", "已付款"].includes(status)) return "bg-blue-50 text-blue-700";
  if (["部分请款", "部分付款"].includes(status)) return "bg-amber-50 text-amber-700";
  if (["未请款", "未付款"].includes(status)) return "bg-slate-100 text-slate-700";
  return "bg-slate-100 text-slate-700";
};

const totalRequestAmount = (row: PaymentRequest) => row.amounts.reduce((sum, item) => sum + item.requestAmount, 0);
const totalAppliedAmount = (row: PaymentRequest) => row.applyRecords.reduce((sum, item) => sum + item.applyAmount, 0);
const totalPaidAmount = (row: PaymentRequest) => row.paymentRecords.reduce((sum, item) => sum + item.paidAmount, 0);
const remainingUnpaid = (row: PaymentRequest) => Math.max(totalRequestAmount(row) - totalPaidAmount(row), 0);
const amountSummary = (row: PaymentRequest) => row.amounts.map((item) => `${money(item.requestAmount)} ${item.currency}`).join(" / ");
const mainCurrency = (row: PaymentRequest) => row.receivingCurrency || row.amounts[0]?.currency || "CNY";
const canEditRequest = (row: PaymentRequest) => row.status !== "已完成" && row.status !== "已作废";
const editDisabledReason = (row: PaymentRequest) => {
  if (row.status === "已完成") return "该请款单已完成付款，不允许编辑";
  if (row.status === "已作废") return "该请款单已作废，不允许编辑";
  return "";
};
const amountWords = (currency: "USD" | "CNY", amount: number) => {
  if (currency === "USD") return `${money(amount)} USD`;
  if (amount === 3220) return "叁仟贰佰贰拾元整";
  if (amount === 1720) return "壹仟柒佰贰拾元整";
  if (amount === 1500) return "壹仟伍佰元整";
  if (amount === 1000) return "壹仟元整";
  if (amount === 500) return "伍佰元整";
  return `${money(amount)} 元整`;
};

function SectionTitle({ children }: { children: string }) {
  return (
    <div className="mb-3 mt-5 flex items-center gap-2 first:mt-0">
      <span className="h-4 w-1 rounded bg-brand" />
      <h3 className="text-sm font-semibold text-gray-900">{children}</h3>
    </div>
  );
}

function StatusTag({ value }: { value: string }) {
  return <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${statusClass(value)}`}>{value}</span>;
}

function InfoGrid({ items }: { items: Array<[string, string | number | undefined | null]> }) {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {items.map(([label, value]) => (
        <div key={label} className="rounded border border-gray-100 bg-gray-50 px-3 py-2">
          <div className="text-xs text-gray-500">{label}</div>
          <div className="mt-1 break-words text-sm font-medium text-gray-900">{value ?? "-"}</div>
        </div>
      ))}
    </div>
  );
}

function CurrencySummary({ row }: { row: PaymentRequest }) {
  return (
    <div className="mt-3 flex flex-wrap gap-2 text-xs">
      {row.amounts.map((amount) => (
        <span key={amount.currency} className="rounded border border-blue-100 bg-blue-50 px-3 py-2 text-blue-700">
          {amount.currency} 确认应付合计：{money(amount.remainingRequestable + amount.requestedBefore)}
        </span>
      ))}
    </div>
  );
}

function AttachmentCards({
  attachments,
  editable,
  onDelete,
  onAction,
}: {
  attachments: LogisticsPaymentAttachment[];
  editable?: boolean;
  onDelete?: (id: string) => void;
  onAction: (message: string) => void;
}) {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {attachments.map((item) => (
        <article key={item.id} className="rounded border border-gray-200 bg-white p-3">
          <div className="flex items-start gap-3">
            <div className="rounded bg-blue-50 p-2 text-blue-600">{fileIcon(item.type)}</div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium text-gray-900" title={item.name}>{item.name}</div>
              <div className="mt-1 text-xs text-gray-500">{item.type} · {item.size}</div>
              <div className="mt-1 text-xs text-gray-400">{item.uploader} · {item.uploadedAt}</div>
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            <button className="inline-flex h-7 items-center gap-1 rounded border border-gray-200 px-2 text-xs text-gray-600 hover:bg-gray-50" onClick={() => onAction(`预览 ${item.name}`)}><Eye size={13} />预览</button>
            <button className="inline-flex h-7 items-center gap-1 rounded border border-gray-200 px-2 text-xs text-gray-600 hover:bg-gray-50" onClick={() => onAction(`下载 ${item.name}`)}><Download size={13} />下载</button>
            {editable && <button className="inline-flex h-7 items-center gap-1 rounded border border-red-200 px-2 text-xs text-red-600 hover:bg-red-50" onClick={() => onDelete?.(item.id)}><Trash2 size={13} />删除</button>}
          </div>
        </article>
      ))}
    </div>
  );
}

function ApplyRecordsTable({ row }: { row: PaymentRequest }) {
  const records = row.applyRecords;
  let appliedTotal = 0;
  const remainingMap = new Map<string, number>();
  records.slice().reverse().forEach((record) => {
    appliedTotal += record.applyAmount;
    remainingMap.set(record.id, Math.max(totalRequestAmount(row) - appliedTotal, 0));
  });
  return (
    <div className="overflow-x-auto rounded border border-gray-200">
      <table className="min-w-[1060px] text-left text-xs">
        <thead className="bg-gray-50 text-gray-700">
          <tr>{["请款记录号", "申请时间", "请款人", "付款类型", "收款币种", "申请付款金额", "付款说明", "付款状态", "付款时间", "付款人", "剩余付款金额", "备注"].map((item) => <th key={item} className="border-b px-2 py-2 font-medium">{item}</th>)}</tr>
        </thead>
        <tbody>
          {records.map((record) => (
            <tr key={record.id} className="border-b last:border-0">
              <td className="px-2 py-2 font-medium text-blue-600">{record.applyNo}</td>
              <td className="px-2 py-2">{record.appliedAt}</td>
              <td className="px-2 py-2">{record.applicant}</td>
              <td className="px-2 py-2">{record.applyType}</td>
              <td className="px-2 py-2">{record.currency}</td>
              <td className="px-2 py-2 text-right font-semibold">{money(record.applyAmount)}</td>
              <td className="px-2 py-2">{record.paymentRemark || "-"}</td>
              <td className="px-2 py-2"><StatusTag value={record.paymentStatus} /></td>
              <td className="px-2 py-2">{record.paidAt ?? "-"}</td>
              <td className="px-2 py-2">{row.paymentRecords.find((payment) => payment.applyNo === record.applyNo)?.payer ?? "-"}</td>
              <td className="px-2 py-2 text-right">{money(remainingMap.get(record.id) ?? 0)}</td>
              <td className="px-2 py-2">{record.remark ?? "-"}</td>
            </tr>
          ))}
          {!records.length && <tr><td colSpan={12} className="py-8 text-center text-gray-400">暂无请款记录</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

function OperationLogTable({ row }: { row: PaymentRequest }) {
  return (
    <div className="overflow-x-auto rounded border border-gray-200">
      <table className="min-w-[760px] text-left text-xs">
        <thead className="bg-gray-50 text-gray-700">
          <tr>{["操作时间", "操作人", "操作类型", "操作内容", "备注"].map((item) => <th key={item} className="border-b px-2 py-2 font-medium">{item}</th>)}</tr>
        </thead>
        <tbody>
          {row.logs.map((log, index) => (
            <tr key={`${log.operatedAt}-${index}`} className="border-b last:border-0">
              <td className="px-2 py-2">{log.operatedAt}</td>
              <td className="px-2 py-2">{log.operator}</td>
              <td className="px-2 py-2 font-medium">{log.action}</td>
              <td className="px-2 py-2">{log.content}</td>
              <td className="px-2 py-2">{log.remark ?? "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PaymentRecordsView({ row, onToast }: { row: PaymentRequest; onToast: (message: string) => void }) {
  return (
    <div className="space-y-4 text-sm">
      {row.paymentRecords.map((record) => (
        <section key={record.id} className="rounded border border-gray-200 bg-white p-4">
          <div className="rounded border border-blue-100 bg-blue-50 p-4">
            <div className="text-xs text-blue-700">付款金额</div>
            <div className="mt-1 text-2xl font-semibold text-blue-900">{money(record.paidAmount)} {record.currency} - {record.currency === "CNY" ? "人民币元" : "美元"}</div>
            <div className="mt-1 font-medium text-blue-800">{record.amountInWords}</div>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-[150px_1fr]">
            {[
              ["付款记录号", record.paymentNo],
              ["请款单号", record.requestNo],
              ["请款记录号", record.applyNo],
              ["付款时间", record.paidAt],
              ["付款人", record.payer],
              ["收款人", record.payeeName],
              ["付款主体", record.payerEntity],
              ["付款方式", record.paymentMethod],
              ["银行账号", record.bankAccount],
              ["开户行", record.bankName],
              ["SWIFT CODE", record.swiftCode ?? "-"],
              ["付款凭证", record.voucher],
              ["付款备注", record.paymentRemark ?? "-"],
            ].map(([label, value]) => (
              <div key={label} className="contents">
                <div className="text-gray-500">{label}</div>
                <div className="font-medium text-gray-900">{value}</div>
              </div>
            ))}
          </div>
          <SectionTitle>付款附件</SectionTitle>
          <AttachmentCards attachments={record.attachments} onAction={onToast} />
        </section>
      ))}
      {!row.paymentRecords.length && <div className="rounded border border-gray-200 bg-white py-10 text-center text-gray-400">暂无付款记录</div>}
    </div>
  );
}

function CompactApplyHistory({ row }: { row: PaymentRequest }) {
  let appliedTotal = 0;
  const total = totalRequestAmount(row);
  return (
    <div className="overflow-x-auto rounded border border-gray-200">
      <table className="min-w-[980px] text-left text-xs">
        <thead className="bg-gray-50 text-gray-700">
          <tr>{["序号", "请款记录号", "请款人", "请款金额", "币种", "申请时间", "付款状态", "付款时间", "付款人", "剩余付款金额", "备注"].map((item) => <th key={item} className="border-b px-2 py-2 font-medium">{item}</th>)}</tr>
        </thead>
        <tbody>
          {row.applyRecords.map((record, index) => {
            appliedTotal += record.applyAmount;
            const payment = row.paymentRecords.find((item) => item.applyNo === record.applyNo);
            return (
              <tr key={record.id} className="border-b last:border-0">
                <td className="px-2 py-2">{index + 1}</td>
                <td className="px-2 py-2 font-medium text-blue-600">{record.applyNo}</td>
                <td className="px-2 py-2">{record.applicant}</td>
                <td className="px-2 py-2 text-right font-semibold">{money(record.applyAmount)}</td>
                <td className="px-2 py-2">{record.currency}</td>
                <td className="px-2 py-2">{record.appliedAt}</td>
                <td className="px-2 py-2"><StatusTag value={record.paymentStatus} /></td>
                <td className="px-2 py-2">{record.paidAt ?? "-"}</td>
                <td className="px-2 py-2">{payment?.payer ?? "-"}</td>
                <td className="px-2 py-2 text-right">{money(Math.max(total - appliedTotal, 0))}</td>
                <td className="px-2 py-2">{record.paymentRemark ?? "-"}</td>
              </tr>
            );
          })}
          {!row.applyRecords.length && <tr><td colSpan={11} className="py-8 text-center text-gray-400">暂无请款记录</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

function RequestDetail({
  row,
  onToast,
  onApplyPayment,
  onMockFinancePayment,
}: {
  row: PaymentRequest;
  onToast: (message: string) => void;
  onApplyPayment: (row: PaymentRequest) => void;
  onMockFinancePayment: (row: PaymentRequest) => void;
}) {
  return (
    <div className="space-y-4 text-sm">
      <div className="grid gap-3 md:grid-cols-4">
        <div className="rounded border border-blue-100 bg-blue-50 p-3">
          <div className="text-xs text-blue-700">请款金额</div>
          <div className="mt-1 text-lg font-semibold text-blue-900">{amountSummary(row)}</div>
        </div>
        <div className="rounded border border-gray-200 p-3"><div className="text-xs text-gray-500">已申请付款</div><div className="mt-1 text-lg font-semibold">{money(totalAppliedAmount(row))}</div></div>
        <div className="rounded border border-gray-200 p-3"><div className="text-xs text-gray-500">已付款</div><div className="mt-1 text-lg font-semibold">{money(totalPaidAmount(row))}</div></div>
        <div className="rounded border border-gray-200 p-3"><div className="text-xs text-gray-500">剩余未付</div><div className="mt-1 text-lg font-semibold">{money(remainingUnpaid(row))}</div></div>
      </div>
      <div className="flex flex-wrap gap-2">
        <button className="inline-flex h-8 items-center gap-1 rounded bg-blue-600 px-3 text-sm text-white" onClick={() => onApplyPayment(row)}><Banknote size={14} />申请付款</button>
        <button className="inline-flex h-8 items-center gap-1 rounded border border-emerald-200 bg-emerald-50 px-3 text-sm text-emerald-700" onClick={() => onMockFinancePayment(row)}><ReceiptText size={14} />模拟财务付款</button>
      </div>

      <SectionTitle>来源对账信息</SectionTitle>
      <div className="overflow-x-auto rounded border border-gray-200">
        <table className="min-w-[980px] text-left text-xs">
          <thead className="bg-gray-50"><tr>{["来源对账单号", "头程物流单号", "头程物流商", "渠道", "运输方式", "费用类型", "状态", "确认应付", "已请款", "剩余可请款", "本次请款", "币种", "备注"].map((item) => <th key={item} className="border-b px-2 py-2 font-medium">{item}</th>)}</tr></thead>
          <tbody>{row.sources.map((source) => <tr key={source.reconciliationNo} className="border-b last:border-0">
            <td className="px-2 py-2 font-medium text-blue-600">{source.reconciliationNo}</td>
            <td className="px-2 py-2">{source.firstLegNo}</td>
            <td className="px-2 py-2">{source.provider}</td>
            <td className="px-2 py-2">{source.channel}</td>
            <td className="px-2 py-2">{source.transportMethod}</td>
            <td className="px-2 py-2">{source.feeType}</td>
            <td className="px-2 py-2">{source.reconciliationStatus}</td>
            <td className="px-2 py-2 text-right">{money(source.confirmedPayable)}</td>
            <td className="px-2 py-2 text-right">{money(source.requestedAmount)}</td>
            <td className="px-2 py-2 text-right">{money(source.confirmedPayable - source.requestedAmount)}</td>
            <td className="px-2 py-2 text-right font-semibold">{money(source.currentRequestAmount)}</td>
            <td className="px-2 py-2">{source.currency}</td>
            <td className="px-2 py-2">{source.remark ?? "-"}</td>
          </tr>)}</tbody>
        </table>
      </div>

      <SectionTitle>付款信息</SectionTitle>
      <div className="grid gap-3 rounded border border-gray-200 bg-white p-3 md:grid-cols-3">
        {[
          ["付款类型", row.paymentType],
          ["收款人", row.payeeName],
          ["付款主体", row.payerEntity],
          ["付款方式", row.paymentMethod],
          ["付款性质", row.paymentNature],
          ["开户行", row.bankName],
          ["银行账号", row.bankAccount],
          ["SWIFT CODE", row.swiftCode ?? "-"],
          ["收款币种", row.receivingCurrency],
        ].map(([label, value]) => <div key={label}><div className="text-xs text-gray-500">{label}</div><div className="mt-1 font-medium">{value}</div></div>)}
      </div>

      <SectionTitle>请款记录</SectionTitle>
      <ApplyRecordsTable row={row} />
      <SectionTitle>付款记录</SectionTitle>
      <PaymentRecordsView row={row} onToast={onToast} />
      <SectionTitle>操作日志</SectionTitle>
      <OperationLogTable row={row} />
      <SectionTitle>附件</SectionTitle>
      <AttachmentCards attachments={row.attachments} onAction={onToast} />
    </div>
  );
}

function CreatePaymentRequestPage({
  draft,
  onChange,
  onBack,
  onSaveDraft,
  onCreateRequest,
  onToast,
}: {
  draft: PaymentRequest;
  onChange: (next: PaymentRequest) => void;
  onBack: () => void;
  onSaveDraft: () => void;
  onCreateRequest: () => void;
  onToast: (message: string) => void;
}) {
  const overLimit = draft.amounts.some((amount) => amount.requestAmount > amount.remainingRequestable);
  const updateField = <K extends keyof PaymentRequest>(key: K, value: PaymentRequest[K]) => onChange({ ...draft, [key]: value, updatedAt: nowText });
  const addAttachment = () => {
    const nextAttachment: LogisticsPaymentAttachment = { id: `upload-${Date.now()}`, name: "发票GOSUXIA8538224印尼.pdf", type: "PDF", size: "1.2 MB", uploader: "张三", uploadedAt: nowText };
    onChange({ ...draft, attachments: [nextAttachment, ...draft.attachments], logs: [{ operatedAt: nowText, operator: "张三", action: "上传附件", content: "上传发票 PDF 1 份" }, ...draft.logs] });
    onToast("已模拟上传附件");
  };

  return (
    <div className="pb-20">
      <PageHeader
        title="创建物流费用请款单"
        desc="来源对账信息自动带出，收款币种只能选择 USD 或 CNY；创建后会同步到物流费用请款列表。"
        extra={<button className="inline-flex h-8 items-center gap-1 rounded border border-gray-200 bg-white px-3 text-sm text-gray-700" onClick={onBack}><ArrowLeft size={14} />返回列表</button>}
      />

      <section className="mb-3 border border-gray-200 bg-white p-4">
        <SectionTitle>来源对账信息</SectionTitle>
        <div className="overflow-x-auto rounded border border-gray-200">
          <table className="min-w-[1100px] text-left text-xs">
            <thead className="bg-gray-50"><tr>{["来源对账单号", "头程物流单号", "头程物流商", "头程物流渠道", "运输方式", "费用类型", "对账状态", "确认应付金额", "已请款金额", "剩余可请款金额", "本次请款金额", "币种", "备注"].map((item) => <th key={item} className="border-b px-2 py-2 font-medium">{item}</th>)}</tr></thead>
            <tbody>{draft.sources.map((source) => <tr key={source.reconciliationNo} className="border-b last:border-0">
              <td className="px-2 py-2 font-medium text-blue-600">{source.reconciliationNo}</td>
              <td className="px-2 py-2">{source.firstLegNo}</td>
              <td className="px-2 py-2">{source.provider}</td>
              <td className="px-2 py-2">{source.channel}</td>
              <td className="px-2 py-2">{source.transportMethod}</td>
              <td className="px-2 py-2">{source.feeType}</td>
              <td className="px-2 py-2">{source.reconciliationStatus}</td>
              <td className="px-2 py-2 text-right">{money(source.confirmedPayable)}</td>
              <td className="px-2 py-2 text-right">{money(source.requestedAmount)}</td>
              <td className="px-2 py-2 text-right">{money(source.confirmedPayable - source.requestedAmount)}</td>
              <td className="px-2 py-2 text-right font-semibold text-blue-700">{money(source.currentRequestAmount)}</td>
              <td className="px-2 py-2">{source.currency}</td>
              <td className="px-2 py-2">{source.remark ?? "-"}</td>
            </tr>)}</tbody>
          </table>
        </div>
        <CurrencySummary row={draft} />
      </section>

      <section className="mb-3 grid gap-3 border border-gray-200 bg-white p-4 xl:grid-cols-2">
        <div>
          <SectionTitle>收款人信息</SectionTitle>
          <div className="grid gap-3 md:grid-cols-2">
            <label className="grid gap-1 md:col-span-2"><span className="text-xs text-gray-500">收款人（单位）名称</span><input className={inputClass} value={draft.payeeName} onChange={(event) => updateField("payeeName", event.target.value)} /></label>
            <label className="grid gap-1"><span className="text-xs text-gray-500">收款人简称</span><input className={inputClass} value={draft.payeeShortName ?? ""} onChange={(event) => updateField("payeeShortName", event.target.value)} /></label>
            <label className="grid gap-1"><span className="text-xs text-gray-500">收款币种</span><select className={inputClass} value={draft.receivingCurrency} onChange={(event) => updateField("receivingCurrency", event.target.value as "USD" | "CNY")}><option>CNY</option><option>USD</option></select></label>
            <label className="grid gap-1 md:col-span-2"><span className="text-xs text-gray-500">开户行</span><input className={inputClass} value={draft.bankName} onChange={(event) => updateField("bankName", event.target.value)} /></label>
            <label className="grid gap-1"><span className="text-xs text-gray-500">银行账号</span><input className={inputClass} value={draft.bankAccount} onChange={(event) => updateField("bankAccount", event.target.value)} /></label>
            <label className="grid gap-1"><span className="text-xs text-gray-500">SWIFT CODE</span><input className={inputClass} value={draft.swiftCode ?? ""} onChange={(event) => updateField("swiftCode", event.target.value)} /></label>
            <label className="grid gap-1 md:col-span-2"><span className="text-xs text-gray-500">收款人地址</span><input className={inputClass} value={draft.payeeAddress ?? ""} onChange={(event) => updateField("payeeAddress", event.target.value)} /></label>
            <label className="grid gap-1"><span className="text-xs text-gray-500">联系人</span><input className={inputClass} value={draft.contactName ?? ""} onChange={(event) => updateField("contactName", event.target.value)} /></label>
            <label className="grid gap-1"><span className="text-xs text-gray-500">联系电话</span><input className={inputClass} value={draft.contactPhone ?? ""} onChange={(event) => updateField("contactPhone", event.target.value)} /></label>
          </div>
        </div>
        <div>
          <SectionTitle>付款信息</SectionTitle>
          <div className="grid gap-3 md:grid-cols-2">
            <label className="grid gap-1"><span className="text-xs text-gray-500">付款类型</span><select className={inputClass} value={draft.paymentType} onChange={(event) => updateField("paymentType", event.target.value)}>{["运费（内陆）", "头程运费", "目的港费用", "清关费", "关税", "增值税", "罚款", "其他"].map((item) => <option key={item}>{item}</option>)}</select></label>
            <label className="grid gap-1"><span className="text-xs text-gray-500">付款主体</span><input className={inputClass} value={draft.payerEntity} onChange={(event) => updateField("payerEntity", event.target.value)} /></label>
            <label className="grid gap-1"><span className="text-xs text-gray-500">付款方式</span><select className={inputClass} value={draft.paymentMethod} onChange={(event) => updateField("paymentMethod", event.target.value)}><option>银行付款</option><option>现金</option><option>其他</option></select></label>
            <label className="grid gap-1"><span className="text-xs text-gray-500">付款性质</span><select className={inputClass} value={draft.paymentNature} onChange={(event) => updateField("paymentNature", event.target.value)}><option>全款</option><option>预付款</option><option>尾款</option><option>部分款</option></select></label>
            <label className="grid gap-1"><span className="text-xs text-gray-500">申请人</span><input className={inputClass} value={draft.applicant} onChange={(event) => updateField("applicant", event.target.value)} /></label>
            <label className="grid gap-1"><span className="text-xs text-gray-500">申请部门</span><input className={inputClass} value={draft.applicantDepartment ?? ""} onChange={(event) => updateField("applicantDepartment", event.target.value)} /></label>
            <label className="grid gap-1"><span className="text-xs text-gray-500">备注</span><input className={inputClass} value={draft.internalRemark ?? ""} onChange={(event) => updateField("internalRemark", event.target.value)} /></label>
          </div>
        </div>
      </section>

      <section className="mb-3 border border-gray-200 bg-white p-4">
        <SectionTitle>付款金额</SectionTitle>
        <div className="space-y-3">
          {draft.amounts.map((amount) => (
            <article key={amount.currency} className="rounded border border-blue-100 bg-blue-50/70 p-4">
              <div className="text-xs text-blue-700">付款金额</div>
              <div className="mt-1 text-2xl font-semibold text-blue-900">{money(amount.requestAmount)} {amount.currency} - {amount.currencyName}</div>
              <div className="mt-1 text-sm font-medium text-blue-800">金额大写：{amount.amountInWords}</div>
              <div className="mt-4 grid gap-3 text-xs md:grid-cols-4">
                <div className="rounded bg-white px-3 py-2"><span className="text-gray-500">收款币种</span><div className="mt-1 font-semibold">{amount.currency}</div></div>
                <div className="rounded bg-white px-3 py-2"><span className="text-gray-500">付款单总付款金额</span><div className="mt-1 font-semibold">{money(amount.requestAmount)} {amount.currency}</div></div>
                <div className="rounded bg-white px-3 py-2"><span className="text-gray-500">已申请付款金额</span><div className="mt-1 font-semibold">{money(totalAppliedAmount(draft))} {amount.currency}</div></div>
                <div className="rounded bg-white px-3 py-2"><span className="text-gray-500">已付款金额</span><div className="mt-1 font-semibold">{money(amount.paidAmount)} {amount.currency}</div></div>
                <div className="rounded bg-white px-3 py-2"><span className="text-gray-500">剩余付款金额</span><div className="mt-1 font-semibold text-blue-700">{money(Math.max(amount.requestAmount - amount.paidAmount, 0))} {amount.currency}</div></div>
                <div className="rounded bg-white px-3 py-2"><span className="text-gray-500">汇率</span><div className="mt-1 font-semibold">{amount.exchangeRate}</div></div>
                <div className="rounded bg-white px-3 py-2"><span className="text-gray-500">折算本位币金额</span><div className="mt-1 font-semibold">{money(amount.baseCurrencyAmount)}</div></div>
                <div className="rounded bg-white px-3 py-2"><span className="text-gray-500">金额大写</span><div className="mt-1 font-semibold">{amount.amountInWords}</div></div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mb-3 border border-gray-200 bg-white p-4">
        <SectionTitle>付款说明</SectionTitle>
        <div className="grid gap-3 md:grid-cols-3">
          <label className="grid gap-1 md:col-span-3"><span className="text-xs text-gray-500">付款说明</span><textarea className={`${inputClass} min-h-24 py-2`} value={draft.paymentRemark} onChange={(event) => updateField("paymentRemark", event.target.value)} /></label>
          <label className="grid gap-1"><span className="text-xs text-gray-500">内部备注</span><textarea className={`${inputClass} min-h-20 py-2`} value={draft.internalRemark ?? ""} onChange={(event) => updateField("internalRemark", event.target.value)} /></label>
          <label className="grid gap-1 md:col-span-2"><span className="text-xs text-gray-500">财务备注</span><textarea className={`${inputClass} min-h-20 py-2`} value={draft.financeRemark ?? ""} onChange={(event) => updateField("financeRemark", event.target.value)} /></label>
        </div>
      </section>

      <section className="mb-3 border border-gray-200 bg-white p-4">
        <SectionTitle>附件</SectionTitle>
        <button className="mb-3 inline-flex h-8 items-center gap-1 rounded bg-[#009688] px-3 text-sm text-white" onClick={addAttachment}><Upload size={14} />上传附件</button>
        <AttachmentCards attachments={draft.attachments} editable onAction={onToast} onDelete={(id) => onChange({ ...draft, attachments: draft.attachments.filter((item) => item.id !== id), logs: [{ operatedAt: nowText, operator: "张三", action: "删除附件", content: "删除请款附件" }, ...draft.logs] })} />
      </section>

      <section className="mb-3 border border-gray-200 bg-white p-4">
        <SectionTitle>请款记录</SectionTitle>
        <ApplyRecordsTable row={draft} />
        <SectionTitle>操作日志</SectionTitle>
        <OperationLogTable row={draft} />
      </section>

      <PageLogic />

      <div className="sticky bottom-0 z-20 mt-4 flex justify-end gap-2 border border-gray-200 bg-white px-4 py-3 shadow-[0_-6px_16px_rgba(15,23,42,0.08)]">
        <button className="inline-flex h-9 items-center gap-1 rounded border border-gray-200 px-4 text-sm text-gray-700 hover:bg-gray-50" onClick={onBack}><ArrowLeft size={15} />返回</button>
        <button className="inline-flex h-9 items-center gap-1 rounded border border-blue-200 bg-blue-50 px-4 text-sm text-blue-700 hover:bg-blue-100" onClick={onSaveDraft}><Save size={15} />保存草稿</button>
        <button className="inline-flex h-9 items-center gap-1 rounded bg-blue-600 px-4 text-sm text-white hover:bg-blue-700 disabled:bg-gray-300" disabled={overLimit} onClick={onCreateRequest}><Plus size={15} />创建请款单</button>
      </div>
    </div>
  );
}

function EditPaymentRequestModal({
  row,
  onClose,
  onSave,
  onToast,
}: {
  row: PaymentRequest | null;
  onClose: () => void;
  onSave: (next: PaymentRequest) => void;
  onToast: (message: string) => void;
}) {
  const [draft, setDraft] = useState<PaymentRequest | null>(row);
  if (!row || !draft) return null;

  const fullEdit = row.status === "未请款";
  const partialEdit = row.status === "部分请款";
  const requestedEdit = row.status === "已请款";
  const limitedNotice = partialEdit || requestedEdit;
  const readOnlyInput = `${inputClass} bg-gray-50 text-gray-500`;
  const editableInput = inputClass;
  const coreInput = fullEdit ? editableInput : readOnlyInput;
  const contactInput = fullEdit || partialEdit ? editableInput : readOnlyInput;
  const remarkInput = fullEdit || partialEdit || requestedEdit ? editableInput : readOnlyInput;
  const allowDeleteAttachment = fullEdit || partialEdit;
  const allowUploadAttachment = fullEdit || partialEdit || requestedEdit;

  const updateDraft = <K extends keyof PaymentRequest>(key: K, value: PaymentRequest[K]) => setDraft({ ...draft, [key]: value, updatedAt: nowText });
  const updateAmount = (currency: string, value: string) => {
    if (!fullEdit) return;
    const nextValue = Number(value.replace(/,/g, ""));
    const safeValue = Number.isFinite(nextValue) && nextValue >= 0 ? nextValue : 0;
    setDraft({
      ...draft,
      updatedAt: nowText,
      amounts: draft.amounts.map((amount) => amount.currency === currency ? {
        ...amount,
        requestAmount: safeValue,
        baseCurrencyAmount: safeValue * amount.exchangeRate,
        amountInWords: amountWords(currency === "USD" ? "USD" : "CNY", safeValue),
      } : amount),
    });
  };
  const addAttachment = () => {
    if (!allowUploadAttachment) return;
    const nextAttachment: LogisticsPaymentAttachment = { id: `edit-att-${Date.now()}`, name: "invoice-20260618.pdf", type: "PDF", size: "1.1 MB", uploader: "张三", uploadedAt: nowText };
    setDraft({ ...draft, attachments: [nextAttachment, ...draft.attachments], updatedAt: nowText });
    onToast("已模拟上传补充附件");
  };
  const deleteAttachment = (id: string) => {
    if (!allowDeleteAttachment) return;
    setDraft({ ...draft, attachments: draft.attachments.filter((item) => item.id !== id), updatedAt: nowText });
  };
  const saveEdit = () => {
    const next: PaymentRequest = {
      ...draft,
      updatedAt: nowText,
      logs: [{ operatedAt: nowText, operator: "张三", action: "编辑请款单", content: "修改付款说明、备注或补充附件", remark: limitedNotice ? "核心金额、来源对账、收款账户信息保持只读" : "未请款状态允许完整编辑" }, ...draft.logs],
    };
    onSave(next);
  };

  return (
    <FormModal open={Boolean(row)} onClose={onClose} title="编辑物流费用请款单" widthClass="w-[1180px]" sectionTitle="编辑物流费用请款单">
      <div className="max-h-[76vh] space-y-4 overflow-y-auto pr-1 text-sm">
        {limitedNotice && <div className="rounded border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">当前请款单已发生请款记录，核心金额、来源对账、收款账户信息不可修改，仅允许补充附件和备注说明。</div>}

        <section className="rounded border border-gray-200 bg-white p-4">
          <SectionTitle>一、来源对账信息</SectionTitle>
          <div className="overflow-x-auto rounded border border-gray-200">
            <table className="min-w-[980px] text-left text-xs">
              <thead className="bg-gray-50"><tr>{["来源对账单号", "头程物流单号", "头程物流商", "渠道", "运输方式", "费用类型", "状态", "确认应付", "币种", "备注"].map((item) => <th key={item} className="border-b px-2 py-2 font-medium">{item}</th>)}</tr></thead>
              <tbody>{draft.sources.map((source) => <tr key={source.reconciliationNo} className="border-b last:border-0">
                <td className="px-2 py-2 font-medium text-blue-600">{source.reconciliationNo}</td>
                <td className="px-2 py-2">{source.firstLegNo}</td>
                <td className="px-2 py-2">{source.provider}</td>
                <td className="px-2 py-2">{source.channel}</td>
                <td className="px-2 py-2">{source.transportMethod}</td>
                <td className="px-2 py-2">{source.feeType}</td>
                <td className="px-2 py-2">{source.reconciliationStatus}</td>
                <td className="px-2 py-2 text-right">{money(source.confirmedPayable)}</td>
                <td className="px-2 py-2">{source.currency}</td>
                <td className="px-2 py-2">{source.remark ?? "-"}</td>
              </tr>)}</tbody>
            </table>
          </div>
        </section>

        <section className="rounded border border-gray-200 bg-white p-4">
          <SectionTitle>二、收款人信息</SectionTitle>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            <label className="grid gap-1"><span className="text-xs text-gray-500">收款人名称</span><input className={coreInput} value={draft.payeeName} disabled={!fullEdit} onChange={(event) => updateDraft("payeeName", event.target.value)} /></label>
            <label className="grid gap-1"><span className="text-xs text-gray-500">收款人简称</span><input className={coreInput} value={draft.payeeShortName ?? ""} disabled={!fullEdit} onChange={(event) => updateDraft("payeeShortName", event.target.value)} /></label>
            <label className="grid gap-1"><span className="text-xs text-gray-500">收款币种</span><select className={coreInput} value={draft.receivingCurrency} disabled={!fullEdit} onChange={(event) => updateDraft("receivingCurrency", event.target.value as "USD" | "CNY")}><option>CNY</option><option>USD</option></select></label>
            <label className="grid gap-1"><span className="text-xs text-gray-500">开户行</span><input className={coreInput} value={draft.bankName} disabled={!fullEdit} onChange={(event) => updateDraft("bankName", event.target.value)} /></label>
            <label className="grid gap-1"><span className="text-xs text-gray-500">银行账号</span><input className={coreInput} value={draft.bankAccount} disabled={!fullEdit} onChange={(event) => updateDraft("bankAccount", event.target.value)} /></label>
            <label className="grid gap-1"><span className="text-xs text-gray-500">SWIFT CODE</span><input className={coreInput} value={draft.swiftCode ?? ""} disabled={!fullEdit} onChange={(event) => updateDraft("swiftCode", event.target.value)} /></label>
            <label className="grid gap-1"><span className="text-xs text-gray-500">联系人</span><input className={contactInput} value={draft.contactName ?? ""} disabled={requestedEdit} onChange={(event) => updateDraft("contactName", event.target.value)} /></label>
            <label className="grid gap-1"><span className="text-xs text-gray-500">联系电话</span><input className={contactInput} value={draft.contactPhone ?? ""} disabled={requestedEdit} onChange={(event) => updateDraft("contactPhone", event.target.value)} /></label>
            <label className="grid gap-1 xl:col-span-3"><span className="text-xs text-gray-500">收款地址</span><input className={contactInput} value={draft.payeeAddress ?? ""} disabled={requestedEdit} onChange={(event) => updateDraft("payeeAddress", event.target.value)} /></label>
          </div>
        </section>

        <section className="rounded border border-gray-200 bg-white p-4">
          <SectionTitle>三、付款信息</SectionTitle>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <label className="grid gap-1"><span className="text-xs text-gray-500">付款类型</span><select className={coreInput} value={draft.paymentType} disabled={!fullEdit} onChange={(event) => updateDraft("paymentType", event.target.value)}>{["运费（内陆）", "头程运费", "目的港费用", "清关费", "关税", "增值税", "罚款", "其他"].map((item) => <option key={item}>{item}</option>)}</select></label>
            <label className="grid gap-1"><span className="text-xs text-gray-500">付款主体</span><input className={coreInput} value={draft.payerEntity} disabled={!fullEdit} onChange={(event) => updateDraft("payerEntity", event.target.value)} /></label>
            <label className="grid gap-1"><span className="text-xs text-gray-500">付款方式</span><select className={coreInput} value={draft.paymentMethod} disabled={!fullEdit} onChange={(event) => updateDraft("paymentMethod", event.target.value)}><option>银行付款</option><option>现金</option><option>其他</option></select></label>
            <label className="grid gap-1"><span className="text-xs text-gray-500">付款性质</span><select className={coreInput} value={draft.paymentNature} disabled={!fullEdit} onChange={(event) => updateDraft("paymentNature", event.target.value)}><option>全款</option><option>预付款</option><option>尾款</option><option>部分款</option></select></label>
          </div>
        </section>

        <section className="rounded border border-gray-200 bg-white p-4">
          <SectionTitle>四、金额信息</SectionTitle>
          <div className="space-y-3">
            {draft.amounts.map((amount) => (
              <article key={amount.currency} className="rounded border border-blue-100 bg-blue-50/70 p-4">
                <div className="text-xs text-blue-700">付款单金额</div>
                <div className="mt-1 text-2xl font-semibold text-blue-900">{money(amount.requestAmount)} {amount.currency} - {amount.currencyName}</div>
                <div className="mt-4 grid gap-3 text-xs md:grid-cols-4">
                  <div className="rounded bg-white px-3 py-2"><span className="text-gray-500">收款币种</span><div className="mt-1 font-semibold">{amount.currency}</div></div>
                  <label className="grid gap-1 rounded bg-white px-3 py-2"><span className="text-gray-500">付款单总付款金额</span><input className={`${fullEdit ? inputClass : readOnlyInput} text-right`} value={String(amount.requestAmount)} disabled={!fullEdit} onChange={(event) => updateAmount(amount.currency, event.target.value)} /></label>
                  <div className="rounded bg-white px-3 py-2"><span className="text-gray-500">已申请付款金额</span><div className="mt-1 font-semibold">{money(totalAppliedAmount(draft))} {amount.currency}</div></div>
                  <div className="rounded bg-white px-3 py-2"><span className="text-gray-500">已付款金额</span><div className="mt-1 font-semibold">{money(amount.paidAmount)} {amount.currency}</div></div>
                  <div className="rounded bg-white px-3 py-2"><span className="text-gray-500">剩余付款金额</span><div className="mt-1 font-semibold text-blue-700">{money(Math.max(amount.requestAmount - amount.paidAmount, 0))} {amount.currency}</div></div>
                  <div className="rounded bg-white px-3 py-2"><span className="text-gray-500">汇率</span><div className="mt-1 font-semibold">{amount.exchangeRate}</div></div>
                  <div className="rounded bg-white px-3 py-2"><span className="text-gray-500">折算本位币金额</span><div className="mt-1 font-semibold">{money(amount.baseCurrencyAmount)}</div></div>
                  <div className="rounded bg-white px-3 py-2"><span className="text-gray-500">金额大写</span><div className="mt-1 font-semibold">{amount.amountInWords}</div></div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded border border-gray-200 bg-white p-4">
          <SectionTitle>五、付款说明</SectionTitle>
          <div className="grid gap-3 md:grid-cols-3">
            <label className="grid gap-1 md:col-span-3"><span className="text-xs text-gray-500">付款说明</span><textarea className={`${remarkInput} min-h-24 py-2`} value={draft.paymentRemark} onChange={(event) => updateDraft("paymentRemark", event.target.value)} /></label>
            <label className="grid gap-1"><span className="text-xs text-gray-500">内部备注</span><textarea className={`${remarkInput} min-h-20 py-2`} value={draft.internalRemark ?? ""} onChange={(event) => updateDraft("internalRemark", event.target.value)} /></label>
            <label className="grid gap-1 md:col-span-2"><span className="text-xs text-gray-500">财务备注</span><textarea className={`${remarkInput} min-h-20 py-2`} value={draft.financeRemark ?? ""} onChange={(event) => updateDraft("financeRemark", event.target.value)} /></label>
          </div>
        </section>

        <section className="rounded border border-gray-200 bg-white p-4">
          <SectionTitle>六、附件信息</SectionTitle>
          {allowUploadAttachment && <button className="mb-3 inline-flex h-8 items-center gap-1 rounded bg-[#009688] px-3 text-sm text-white" onClick={addAttachment}><Upload size={14} />上传补充附件</button>}
          <AttachmentCards attachments={draft.attachments} editable={allowDeleteAttachment} onAction={onToast} onDelete={deleteAttachment} />
          <div className="mt-2 text-xs text-gray-500">支持 PDF、PPT / PPTX、XLS / XLSX、JPG / JPEG / PNG / WEBP</div>
        </section>

        <section className="rounded border border-gray-200 bg-white p-4">
          <SectionTitle>七、请款记录</SectionTitle>
          <ApplyRecordsTable row={draft} />
          <SectionTitle>八、操作日志</SectionTitle>
          <OperationLogTable row={draft} />
        </section>
      </div>
      <div className="mt-4 flex justify-end gap-2 border-t pt-3">
        <button className="h-8 rounded border px-4 text-sm" onClick={onClose}>取消</button>
        <button className="h-8 rounded bg-blue-600 px-4 text-sm text-white" onClick={saveEdit}>保存编辑</button>
      </div>
    </FormModal>
  );
}

function PageLogic() {
  return (
    <DesignLogicCard sections={[
      {
        title: "页面功能说明",
        headers: ["说明项", "内容"],
        rows: [
          ["物流费用请款", "物流费用请款用于承接物流费用对账结果并生成付款单。创建请款单后，用户可以多次申请付款。"],
          ["申请付款", "申请付款时自动带出收款信息、附件和历史请款记录。本次付款申请的币种只影响本次申请，不会改变付款单原始金额信息。"],
          ["财务付款结果查看", "物流费用请款用于承接物流费用对账结果并生成请款单，支持申请付款、请款记录、操作日志和财务付款结果查看。"],
          ["状态编辑", "物流费用请款支持在不同状态下进行不同范围的编辑。未请款可编辑完整付款信息；部分请款和已请款只允许补充附件、备注和付款说明；已完成或已作废不允许编辑。"],
        ],
      },
      {
        title: "业务逻辑说明",
        headers: ["业务场景", "规则说明", "页面结果"],
        rows: [
          ["对账单生成请款单", "从物流费用对账勾选记录后进入创建页面", "创建后同步到物流费用请款列表"],
          ["删除右侧金额块", "付款金额区域不再拆出右侧独立小卡片", "金额信息集中展示"],
          ["自动带出收款信息", "申请付款时自动读取请款单收款信息", "用户无需重复录入"],
          ["自动带出附件", "申请付款时自动展示请款单已有附件", "支持查看并追加上传"],
          ["删除按比例付款", "不再使用比例类快捷选项", "只保留全款 / 部分付款"],
          ["收款币种", "只能从下拉中选择 USD 或 CNY", "不允许手动输入"],
          ["创建请款单", "从物流费用对账勾选记录生成请款单", "状态为未请款"],
          ["未请款", "创建请款单但未申请付款", "请款状态显示未请款，付款状态显示未付款"],
          ["部分请款", "已申请付款但未覆盖总金额", "请款状态显示部分请款"],
          ["已请款", "已申请完整金额但财务未全部付款", "请款状态显示已请款，付款状态仍可为未付款"],
          ["已完成", "整单金额已全部付款完成", "请款状态显示已完成，付款状态显示已完成"],
          ["财务付款结果查看", "财务付款结果继续用于展示实际付款", "付款结果可查看"],
          ["请款记录", "记录每次申请付款金额和付款状态", "展示未付款 / 已付款"],
          ["申请付款", "点击申请付款填写本次申请金额", "生成请款记录"],
          ["全款申请", "本次付款金额等于剩余付款金额", "自动带出金额"],
          ["部分付款申请", "用户手动填写金额，不能超过剩余付款金额", "请款状态变为部分请款"],
          ["操作日志", "记录创建、修改、上传、申请付款等操作", "展示谁在何时做了什么"],
          ["财务付款", "财务付款后登记付款结果", "付款状态更新为部分付款或已付款"],
          ["未请款编辑", "尚未申请付款", "允许编辑收款信息、付款信息、金额、附件"],
          ["部分请款编辑", "已经申请过部分金额", "只允许补充附件、备注、付款说明、联系人、联系电话"],
          ["已请款编辑", "已经申请完整金额", "只允许补充附件和备注"],
          ["已完成编辑", "整单已付款完成", "编辑按钮置灰并提示不允许编辑"],
          ["已作废编辑", "单据作废", "编辑按钮置灰并提示不允许编辑"],
          ["核心金额保护", "已发生请款后不能改金额", "金额字段只读"],
          ["收款账户保护", "已发生请款后不能改账户", "银行账号、开户行、SWIFT 只读"],
          ["编辑记录", "保存编辑后记录操作日志", "操作日志新增编辑记录"],
        ],
      },
    ]} />
  );
}

type ApplyDraft = {
  applyType: "全款" | "部分付款";
  currency: "USD" | "CNY";
  amount: number;
  paymentDate: string;
  remark: string;
  financeRemark: string;
};

type FinanceDraft = {
  applyNo: string;
  amount: number;
  currency: "USD" | "CNY";
  paidAt: string;
  paymentMethod: string;
  voucher: string;
  remark: string;
};

export default function LogisticsPaymentRequest({
  initialMode = "list",
  initialDraft,
}: {
  initialMode?: "list" | "create";
  initialDraft?: PaymentRequest;
}) {
  const [rows, setRows] = useState<PaymentRequest[]>(() => [...paymentRequestStore.rows]);
  const [pageMode, setPageMode] = useState<"list" | "create">(initialMode);
  const [createDraft, setCreateDraft] = useState<PaymentRequest>(() => initialDraft ?? paymentRequestStore.rows[0]);
  const [keyword, setKeyword] = useState("");
  const [sourceNo, setSourceNo] = useState("");
  const [firstLegNo, setFirstLegNo] = useState("");
  const [payee, setPayee] = useState("");
  const [paymentType, setPaymentType] = useState("");
  const [currency, setCurrency] = useState("");
  const [status, setStatus] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [applicant, setApplicant] = useState("");
  const [selected, setSelected] = useState<PaymentRequest | null>(null);
  const [editTarget, setEditTarget] = useState<PaymentRequest | null>(null);
  const [applyRecordRow, setApplyRecordRow] = useState<PaymentRequest | null>(null);
  const [paymentRecordRow, setPaymentRecordRow] = useState<PaymentRequest | null>(null);
  const [operationLogRow, setOperationLogRow] = useState<PaymentRequest | null>(null);
  const [applyTarget, setApplyTarget] = useState<PaymentRequest | null>(null);
  const [financeTarget, setFinanceTarget] = useState<PaymentRequest | null>(null);
  const [toast, setToast] = useState("");

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2400);
  };

  const syncRows = (next: PaymentRequest) => {
    upsertLogisticsPaymentRequest(next);
    setRows([...paymentRequestStore.rows]);
    setSelected((current) => current?.id === next.id ? next : current);
    setEditTarget((current) => current?.id === next.id ? next : current);
    setApplyRecordRow((current) => current?.id === next.id ? next : current);
    setPaymentRecordRow((current) => current?.id === next.id ? next : current);
    setOperationLogRow((current) => current?.id === next.id ? next : current);
  };

  const filteredRows = useMemo(() => rows.filter((row) => {
    const sourceText = row.sources.map((item) => item.reconciliationNo).join(",");
    const firstLegText = row.sources.map((item) => item.firstLegNo).join(",");
    return (!keyword || row.requestNo.includes(keyword))
      && (!sourceNo || sourceText.includes(sourceNo))
      && (!firstLegNo || firstLegText.includes(firstLegNo))
      && (!payee || row.payeeName.toLowerCase().includes(payee.toLowerCase()))
      && (!paymentType || row.paymentType === paymentType)
      && (!currency || row.receivingCurrency === currency)
      && (!status || row.status === status)
      && (!paymentStatus || row.paymentStatus === paymentStatus)
      && (!applicant || row.applicant === applicant);
  }), [applicant, currency, firstLegNo, keyword, payee, paymentStatus, paymentType, rows, sourceNo, status]);

  const openCreate = () => {
    const base = paymentRequestStore.rows[0];
    setCreateDraft({
      ...base,
      id: `pay-log-create-${Date.now()}`,
      requestNo: "系统保存后自动生成",
      status: "未请款",
      paymentStatus: "未付款",
      amounts: base.amounts.map((amount) => ({ ...amount, paidAmount: 0 })),
      applyRecords: [],
      paymentRecords: [],
      logs: [{ operatedAt: nowText, operator: "张三", action: "创建请款单", content: "手动进入创建请款单页面" }],
    });
    setPageMode("create");
  };

  const finalizeCreate = (action: "保存草稿" | "创建请款单") => {
    const requestNo = createDraft.requestNo === "系统保存后自动生成" ? `PAY-LOG-202606-${String(paymentRequestStore.rows.length + 1).padStart(4, "0")}` : createDraft.requestNo;
    const next: PaymentRequest = {
      ...createDraft,
      requestNo,
      status: "未请款",
      paymentStatus: "未付款",
      updatedAt: nowText,
      logs: [{ operatedAt: nowText, operator: "张三", action, content: action === "保存草稿" ? "保存物流费用付款单草稿" : "创建物流费用付款单并同步到列表" }, ...createDraft.logs],
    };
    setCreateDraft(next);
    syncRows(next);
    setPageMode("list");
    showToast(action === "保存草稿" ? "保存草稿成功，状态为未请款，已同步到物流费用请款列表" : "请款单创建成功，已同步到物流费用请款列表");
  };

  const resetFilters = () => {
    setKeyword("");
    setSourceNo("");
    setFirstLegNo("");
    setPayee("");
    setPaymentType("");
    setCurrency("");
    setStatus("");
    setPaymentStatus("");
    setApplicant("");
  };

  const openApplyPayment = (row: PaymentRequest) => {
    setApplyTarget(row);
  };

  const openEditPaymentRequest = (row: PaymentRequest) => {
    const reason = editDisabledReason(row);
    if (reason) {
      showToast(`${reason}。`);
      return;
    }
    setEditTarget(row);
  };

  const saveEditPaymentRequest = (next: PaymentRequest) => {
    syncRows(next);
    setEditTarget(null);
    showToast("编辑已保存，操作日志已更新");
  };

  const confirmApplyPayment = (draft: ApplyDraft) => {
    if (!applyTarget) return;
    if (draft.amount <= 0) return showToast("本次付款金额必须大于 0");
    if (draft.amount > remainingUnpaid(applyTarget)) return showToast("本次付款金额不能大于剩余付款金额");
    const nextApplied = totalAppliedAmount(applyTarget) + draft.amount;
    const requestTotal = totalRequestAmount(applyTarget);
    const nextRecord: LogisticsPaymentApplyRecord = {
      id: `apply-${Date.now()}`,
      applyNo: `REQ-PAY-${String(applyTarget.applyRecords.length + 1).padStart(3, "0")}`,
      appliedAt: nowText,
      applicant: "张三",
      applyType: draft.applyType,
      currency: draft.currency,
      applyAmount: draft.amount,
      applyRatio: 0,
      paymentRemark: draft.remark || draft.financeRemark,
      paymentStatus: "未付款",
    };
    const next: PaymentRequest = {
      ...applyTarget,
      status: nextApplied >= requestTotal ? "已请款" : "部分请款",
      updatedAt: nowText,
      applyRecords: [nextRecord, ...applyTarget.applyRecords],
      logs: [{ operatedAt: nowText, operator: "张三", action: "申请付款", content: `申请付款 ${money(draft.amount)} ${draft.currency}` }, ...applyTarget.logs],
    };
    syncRows(next);
    setApplyTarget(null);
    showToast("已生成请款记录");
  };

  const openMockFinancePayment = (row: PaymentRequest) => {
    if (!row.applyRecords.length) {
      showToast("请先申请付款，再模拟财务付款");
      return;
    }
    setFinanceTarget(row);
  };

  const confirmFinancePayment = (draft: FinanceDraft) => {
    if (!financeTarget) return;
    const applyRecord = financeTarget.applyRecords.find((item) => item.applyNo === draft.applyNo) ?? financeTarget.applyRecords[0];
    if (draft.amount <= 0) return showToast("付款金额必须大于 0");
    if (draft.amount > applyRecord.applyAmount) return showToast("付款金额不能超过请款记录申请金额");
    const nextPayment: LogisticsActualPaymentRecord = {
      id: `payment-${Date.now()}`,
      paymentNo: `PAYMENT-202606-${String(financeTarget.paymentRecords.length + 1).padStart(4, "0")}`,
      requestNo: financeTarget.requestNo,
      applyNo: applyRecord.applyNo,
      paidAt: draft.paidAt,
      payer: "财务A",
      payeeName: financeTarget.payeeName,
      payerEntity: financeTarget.payerEntity,
      paymentMethod: draft.paymentMethod,
      currency: draft.currency,
      paidAmount: draft.amount,
      bankAccount: financeTarget.bankAccount,
      bankName: financeTarget.bankName,
      swiftCode: financeTarget.swiftCode,
      voucher: draft.voucher,
      paymentRemark: draft.remark,
      amountInWords: amountWords(draft.currency, draft.amount),
      attachments: [{ id: `pay-att-${Date.now()}`, name: draft.voucher || "银行回单.pdf", type: "PDF", size: "720 KB", uploader: "财务A", uploadedAt: draft.paidAt }],
    };
    const nextPaid = totalPaidAmount(financeTarget) + draft.amount;
    const requestTotal = totalRequestAmount(financeTarget);
    const next: PaymentRequest = {
      ...financeTarget,
      status: nextPaid >= requestTotal ? "已完成" : financeTarget.status,
      paymentStatus: nextPaid >= requestTotal ? "已完成" : "部分付款",
      updatedAt: nowText,
      paymentRecords: [nextPayment, ...financeTarget.paymentRecords],
      applyRecords: financeTarget.applyRecords.map((item) => item.applyNo === applyRecord.applyNo ? { ...item, paymentStatus: draft.amount >= item.applyAmount ? "已付款" : "未付款", paidAt: draft.paidAt, paymentNo: nextPayment.paymentNo } : item),
      amounts: financeTarget.amounts.map((amount) => amount.currency === draft.currency ? { ...amount, paidAmount: amount.paidAmount + draft.amount } : amount),
      logs: [{ operatedAt: nowText, operator: "财务A", action: "财务付款", content: `付款 ${money(draft.amount)} ${draft.currency}` }, ...financeTarget.logs],
    };
    syncRows(next);
    setFinanceTarget(null);
    showToast("已生成付款记录并更新付款状态");
  };

  if (pageMode === "create") {
    return (
      <>
        <CreatePaymentRequestPage
          draft={createDraft}
          onChange={setCreateDraft}
          onBack={() => setPageMode("list")}
          onSaveDraft={() => finalizeCreate("保存草稿")}
          onCreateRequest={() => finalizeCreate("创建请款单")}
          onToast={showToast}
        />
        <Toast msg={toast} />
      </>
    );
  }

  return (
    <div>
      <PageHeader
        title="物流费用请款"
        desc="管理物流费用对账生成的请款单，支持申请付款、请款记录、操作日志和财务付款结果查看。"
        extra={<div className="flex gap-2">
          <button className="inline-flex h-8 items-center gap-1 rounded border border-gray-200 bg-white px-3 text-sm text-gray-700 hover:bg-gray-50" onClick={() => showToast("已导出当前筛选结果 Demo")}><Download size={14} />导出</button>
          <button className="inline-flex h-8 items-center gap-1 rounded bg-blue-600 px-3 text-sm text-white hover:bg-blue-700" onClick={openCreate}><Plus size={14} />新建请款单</button>
        </div>}
      />

      <section className="mb-3 border border-gray-200 bg-white px-3 py-3">
        <div className="grid gap-2 lg:grid-cols-6">
          <input className={inputClass} value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="请款单号" />
          <input className={inputClass} value={sourceNo} onChange={(event) => setSourceNo(event.target.value)} placeholder="来源对账单号" />
          <input className={inputClass} value={firstLegNo} onChange={(event) => setFirstLegNo(event.target.value)} placeholder="头程物流单号" />
          <input className={inputClass} value={payee} onChange={(event) => setPayee(event.target.value)} placeholder="收款人 / 物流商" />
          <select className={inputClass} value={paymentType} onChange={(event) => setPaymentType(event.target.value)}><option value="">付款类型</option><option>运费（内陆）</option><option>头程运费</option><option>清关费</option></select>
          <select className={inputClass} value={currency} onChange={(event) => setCurrency(event.target.value)}><option value="">收款币种</option><option>CNY</option><option>USD</option></select>
          <select className={inputClass} value={status} onChange={(event) => setStatus(event.target.value)}><option value="">请款状态</option>{["未请款", "部分请款", "已请款", "已完成"].map((item) => <option key={item}>{item}</option>)}</select>
          <select className={inputClass} value={paymentStatus} onChange={(event) => setPaymentStatus(event.target.value)}><option value="">付款状态</option>{["未付款", "部分付款", "已付款", "已完成"].map((item) => <option key={item}>{item}</option>)}</select>
          <select className={inputClass} value={applicant} onChange={(event) => setApplicant(event.target.value)}><option value="">申请人</option>{["张三", "李四", "王五", "赵六"].map((item) => <option key={item}>{item}</option>)}</select>
          <input className={inputClass} placeholder="创建时间范围" />
        </div>
        <div className="mt-3 flex gap-2">
          <button className="inline-flex h-8 items-center gap-1 rounded bg-blue-600 px-3 text-sm text-white"><Search size={14} />查询</button>
          <button className="h-8 rounded border border-gray-200 px-3 text-sm text-gray-600" onClick={resetFilters}>重置</button>
          <button className="h-8 rounded border border-gray-200 px-3 text-sm text-gray-600" onClick={() => showToast("已导出当前筛选结果 Demo")}>导出</button>
        </div>
      </section>

      <section className="overflow-x-auto border border-gray-200 bg-white">
        <table data-testid="logistics-payment-request-table" className="min-w-[2100px] text-left text-xs">
          <thead className="bg-gray-50 text-gray-700">
            <tr>{["请款单号", "付款类型", "收款人", "来源对账单号", "关联头程物流单号", "付款主体", "收款币种", "请款总金额", "已申请付款金额", "已付款金额", "剩余付款金额", "请款状态", "付款状态", "申请人", "创建时间", "操作"].map((item) => <th key={item} className="whitespace-nowrap border-b border-r border-gray-200 px-2 py-2 font-medium">{item}</th>)}</tr>
          </thead>
          <tbody>
            {filteredRows.map((row) => (
              <tr key={row.id} className="border-b border-gray-100 align-top hover:bg-blue-50/30">
                <td className="px-2 py-2 font-medium text-blue-600">{row.requestNo}</td>
                <td className="px-2 py-2">{row.paymentType}</td>
                <td className="max-w-[260px] px-2 py-2">{row.payeeName}</td>
                <td className="px-2 py-2">{row.sources.map((item) => item.reconciliationNo).join("、")}</td>
                <td className="px-2 py-2">{row.sources.map((item) => item.firstLegNo).join("、")}</td>
                <td className="px-2 py-2">{row.payerEntity}</td>
                <td className="px-2 py-2">{row.receivingCurrency}</td>
                <td className="px-2 py-2 font-semibold text-blue-700">{amountSummary(row)}</td>
                <td className="px-2 py-2 text-right">{money(totalAppliedAmount(row))}</td>
                <td className="px-2 py-2 text-right">{money(totalPaidAmount(row))}</td>
                <td className="px-2 py-2 text-right">{money(remainingUnpaid(row))}</td>
                <td className="px-2 py-2"><StatusTag value={row.status} /></td>
                <td className="px-2 py-2"><StatusTag value={row.paymentStatus} /></td>
                <td className="px-2 py-2">{row.applicant}</td>
                <td className="px-2 py-2">{row.createdAt}</td>
                <td className="sticky right-0 min-w-[270px] border-l border-gray-200 bg-white px-2 py-2 shadow-[-4px_0_8px_rgba(15,23,42,0.04)]">
                  <div className="flex flex-wrap gap-x-3 gap-y-2">
                    <button className="text-blue-600 hover:text-blue-800" onClick={() => setSelected(row)}>查看</button>
                    <button className={`${canEditRequest(row) ? "text-blue-600 hover:text-blue-800" : "cursor-not-allowed text-gray-400"}`} data-disabled={!canEditRequest(row)} title={editDisabledReason(row)} onClick={() => openEditPaymentRequest(row)}>编辑</button>
                    <button className="text-emerald-600 hover:text-emerald-800" onClick={() => openApplyPayment(row)}>申请付款</button>
                    <button className="text-indigo-600 hover:text-indigo-800" onClick={() => setPaymentRecordRow(row)}>付款记录</button>
                    <button className="text-amber-600 hover:text-amber-800" onClick={() => setApplyRecordRow(row)}>请款记录</button>
                    <button className="text-purple-600 hover:text-purple-800" onClick={() => setOperationLogRow(row)}>操作日志</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <PageLogic />

      <FormModal open={Boolean(selected)} onClose={() => setSelected(null)} title="物流费用请款详情" widthClass="w-[1180px]" sectionTitle="请款单详情">
        {selected && <RequestDetail row={selected} onToast={showToast} onApplyPayment={openApplyPayment} onMockFinancePayment={openMockFinancePayment} />}
      </FormModal>
      <FormModal open={Boolean(applyRecordRow)} onClose={() => setApplyRecordRow(null)} title="请款记录" widthClass="w-[1060px]" sectionTitle="请款记录">
        {applyRecordRow && <ApplyRecordsTable row={applyRecordRow} />}
      </FormModal>
      <FormModal open={Boolean(operationLogRow)} onClose={() => setOperationLogRow(null)} title="操作日志" widthClass="w-[900px]" sectionTitle="操作日志">
        {operationLogRow && <OperationLogTable row={operationLogRow} />}
      </FormModal>
      <FormModal open={Boolean(paymentRecordRow)} onClose={() => setPaymentRecordRow(null)} title="付款记录" widthClass="w-[980px]" sectionTitle="付款记录">
        {paymentRecordRow && <PaymentRecordsView row={paymentRecordRow} onToast={showToast} />}
      </FormModal>
      <EditPaymentRequestModal key={editTarget?.id ?? "edit-empty"} row={editTarget} onClose={() => setEditTarget(null)} onSave={saveEditPaymentRequest} onToast={showToast} />
      <ApplyPaymentModal row={applyTarget} onClose={() => setApplyTarget(null)} onConfirm={confirmApplyPayment} />
      <FinancePaymentModal row={financeTarget} onClose={() => setFinanceTarget(null)} onConfirm={confirmFinancePayment} />
      <Toast msg={toast} />
    </div>
  );
}

function ApplyPaymentModal({ row, onClose, onConfirm }: { row: PaymentRequest | null; onClose: () => void; onConfirm: (draft: ApplyDraft) => void }) {
  const remain = row ? remainingUnpaid(row) : 0;
  const currency = row ? mainCurrency(row) : "CNY";
  const [applyType, setApplyType] = useState<"全款" | "部分付款">("全款");
  const [amount, setAmount] = useState(remain);
  const [selectedCurrency, setSelectedCurrency] = useState<"USD" | "CNY">(currency);
  const [remark, setRemark] = useState("本次申请付款，请财务核对后付款。");
  const [financeRemark, setFinanceRemark] = useState("");
  if (!row) return null;
  const actualAmount = applyType === "全款" ? remain : amount;
  const exceed = actualAmount > remain;
  const firstSource = row.sources[0];
  return (
    <FormModal open={Boolean(row)} onClose={onClose} title="申请付款" widthClass="w-[980px]" sectionTitle="付款申请信息">
      <div className="max-h-[72vh] space-y-4 overflow-y-auto pr-1 text-sm">
        <section className="rounded border border-gray-200 bg-white p-4">
          <SectionTitle>一、付款单基础信息</SectionTitle>
          <InfoGrid items={[
            ["请款单号", row.requestNo],
            ["来源对账单号", firstSource?.reconciliationNo],
            ["头程物流单号", firstSource?.firstLegNo],
            ["头程物流商", firstSource?.provider],
            ["付款类型", row.paymentType],
            ["付款主体", row.payerEntity],
            ["付款方式", row.paymentMethod],
            ["付款性质", row.paymentNature],
            ["申请人", row.applicant],
            ["创建时间", row.createdAt],
          ]} />
        </section>

        <section className="rounded border border-gray-200 bg-white p-4">
          <SectionTitle>二、收款信息</SectionTitle>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            <div className="rounded border border-gray-100 bg-gray-50 px-3 py-2"><div className="text-xs text-gray-500">收款人（单位）名称</div><div className="mt-1 font-medium">{row.payeeName}</div></div>
            <div className="rounded border border-gray-100 bg-gray-50 px-3 py-2"><div className="text-xs text-gray-500">收款币种</div><div className="mt-1 font-medium">{currency}</div></div>
            <div className="rounded border border-gray-100 bg-gray-50 px-3 py-2"><div className="text-xs text-gray-500">开户行</div><div className="mt-1 font-medium">{row.bankName}</div></div>
            <div className="rounded border border-gray-100 bg-gray-50 px-3 py-2"><div className="text-xs text-gray-500">银行账号</div><div className="mt-1 flex items-center gap-2 font-medium">{row.bankAccount}<button className="rounded border border-gray-200 bg-white px-2 py-1 text-xs text-blue-600" onClick={() => navigator.clipboard?.writeText(row.bankAccount)}>复制</button></div></div>
            <div className="rounded border border-gray-100 bg-gray-50 px-3 py-2"><div className="text-xs text-gray-500">SWIFT CODE</div><div className="mt-1 font-medium">{row.swiftCode ?? "-"}</div></div>
            <div className="rounded border border-gray-100 bg-gray-50 px-3 py-2"><div className="text-xs text-gray-500">收款地址</div><div className="mt-1 font-medium">{row.payeeAddress ?? "-"}</div></div>
            <div className="rounded border border-gray-100 bg-gray-50 px-3 py-2"><div className="text-xs text-gray-500">联系人</div><div className="mt-1 font-medium">{row.contactName ?? "-"}</div></div>
            <div className="rounded border border-gray-100 bg-gray-50 px-3 py-2"><div className="text-xs text-gray-500">联系电话</div><div className="mt-1 font-medium">{row.contactPhone ?? "-"}</div></div>
          </div>
        </section>

        <section className="rounded border border-gray-200 bg-white p-4">
          <SectionTitle>三、金额信息</SectionTitle>
          <div className="rounded border border-blue-100 bg-blue-50 p-4">
            <div className="text-xs text-blue-700">剩余付款金额</div>
            <div className="mt-1 text-2xl font-semibold text-blue-900">{money(remain)} {currency}</div>
            <div className="mt-1 text-sm font-medium text-blue-800">金额大写：{amountWords(currency, totalRequestAmount(row))}</div>
          </div>
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            <div className="rounded border border-gray-100 bg-gray-50 px-3 py-2"><div className="text-xs text-gray-500">付款单总付款金额</div><div className="mt-1 font-semibold">{money(totalRequestAmount(row))} {currency}</div></div>
            <div className="rounded border border-gray-100 bg-gray-50 px-3 py-2"><div className="text-xs text-gray-500">已申请付款金额</div><div className="mt-1 font-semibold">{money(totalAppliedAmount(row))} {currency}</div></div>
            <div className="rounded border border-gray-100 bg-gray-50 px-3 py-2"><div className="text-xs text-gray-500">已付款金额</div><div className="mt-1 font-semibold">{money(totalPaidAmount(row))} {currency}</div></div>
            <div className="rounded border border-gray-100 bg-gray-50 px-3 py-2"><div className="text-xs text-gray-500">剩余付款金额</div><div className="mt-1 font-semibold text-blue-700">{money(remain)} {currency}</div></div>
            <div className="rounded border border-gray-100 bg-gray-50 px-3 py-2"><div className="text-xs text-gray-500">收款币种</div><div className="mt-1 font-semibold">{currency}</div></div>
            <div className="rounded border border-gray-100 bg-gray-50 px-3 py-2 md:col-span-2"><div className="text-xs text-gray-500">金额大写</div><div className="mt-1 font-semibold">{amountWords(currency, totalRequestAmount(row))}</div></div>
          </div>
        </section>

        <section className="rounded border border-gray-200 bg-white p-4">
          <SectionTitle>四、附件信息</SectionTitle>
          {row.attachments.length ? <AttachmentCards attachments={row.attachments} onAction={() => undefined} /> : <div className="rounded border border-gray-200 py-8 text-center text-gray-400">暂无附件</div>}
          <button className="mt-3 inline-flex h-8 items-center gap-1 rounded bg-[#009688] px-3 text-sm text-white" onClick={() => undefined}><Upload size={14} />继续上传附件</button>
          <div className="mt-2 text-xs text-gray-500">支持 PDF、PPT / PPTX、XLS / XLSX、JPG / JPEG / PNG / WEBP</div>
        </section>

        <section className="rounded border border-gray-200 bg-white p-4">
          <SectionTitle>五、历史请款记录</SectionTitle>
          <CompactApplyHistory row={row} />
        </section>

        <section className="rounded border border-gray-200 bg-white p-4">
          <SectionTitle>六、本次付款申请</SectionTitle>
          <div className="grid gap-3 md:grid-cols-2">
            <label className="grid gap-1"><span className="text-xs text-gray-500">付款类型</span><select className={inputClass} value={applyType} onChange={(event) => { const next = event.target.value as "全款" | "部分付款"; setApplyType(next); setAmount(next === "全款" ? remain : 0); }}><option>全款</option><option>部分付款</option></select></label>
            <label className="grid gap-1"><span className="text-xs text-gray-500">本次付款金额</span><div className="flex gap-2"><input className={`${inputClass} flex-1 text-right`} value={String(actualAmount)} disabled={applyType === "全款"} onChange={(event) => setAmount(Number(event.target.value) || 0)} /><select className={`${inputClass} w-24`} value={selectedCurrency} onChange={(event) => setSelectedCurrency(event.target.value as "USD" | "CNY")}><option>CNY</option><option>USD</option></select></div></label>
            <label className="grid gap-1"><span className="text-xs text-gray-500">付款日期</span><input className={inputClass} type="date" defaultValue="2026-06-18" /></label>
            <label className="grid gap-1 md:col-span-2"><span className="text-xs text-gray-500">付款说明</span><textarea className={`${inputClass} min-h-20 py-2`} value={remark} onChange={(event) => setRemark(event.target.value)} /></label>
            <label className="grid gap-1 md:col-span-2"><span className="text-xs text-gray-500">财务备注</span><textarea className={`${inputClass} min-h-20 py-2`} value={financeRemark} onChange={(event) => setFinanceRemark(event.target.value)} /></label>
            <div className="md:col-span-2 rounded border border-blue-100 bg-blue-50 px-3 py-2 text-xs text-blue-700">本次付款申请币种仅用于本次申请，不会修改付款单原始收款币种。</div>
          </div>
        </section>
      </div>
      {exceed && <div className="mt-3 rounded border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">本次付款金额不能大于剩余付款金额</div>}
      <div className="mt-4 flex justify-end gap-2 border-t pt-3">
        <button className="h-8 rounded border px-4 text-sm" onClick={onClose}>取消</button>
        <button className="h-8 rounded bg-blue-600 px-4 text-sm text-white disabled:bg-gray-300" disabled={exceed} onClick={() => onConfirm({ applyType, currency: selectedCurrency, amount: actualAmount, paymentDate: "2026-06-18", remark, financeRemark })}>确认申请付款</button>
      </div>
    </FormModal>
  );
}

function FinancePaymentModal({ row, onClose, onConfirm }: { row: PaymentRequest | null; onClose: () => void; onConfirm: (draft: FinanceDraft) => void }) {
  const firstApply = row?.applyRecords[0];
  const [applyNo, setApplyNo] = useState(firstApply?.applyNo ?? "");
  const [amount, setAmount] = useState(firstApply?.applyAmount ?? 0);
  const [currency, setCurrency] = useState<"USD" | "CNY">(firstApply?.currency ?? "CNY");
  const [voucher, setVoucher] = useState("BANK-RECEIPT-20260618.pdf");
  const [remark, setRemark] = useState("财务付款登记");
  if (!row || !firstApply) return null;
  const effectiveApplyNo = applyNo || firstApply.applyNo;
  const effectiveAmount = amount > 0 ? amount : firstApply.applyAmount;
  const effectiveCurrency = currency || firstApply.currency;
  return (
    <FormModal open={Boolean(row)} onClose={onClose} title="财务付款登记" widthClass="w-[720px]" sectionTitle="付款登记信息">
      <div className="grid gap-3 text-sm md:grid-cols-2">
        <label className="grid gap-1"><span className="text-xs text-gray-500">请款单号</span><input className={inputClass} value={row.requestNo} disabled /></label>
        <label className="grid gap-1"><span className="text-xs text-gray-500">请款记录号</span><select className={inputClass} value={effectiveApplyNo} onChange={(event) => { const next = row.applyRecords.find((item) => item.applyNo === event.target.value); setApplyNo(event.target.value); setAmount(next?.applyAmount ?? 0); setCurrency(next?.currency ?? "CNY"); }}>{row.applyRecords.map((item) => <option key={item.applyNo}>{item.applyNo}</option>)}</select></label>
        <label className="grid gap-1"><span className="text-xs text-gray-500">收款人</span><input className={inputClass} value={row.payeeName} disabled /></label>
        <label className="grid gap-1"><span className="text-xs text-gray-500">付款金额</span><input className={`${inputClass} text-right`} value={String(effectiveAmount)} onChange={(event) => setAmount(Number(event.target.value) || 0)} /></label>
        <label className="grid gap-1"><span className="text-xs text-gray-500">收款币种</span><select className={inputClass} value={effectiveCurrency} onChange={(event) => setCurrency(event.target.value as "USD" | "CNY")}><option>CNY</option><option>USD</option></select></label>
        <label className="grid gap-1"><span className="text-xs text-gray-500">付款时间</span><input className={inputClass} value="2026-06-18 15:30" disabled /></label>
        <label className="grid gap-1"><span className="text-xs text-gray-500">付款方式</span><select className={inputClass}><option>银行付款</option><option>现金</option><option>其他</option></select></label>
        <label className="grid gap-1"><span className="text-xs text-gray-500">付款凭证</span><input className={inputClass} value={voucher} onChange={(event) => setVoucher(event.target.value)} /></label>
        <label className="grid gap-1 md:col-span-2"><span className="text-xs text-gray-500">付款备注</span><textarea className={`${inputClass} min-h-20 py-2`} value={remark} onChange={(event) => setRemark(event.target.value)} /></label>
      </div>
      <div className="mt-4 flex justify-end gap-2 border-t pt-3">
        <button className="h-8 rounded border px-4 text-sm" onClick={onClose}>取消</button>
        <button className="h-8 rounded bg-emerald-600 px-4 text-sm text-white" onClick={() => onConfirm({ applyNo: effectiveApplyNo, amount: effectiveAmount, currency: effectiveCurrency, paidAt: "2026-06-18 15:30", paymentMethod: "银行付款", voucher, remark })}>确认财务付款</button>
      </div>
    </FormModal>
  );
}
