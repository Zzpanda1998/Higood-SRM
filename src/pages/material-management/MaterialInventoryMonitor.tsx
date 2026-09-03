import { Fragment, useMemo, useState } from "react";
import { Plus, RefreshCw, Search, X } from "lucide-react";

type MonitorRow = {
  id: number;
  spu: string;
  sku: string;
  name: string;
  type: "面料" | "辅料";
  unit: string;
  stock: number;
  threshold: number;
  usage: number;
  stockText: string[];
  processing: boolean;
  process: string;
  factory: string;
  thresholdMode?: "按阈值比例" | "按固定数量";
  thresholdRatio?: number;
  fixedTrigger?: number;
  replenishmentTarget?: number;
  purchaseRule?: string;
  transferRule?: string;
  blankSpu?: string;
  blankSku: string;
  blankName: string;
  blankStock: number;
  status: string;
  decision: string;
  document: string;
  documentNo: string;
  progress: string;
  removed?: boolean;
};
type Log = {
  time: string;
  action: string;
  content: string;
  sku: string;
  document?: string;
};
type GeneratedRecord = {
  monitorId: number;
  time: string;
  method: string;
  type: "调拨单" | "面辅料采购单";
  no: string;
  objectSku: string;
  qty: number;
  processNo: string;
  status: string;
  operator: string;
  processRecords?: {
    no: string;
    process: string;
    receiveSku: string;
    qty: number;
    outputSku: string;
    outputQty: number;
  }[];
};

const initial: MonitorRow[] = [
  {
    id: 1,
    spu: "SKU001",
    sku: "SKU001-BLUE",
    name: "SKU001蓝色面料",
    type: "面料",
    unit: "米",
    stock: 1800,
    threshold: 4000,
    usage: 620,
    stockText: ["原料仓 / A01-01-01 / 3卷 / 1,800米"],
    processing: true,
    process: "染色",
    factory: "宏达染厂",
    blankSku: "SKU001-WHITE",
    blankName: "SKU001白色坯布",
    blankStock: 200,
    status: "待调拨",
    decision: "调拨加工",
    document: "-",
    documentNo: "",
    progress: "待调拨",
    blankSpu: "SKU001",
  },
  {
    id: 2,
    spu: "SKU002",
    sku: "SKU002-RED",
    name: "SKU002红色面料",
    type: "面料",
    unit: "米",
    stock: 600,
    threshold: 2000,
    usage: 780,
    stockText: ["原料仓 / A03-01-01 / 1卷 / 600米"],
    processing: true,
    process: "染色 / 印花",
    factory: "华彩染厂",
    blankSku: "SKU002-WHITE",
    blankName: "SKU002白色坯布",
    blankStock: 300,
    status: "待采购",
    decision: "采购坯布后加工",
    document: "-",
    documentNo: "",
    progress: "待采购",
    blankSpu: "SKU002",
  },
  {
    id: 3,
    spu: "ACC-200",
    sku: "ACC-2002",
    name: "白色纽扣",
    type: "辅料",
    unit: "个",
    stock: 800,
    threshold: 2000,
    usage: 3500,
    stockText: ["原料仓 / B02-01-01 / 8包 / 800个"],
    processing: false,
    process: "无",
    factory: "",
    blankSku: "",
    blankName: "",
    blankStock: 0,
    status: "待采购",
    decision: "直接采购",
    document: "-",
    documentNo: "",
    progress: "待采购",
  },
  {
    id: 4,
    spu: "FAB-720",
    sku: "FAB-7208",
    name: "弹力罗纹布",
    type: "面料",
    unit: "米",
    stock: 1680,
    threshold: 2200,
    usage: 510,
    stockText: [
      "原料仓 / A05-01-01 / 3卷 / 860米",
      "原料仓 / A05-01-02 / 2卷 / 520米",
      "中转仓 / B02-01-01 / 1卷 / 300米",
    ],
    processing: true,
    process: "染色",
    factory: "宏达染厂",
    blankSku: "FAB-7208-WHITE",
    blankName: "弹力罗纹坯布",
    blankStock: 800,
    status: "正常",
    decision: "无需处理",
    document: "-",
    documentNo: "",
    progress: "未触发",
  },
  {
    id: 5,
    spu: "FAB-900",
    sku: "FAB-9003",
    name: "数码印花底布",
    type: "面料",
    unit: "米",
    stock: 260,
    threshold: 1000,
    usage: 430,
    stockText: ["原料仓 / A09-01-02 / 1卷 / 260米"],
    processing: true,
    process: "印花",
    factory: "彩艺印花厂",
    blankSku: "FAB-9003-WHITE",
    blankName: "本白数码底布",
    blankStock: 80,
    status: "缺货风险",
    decision: "采购坯布后加工",
    document: "待生成",
    documentNo: "",
    progress: "待处理",
  },
];
const triggerLine = (r: MonitorRow) =>
  r.thresholdMode === "按固定数量"
    ? (r.fixedTrigger ?? 0)
    : r.threshold * (r.thresholdRatio ?? 0.5);
const shortage = (r: MonitorRow) => r.stock < triggerLine(r);
const suggested = (r: MonitorRow) => Math.max(0, 2000 - r.stock);
const ruleError = (r: MonitorRow) =>
  !r.sku ||
  r.threshold <= 0 ||
  (r.processing && (!r.process || r.process === "无" || !r.blankSku));
const monitorStatus = (r: MonitorRow) =>
  r.removed
    ? "已停用"
    : ruleError(r)
      ? "规则异常"
      : shortage(r)
        ? "库存不足"
        : "库存充足";
const transferAllowed = (r: MonitorRow) =>
  shortage(r) &&
  suggested(r) > 0 &&
  r.processing &&
  Boolean(r.blankSku) &&
  r.blankStock >= suggested(r);
const purchaseAllowed = (r: MonitorRow) =>
  shortage(r) && suggested(r) > 0 && !transferAllowed(r);
const tone = (v: string) =>
  v === "库存充足" ||
  v.includes("正常") ||
  v.includes("足够") ||
  v === "无需处理"
    ? "bg-emerald-50 text-emerald-700"
    : v === "库存不足"
      ? "bg-red-50 text-red-700"
      : v.includes("缺货") || v.includes("不足") || v.includes("待处理")
        ? "bg-amber-50 text-amber-700"
        : v === "未触发"
          ? "bg-gray-100 text-gray-600"
          : "bg-blue-50 text-blue-700";
const Btn = ({
  children,
  onClick,
  secondary = false,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  secondary?: boolean;
}) => (
  <button
    onClick={onClick}
    className={`inline-flex h-8 items-center gap-1.5 rounded px-3 text-sm ${secondary ? "border bg-white text-gray-700 hover:bg-gray-50" : "bg-blue-600 text-white hover:bg-blue-700"}`}
  >
    {children}
  </button>
);

export default function MaterialInventoryMonitor() {
  const [rows, setRows] = useState(initial),
    [keyword, setKeyword] = useState(""),
    [query, setQuery] = useState("");
  const [type, setType] = useState("全部"),
    [processing, setProcessing] = useState("全部"),
    [status, setStatus] = useState("全部");
  const [edit, setEdit] = useState<MonitorRow | null>(null),
    [detail, setDetail] = useState<MonitorRow | null>(null),
    [docAction, setDocAction] = useState<{
      row: MonitorRow;
      type: "采购" | "调拨";
    } | null>(null),
    [adding, setAdding] = useState(false),
    [toast, setToast] = useState("");
  const [logs, setLogs] = useState<Log[]>([
    {
      time: "2026-09-01 17:10",
      action: "编辑监控规则",
      content: "配置库存不足规则及调拨单触发规则",
      sku: "SKU001-BLUE",
      document: "DB-202609-0001",
    },
  ]);
  const [records, setRecords] = useState<GeneratedRecord[]>([
    {
      monitorId: 1,
      time: "2026-09-02 09:30",
      method: "手动生成",
      type: "调拨单",
      no: "DB-202609-0001",
      objectSku: "SKU001-WHITE",
      qty: 200,
      processNo: "2",
      status: "待调拨",
      operator: "张三",
      processRecords: [
        {
          no: "JG-202609-0001",
          process: "染色",
          receiveSku: "SKU001-WHITE",
          qty: 200,
          outputSku: "SKU001-DYED",
          outputQty: 196,
        },
        {
          no: "JG-202609-0002",
          process: "绣花",
          receiveSku: "SKU001-DYED",
          qty: 196,
          outputSku: "SKU001-BLUE",
          outputQty: 190,
        },
      ],
    },
    {
      monitorId: 2,
      time: "2026-09-02 09:40",
      method: "手动生成",
      type: "面辅料采购单",
      no: "MP-202609-0002",
      objectSku: "SKU002-WHITE",
      qty: 1400,
      processNo: "-",
      status: "待下单",
      operator: "张三",
    },
  ]);
  const now = () =>
    new Date().toLocaleString("zh-CN", { hour12: false }).replaceAll("/", "-");
  const notify = (s: string) => {
    setToast(s);
    setTimeout(() => setToast(""), 2600);
  };
  const log = (x: Omit<Log, "time">) =>
    setLogs((v) => [{ ...x, time: now() }, ...v]);
  const visible = useMemo(
    () =>
      rows.filter(
        (r) =>
          !r.removed &&
          (!query ||
            `${r.spu} ${r.sku}`.toLowerCase().includes(query.toLowerCase())) &&
          (type === "全部" || r.type === type) &&
          (processing === "全部" ||
            (r.processing ? "是" : "否") === processing) &&
          (status === "全部" || monitorStatus(r) === status),
      ),
    [rows, query, type, processing, status],
  );
  const refreshRules = () => {
    log({
      action: "刷新库存",
      content: "刷新目标 SKU 库存并重新计算长期监控状态",
      sku: "全部",
    });
    notify("库存和监控状态已刷新");
  };
  const save = (r: MonitorRow) => {
    const next = { ...r, status: monitorStatus(r) };
    setRows((v) =>
      v.some((x) => x.id === next.id)
        ? v.map((x) => (x.id === next.id ? next : x))
        : [...v, next],
    );
    log({
      action: adding ? "添加监控 SKU" : "编辑监控规则",
      content: `阈值 ${r.threshold}；${r.processing ? `${r.process} / ${r.blankSku}` : "无需加工"}`,
      sku: r.sku,
    });
    setAdding(false);
    setEdit(null);
    notify("保存监控规则成功。");
  };
  return (
    <div className="space-y-3">
      <div className="rounded-lg border bg-white px-5 py-4">
        <div className="flex justify-between">
          <div>
            <div className="text-xs text-gray-500">
              原料管理 / 面辅料库存监控
            </div>
            <h1 className="mt-1 text-xl font-semibold">面辅料库存监控</h1>
            <p className="mt-1 text-sm text-gray-500">
              长期监控关键面辅料 SKU 库存；生成业务单据后监控规则仍持续有效。
            </p>
          </div>
          <div className="flex gap-2">
            <Stat
              n={rows.filter(shortage).length}
              label="库存不足"
              color="amber"
            />
            <Stat
              n={rows.filter((r) => monitorStatus(r) === "库存充足").length}
              label="库存充足"
              color="blue"
            />
            <Stat n={records.length} label="历史单据" color="emerald" />
          </div>
        </div>
      </div>
      <div className="rounded-lg border bg-white">
        <div className="flex flex-wrap items-end gap-2 border-b bg-gray-50/60 p-4">
          <Field label="SPU / SKU">
            <div className="relative">
              <Search
                size={15}
                className="absolute left-2.5 top-2.5 text-gray-400"
              />
              <input
                className="input w-52 pl-8"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="输入 SPU / SKU"
              />
            </div>
          </Field>
          <Select
            label="类型"
            value={type}
            set={setType}
            options={["全部", "面料", "辅料"]}
          />
          <Select
            label="是否需要加工"
            value={processing}
            set={setProcessing}
            options={["全部", "是", "否"]}
          />
          <Select
            label="目标 SKU 库存状态"
            value={status}
            set={setStatus}
            options={[
              "全部",
              "监控中",
              "库存充足",
              "库存不足",
              "规则异常",
              "已停用",
            ]}
          />
          <Btn onClick={() => setQuery(keyword)}>查询</Btn>
          <Btn
            secondary
            onClick={() => {
              setKeyword("");
              setQuery("");
              setType("全部");
              setProcessing("全部");
              setStatus("全部");
            }}
          >
            重置
          </Btn>
          <div className="ml-auto flex gap-2">
            <Btn secondary onClick={refreshRules}>
              <RefreshCw size={15} />
              批量刷新库存
            </Btn>
            <Btn
              secondary
              onClick={() => {
                setAdding(true);
                setEdit({
                  ...initial[0],
                  id: Math.max(...rows.map((r) => r.id)) + 1,
                  spu: "",
                  sku: "",
                  name: "",
                  stock: 0,
                  threshold: 2000,
                  usage: 0,
                  stockText: ["暂无库存明细"],
                  status: "正常",
                  decision: "无需处理",
                  document: "-",
                  documentNo: "",
                  progress: "未触发",
                });
              }}
            >
              <Plus size={15} />
              手动添加监控 SKU
            </Btn>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-[1750px] w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                {[
                  "图片/名称",
                  "目标 SKU",
                  "类型",
                  "目标 SKU 库存",
                  "阈值",
                  "目标 SKU 库存状态",
                  "库存不足条件",
                  "近7天使用",
                  "是否加工/工序",
                  "胚布/原料 SKU",
                  "胚布/原料名称",
                  "胚布库存",
                  "操作",
                ].map((x) => (
                  <th key={x} className="px-3 py-3 font-medium">
                    {x}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {visible.map((r) => (
                <tr key={r.id} className="hover:bg-blue-50/30">
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded ${r.type === "面料" ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-700"}`}
                      >
                        {r.type}
                      </div>
                      <div>
                        <b className="text-sm">{r.name}</b>
                        <div className="text-gray-400">{r.spu}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 font-medium text-blue-700">{r.sku}</td>
                  <td className="px-3">{r.type}</td>
                  <td className="px-3 leading-5">
                    {r.stockText.map((x) => (
                      <div key={x}>{x}</div>
                    ))}
                    <b>
                      合计：{r.stock.toLocaleString()}
                      {r.unit}
                    </b>
                  </td>
                  <td className="px-3">
                    <b>{r.threshold.toLocaleString()}</b>
                  </td>
                  <td className="px-3">
                    <Tag text={monitorStatus(r)} />
                  </td>
                  <td className="px-3">
                    <div>
                      {(r.thresholdMode || "按阈值比例") === "按阈值比例"
                        ? `当前库存 < 阈值 × ${r.thresholdRatio ?? 0.5}`
                        : `当前库存 < ${r.fixedTrigger ?? 1000}`}
                    </div>
                    <div className="text-gray-400">触发线 {triggerLine(r)}</div>
                  </td>
                  <td className="px-3">
                    {r.usage.toLocaleString()}
                    {r.unit}
                  </td>
                  <td className="px-3">
                    {r.processing ? "是" : "否"}
                    <div className="text-gray-400">{r.process}</div>
                  </td>
                  <td className="px-3">
                    <b>{r.blankSku || "-"}</b>
                  </td>
                  <td className="px-3">{r.blankName || "-"}</td>
                  <td className="px-3 leading-5">
                    {r.processing && r.blankSku ? (
                      <>
                        <div>
                          原料仓 / P01-01-01 /{" "}
                          {Math.max(1, Math.ceil(r.blankStock / 200))}卷 /{" "}
                          {r.blankStock.toLocaleString()}
                          {r.unit}
                        </div>
                        <b>
                          合计：{Math.max(1, Math.ceil(r.blankStock / 200))}卷 /{" "}
                          {r.blankStock.toLocaleString()}
                          {r.unit}
                        </b>
                      </>
                    ) : (
                      <span className="text-gray-400">无需加工</span>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex flex-col items-start gap-1.5 whitespace-nowrap">
                      <button
                        onClick={() => {
                          setAdding(false);
                          setEdit({ ...r });
                        }}
                        className="text-blue-600"
                      >
                        编辑
                      </button>
                      <button
                        disabled={!transferAllowed(r)}
                        title={
                          transferAllowed(r)
                            ? "生成调拨单"
                            : "当前不满足调拨规则"
                        }
                        onClick={() => setDocAction({ row: r, type: "调拨" })}
                        className={
                          transferAllowed(r)
                            ? "text-blue-600"
                            : "cursor-not-allowed text-gray-300"
                        }
                      >
                        生成调拨单
                      </button>
                      <button
                        disabled={!purchaseAllowed(r)}
                        title={
                          purchaseAllowed(r)
                            ? "生成面辅料采购单"
                            : "当前不满足采购规则"
                        }
                        onClick={() => setDocAction({ row: r, type: "采购" })}
                        className={
                          purchaseAllowed(r)
                            ? "text-blue-600"
                            : "cursor-not-allowed text-gray-300"
                        }
                      >
                        生成面辅料采购单
                      </button>
                      <button
                        onClick={() => {
                          setDetail(r);
                          log({
                            action: "查看记录",
                            content: "查看库存监控历史生成记录",
                            sku: r.sku,
                            document: r.documentNo,
                          });
                        }}
                        className="text-blue-600"
                      >
                        查看记录
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <Prd />
      <div className="rounded-lg border bg-white">
        <div className="border-b px-4 py-3 font-medium">操作日志</div>
        <div className="divide-y">
          {logs.slice(0, 6).map((l, i) => (
            <div
              key={i}
              className="grid grid-cols-[160px_140px_1fr_140px] gap-3 px-4 py-3 text-xs"
            >
              <span className="text-gray-400">{l.time}</span>
              <b>{l.action}</b>
              <span>{l.content}</span>
              <span className="text-blue-600">{l.document || l.sku}</span>
            </div>
          ))}
        </div>
      </div>
      {edit && (
        <RuleModal
          row={edit}
          adding={adding}
          onClose={() => {
            setEdit(null);
            setAdding(false);
          }}
          onSave={save}
        />
      )}{" "}
      {detail && (
        <Detail
          row={detail}
          records={records.filter((x) => x.monitorId === detail.id)}
          onClose={() => setDetail(null)}
        />
      )}{" "}
      {docAction && (
        <DocumentModal
          action={docAction}
          onClose={() => setDocAction(null)}
          onConfirm={({ qty, syncProcess, warehouse, target }) => {
            const prefix = docAction.type === "采购" ? "MP" : "DB";
            const seq = records.length + 1;
            const no = `${prefix}-202609-${String(seq).padStart(4, "0")}`;
            const processNo =
              docAction.row.processing && syncProcess
                ? `JG-202609-${String(seq).padStart(4, "0")}`
                : "-";
            setRecords((v) => [
              {
                monitorId: docAction.row.id,
                time: now(),
                method: "手动生成",
                type: docAction.type === "采购" ? "面辅料采购单" : "调拨单",
                no,
                objectSku: docAction.row.processing
                  ? docAction.row.blankSku
                  : docAction.row.sku,
                qty,
                processNo,
                status: docAction.type === "采购" ? "待下单" : "待调拨",
                operator: "张三",
              },
              ...v,
            ]);
            log({
              action: docAction.type === "采购" ? "下采购单" : "生成调拨单",
              content: `数量 ${qty}${docAction.row.unit}${docAction.type === "调拨" ? `，${warehouse} → ${target}` : ""}${processNo !== "-" ? `，同步生成加工单 ${processNo}` : ""}；监控对象继续有效`,
              sku: docAction.row.sku,
              document: no,
            });
            setDocAction(null);
            notify(`${docAction.type}单已生成`);
          }}
        />
      )}
      {toast && (
        <div className="fixed bottom-5 right-5 z-[90] rounded bg-gray-900 px-4 py-3 text-sm text-white shadow">
          {toast}
        </div>
      )}
    </div>
  );
}
function Tag({ text }: { text: string }) {
  return (
    <span className={`whitespace-nowrap rounded-full px-2 py-1 ${tone(text)}`}>
      {text}
    </span>
  );
}
function Stat({
  n,
  label,
  color,
}: {
  n: number;
  label: string;
  color: string;
}) {
  const colors: Record<string, string> = {
    amber: "bg-amber-50 text-amber-700",
    blue: "bg-blue-50 text-blue-700",
    emerald: "bg-emerald-50 text-emerald-700",
  };
  return (
    <div className={`rounded px-4 py-2 text-center ${colors[color]}`}>
      <b className="block text-lg">{n}</b>
      <span className="text-xs">{label}</span>
    </div>
  );
}
function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="text-xs text-gray-500">
      <span className="mb-1 block">{label}</span>
      {children}
    </label>
  );
}
function Select({
  label,
  value,
  set,
  options,
}: {
  label: string;
  value: string;
  set: (v: string) => void;
  options: string[];
}) {
  return (
    <Field label={label}>
      <select
        className="input w-36"
        value={value}
        onChange={(e) => set(e.target.value)}
      >
        {options.map((x) => (
          <option key={x}>{x}</option>
        ))}
      </select>
    </Field>
  );
}
function Modal({
  title,
  onClose,
  children,
  large = false,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  large?: boolean;
}) {
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/45 p-5 backdrop-blur-[2px]">
      <div
        className={`max-h-[94vh] w-full overflow-auto rounded-xl border border-white/60 bg-slate-50 shadow-[0_24px_80px_rgba(15,23,42,0.28)] ${large ? "min-h-[78vh] max-w-[1500px]" : "max-w-6xl"}`}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white/95 px-6 py-4 backdrop-blur">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
            <div className="mt-1 h-0.5 w-8 rounded-full bg-blue-600" />
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
function Info({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs text-gray-500">{label}</div>
      <div className="mt-1 text-sm font-medium">{value}</div>
    </div>
  );
}
function PurchaseFormRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[80px_minmax(0,1fr)] items-start gap-3">
      <div className="pt-1.5 text-right text-gray-700">{label}</div>
      <div>{children}</div>
    </div>
  );
}
function Box({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      <h3 className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white px-4 py-3 text-sm font-semibold text-slate-800">
        {title}
      </h3>
      <div className="p-5">{children}</div>
    </section>
  );
}
function RuleModal({
  row,
  adding,
  onClose,
  onSave,
}: {
  row: MonitorRow;
  adding: boolean;
  onClose: () => void;
  onSave: (r: MonitorRow) => void;
}) {
  const [r, setR] = useState(row);
  const patch = (p: Partial<MonitorRow>) => setR((v) => ({ ...v, ...p }));
  return (
    <Modal
      title={adding ? "手动添加面辅料库存监控" : "编辑库存监控规则"}
      onClose={onClose}
    >
      <div className="mb-5 rounded-xl border border-blue-100 bg-blue-50/70 px-4 py-3 text-sm text-blue-800">
        配置目标 SKU 的库存判断、加工方式与坯布匹配关系。带 * 的字段为必填项。
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <Box title="一、目标 SKU 信息">
          <div className="grid grid-cols-2 gap-4">
            <Field label="SPU *">
              <select
                className="input"
                value={r.spu}
                onChange={(e) => patch({ spu: e.target.value, sku: "" })}
              >
                <option value="">请输入完整 SPU 后选择</option>
                {[...new Set(initial.map((x) => x.spu))].map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </Field>
            <Field label="目标 SKU *">
              <select
                className="input"
                value={r.sku}
                onChange={(e) => {
                  const found = initial.find((x) => x.sku === e.target.value);
                  if (found)
                    patch({
                      ...found,
                      id: r.id,
                      documentNo: r.documentNo,
                      status: r.status,
                      progress: r.progress,
                    });
                }}
              >
                <option value="">请输入完整 SKU 后选择</option>
                {initial
                  .filter((x) => x.spu === r.spu)
                  .map((x) => (
                    <option key={x.sku}>{x.sku}</option>
                  ))}
              </select>
            </Field>
            <Info label="面辅料名称（SKU 自动带出）" value={r.name || "-"} />
            <Info label="类型（SKU 自动带出）" value={r.type || "-"} />
            <Info
              label="规格 / 颜色"
              value={
                r.sku.includes("BLUE")
                  ? "蓝色"
                  : r.sku.includes("RED")
                    ? "红色"
                    : "标准规格"
              }
            />
            <Info label="基础单位" value={r.unit} />
          </div>
        </Box>
        <Box title="二、库存与阈值规则">
          <div className="grid grid-cols-3 gap-4">
            <Info label="当前库存" value={`${r.stock}${r.unit}`} />
            <Field label="阈值 *">
              <input
                type="number"
                className="input"
                value={r.threshold}
                onChange={(e) => patch({ threshold: +e.target.value })}
              />
            </Field>
            <Select
              label="库存不足判断方式 *"
              value={r.thresholdMode || "按阈值比例"}
              set={(v) =>
                patch({ thresholdMode: v as "按阈值比例" | "按固定数量" })
              }
              options={["按阈值比例", "按固定数量"]}
            />
            {(r.thresholdMode || "按阈值比例") === "按阈值比例" ? (
              <Field label="阈值比例 *">
                <input
                  type="number"
                  step="0.1"
                  className="input"
                  value={r.thresholdRatio ?? 0.5}
                  onChange={(e) => patch({ thresholdRatio: +e.target.value })}
                />
              </Field>
            ) : (
              <Field label="固定触发数量 *">
                <input
                  type="number"
                  className="input"
                  value={r.fixedTrigger ?? 1000}
                  onChange={(e) => patch({ fixedTrigger: +e.target.value })}
                />
              </Field>
            )}
            <Info label="触发线" value={triggerLine(r)} />
            <Info label="近 7 天使用" value={r.usage} />
            <Info label="建议补货" value={suggested(r)} />
            <div className="col-span-3 rounded bg-amber-50 p-2 text-xs text-amber-800">
              库存不足条件：当前库存 &lt;{" "}
              {(r.thresholdMode || "按阈值比例") === "按阈值比例"
                ? `阈值 × ${r.thresholdRatio ?? 0.5}`
                : `固定数量 ${r.fixedTrigger ?? 1000}`}
              ；当前结果：{shortage(r) ? "库存不足" : "库存正常"}
            </div>
            <div className="col-span-3 grid grid-cols-2 gap-4">
              <Info
                label="采购单触发规则"
                value="目标 SKU 库存不足，且无法触发调拨单时可生成"
              />
              <Info
                label="调拨单触发规则"
                value="目标 SKU 库存不足，已设置胚布 SKU，且胚布库存 ≥ 建议补货数量"
              />
            </div>
          </div>
        </Box>
        <Box title="三、加工规则">
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="是否需要加工"
              value={r.processing ? "是" : "否"}
              set={(v) =>
                patch({
                  processing: v === "是",
                  process: v === "是" ? "染色" : "无",
                })
              }
              options={["是", "否"]}
            />
            {r.processing && (
              <div className="col-span-2">
                <div className="mb-2 text-xs text-gray-500">
                  加工工序（可多选）*
                </div>
                <div className="flex gap-4">
                  {["染色", "印花", "绣花", "花边"].map((x) => {
                    const selected = r.process.split(" / ").includes(x);
                    return (
                      <label
                        key={x}
                        className={`cursor-pointer rounded border px-3 py-2 text-sm ${selected ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200"}`}
                      >
                        <input
                          type="checkbox"
                          className="mr-2"
                          checked={selected}
                          onChange={() => {
                            const list =
                              r.process === "无"
                                ? []
                                : r.process.split(" / ").filter(Boolean);
                            patch({
                              process:
                                (selected
                                  ? list.filter((v) => v !== x)
                                  : [...list, x]
                                ).join(" / ") || "无",
                            });
                          }}
                        />
                        {x}
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </Box>
        <Box title="四、坯布 / 原料匹配">
          {r.processing ? (
            <div className="grid grid-cols-2 gap-4">
              <Field label="坯布 / 原料 SPU *">
                <select
                  className="input"
                  value={r.blankSpu || ""}
                  onChange={(e) =>
                    patch({ blankSpu: e.target.value, blankSku: "" })
                  }
                >
                  <option value="">请输入完整 SPU 后选择</option>
                  {[
                    ...new Set(
                      initial
                        .filter((x) => x.blankSku)
                        .map((x) => x.blankSpu || x.spu),
                    ),
                  ].map((x) => (
                    <option key={x}>{x}</option>
                  ))}
                </select>
              </Field>
              <Field label="坯布 / 原料 SKU *">
                <select
                  className="input"
                  value={r.blankSku}
                  onChange={(e) => {
                    const f = initial.find(
                      (x) => x.blankSku === e.target.value,
                    );
                    patch({
                      blankSku: e.target.value,
                      blankName: f?.blankName || "",
                    });
                  }}
                >
                  <option value="">请输入完整 SKU 后选择</option>
                  {initial
                    .filter(
                      (x) =>
                        (x.blankSpu || x.spu) === (r.blankSpu || "") &&
                        x.blankSku,
                    )
                    .map((x) => (
                      <option key={x.blankSku}>{x.blankSku}</option>
                    ))}
                </select>
              </Field>
              <Info
                label="坯布 / 原料产品名称（自动带出）"
                value={r.blankName || "-"}
              />
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              无需加工，直接采购目标 SKU。
            </p>
          )}
        </Box>
        <Box title="五、备注信息">
          <textarea
            className="h-24 w-full rounded border p-3 text-sm"
            placeholder="监控备注、加工备注、采购备注"
          />
        </Box>
      </div>
      <div className="sticky bottom-0 -mx-6 -mb-6 mt-6 flex justify-end gap-2 border-t border-slate-200 bg-white/95 px-6 py-4 backdrop-blur">
        <Btn secondary onClick={onClose}>
          取消
        </Btn>
        <Btn
          onClick={() => {
            if (!r.spu || !r.sku) return;
            if (r.threshold <= 0) return;
            if (
              r.processing &&
              (!r.blankSpu || !r.blankSku || r.process === "无")
            )
              return;
            onSave(r);
          }}
        >
          保存监控规则
        </Btn>
      </div>
    </Modal>
  );
}
function DocumentModal({
  action,
  onClose,
  onConfirm,
}: {
  action: { row: MonitorRow; type: "采购" | "调拨" };
  onClose: () => void;
  onConfirm: (data: {
    qty: number;
    syncProcess: boolean;
    warehouse: string;
    target: string;
  }) => void;
}) {
  const r = action.row;
  const [qty, setQty] = useState(suggested(r));
  const [warehouse, setWarehouse] = useState(
    `原料仓 / P01-01-01（可用 ${r.blankStock}${r.unit}）`,
  );
  const [target, setTarget] = useState("");
  const [syncProcess, setSyncProcess] = useState(true);
  const [spuSearch, setSpuSearch] = useState(r.spu);
  const [activeSpu, setActiveSpu] = useState(r.spu);
  const [editingSpu, setEditingSpu] = useState(false);
  const searched = true;
  const [supplier, setSupplier] = useState("");
  const [purchaseRegion, setPurchaseRegion] = useState("ID");
  const [usageType, setUsageType] = useState("成衣破货");
  const [remark, setRemark] = useState("");
  const purchaseSku =
    activeSpu === r.spu
      ? r.processing && r.blankSku
        ? r.blankSku
        : r.sku
      : `${activeSpu.toUpperCase()}-001`;
  const searchSpu = () => {
    const nextSpu = spuSearch.trim().toUpperCase();
    if (!nextSpu) return;
    setSpuSearch(nextSpu);
    setActiveSpu(nextSpu);
    setEditingSpu(false);
    setSupplier("");
  };
  if (action.type === "采购")
    return (
      <Modal title={`${r.type}采购`} onClose={onClose}>
        <div className="min-h-[610px] text-xs">
          <div className="grid grid-cols-[80px_225px_auto_1fr] items-center gap-3">
            <label className="text-right">
              <span className="mr-1 text-red-500">*</span>请输入SPU
            </label>
            <input
              readOnly={!editingSpu}
              value={spuSearch}
              onChange={(e) => setSpuSearch(e.target.value)}
              onKeyDown={(e) => editingSpu && e.key === "Enter" && searchSpu()}
              className={`h-8 border px-2 text-gray-700 outline-none ${editingSpu ? "border-emerald-500 bg-white" : "border-gray-300 bg-gray-50"}`}
            />
            <button
              type="button"
              onClick={() => (editingSpu ? searchSpu() : setEditingSpu(true))}
              className="h-8 rounded border border-blue-500 px-4 text-blue-600 hover:bg-blue-50"
            >
              {editingSpu ? "搜索" : "修改"}
            </button>
            <span className="text-gray-400">
              {editingSpu
                ? "输入完整 SPU 后点击搜索或按 Enter"
                : activeSpu === r.spu
                  ? "已自动带入当前监控 SPU"
                  : "已切换为其他 SPU"}
            </span>
          </div>
          {searched && (
            <div className="mt-5 space-y-4">
              <PurchaseFormRow label="商品信息">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-16 w-16 items-center justify-center border ${r.type === "面料" ? "bg-blue-50 text-blue-700" : "bg-gray-50 text-gray-600"}`}
                  >
                    {r.type}图片
                  </div>
                  <div className="space-y-1 text-gray-600">
                    <div>
                      SPU：<b>{activeSpu}</b>
                    </div>
                    <div>选品人：小叶</div>
                    <div>成本价：{r.type === "面料" ? "8.60" : "0.26"}</div>
                  </div>
                </div>
              </PurchaseFormRow>
              <PurchaseFormRow label="供应商名称">
                <div>
                  <select
                    value={supplier}
                    onChange={(e) => setSupplier(e.target.value)}
                    className="h-8 w-64 border border-gray-300 px-2"
                  >
                    <option value="">请选择</option>
                    <option>广州恒发布业有限公司</option>
                    <option>东莞宏达纺织有限公司</option>
                    <option>义乌华盛辅料有限公司</option>
                  </select>
                  <div className="mt-1 text-[11px] text-gray-400">
                    商品绑定供应商：{r.type === "面料" ? 2 : 1}
                  </div>
                </div>
              </PurchaseFormRow>
              <PurchaseFormRow label="供应商电话">
                <span>{supplier ? "138****2368" : "-"}</span>
              </PurchaseFormRow>
              <PurchaseFormRow label="供应商地址">
                <span>{supplier ? "广东省广州市海珠区中大纺织城" : "-"}</span>
              </PurchaseFormRow>
              <PurchaseFormRow label="采购地区">
                <select
                  value={purchaseRegion}
                  onChange={(e) => setPurchaseRegion(e.target.value)}
                  className="h-8 w-64 border border-gray-300 bg-white px-2"
                >
                  <option value="ID">ID</option>
                  <option value="CN">CN</option>
                </select>
              </PurchaseFormRow>
              <PurchaseFormRow label="使用类型">
                <div className="flex gap-5">
                  {[
                    "成衣破货",
                    "样衣破货",
                    "成衣破货补采",
                    "成衣破货备货",
                    "kol样品小单",
                  ].map((x) => (
                    <label key={x} className="flex items-center gap-1.5">
                      <input
                        type="radio"
                        checked={usageType === x}
                        onChange={() => setUsageType(x)}
                        className="accent-emerald-500"
                      />
                      {x}
                    </label>
                  ))}
                </div>
              </PurchaseFormRow>
              <PurchaseFormRow label="SKU列表">
                <table className="w-full max-w-5xl border-collapse border text-center">
                  <thead className="bg-gray-50">
                    <tr>
                      {[
                        "",
                        "SKU编码",
                        "sku图片",
                        "颜色尺码",
                        "采购数量",
                        "计划频数",
                        "价格",
                      ].map((x) => (
                        <th key={x} className="border px-3 py-3 font-medium">
                          {x}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border py-3">
                        <input type="checkbox" defaultChecked />
                      </td>
                      <td className="border">{purchaseSku}</td>
                      <td className="border">
                        <div className="mx-auto flex h-11 w-11 items-center justify-center bg-gray-100">
                          图片
                        </div>
                      </td>
                      <td className="border">
                        {r.sku.includes("BLUE")
                          ? "蓝色"
                          : r.sku.includes("RED")
                            ? "红色"
                            : "标准"}
                      </td>
                      <td className="border">
                        <input
                          type="number"
                          value={qty}
                          onChange={(e) => setQty(+e.target.value)}
                          className="h-7 w-24 border px-2"
                        />{" "}
                        {r.unit}
                      </td>
                      <td className="border">
                        <input className="h-7 w-20 border px-2" />
                      </td>
                      <td className="border">
                        {r.type === "面料" ? "8.600" : "0.260"}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </PurchaseFormRow>
              <PurchaseFormRow label="备注">
                <textarea
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                  className="h-20 w-72 border p-2"
                />
              </PurchaseFormRow>
              <PurchaseFormRow label="专用SPU">
                <input className="h-8 w-40 border px-2" />
              </PurchaseFormRow>
              <div className="ml-[92px] flex gap-2">
                <button
                  disabled={!supplier || qty <= 0}
                  onClick={() =>
                    onConfirm({
                      qty,
                      syncProcess: r.processing,
                      warehouse: "原料仓",
                      target: "",
                    })
                  }
                  className="h-8 bg-emerald-500 px-5 text-white disabled:bg-gray-300"
                >
                  添加
                </button>
                <button
                  onClick={() => {
                    setSupplier("");
                    setQty(suggested(r));
                    setRemark("");
                  }}
                  className="h-8 border px-5"
                >
                  重置
                </button>
              </div>
            </div>
          )}
        </div>
      </Modal>
    );
  return (
    <Modal title="确认生成调拨单" onClose={onClose}>
      <div className="mb-5 flex items-center justify-between rounded-xl border border-blue-100 bg-gradient-to-r from-blue-50 to-indigo-50 px-5 py-4">
        <div>
          <div className="text-xs font-medium text-blue-600">本次建议调拨</div>
          <div className="mt-1 text-2xl font-bold text-slate-900">
            {suggested(r).toLocaleString()}
            <span className="ml-1 text-sm font-normal text-slate-500">
              {r.unit}
            </span>
          </div>
        </div>
        <div className="rounded-full bg-white px-3 py-1.5 text-xs font-medium text-blue-700 shadow-sm">
          {r.process}加工
        </div>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 text-sm font-semibold text-slate-800">
          调拨对象
        </div>
        <div className="grid grid-cols-3 gap-6">
          <Info label="目标 SKU" value={r.sku} />
          <Info label="面辅料名称" value={r.name} />
          <Info label="类型" value={<Tag text={r.type} />} />
          <Info label="坯布 / 原料 SKU" value={r.blankSku} />
          <Info label="坯布 / 原料名称" value={r.blankName} />
          <Info label="加工工序" value={r.process} />
        </div>
      </div>
      <div className="mt-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 text-sm font-semibold text-slate-800">
          调拨信息
        </div>
        <div className="grid grid-cols-3 gap-5">
          <Field label="调出仓库 / 库位 *">
            <select
              className="input"
              value={warehouse}
              onChange={(e) => setWarehouse(e.target.value)}
            >
              <option>
                原料仓 / P01-01-01（可用 {r.blankStock}
                {r.unit}）
              </option>
              {r.blankStock > 400 && (
                <option>
                  原料仓 / P01-01-02（可用 {Math.floor(r.blankStock * 0.35)}
                  {r.unit}）
                </option>
              )}
            </select>
          </Field>
          <Field label="调入目标（印染厂）*">
            <select
              className="input"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
            >
              <option value="">请选择印染厂</option>
              <option>宏达染厂</option>
              <option>华彩染厂</option>
              <option>彩艺印花厂</option>
              <option>锦绣绣花厂</option>
            </select>
          </Field>
          <Field label="调拨数量 *">
            <input
              type="number"
              className="input"
              value={qty}
              onChange={(e) => setQty(+e.target.value)}
            />
          </Field>
          {r.processing && (
            <Field label="是否同步生成加工单 *">
              <select
                className="input"
                value={syncProcess ? "是" : "否"}
                onChange={(e) => setSyncProcess(e.target.value === "是")}
              >
                <option>是</option>
                <option>否</option>
              </select>
            </Field>
          )}
          <div className="col-span-3">
            <div className="mb-1 text-xs text-gray-500">调拨备注</div>
            <textarea
              className="h-20 w-full rounded-lg border border-slate-200 p-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              placeholder="请输入本次调拨的补充说明（选填）"
            />
          </div>
        </div>
      </div>
      <div className="sticky bottom-0 -mx-6 -mb-6 mt-6 flex justify-end gap-2 border-t border-slate-200 bg-white/95 px-6 py-4 backdrop-blur">
        <Btn secondary onClick={onClose}>
          取消
        </Btn>
        <Btn
          onClick={() =>
            qty > 0 &&
            target &&
            onConfirm({
              qty,
              syncProcess,
              warehouse,
              target,
            })
          }
        >
          确认生成
        </Btn>
      </div>
    </Modal>
  );
}
function Detail({
  row: r,
  records,
  onClose,
}: {
  row: MonitorRow;
  records: GeneratedRecord[];
  onClose: () => void;
}) {
  const qty = suggested(r);
  const [expandedNo, setExpandedNo] = useState<string | null>(null);
  return (
    <Modal title={`库存监控生成记录 · ${r.sku}`} onClose={onClose} large>
      <div className="mb-5 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 bg-gradient-to-r from-blue-50 to-white px-5 py-3 text-sm font-semibold text-slate-800">
          监控对象概览
        </div>
        <div className="grid grid-cols-5 gap-4 p-5">
          <Info label="目标 SPU" value={r.spu} />
          <Info label="目标 SKU" value={r.sku} />
          <Info label="面辅料名称" value={r.name} />
          <Info label="当前库存" value={`${r.stock}${r.unit}`} />
          <Info label="库存状态" value={<Tag text={monitorStatus(r)} />} />
        </div>
      </div>
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-[1050px] w-full text-left text-xs">
          <thead className="border-b border-slate-200 bg-slate-50 text-slate-500">
            <tr>
              {[
                "生成时间",
                "生成方式",
                "子单据类型",
                "单据号",
                "对象 SKU",
                "数量",
                "关联加工单",
                "子单据状态",
                "操作人",
                "操作",
              ].map((x) => (
                <th key={x} className="px-4 py-3.5 font-medium">
                  {x}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {records.map((x) => {
              const expanded = expandedNo === x.no;
              return (
                <Fragment key={x.no}>
                  <tr className="transition hover:bg-blue-50/40">
                    <td className="px-4 py-4 text-slate-500">{x.time}</td>
                    <td className="px-4">{x.method}</td>
                    <td className="px-4">{x.type}</td>
                    <td className="px-4 font-medium text-blue-600">{x.no}</td>
                    <td className="px-4 font-medium text-slate-700">
                      {x.objectSku}
                    </td>
                    <td className="px-4 font-semibold">{x.qty}</td>
                    <td className="px-4">
                      {x.processRecords?.length ? (
                        <span className="rounded-full bg-blue-50 px-2.5 py-1 font-medium text-blue-700">
                          {x.processRecords.length} 个
                        </span>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="px-4">
                      <Tag text={x.status} />
                    </td>
                    <td className="px-4">{x.operator}</td>
                    <td className="px-4 whitespace-nowrap">
                      <button
                        onClick={() => setExpandedNo(expanded ? null : x.no)}
                        className="rounded-md border border-blue-200 bg-blue-50 px-3 py-1.5 font-medium text-blue-700 transition hover:bg-blue-100"
                      >
                        {expanded ? "收起" : "展开"}
                      </button>
                    </td>
                  </tr>
                  {expanded && (
                    <tr>
                      <td colSpan={10} className="bg-slate-50/80 px-5 py-5">
                        <div className="overflow-hidden rounded-xl border border-blue-100 bg-white shadow-sm">
                          <div className="flex items-center justify-between border-b border-blue-100 bg-blue-50/70 px-4 py-3">
                            <div>
                              <div className="font-semibold text-slate-800">
                                关联加工单记录
                              </div>
                              <div className="mt-0.5 text-[11px] text-slate-500">
                                加工对象 SKU 即当前工序的接收 SKU，交出 SKU
                                将传递给下一道工序。
                              </div>
                            </div>
                            <span className="text-xs text-blue-700">
                              调拨对象：{x.objectSku}
                            </span>
                          </div>
                          {x.processRecords?.length ? (
                            <table className="w-full text-left text-xs">
                              <thead className="bg-slate-50 text-slate-500">
                                <tr>
                                  {[
                                    "工序",
                                    "加工单号",
                                    "加工对象 SKU（接收 SKU）",
                                    "加工数量",
                                    "交出 SKU",
                                    "交出数量",
                                  ].map((label) => (
                                    <th
                                      key={label}
                                      className="px-4 py-3 font-medium"
                                    >
                                      {label}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                {x.processRecords.map((process, index) => (
                                  <tr key={process.no}>
                                    <td className="px-4 py-3">
                                      <span className="rounded bg-indigo-50 px-2 py-1 text-indigo-700">
                                        {index + 1}. {process.process}
                                      </span>
                                    </td>
                                    <td className="px-4 font-medium text-blue-600">
                                      {process.no}
                                    </td>
                                    <td className="px-4 font-medium">
                                      {process.receiveSku}
                                    </td>
                                    <td className="px-4">
                                      {process.qty}
                                      {r.unit}
                                    </td>
                                    <td className="px-4 font-medium text-emerald-700">
                                      {process.outputSku}
                                    </td>
                                    <td className="px-4">
                                      {process.outputQty}
                                      {r.unit}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          ) : (
                            <div className="py-10 text-center text-sm text-slate-400">
                              暂无关联加工单记录
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
            {!records.length && (
              <tr>
                <td colSpan={10} className="py-12 text-center text-gray-400">
                  该 SKU 暂无子单据记录
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50/60 px-4 py-3 text-xs leading-5 text-slate-600">
        <div className="font-semibold text-blue-800">SKU 链路说明</div>
        <div className="mt-1">
          调拨单对象 SKU = 调拨时选择的胚布 / 原料 SKU；第一道加工单接收 SKU =
          调拨单对象 SKU；后续加工单接收 SKU = 上一道加工单交出
          SKU；最后一道加工单交出 SKU = 当前监控目标 SKU。
        </div>
        <div className="mt-1 text-slate-500">
          展开字段包含：加工单号、加工对象 SKU（即接收 SKU）、加工数量、交出
          SKU、交出数量。
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-xs text-slate-500">
        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-slate-300 text-[10px] text-white">
          i
        </span>
        查看该监控 SKU 历史生成的子单据及加工链路；点击操作列“展开 /
        收起”可在当前行查看或隐藏关联加工单。
      </div>
    </Modal>
  );
  /* 以下保留旧详情结构代码仅用于类型兼容，不会渲染。 */
  return (
    <Modal title={`库存监控生成记录 · ${r.sku}`} onClose={onClose}>
      <div className="mb-4 grid grid-cols-4 gap-3">
        <Summary label="目标 SKU 库存状态" value={monitorStatus(r)} />
        <Summary label="建议补货数量" value={`${qty}${r.unit}`} />
        <Summary label="是否需要加工" value={r.processing ? "是" : "否"} />
        <Summary
          label="目标库存数"
          value={`${r.replenishmentTarget ?? 2000}${r.unit}`}
        />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Box title="一、目标 SKU 信息">
          <div className="grid grid-cols-4 gap-4">
            <Info label="SPU" value={r.spu} />
            <Info label="目标 SKU" value={r.sku} />
            <Info label="名称" value={r.name} />
            <Info label="类型" value={r.type} />
            <Info label="基础单位" value={r.unit} />
          </div>
        </Box>
        <Box title="二、库存与阈值规则">
          <div className="grid grid-cols-4 gap-4">
            <Info label="当前库存" value={r.stock} />
            <Info label="阈值" value={r.threshold} />
            <Info label="判断方式" value={r.thresholdMode || "按阈值比例"} />
            <Info label="触发线" value={triggerLine(r)} />
            <Info label="近 7 天使用" value={r.usage} />
            <Info label="建议补货" value={qty} />
          </div>
        </Box>
        <Box title="三、加工规则">
          <div className="grid grid-cols-3 gap-4">
            <Info label="是否需要加工" value={r.processing ? "是" : "否"} />
            <Info label="加工工序" value={r.process} />
            <Info
              label="加工状态"
              value={r.processing ? "待加工" : "无需加工"}
            />
          </div>
        </Box>
        <Box title="四、坯布 / 原料匹配">
          <div className="grid grid-cols-3 gap-4">
            <Info label="坯布 / 原料 SPU" value={r.blankSpu || "-"} />
            <Info label="坯布 SKU" value={r.blankSku || "-"} />
            <Info label="坯布名称" value={r.blankName || "-"} />
          </div>
        </Box>
        <Box title="五、规则判断结果">
          <div className="grid grid-cols-3 gap-4">
            <Info label="是否触发缺货" value={shortage(r) ? "是" : "否"} />
            <Info
              label="库存不足规则"
              value={
                (r.thresholdMode || "按阈值比例") === "按阈值比例"
                  ? `当前库存 < 阈值 × ${r.thresholdRatio ?? 0.5}`
                  : `当前库存 < 固定数量 ${r.fixedTrigger ?? 1000}`
              }
            />
            <Info
              label="触发原因"
              value={
                shortage(r)
                  ? `库存 ${r.stock} < 触发线 ${triggerLine(r)}`
                  : "库存正常"
              }
            />
            <Info
              label="采购单触发规则"
              value={r.purchaseRule || "库存不足且无需加工时下采购单"}
            />
            <Info
              label="调拨单触发规则"
              value={
                r.transferRule ||
                "库存不足且需要加工并已配置坯布 / 原料时生成调拨单"
              }
            />
            <Info
              label="当前可执行动作"
              value={
                transferAllowed(r)
                  ? "生成调拨单"
                  : purchaseAllowed(r)
                    ? "生成面辅料采购单"
                    : "当前规则未触发"
              }
            />
          </div>
        </Box>
        <Box title="六、历史生成单据记录">
          <table className="w-full text-left text-xs">
            <thead>
              <tr>
                {[
                  "生成时间",
                  "方式",
                  "单据类型",
                  "单据号",
                  "对象 SKU",
                  "数量",
                  "关联加工单",
                  "状态",
                  "操作人",
                  "操作",
                ].map((x) => (
                  <th className="pb-2" key={x}>
                    {x}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {records.map((x) => (
                <tr key={x.no} className="border-t">
                  <td className="py-2">{x.time}</td>
                  <td>{x.method}</td>
                  <td>{x.type}</td>
                  <td className="text-blue-600">{x.no}</td>
                  <td>{x.objectSku}</td>
                  <td>{x.qty}</td>
                  <td className="text-blue-600">{x.processNo}</td>
                  <td>{x.status}</td>
                  <td>{x.operator}</td>
                  <td className="whitespace-nowrap">
                    <button className="mr-2 text-blue-600">查看{x.type}</button>
                    {x.processNo !== "-" && (
                      <button className="text-blue-600">查看加工单</button>
                    )}
                  </td>
                </tr>
              ))}
              {!records.length && (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-gray-400">
                    暂无历史生成记录
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Box>
        <div className="lg:col-span-2">
          <Box title="七、操作日志">
            <div className="text-sm text-gray-600">
              2026-09-01 17:10　系统　按监控配置重新计算状态：{r.status}
              ，关联单据 {r.documentNo || "待生成"}
            </div>
          </Box>
        </div>
      </div>
    </Modal>
  );
}
function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="mt-1 text-lg font-semibold text-blue-700">{value}</div>
    </div>
  );
}
function Prd() {
  const rows = [
    ["页面定位", "长期库存监控规则，不是业务单据", "不展示一次性流程进度"],
    ["监控对象", "每行持续监控一个目标 SKU", "生成单据后仍继续监控"],
    [
      "操作按钮",
      "固定展示编辑、生成调拨单、生成面辅料采购单、查看记录",
      "不满足规则时按钮置灰",
    ],
    ["库存状态", "库存不足显示红色，库存充足显示绿色", "状态字段紧邻阈值"],
    ["胚布库存", "按仓库、货架、卷数和数量组合展示", "支持查看明细与合计"],
    ["操作展示", "四个操作按钮纵向按列排列", "避免横向拥挤"],
    [
      "建议补货数量",
      "固定按 2000 − 目标 SKU 当前库存计算",
      "单据数量默认带出并可编辑",
    ],
    [
      "调拨触发",
      "库存不足、已配置胚布 SKU，且胚布库存 ≥ 建议补货数量",
      "允许生成调拨单",
    ],
    ["采购触发", "库存不足且无法满足调拨规则", "允许生成面辅料采购单"],
    [
      "加工链路",
      "首道接收 SKU 为调拨对象，后续接收 SKU 为上道交出 SKU，末道交出目标 SKU",
      "使用两道加工 Mock 数据展示完整流转",
    ],
    [
      "查看记录",
      "查看该监控 SKU 历史子单据记录及对应加工链路",
      "操作列通过展开 / 收起在当前行展示关联加工单",
    ],
    [
      "加工单字段",
      "加工单号、加工对象 SKU（即接收 SKU）、加工数量、交出 SKU、交出数量",
      "不再混用调拨单对象 SKU 与加工单接收 SKU",
    ],
    ["监控持续", "生成单据不会关闭或改变监控对象", "后续可重复生成并留痕"],
    ["操作日志", "每次编辑、生成及数量修改均记录", "支持追溯"],
  ];
  return (
    <div className="rounded-lg border border-blue-100 bg-blue-50/40 p-4">
      <h3 className="font-semibold text-blue-900">完整功能 PRD 说明</h3>
      <p className="mt-2 text-sm leading-6 text-blue-800">
        面辅料库存监控是长期存在的库存监控规则页面，不是一次性业务单据。系统按目标
        SKU
        维度持续判断库存是否不足。每个监控对象固定提供编辑、生成调拨单、生成面辅料采购单和查看记录操作。调拨或采购数量均按“目标库存数
        − 当前库存”计算；需要加工时，对象为胚布 / 原料
        SKU，并同步生成对应工序的加工单 Mock
        记录。生成单据后监控对象保持不变；查看记录弹窗用于查看某个监控 SKU
        历史生成的子单据记录及加工链路，操作列使用“展开 /
        收起”在当前行展示关联加工单。调拨单对象 SKU 是调拨时选择的
        SKU；第一道加工单接收 SKU 是调拨对象，后续接收 SKU 是上一道加工单交出
        SKU，最后一道加工单交出 SKU 是监控目标 SKU。
      </p>
      <div className="mt-4 grid grid-cols-2 gap-2 text-xs md:grid-cols-4">
        {[
          "一、页面定位",
          "二、字段说明",
          "三、库存监控规则",
          "四、加工判断规则",
          "五、坯布匹配规则",
          "六、自动补货决策",
          "七、采购单规则",
          "八、调拨单规则",
          "九、流程进度说明",
          "十、异常边界",
          "十一、操作日志",
        ].map((x) => (
          <div key={x} className="rounded bg-white px-3 py-2 text-gray-600">
            {x}
          </div>
        ))}
      </div>
      <table className="mt-4 w-full overflow-hidden rounded bg-white text-left text-xs">
        <thead className="bg-blue-50">
          <tr>
            <th className="p-2">业务场景</th>
            <th className="p-2">规则说明</th>
            <th className="p-2">页面结果</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {rows.map((x) => (
            <tr key={x[0]}>
              <td className="p-2 font-medium">{x[0]}</td>
              <td className="p-2">{x[1]}</td>
              <td className="p-2">{x[2]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
