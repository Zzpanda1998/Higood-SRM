import type { LogisticsReconciliationRow } from "../types/finance";
import type { LogisticsPaymentRequest } from "../types/logisticsPaymentRequest";

const normalizeCurrency = (currency?: string): "USD" | "CNY" => (currency === "USD" ? "USD" : "CNY");
const currencyName = (currency: "USD" | "CNY") => (currency === "USD" ? "美元" : "人民币元");
const rate = (currency: "USD" | "CNY") => (currency === "USD" ? 7.21 : 1);
const cnyWords = (value: number) => {
  if (value === 3220) return "叁仟贰佰贰拾元整";
  if (value === 1500) return "壹仟伍佰元整";
  if (value === 22280) return "贰万贰仟贰佰捌拾元整";
  if (value === 11140) return "壹万壹仟壹佰肆拾元整";
  if (value === 12000) return "壹万贰仟元整";
  return `${value.toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} 元整`;
};

const baseAttachments = [
  { id: "att-1", name: "invoice-20260618.pdf", type: "PDF" as const, size: "1.8 MB", uploader: "张三", uploadedAt: "2026-06-18 10:25" },
  { id: "att-2", name: "statement-20260618.xlsx", type: "Excel" as const, size: "624 KB", uploader: "张三", uploadedAt: "2026-06-18 10:26" },
  { id: "att-3", name: "payment-proof.jpg", type: "Image" as const, size: "420 KB", uploader: "张三", uploadedAt: "2026-06-18 10:27" },
];

export const logisticsPaymentRequests: LogisticsPaymentRequest[] = [
  {
    id: "pay-log-1",
    requestNo: "PAY-LOG-202606-0001",
    paymentType: "头程运费",
    payeeName: "广州城际国际货运",
    payeeShortName: "广州城际",
    payeeAddress: "Hong Kong Central, Finance Street 88",
    contactName: "当前联系人",
    contactPhone: "+852 6688 1024",
    paymentDate: "2026-06-18",
    payerEntity: "HiGOOD LIVE Limited",
    paymentMethod: "银行付款",
    paymentNature: "全款",
    bankName: "JPMorgan Chase Bank N.A., Hong Kong Branch",
    bankAccount: "63003695501",
    swiftCode: "CHASHKHHXXX",
    receivingCurrency: "CNY",
    paymentRemark: "TB-2026-0004 已完成对账，需付 CNY 3,220.00；\n本次为头程运费付款申请。",
    internalRemark: "从物流费用对账生成，展示历史请款记录和附件。",
    financeRemark: "未发起请款，财务尚未付款。",
    status: "未请款",
    paymentStatus: "未付款",
    applicant: "张三",
    applicantDepartment: "采购部",
    createdAt: "2026-06-18 10:20",
    updatedAt: "2026-06-18 10:30",
    sources: [
      {
        reconciliationNo: "REC-LOG-202606-0004",
        firstLegNo: "TB-2026-0004",
        provider: "广州城际国际货运",
        channel: "华南头程快线",
        transportMethod: "陆运",
        domesticLogisticsNo: "DL-CN-20260601",
        feeType: "头程运费",
        reconciliationStatus: "已完成",
        currency: "CNY",
        confirmedPayable: 3220,
        requestedAmount: 0,
        currentRequestAmount: 3220,
        remark: "TB-2026-0004 已完成对账",
      },
    ],
    amounts: [
      {
        currency: "CNY",
        currencyName: "人民币元",
        requestAmount: 3220,
        paidAmount: 0,
        amountInWords: "叁仟贰佰贰拾元整",
        exchangeRate: 1,
        baseCurrencyAmount: 3220,
        requestedBefore: 0,
        remainingRequestable: 3220,
      },
    ],
    attachments: baseAttachments,
    applyRecords: [],
    paymentRecords: [],
    logs: [
      { operatedAt: "2026-06-18 10:20", operator: "张三", action: "创建请款单", content: "从物流费用对账记录创建请款单" },
      { operatedAt: "2026-06-18 10:25", operator: "张三", action: "上传附件", content: "上传 invoice-20260618.pdf、statement-20260618.xlsx、payment-proof.jpg" },
    ],
  },
  {
    id: "pay-log-2",
    requestNo: "PAY-LOG-202606-0002",
    paymentType: "头程运费",
    payeeName: "STARSHIP INTERNATIONAL LOGISTICS CO., LTD",
    payeeShortName: "STARSHIP",
    paymentDate: "2026-06-15",
    payerEntity: "HiGOOD LIVE Limited",
    paymentMethod: "银行付款",
    paymentNature: "部分款",
    bankName: "HSBC Hong Kong",
    bankAccount: "808-558399-001",
    swiftCode: "HSBCHKHHHKH",
    receivingCurrency: "USD",
    paymentRemark: "海运费分批申请付款。",
    status: "部分请款",
    paymentStatus: "部分付款",
    applicant: "李四",
    applicantDepartment: "采购部",
    createdAt: "2026-06-12 09:05",
    updatedAt: "2026-06-13 15:20",
    sources: [
      {
        reconciliationNo: "REC-LOG-202606-0004",
        firstLegNo: "TB-2026-0004",
        provider: "STARSHIP INTERNATIONAL LOGISTICS CO., LTD",
        channel: "上海海运雅加达线",
        transportMethod: "海运",
        domesticLogisticsNo: "DL-CN-20260604",
        feeType: "头程运费",
        reconciliationStatus: "已完成",
        currency: "USD",
        confirmedPayable: 1250,
        requestedAmount: 0,
        currentRequestAmount: 1250,
      },
    ],
    amounts: [
      { currency: "USD", currencyName: "美元", requestAmount: 1250, paidAmount: 600, amountInWords: "壹仟贰佰伍拾美元整", exchangeRate: 7.21, baseCurrencyAmount: 9012.5, requestedBefore: 0, remainingRequestable: 1250 },
    ],
    attachments: [{ id: "att-5", name: "I237085537印尼HGFAD202账单.xlsx", type: "Excel", size: "860 KB", uploader: "李四", uploadedAt: "2026-06-12 09:20" }],
    applyRecords: [
      { id: "apply-2", applyNo: "REQ-PAY-002", appliedAt: "2026-06-12 09:30", applicant: "李四", applyType: "部分付款", currency: "USD", applyAmount: 625, applyRatio: 0, paymentRemark: "先申请首笔运费。", paymentStatus: "已付款", paidAt: "2026-06-13 15:20", paymentNo: "PAYMENT-202606-0002" },
    ],
    paymentRecords: [
      {
        id: "payment-2",
        paymentNo: "PAYMENT-202606-0002",
        requestNo: "PAY-LOG-202606-0002",
        applyNo: "REQ-PAY-002",
        paidAt: "2026-06-13 15:20",
        payer: "财务A",
        payeeName: "STARSHIP INTERNATIONAL LOGISTICS CO., LTD",
        payerEntity: "HiGOOD LIVE Limited",
        paymentMethod: "银行付款",
        currency: "USD",
        paidAmount: 600,
        bankAccount: "808-558399-001",
        bankName: "HSBC Hong Kong",
        swiftCode: "HSBCHKHHHKH",
        voucher: "BANK-RECEIPT-20260613.pdf",
        paymentRemark: "首笔部分付款",
        amountInWords: "陆佰美元整",
        attachments: [{ id: "pay-att-2", name: "BANK-RECEIPT-20260613.pdf", type: "PDF", size: "620 KB", uploader: "财务A", uploadedAt: "2026-06-13 15:22" }],
      },
    ],
    logs: [
      { operatedAt: "2026-06-12 09:05", operator: "李四", action: "创建请款单", content: "创建头程运费请款单" },
      { operatedAt: "2026-06-12 09:30", operator: "李四", action: "申请付款", content: "申请部分付款 625.00 USD" },
    ],
  },
  {
    id: "pay-log-3",
    requestNo: "PAY-LOG-202606-0003",
    paymentType: "清关费",
    payeeName: "JAKARTA CUSTOMS SERVICE LTD",
    paymentDate: "2026-06-18",
    payerEntity: "HiGOOD LIVE Limited",
    paymentMethod: "银行付款",
    paymentNature: "部分款",
    bankName: "Bank Central Asia",
    bankAccount: "7788120099",
    swiftCode: "CENAIDJA",
    receivingCurrency: "CNY",
    paymentRemark: "清关费已完成完整请款，等待财务付款。",
    status: "已请款",
    paymentStatus: "未付款",
    applicant: "王五",
    applicantDepartment: "采购部",
    createdAt: "2026-06-14 16:10",
    updatedAt: "2026-06-14 16:10",
    sources: [
      {
        reconciliationNo: "REC-LOG-202606-0006",
        firstLegNo: "TB-2026-0006",
        provider: "JAKARTA CUSTOMS SERVICE LTD",
        channel: "雅加达清关服务",
        transportMethod: "海运",
        domesticLogisticsNo: "DL-CN-20260606",
        feeType: "清关费",
        reconciliationStatus: "已完成",
        currency: "CNY",
        confirmedPayable: 30000,
        requestedAmount: 10000,
        currentRequestAmount: 12000,
      },
    ],
    amounts: [{ currency: "CNY", currencyName: "人民币元", requestAmount: 12000, paidAmount: 0, amountInWords: "壹万贰仟元整", exchangeRate: 1, baseCurrencyAmount: 12000, requestedBefore: 10000, remainingRequestable: 20000 }],
    attachments: [{ id: "att-6", name: "清关服务报价单.pdf", type: "PDF", size: "740 KB", uploader: "王五", uploadedAt: "2026-06-14 16:11" }],
    applyRecords: [
      { id: "apply-3", applyNo: "REQ-PAY-003", appliedAt: "2026-06-18 09:30", applicant: "王五", applyType: "全款", currency: "CNY", applyAmount: 12000, applyRatio: 0, paymentRemark: "申请完整清关费用", paymentStatus: "未付款" },
    ],
    paymentRecords: [],
    logs: [
      { operatedAt: "2026-06-14 16:10", operator: "王五", action: "创建请款单", content: "创建清关费付款单" },
      { operatedAt: "2026-06-18 09:30", operator: "王五", action: "申请付款", content: "申请付款 12,000.00 CNY" },
    ],
  },
  {
    id: "pay-log-4",
    requestNo: "PAY-LOG-202606-0004",
    paymentType: "头程运费",
    payeeName: "广州城际国际货运",
    payeeShortName: "海航货运",
    payeeAddress: "Guangzhou Baiyun Logistics Park",
    contactName: "陈经理",
    contactPhone: "+86 138 0000 2604",
    paymentDate: "2026-06-18",
    payerEntity: "HiGOOD LIVE Limited",
    paymentMethod: "银行付款",
    paymentNature: "全款",
    bankName: "Bank of China Guangzhou Branch",
    bankAccount: "6217002606040001",
    swiftCode: "BKCHCNBJ400",
    receivingCurrency: "CNY",
    paymentRemark: "已完成付款的头程运费单据。",
    internalRemark: "用于展示已完成状态编辑按钮禁用。",
    financeRemark: "付款完成。",
    status: "已完成",
    paymentStatus: "已完成",
    applicant: "张三",
    applicantDepartment: "采购部",
    createdAt: "2026-06-18 11:20",
    updatedAt: "2026-06-18 15:20",
    sources: [
      {
        reconciliationNo: "REC-LOG-202606-0007",
        firstLegNo: "TB-2026-0007",
        provider: "广州城际国际货运",
        channel: "华南头程海运",
        transportMethod: "海运",
        domesticLogisticsNo: "DL-CN-20260607",
        feeType: "头程运费",
        reconciliationStatus: "已完成",
        currency: "CNY",
        confirmedPayable: 4580,
        requestedAmount: 0,
        currentRequestAmount: 4580,
        remark: "已完成付款 Mock",
      },
    ],
    amounts: [{ currency: "CNY", currencyName: "人民币元", requestAmount: 4580, paidAmount: 4580, amountInWords: "肆仟伍佰捌拾元整", exchangeRate: 1, baseCurrencyAmount: 4580, requestedBefore: 0, remainingRequestable: 4580 }],
    attachments: [{ id: "att-7", name: "completed-payment.pdf", type: "PDF", size: "540 KB", uploader: "张三", uploadedAt: "2026-06-18 11:25" }],
    applyRecords: [
      { id: "apply-4", applyNo: "REQ-PAY-004", appliedAt: "2026-06-18 11:30", applicant: "张三", applyType: "全款", currency: "CNY", applyAmount: 4580, applyRatio: 0, paymentRemark: "全款请款", paymentStatus: "已付款", paidAt: "2026-06-18 15:20", paymentNo: "PAYMENT-202606-0004" },
    ],
    paymentRecords: [
      { id: "payment-4", paymentNo: "PAYMENT-202606-0004", requestNo: "PAY-LOG-202606-0004", applyNo: "REQ-PAY-004", paidAt: "2026-06-18 15:20", payer: "财务A", payeeName: "广州城际国际货运", payerEntity: "HiGOOD LIVE Limited", paymentMethod: "银行付款", currency: "CNY", paidAmount: 4580, bankAccount: "6217002606040001", bankName: "Bank of China Guangzhou Branch", swiftCode: "BKCHCNBJ400", voucher: "BANK-RECEIPT-20260618.pdf", paymentRemark: "全款付款完成", amountInWords: "肆仟伍佰捌拾元整", attachments: [{ id: "pay-att-4", name: "BANK-RECEIPT-20260618.pdf", type: "PDF", size: "690 KB", uploader: "财务A", uploadedAt: "2026-06-18 15:22" }] },
    ],
    logs: [
      { operatedAt: "2026-06-18 11:20", operator: "张三", action: "创建请款单", content: "创建头程运费付款单" },
      { operatedAt: "2026-06-18 15:20", operator: "财务A", action: "财务付款", content: "付款 4,580.00 CNY" },
    ],
  },
];

export const paymentRequestStore = {
  rows: [...logisticsPaymentRequests],
};

export function upsertLogisticsPaymentRequest(row: LogisticsPaymentRequest) {
  const index = paymentRequestStore.rows.findIndex((item) => item.id === row.id);
  if (index >= 0) paymentRequestStore.rows[index] = row;
  else paymentRequestStore.rows.unshift(row);
}

export function createLogisticsPaymentRequestDraftFromRows(rows: LogisticsReconciliationRow[]): LogisticsPaymentRequest {
  const provider = rows[0]?.forwarderName || "WUHAN JINYANG INTERNATIONAL TRANSPORTATION CO., LTD";
  const sources = rows.map((row, index) => {
    const currency = normalizeCurrency(row.actualFee?.currency ?? row.estimatedFee.currency);
    const payable = row.actualFee?.totalFee ?? row.estimatedFee.totalFee;
    return {
      reconciliationNo: `REC-LOG-202606-${String(index + 1).padStart(4, "0")}`,
      firstLegNo: row.firstLegNo,
      provider,
      channel: row.forwarderChannelName ?? row.channel ?? "-",
      transportMethod: row.transportMethod ?? "-",
      domesticLogisticsNo: row.logisticsNo,
      feeType: row.transportMethod === "陆运" || row.transportMethod === "快递" ? "运费（内陆）" : "头程运费",
      reconciliationStatus: "已完成",
      currency,
      confirmedPayable: payable,
      requestedAmount: 0,
      currentRequestAmount: payable,
      remark: row.remark ?? `${row.firstLegNo} 已完成对账`,
    };
  });
  const groups = sources.reduce<Record<"USD" | "CNY", { confirmed: number; requested: number; current: number }>>((result, source) => {
    result[source.currency].confirmed += source.confirmedPayable;
    result[source.currency].requested += source.requestedAmount;
    result[source.currency].current += source.currentRequestAmount;
    return result;
  }, { USD: { confirmed: 0, requested: 0, current: 0 }, CNY: { confirmed: 0, requested: 0, current: 0 } });
  const amounts = (Object.entries(groups) as Array<["USD" | "CNY", { confirmed: number; requested: number; current: number }]>)
    .filter(([, value]) => value.current > 0)
    .map(([currency, value]) => ({
      currency,
      currencyName: currencyName(currency),
      requestAmount: value.current,
      paidAmount: 0,
      amountInWords: currency === "CNY" ? cnyWords(value.current) : `${value.current.toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD`,
      exchangeRate: rate(currency),
      baseCurrencyAmount: value.current * rate(currency),
      requestedBefore: value.requested,
      remainingRequestable: value.confirmed - value.requested,
    }));
  const mainCurrency = amounts[0]?.currency ?? "CNY";
  return {
    id: `pay-log-create-${Date.now()}`,
    requestNo: "系统保存后自动生成",
    paymentType: sources[0]?.feeType ?? "运费（内陆）",
    payeeName: provider,
    payeeShortName: provider,
    payeeAddress: "Hong Kong Central, Finance Street 88",
    contactName: "当前联系人",
    contactPhone: "+852 6688 1024",
    paymentDate: "2026-06-18",
    payerEntity: "HiGOOD LIVE Limited",
    paymentMethod: "银行付款",
    paymentNature: "全款",
    bankName: "JPMorgan Chase Bank N.A., Hong Kong Branch",
    bankAccount: "63003695501",
    swiftCode: "CHASHKHHXXX",
    receivingCurrency: mainCurrency,
    paymentRemark: sources.map((source) => `${source.remark ?? source.firstLegNo} 需付 ${source.currency} ${source.currentRequestAmount.toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}；`).join("\n"),
    internalRemark: "从物流费用对账页面勾选记录后进入创建请款单页面。",
    financeRemark: "",
    status: "未请款",
    paymentStatus: "未付款",
    applicant: "张三",
    applicantDepartment: "采购部",
    createdAt: "2026-06-18 10:00",
    updatedAt: "2026-06-18 10:00",
    sources,
    amounts,
    attachments: baseAttachments.slice(0, 2).map((item) => ({ ...item, uploader: "张三", uploadedAt: "2026-06-18 10:02" })),
    applyRecords: [],
    paymentRecords: [],
    logs: [{ operatedAt: "2026-06-18 10:00", operator: "张三", action: "创建请款单", content: `从 ${sources.length} 条物流费用对账记录进入创建请款单页面` }],
  };
}
