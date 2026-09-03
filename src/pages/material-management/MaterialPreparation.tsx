import { useMemo, useState } from "react";
import {
  ClipboardList,
  FileClock,
  PackageCheck,
  Plus,
  RefreshCw,
  Search,
  X,
} from "lucide-react";

type OrderType = "采购" | "染色" | "绣花" | "花边" | "印花";
type MaterialRow = {
  id: number;
  spu: string;
  sku: string;
  name: string;
  type: "面料" | "辅料";
  stock: number;
  stockText: string[];
  unit: string;
  threshold?: number;
  usage7d: number;
  orderType?: OrderType;
  removed?: boolean;
  orderNo?: string;
  color: string;
};
type StockOrder = {
  no: string;
  source: string;
  sku: string;
  spu: string;
  name: string;
  type: string;
  orderType: OrderType;
  qty: number;
  stock: number;
  threshold: number;
  node: string;
  process: string;
  factory: string;
  delivered: number;
  loss: number;
  status: string;
  reconcile: string;
  createdAt: string;
  mode: "GTG" | "MGS";
};
type Log = {
  time: string;
  operator: string;
  action: string;
  content: string;
  sku: string;
  orderNo?: string;
};

const initialMaterials: MaterialRow[] = [
  {
    id: 1,
    spu: "FAB-500",
    sku: "FAB-5000",
    name: "180g纯棉针织布",
    type: "面料",
    stock: 860,
    stockText: ["原料仓 / A01-01-01 / 3卷 / 860米"],
    unit: "米",
    threshold: 2000,
    usage7d: 720,
    orderType: "染色",
    color: "bg-blue-100 text-blue-700",
  },
  {
    id: 2,
    spu: "ACC-200",
    sku: "ACC-2002",
    name: "白色纽扣",
    type: "辅料",
    stock: 12000,
    stockText: [
      "原料仓 / B02-01-01 / 12包 / 7,200个",
      "原料仓 / B02-01-02 / 8包 / 4,800个",
    ],
    unit: "个",
    threshold: 20000,
    usage7d: 3500,
    orderType: "采购",
    color: "bg-slate-100 text-slate-700",
  },
  {
    id: 3,
    spu: "FAB-600",
    sku: "FAB-6000",
    name: "印花底布",
    type: "面料",
    stock: 400,
    stockText: ["原料仓 / A03-01-01 / 1卷 / 400米"],
    unit: "米",
    threshold: 1000,
    usage7d: 680,
    orderType: "印花",
    color: "bg-violet-100 text-violet-700",
  },
  {
    id: 4,
    spu: "ACC-300",
    sku: "ACC-3001",
    name: "花边辅料",
    type: "辅料",
    stock: 300,
    stockText: ["原料仓 / C01-01-01 / 5包 / 300米"],
    unit: "米",
    threshold: 800,
    usage7d: 220,
    orderType: "花边",
    color: "bg-rose-100 text-rose-700",
  },
  {
    id: 5,
    spu: "FAB-720",
    sku: "FAB-7208",
    name: "弹力罗纹布",
    type: "面料",
    stock: 1680,
    stockText: [
      "原料仓 / A05-01-01 / 3卷 / 860米",
      "原料仓 / A05-01-02 / 2卷 / 520米",
      "中转仓 / B02-01-01 / 1卷 / 300米",
    ],
    unit: "米",
    threshold: 2200,
    usage7d: 510,
    orderType: "染色",
    color: "bg-emerald-100 text-emerald-700",
  },
];

const initialOrders: StockOrder[] = [
  {
    no: "BH-MAT-202609-0001",
    source: "系统自动",
    sku: "FAB-5000",
    spu: "FAB-500",
    name: "180g纯棉针织布",
    type: "面料",
    orderType: "染色",
    qty: 1140,
    stock: 860,
    threshold: 2000,
    node: "原料仓",
    process: "待染色",
    factory: "宏达染厂",
    delivered: 0,
    loss: 0,
    status: "待处理",
    reconcile: "未对账",
    createdAt: "2026-09-01 10:16",
    mode: "GTG",
  },
  {
    no: "BH-MAT-202609-0002",
    source: "系统自动",
    sku: "FAB-6000",
    spu: "FAB-600",
    name: "印花底布",
    type: "面料",
    orderType: "印花",
    qty: 1600,
    stock: 400,
    threshold: 1000,
    node: "原料仓",
    process: "待印花",
    factory: "彩艺印花厂",
    delivered: 0,
    loss: 0,
    status: "待处理",
    reconcile: "未对账",
    createdAt: "2026-09-01 10:18",
    mode: "MGS",
  },
  {
    no: "BH-ACC-202609-0001",
    source: "手动创建",
    sku: "ACC-3001",
    spu: "ACC-300",
    name: "花边辅料",
    type: "辅料",
    orderType: "花边",
    qty: 1700,
    stock: 300,
    threshold: 800,
    node: "加工厂",
    process: "花边加工中",
    factory: "恒发布艺",
    delivered: 820,
    loss: 18,
    status: "加工中",
    reconcile: "部分对账",
    createdAt: "2026-08-29 14:30",
    mode: "GTG",
  },
];

const statusClass = (s: string) =>
  s.includes("正常") || s === "已完成"
    ? "bg-emerald-50 text-emerald-700"
    : s.includes("已生成") || s.includes("加工")
      ? "bg-blue-50 text-blue-700"
      : "bg-amber-50 text-amber-700";
const getProgress = (order?: StockOrder) => {
  if (!order)
    return {
      label: "未生成备货单",
      detail: "",
      tone: "bg-gray-100 text-gray-600",
    };
  if (["草稿", "待处理"].includes(order.status))
    return {
      label: "生成备货单",
      detail: order.status,
      tone: "bg-gray-100 text-gray-700",
    };
  if (order.status === "加工中")
    return {
      label: "加工厂加工",
      detail: `${order.orderType} / ${order.factory}`,
      tone: "bg-blue-50 text-blue-700",
    };
  if (order.status === "已完成")
    return {
      label: order.reconcile === "已对账" ? "财务对账" : "最终入库",
      detail: "目标仓",
      tone: "bg-emerald-50 text-emerald-700",
    };
  if (["待对账", "已对账"].includes(order.status))
    return {
      label: "财务对账",
      detail: order.status,
      tone: "bg-emerald-50 text-emerald-700",
    };
  if (["待调拨", "调拨中"].includes(order.status))
    return {
      label: "仓库调拨",
      detail: `去 ${order.factory}`,
      tone: "bg-amber-50 text-amber-700",
    };
  if (["采购中", "已下单"].includes(order.status))
    return {
      label: "采购下单",
      detail: "供应商",
      tone: "bg-blue-50 text-blue-700",
    };
  if (order.status === "已入库")
    return order.orderType === "采购"
      ? {
          label: "最终入库",
          detail: "原料仓",
          tone: "bg-blue-50 text-blue-700",
        }
      : order.mode === "GTG"
        ? {
            label: "仓库调拨",
            detail: `去 ${order.factory}`,
            tone: "bg-amber-50 text-amber-700",
          }
        : {
            label: "加工厂加工",
            detail: `${order.orderType} / ${order.factory}`,
            tone: "bg-blue-50 text-blue-700",
          };
  if (order.status === "部分完成")
    return {
      label: "工厂交出",
      detail: order.factory,
      tone: "bg-blue-50 text-blue-700",
    };
  return {
    label: order.process ? "加工厂加工" : order.status || "进度异常",
    detail: order.node,
    tone: order.process
      ? "bg-amber-50 text-amber-700"
      : "bg-red-50 text-red-700",
  };
};
const Button = ({
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
    className={`inline-flex h-8 items-center gap-1.5 rounded px-3 text-sm ${secondary ? "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50" : "bg-blue-600 text-white hover:bg-blue-700"}`}
  >
    {children}
  </button>
);

export default function MaterialPreparation() {
  const [materials, setMaterials] = useState(
    initialMaterials.map((m) => ({
      ...m,
      orderNo: initialOrders.find(
        (o) => o.sku === m.sku && o.status !== "已完成",
      )?.no,
    })),
  );
  const [orders, setOrders] = useState(initialOrders);
  const [tab, setTab] = useState<"materials" | "orders" | "logs">("materials");
  const [keyword, setKeyword] = useState("");
  const [query, setQuery] = useState("");
  const [edit, setEdit] = useState<MaterialRow | null>(null);
  const [remove, setRemove] = useState<MaterialRow | null>(null);
  const [detail, setDetail] = useState<StockOrder | null>(null);
  const [manualOpen, setManualOpen] = useState(false);
  const [threshold, setThreshold] = useState(0);
  const [orderType, setOrderType] = useState<OrderType>("采购");
  const [toast, setToast] = useState("");
  const [logs, setLogs] = useState<Log[]>([
    {
      time: "2026-09-01 10:18",
      operator: "系统",
      action: "自动生成备货单",
      content: "库存低于阈值触发线，自动生成面辅料备货单",
      sku: "FAB-6000",
      orderNo: "BH-MAT-202609-0002",
    },
  ]);
  const now = () =>
    new Date().toLocaleString("zh-CN", { hour12: false }).replaceAll("/", "-");
  const visible = useMemo(
    () =>
      materials.filter(
        (m) =>
          !m.removed &&
          (!query ||
            m.sku.toLowerCase().includes(query.toLowerCase()) ||
            m.spu.toLowerCase().includes(query.toLowerCase())),
      ),
    [materials, query],
  );
  const suggested = (m: MaterialRow) =>
    m.threshold == null
      ? null
      : m.stock < m.threshold * 0.5
        ? Math.max(0, 2000 - m.stock)
        : 0;
  const materialStatus = (m: MaterialRow) =>
    m.orderNo ? "已生成备货单" : suggested(m) ? "待备货" : "正常";
  const notify = (s: string) => {
    setToast(s);
    window.setTimeout(() => setToast(""), 2600);
  };
  const addLog = (x: Omit<Log, "time">) =>
    setLogs((v) => [{ ...x, time: now() }, ...v]);

  const generate = () => {
    let made = 0,
      duplicate = 0;
    setMaterials((rows) =>
      rows.map((m) => {
        const qty = suggested(m);
        if (!qty || !m.orderType || m.removed) return m;
        if (m.orderNo) {
          duplicate++;
          return m;
        }
        const seq = String(orders.length + made + 1).padStart(4, "0");
        const no = `BH-${m.type === "面料" ? "MAT" : "ACC"}-202609-${seq}`;
        made++;
        const o: StockOrder = {
          no,
          source: "系统自动",
          sku: m.sku,
          spu: m.spu,
          name: m.name,
          type: m.type,
          orderType: m.orderType,
          qty,
          stock: m.stock,
          threshold: m.threshold!,
          node: "原料仓",
          process: m.orderType === "采购" ? "采购待处理" : `待${m.orderType}`,
          factory: m.orderType === "采购" ? "-" : "待指定",
          delivered: 0,
          loss: 0,
          status: "待处理",
          reconcile: "未对账",
          createdAt: now(),
          mode: "GTG",
        };
        setOrders((v) => [...v, o]);
        addLog({
          operator: "系统",
          action: "自动生成备货单",
          content: `库存 ${m.stock}${m.unit} 低于阈值触发线，生成 ${no}`,
          sku: m.sku,
          orderNo: no,
        });
        return { ...m, orderNo: no };
      }),
    );
    window.setTimeout(
      () =>
        notify(
          made
            ? `已生成 ${made} 张面辅料备货单${duplicate ? `，${duplicate} 个 SKU 已存在未完成单据` : ""}`
            : duplicate
              ? "当前 SKU 已存在未完成面辅料备货单，不重复生成"
              : "当前没有满足自动下单规则的 SKU",
        ),
      0,
    );
  };
  const saveEdit = () => {
    if (!edit || threshold <= 0) return notify("阈值必须大于 0");
    const old = edit;
    setMaterials((v) =>
      v.map((m) => (m.id === edit.id ? { ...m, threshold, orderType } : m)),
    );
    addLog({
      operator: "张三",
      action: "编辑备料规则",
      content: `阈值 ${old.threshold} → ${threshold}；下单类型 ${old.orderType} → ${orderType}`,
      sku: old.sku,
    });
    setEdit(null);
    notify("备料规则已保存，状态已重新计算");
  };
  const confirmRemove = () => {
    if (!remove) return;
    setMaterials((v) =>
      v.map((m) => (m.id === remove.id ? { ...m, removed: true } : m)),
    );
    addLog({
      operator: "张三",
      action: "移除备料 SKU",
      content: `将 ${remove.sku} 从备料列表移除，不影响库存及历史单据`,
      sku: remove.sku,
    });
    setRemove(null);
    notify("已从备料列表移除");
  };
  const refresh = () => {
    addLog({
      operator: "系统",
      action: "刷新库存",
      content: "已批量刷新库存、卷数和货架数量",
      sku: "全部",
    });
    notify("库存数据已刷新");
  };
  const createManualOrder = (data: {
    material: MaterialRow;
    threshold: number;
    qty: number;
    orderType: OrderType;
    mode: "GTG" | "MGS";
    factory: string;
    processes: string[];
    draft: boolean;
  }) => {
    const seq = String(orders.length + 1).padStart(4, "0");
    const no = `BH-${data.material.type === "面料" ? "MAT" : "ACC"}-202609-${seq}`;
    const order: StockOrder = {
      no,
      source: "手动创建",
      sku: data.material.sku,
      spu: data.material.spu,
      name: data.material.name,
      type: data.material.type,
      orderType: data.orderType,
      qty: data.qty,
      stock: data.material.stock,
      threshold: data.threshold,
      node: "原料仓",
      process:
        data.orderType === "采购"
          ? "采购待处理"
          : `待${data.processes[0] || data.orderType}`,
      factory: data.orderType === "采购" ? "-" : data.factory,
      delivered: 0,
      loss: 0,
      status: data.draft ? "草稿" : "待处理",
      reconcile: "未对账",
      createdAt: now(),
      mode: data.mode,
    };
    setOrders((v) => [...v, order]);
    setMaterials((v) =>
      v.map((m) =>
        m.id === data.material.id
          ? {
              ...m,
              threshold: data.threshold,
              orderType: data.orderType,
              orderNo: no,
            }
          : m,
      ),
    );
    addLog({
      operator: "张三",
      action: data.draft ? "保存备货单草稿" : "手动添加备货单",
      content: `${data.orderType}；下单 ${data.qty}${data.material.unit}；工序 ${data.processes.join(" → ") || "无"}`,
      sku: data.material.sku,
      orderNo: no,
    });
    setManualOpen(false);
    notify(data.draft ? "备货单草稿已保存。" : "手动添加备货单成功。");
  };

  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-gray-200 bg-white px-5 py-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xs text-gray-500">
              原料管理 / 面辅料备料列表
            </div>
            <h1 className="mt-1 text-xl font-semibold">面辅料备料列表</h1>
            <p className="mt-1 text-sm text-gray-500">
              按 SKU 监控库存阈值，自动形成面辅料备货需求并追踪后续业务流转。
            </p>
          </div>
          <div className="flex gap-2">
            <div className="rounded bg-amber-50 px-3 py-2 text-center">
              <b className="block text-lg text-amber-700">
                {
                  materials.filter(
                    (m) => !m.removed && suggested(m) && !m.orderNo,
                  ).length
                }
              </b>
              <span className="text-xs text-amber-700">待备货</span>
            </div>
            <div className="rounded bg-blue-50 px-3 py-2 text-center">
              <b className="block text-lg text-blue-700">{orders.length}</b>
              <span className="text-xs text-blue-700">备货单</span>
            </div>
          </div>
        </div>
      </div>
      <div className="rounded-lg border border-gray-200 bg-white">
        <div className="flex border-b px-4">
          {[
            ["materials", "备料监控", ClipboardList],
            ["orders", "备货单记录", PackageCheck],
            ["logs", "操作日志", FileClock],
          ].map(([k, n, I]: any) => (
            <button
              key={k}
              onClick={() => setTab(k)}
              className={`flex items-center gap-1.5 border-b-2 px-4 py-3 text-sm ${tab === k ? "border-blue-600 font-medium text-blue-600" : "border-transparent text-gray-500"}`}
            >
              <I size={16} />
              {n}
            </button>
          ))}
        </div>
        {tab === "materials" && (
          <>
            <div className="flex flex-wrap items-center gap-2 border-b bg-gray-50/60 p-4">
              <div className="relative">
                <Search
                  className="absolute left-2.5 top-2 text-gray-400"
                  size={16}
                />
                <input
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && setQuery(keyword)}
                  className="h-8 w-64 rounded border border-gray-300 pl-8 pr-3 text-sm outline-none focus:border-blue-500"
                  placeholder="请输入 SPU / SKU"
                />
              </div>
              <Button onClick={() => setQuery(keyword)}>查询</Button>
              <Button
                secondary
                onClick={() => {
                  setKeyword("");
                  setQuery("");
                }}
              >
                重置
              </Button>
              <div className="ml-auto flex gap-2">
                <Button secondary onClick={refresh}>
                  <RefreshCw size={15} />
                  批量刷新库存
                </Button>
                <Button secondary onClick={() => setManualOpen(true)}>
                  <Plus size={15} />
                  手动添加备货单
                </Button>
                <Button onClick={generate}>
                  <PackageCheck size={15} />
                  自动生成备货单
                </Button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-[1250px] w-full text-left text-sm">
                <thead className="bg-gray-50 text-xs text-gray-500">
                  <tr>
                    {[
                      "图片/名称",
                      "SKU",
                      "类型",
                      "库存明细",
                      "阈值",
                      "近7天使用",
                      "建议下单",
                      "下单类型",
                      "备料状态",
                      "进度",
                      "操作",
                    ].map((x) => (
                      <th className="px-3 py-3 font-medium" key={x}>
                        {x}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {visible.map((m) => (
                    <tr key={m.id} className="hover:bg-blue-50/30">
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          <div
                            className={`flex h-11 w-11 items-center justify-center rounded ${m.color}`}
                          >
                            <span className="text-xs font-bold">{m.type}</span>
                          </div>
                          <div>
                            <b className="font-medium">{m.name}</b>
                            <div className="text-xs text-gray-400">{m.spu}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 font-medium text-blue-700">
                        {m.sku}
                      </td>
                      <td className="px-3">
                        <span className="rounded bg-gray-100 px-2 py-1 text-xs">
                          {m.type}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-xs leading-5 text-gray-600">
                        {m.stockText.map((x) => (
                          <div key={x}>{x}</div>
                        ))}
                        {m.stockText.length > 1 && (
                          <b className="text-gray-800">
                            合计：{m.stock.toLocaleString()}
                            {m.unit}
                          </b>
                        )}
                      </td>
                      <td className="px-3 font-medium">
                        {m.threshold?.toLocaleString() ?? "-"}
                      </td>
                      <td className="px-3">
                        {m.usage7d.toLocaleString()} {m.unit}
                      </td>
                      <td className="px-3">
                        <b
                          className={
                            suggested(m) ? "text-red-600" : "text-gray-500"
                          }
                        >
                          {suggested(m)?.toLocaleString() ?? "-"}
                        </b>{" "}
                        {suggested(m) != null && m.unit}
                      </td>
                      <td className="px-3">{m.orderType || "-"}</td>
                      <td className="px-3">
                        <span
                          className={`rounded-full px-2 py-1 text-xs ${statusClass(materialStatus(m))}`}
                        >
                          {materialStatus(m)}
                        </span>
                      </td>
                      <td className="px-3">
                        {(() => {
                          const p = getProgress(
                            orders.filter((o) => o.sku === m.sku).at(-1),
                          );
                          return (
                            <div>
                              <span
                                className={`whitespace-nowrap rounded-full px-2 py-1 text-xs ${p.tone}`}
                              >
                                {p.label}
                              </span>
                              {p.detail && (
                                <div className="mt-1 whitespace-nowrap text-xs text-gray-400">
                                  · {p.detail}
                                </div>
                              )}
                            </div>
                          );
                        })()}
                      </td>
                      <td className="px-3 whitespace-nowrap">
                        <button
                          onClick={() => {
                            setEdit(m);
                            setThreshold(m.threshold || 0);
                            setOrderType(m.orderType || "采购");
                          }}
                          className="mr-3 text-blue-600"
                        >
                          编辑
                        </button>
                        {m.orderNo ? (
                          <button
                            onClick={() => {
                              const skuOrders = orders.filter(
                                (x) => x.sku === m.sku,
                              );
                              const o = skuOrders[skuOrders.length - 1];
                              if (o) {
                                setDetail(o);
                                addLog({
                                  operator: "张三",
                                  action: "查看备货单",
                                  content: `查看 ${o.no}`,
                                  sku: m.sku,
                                  orderNo: o.no,
                                });
                              }
                            }}
                            className="mr-3 text-blue-600"
                          >
                            查看备货单
                          </button>
                        ) : (
                          <button
                            disabled
                            className="mr-3 cursor-not-allowed text-gray-300"
                          >
                            查看备货单
                          </button>
                        )}
                        <button
                          onClick={() => setRemove(m)}
                          className="text-red-600"
                        >
                          移除
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
        {tab === "orders" && (
          <div className="overflow-x-auto">
            <table className="min-w-[1450px] w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs text-gray-500">
                <tr>
                  {[
                    "面辅料备货单号",
                    "来源",
                    "SKU/名称",
                    "类型",
                    "下单类型",
                    "下单数量",
                    "目标仓库",
                    "当前节点/工序",
                    "加工厂",
                    "交出/损耗",
                    "备货状态",
                    "对账状态",
                    "创建时间",
                    "操作",
                  ].map((x) => (
                    <th key={x} className="px-3 py-3 font-medium">
                      {x}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {orders.map((o) => (
                  <tr key={o.no} className="hover:bg-blue-50/30">
                    <td className="px-3 py-3 font-medium text-blue-700">
                      {o.no}
                    </td>
                    <td className="px-3">{o.source}</td>
                    <td className="px-3">
                      <b>{o.sku}</b>
                      <div className="text-xs text-gray-500">{o.name}</div>
                    </td>
                    <td className="px-3">{o.type}</td>
                    <td className="px-3">{o.orderType}</td>
                    <td className="px-3 font-medium">
                      {o.qty.toLocaleString()}
                    </td>
                    <td className="px-3">原料仓</td>
                    <td className="px-3">
                      {o.node}
                      <div className="text-xs text-gray-500">{o.process}</div>
                    </td>
                    <td className="px-3">{o.factory}</td>
                    <td className="px-3">
                      {o.delivered} / {o.loss}
                    </td>
                    <td className="px-3">
                      <span
                        className={`rounded-full px-2 py-1 text-xs ${statusClass(o.status)}`}
                      >
                        {o.status}
                      </span>
                    </td>
                    <td className="px-3">{o.reconcile}</td>
                    <td className="px-3 text-xs">{o.createdAt}</td>
                    <td className="px-3 whitespace-nowrap">
                      <button
                        onClick={() => setDetail(o)}
                        className="mr-3 text-blue-600"
                      >
                        查看
                      </button>
                      <button
                        onClick={() => setDetail(o)}
                        className="text-blue-600"
                      >
                        流转/结算
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {tab === "logs" && (
          <div className="p-4">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs text-gray-500">
                <tr>
                  {[
                    "操作时间",
                    "操作人",
                    "操作类型",
                    "操作内容",
                    "关联 SKU",
                    "关联备货单",
                  ].map((x) => (
                    <th className="px-3 py-3 font-medium" key={x}>
                      {x}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {logs.map((l, i) => (
                  <tr key={i}>
                    <td className="px-3 py-3 text-gray-500">{l.time}</td>
                    <td className="px-3">{l.operator}</td>
                    <td className="px-3">
                      <span className="rounded bg-blue-50 px-2 py-1 text-blue-700">
                        {l.action}
                      </span>
                    </td>
                    <td className="px-3">{l.content}</td>
                    <td className="px-3">{l.sku}</td>
                    <td className="px-3 text-blue-600">{l.orderNo || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <div className="rounded-lg border border-blue-100 bg-blue-50/50 p-4">
        <h3 className="font-medium text-blue-900">完整功能 PRD 说明</h3>
        <p className="mt-1 text-sm leading-6 text-blue-800">
          面辅料备料列表位于原料管理目录下，用于按 SKU
          维度监控面料和辅料库存，并根据库存阈值和下单类型自动生成面辅料备货单。页面新增进度字段，用于展示当前备货单的整体流程进度。备料状态只展示状态标签，查看备货单入口统一放在操作列。用户也可手动选择
          SPU、SKU、工序和阈值创建备货需求。面辅料备货流程进度只展示大业务节点，不展示过细的子状态。主节点包括生成备货单、采购下单、采购入库、仓库调拨、加工厂加工、工厂交出、中转仓入库、中转仓出库、最终入库和财务对账。染色、印花、绣花、花边作为加工厂加工节点下的补充说明，不单独拆成主节点。
        </p>
        <div className="mt-4 overflow-hidden rounded border border-blue-100 bg-white">
          <table className="w-full text-left text-xs">
            <thead className="bg-blue-50 text-blue-900">
              <tr>
                <th className="px-3 py-2">业务场景</th>
                <th className="px-3 py-2">规则说明</th>
                <th className="px-3 py-2">页面结果</th>
              </tr>
            </thead>
            <tbody className="divide-y text-gray-600">
              {[
                [
                  "新增进度字段",
                  "列表读取对应未完成备货单的整体流程进度",
                  "直接查看当前流程进度",
                ],
                [
                  "当前工序",
                  "正在执行或即将执行的业务动作 / 加工工序",
                  "如待染色、染色中、最终入库",
                ],
                [
                  "当前节点",
                  "货物所在仓库、工厂或系统节点",
                  "如原料仓、染厂、加工中转仓",
                ],
                [
                  "流程节点简化",
                  "只展示大业务节点，不拆分采购中、待调拨等子状态",
                  "页面进度条更清晰",
                ],
                [
                  "具体工序展示",
                  "染色、印花、绣花、花边作为加工节点说明",
                  "不单独拆成主节点",
                ],
                [
                  "自动下单",
                  "库存 < 阈值 × 0.5；数量 = 2000 − 当前库存",
                  "满足规则自动生成",
                ],
                [
                  "去重规则",
                  "同 SKU 有未完成备货单时不重复自动生成",
                  "避免重复备货",
                ],
                ["GTG 模式", "展示仓库调拨节点", "表示需要生成或执行调拨"],
                ["MGS 模式", "仓库调拨节点标记为跳过", "不生成独立调拨单"],
                [
                  "多道工序",
                  "每道工序复用加工厂加工和工厂交出节点",
                  "具体工序放在节点说明里",
                ],
                [
                  "中转流转",
                  "多道工序间展示中转仓入库和中转仓出库",
                  "保证系统链路完整",
                ],
                [
                  "列表进度",
                  "列表只显示当前大节点，小字补充具体工序和工厂",
                  "不再展示过细状态",
                ],
                [
                  "状态同步",
                  "子流程变化同步更新列表进度、当前工序及节点",
                  "列表与详情保持一致",
                ],
                [
                  "异常提示",
                  "进度缺失或工序节点不匹配时标记异常",
                  "避免业务状态混乱",
                ],
                [
                  "操作追溯",
                  "手动添加、自动生成、编辑、查看、移除和进度变化均记日志",
                  "关键动作可追溯",
                ],
              ].map(([a, b, c]) => (
                <tr key={a}>
                  <td className="px-3 py-2 font-medium text-gray-800">{a}</td>
                  <td className="px-3 py-2">{b}</td>
                  <td className="px-3 py-2">{c}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {edit && (
        <Modal title="编辑备料规则" onClose={() => setEdit(null)}>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <Info label="SKU" value={edit.sku} />
            <Info label="名称" value={edit.name} />
            <Info
              label="当前库存"
              value={`${edit.stock.toLocaleString()} ${edit.unit}`}
            />
            <Info
              label="近 7 天使用"
              value={`${edit.usage7d.toLocaleString()} ${edit.unit}`}
            />
            <label>
              <span className="mb-1 block text-gray-500">阈值 *</span>
              <input
                type="number"
                value={threshold}
                onChange={(e) => setThreshold(Number(e.target.value))}
                className="h-9 w-full rounded border px-3"
              />
            </label>
            <label>
              <span className="mb-1 block text-gray-500">下单类型 *</span>
              <select
                value={orderType}
                onChange={(e) => setOrderType(e.target.value as OrderType)}
                className="h-9 w-full rounded border px-3"
              >
                {["采购", "染色", "绣花", "花边", "印花"].map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </label>
          </div>
          <div className="mt-5 flex justify-end gap-2">
            <Button secondary onClick={() => setEdit(null)}>
              取消
            </Button>
            <Button onClick={saveEdit}>保存</Button>
          </div>
        </Modal>
      )}
      {remove && (
        <Modal title="移除备料 SKU" onClose={() => setRemove(null)}>
          <p className="text-sm">确认将该 SKU 从面辅料备料列表中移除？</p>
          <div className="mt-3 rounded bg-amber-50 p-3 text-sm text-amber-800">
            {remove.sku} · {remove.name}
            <br />
            <span className="text-xs">
              不会影响真实库存、历史备货单及操作日志。
            </span>
          </div>
          <div className="mt-5 flex justify-end gap-2">
            <Button secondary onClick={() => setRemove(null)}>
              取消
            </Button>
            <button
              onClick={confirmRemove}
              className="h-8 rounded bg-red-600 px-3 text-sm text-white"
            >
              确认移除
            </button>
          </div>
        </Modal>
      )}
      {manualOpen && (
        <ManualOrderModal
          materials={materials.filter((m) => !m.removed)}
          orders={orders}
          onClose={() => setManualOpen(false)}
          onSubmit={createManualOrder}
          notify={notify}
        />
      )}
      {detail && <OrderDetail order={detail} onClose={() => setDetail(null)} />}{" "}
      {toast && (
        <div className="fixed bottom-5 right-5 z-[90] rounded bg-gray-900 px-4 py-3 text-sm text-white shadow-xl">
          {toast}
        </div>
      )}
    </div>
  );
}

function Modal({
  title,
  onClose,
  children,
  wide = false,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 p-5">
      <div
        className={`${wide ? "max-w-6xl" : "max-w-lg"} max-h-[90vh] w-full overflow-auto rounded-lg bg-white shadow-2xl`}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-5 py-4">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}
function Info({ label, value }: { label: string; value: string | number }) {
  return (
    <div>
      <div className="text-xs text-gray-500">{label}</div>
      <div className="mt-1 text-sm font-medium">{value}</div>
    </div>
  );
}
function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded border border-gray-200">
      <h3 className="border-b bg-gray-50 px-4 py-2.5 text-sm font-semibold">
        {title}
      </h3>
      <div className="p-4">{children}</div>
    </section>
  );
}
function ManualOrderModal({
  materials,
  orders,
  onClose,
  onSubmit,
  notify,
}: {
  materials: MaterialRow[];
  orders: StockOrder[];
  onClose: () => void;
  onSubmit: (data: {
    material: MaterialRow;
    threshold: number;
    qty: number;
    orderType: OrderType;
    mode: "GTG" | "MGS";
    factory: string;
    processes: string[];
    draft: boolean;
  }) => void;
  notify: (s: string) => void;
}) {
  const [spu, setSpu] = useState("");
  const [sku, setSku] = useState("");
  const material = materials.find((m) => m.sku === sku);
  const [threshold, setThreshold] = useState(0),
    [qty, setQty] = useState(0);
  const [kind, setKind] = useState<OrderType>("采购"),
    [mode, setMode] = useState<"GTG" | "MGS">("GTG");
  const [factory, setFactory] = useState(""),
    [multi, setMulti] = useState(false),
    [processes, setProcesses] = useState<string[]>([]),
    [loss, setLoss] = useState(3);
  const [remark, setRemark] = useState("");
  const choose = (v: string) => {
    setSku(v);
    const m = materials.find((x) => x.sku === v);
    if (m) {
      setThreshold(m.threshold || 0);
      setQty(Math.max(1, 2000 - m.stock));
      setKind(m.orderType || "采购");
      setProcesses(m.orderType && m.orderType !== "采购" ? [m.orderType] : []);
    }
  };
  const changeKind = (v: OrderType) => {
    setKind(v);
    setProcesses(v === "采购" ? [] : [v]);
  };
  const submit = (draft: boolean) => {
    if (!spu) return notify("请选择 SPU");
    if (!material) return notify("请选择 SKU");
    if (threshold <= 0) return notify("请填写有效阈值");
    if (qty <= 0) return notify("下单数量必须大于 0");
    if (kind !== "采购" && !processes.length) return notify("请选择工序");
    if (kind !== "采购" && !factory) return notify("请选择加工厂");
    onSubmit({
      material,
      threshold,
      qty,
      orderType: kind,
      mode,
      factory,
      processes,
      draft,
    });
  };
  const duplicate =
    material &&
    orders.some(
      (o) => o.sku === material.sku && !["已完成", "已关闭"].includes(o.status),
    );
  return (
    <Modal wide title="手动添加面辅料备货单" onClose={onClose}>
      <div className="grid gap-4 lg:grid-cols-2">
        <Section title="一、面辅料选择">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <Field label="SPU *">
              <select
                value={spu}
                onChange={(e) => {
                  setSpu(e.target.value);
                  setSku("");
                }}
                className="input"
              >
                <option value="">请选择 / 搜索 SPU</option>
                {[...new Set(materials.map((m) => m.spu))].map((x) => (
                  <option key={x}>{x}</option>
                ))}
              </select>
            </Field>
            <Field label="SKU *">
              <select
                value={sku}
                disabled={!spu}
                onChange={(e) => choose(e.target.value)}
                className="input disabled:bg-gray-100"
              >
                <option value="">请选择 SKU</option>
                {materials
                  .filter((m) => m.spu === spu)
                  .map((m) => (
                    <option key={m.sku} value={m.sku}>
                      {m.sku} · {m.name}
                    </option>
                  ))}
              </select>
            </Field>
            {material && (
              <>
                <Info label="面辅料名称" value={material.name} />
                <Info label="类型 / 规格" value={`${material.type} / 本白`} />
                <Info label="基础单位" value={material.unit} />
                <div
                  className={`flex h-12 items-center justify-center rounded ${material.color}`}
                >
                  {material.type}图片
                </div>
              </>
            )}
          </div>
          {material && (
            <p className="mt-3 rounded bg-blue-50 p-2 text-xs text-blue-700">
              该 SKU 已在备料列表中，确认后同步更新阈值和下单类型。
            </p>
          )}
          {duplicate && (
            <p className="mt-2 rounded bg-amber-50 p-2 text-xs text-amber-800">
              该 SKU 已存在未完成备货单，仍可确认继续手动创建。
            </p>
          )}
        </Section>
        <Section title="二、库存与阈值信息">
          <div className="mb-3 rounded bg-gray-50 p-3 text-xs leading-5 text-gray-600">
            {material
              ? material.stockText.map((x) => <div key={x}>{x}</div>)
              : "选择 SKU 后自动带出库存明细"}
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Info
              label="当前库存"
              value={material ? `${material.stock} ${material.unit}` : "-"}
            />
            <Info
              label="近 7 天使用"
              value={material ? `${material.usage7d} ${material.unit}` : "-"}
            />
            <Info
              label="建议下单"
              value={
                material
                  ? `${Math.max(0, 2000 - material.stock)} ${material.unit}`
                  : "-"
              }
            />
            <Field label="阈值 *">
              <input
                type="number"
                value={threshold || ""}
                onChange={(e) => setThreshold(+e.target.value)}
                className="input"
              />
            </Field>
            <Field label="手动下单数量 *">
              <input
                type="number"
                value={qty || ""}
                onChange={(e) => setQty(+e.target.value)}
                className="input"
              />
            </Field>
          </div>
        </Section>
        <div className="lg:col-span-2">
          <Section title="三、下单与工序信息">
            <div className="grid grid-cols-4 gap-4">
              <Field label="下单类型 *">
                <select
                  value={kind}
                  onChange={(e) => changeKind(e.target.value as OrderType)}
                  className="input"
                >
                  {["采购", "染色", "绣花", "花边", "印花"].map((x) => (
                    <option key={x}>{x}</option>
                  ))}
                </select>
              </Field>
              <Field label="是否多道工序 *">
                <select
                  disabled={kind === "采购"}
                  value={multi ? "是" : "否"}
                  onChange={(e) => {
                    const yes = e.target.value === "是";
                    setMulti(yes);
                    if (yes && processes.length < 2)
                      setProcesses((v) => [...v, "印花"]);
                  }}
                  className="input disabled:bg-gray-100"
                >
                  <option>否</option>
                  <option>是</option>
                </select>
              </Field>
              <Field label="加工厂">
                <select
                  disabled={kind === "采购"}
                  value={factory}
                  onChange={(e) => setFactory(e.target.value)}
                  className="input disabled:bg-gray-100"
                >
                  <option value="">请选择</option>
                  {["宏达染厂", "彩艺印花厂", "锦绣绣花厂", "恒发布艺"].map(
                    (x) => (
                      <option key={x}>{x}</option>
                    ),
                  )}
                </select>
              </Field>
              <Field label="预计损耗率 %">
                <input
                  type="number"
                  value={loss}
                  onChange={(e) => setLoss(+e.target.value)}
                  className="input"
                />
              </Field>
            </div>
            {kind === "采购" ? (
              <p className="mt-4 rounded bg-gray-50 p-3 text-sm text-gray-500">
                采购类型直接采购补货，不需要工序路线。
              </p>
            ) : (
              <div className="mt-4">
                <div className="mb-2 flex justify-between text-sm font-medium">
                  工序路线{" "}
                  {multi && (
                    <button
                      onClick={() => setProcesses((v) => [...v, "印花"])}
                      className="text-blue-600"
                    >
                      + 新增工序
                    </button>
                  )}
                </div>
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50">
                    <tr>
                      {[
                        "顺序",
                        "工序",
                        "加工厂",
                        "模式",
                        "来源节点",
                        "是否调拨",
                        "计划投入",
                        "预计交出",
                        "操作",
                      ].map((x) => (
                        <th key={x} className="p-2">
                          {x}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {processes.map((p, i) => (
                      <tr key={i} className="border-t">
                        <td className="p-2">第 {i + 1} 道</td>
                        <td>
                          <select
                            value={p}
                            onChange={(e) =>
                              setProcesses((v) =>
                                v.map((x, j) => (j === i ? e.target.value : x)),
                              )
                            }
                            className="rounded border p-1"
                          >
                            {["染色", "绣花", "花边", "印花"].map((x) => (
                              <option key={x}>{x}</option>
                            ))}
                          </select>
                        </td>
                        <td>{factory || "待选择"}</td>
                        <td>{mode}</td>
                        <td>{i ? "加工中转仓" : "原料仓"}</td>
                        <td>{mode === "GTG" ? "是" : "否"}</td>
                        <td>{Math.round(qty * Math.pow(1 - loss / 100, i))}</td>
                        <td>
                          {Math.round(qty * Math.pow(1 - loss / 100, i + 1))}
                        </td>
                        <td>
                          {processes.length > 1 && (
                            <button
                              onClick={() =>
                                setProcesses((v) => v.filter((_, j) => j !== i))
                              }
                              className="text-red-600"
                            >
                              删除
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Section>
        </div>
        <Section title="四、目标仓库与业务模式">
          <div className="grid grid-cols-2 gap-4">
            <Field label="目标仓库 *">
              <select className="input">
                <option>原料仓</option>
                <option>中转仓</option>
                <option>指定仓</option>
              </select>
            </Field>
            <Field label="默认业务模式 *">
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value as "GTG" | "MGS")}
                className="input"
              >
                <option>GTG</option>
                <option>MGS</option>
              </select>
            </Field>
            <Info
              label="是否生成调拨单"
              value={mode === "GTG" ? "是" : "否，仅记录交付"}
            />
            <Info label="交付对象" value={factory || "目标仓"} />
          </div>
        </Section>
        <Section title="五、备注信息">
          <textarea
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
            className="h-28 w-full rounded border p-3 text-sm"
            placeholder="备货备注、采购备注、工序备注"
          />
        </Section>
      </div>
      <div className="mt-5 flex justify-end gap-2 border-t pt-4">
        <Button secondary onClick={onClose}>
          取消
        </Button>
        <Button secondary onClick={() => submit(true)}>
          保存草稿
        </Button>
        <Button onClick={() => submit(false)}>确认添加</Button>
      </div>
    </Modal>
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
    <label className="text-sm">
      <span className="mb-1 block text-gray-500">{label}</span>
      {children}
    </label>
  );
}

function FlowProgress({
  order,
  route,
}: {
  order: StockOrder;
  route: { n: string; factory: string; status: string }[];
}) {
  type Step = { name: string; note?: string; skipped?: boolean };
  const steps: Step[] = [
    { name: "生成备货单", note: order.source },
    { name: "采购下单" },
    { name: "采购入库", note: "进入原料仓" },
  ];
  if (order.orderType !== "采购") {
    steps.push({
      name: "仓库调拨",
      note: order.mode === "GTG" ? `去 ${order.factory}` : "MGS 不生成调拨单",
      skipped: order.mode === "MGS",
    });
    route.forEach((r, i) => {
      if (i > 0)
        steps.push(
          { name: "中转仓入库", note: "加工中转仓" },
          { name: "中转仓出库", note: `发往 ${r.factory}` },
        );
      steps.push(
        { name: "加工厂加工", note: `第${i + 1}道：${r.n} / ${r.factory}` },
        { name: "工厂交出", note: r.factory },
      );
    });
  }
  steps.push(
    { name: "最终入库", note: "目标仓" },
    { name: "财务对账", note: order.reconcile },
  );
  const progress = getProgress(order);
  let active = steps.findIndex((s) => s.name === progress.label && !s.skipped);
  if (order.status === "加工中")
    active = steps.findIndex((s) => s.name === "加工厂加工");
  if (active < 0) active = 0;
  return (
    <div className="mb-4 rounded-lg border bg-white p-4">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold">面辅料备货流程进度</h3>
          <p className="mt-1 text-xs text-gray-500">
            展示备货单从生成、采购、入库、调拨、加工、交出、中转、最终入库到财务对账的整体进度
          </p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs ${getProgress(order).tone}`}
        >
          {getProgress(order).label}{" "}
          {getProgress(order).detail && `· ${getProgress(order).detail}`}
        </span>
      </div>
      <div className="overflow-x-auto pb-2">
        <div className="flex min-w-max items-start">
          {steps.map((step, i) => (
            <div key={`${step.name}-${i}`} className="flex items-start">
              <div className="w-24 text-center">
                <div
                  className={`mx-auto flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${step.skipped ? "border-2 border-dashed border-gray-300 bg-gray-50 text-gray-400" : i < active ? "bg-emerald-500 text-white" : i === active ? "bg-blue-600 text-white ring-4 ring-blue-100" : "border-2 border-gray-300 bg-white text-gray-400"}`}
                >
                  {step.skipped ? "—" : i < active ? "✓" : i + 1}
                </div>
                <div
                  className={`mt-2 text-xs ${i === active ? "font-semibold text-blue-700" : i < active ? "text-emerald-700" : "text-gray-400"}`}
                >
                  {step.name}
                </div>
                <div className="mt-1 text-[10px] text-gray-400">
                  {step.skipped
                    ? "跳过"
                    : i < active
                      ? "已完成"
                      : i === active
                        ? "进行中"
                        : "待开始"}
                </div>
                {step.note && (
                  <div className="mt-1 px-1 text-[10px] leading-4 text-gray-500">
                    {step.note}
                  </div>
                )}
              </div>
              {i < steps.length - 1 && (
                <div
                  className={`mt-4 h-0.5 w-6 ${i < active ? "bg-emerald-400" : "bg-gray-200"}`}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function OrderDetail({
  order,
  onClose,
}: {
  order: StockOrder;
  onClose: () => void;
}) {
  const route =
    order.orderType === "采购"
      ? []
      : order.orderType === "染色"
        ? [
            { n: "染色", factory: order.factory, status: "待调拨" },
            { n: "印花", factory: "彩艺印花厂", status: "待开始" },
          ]
        : [
            {
              n: order.orderType,
              factory: order.factory,
              status: order.status === "加工中" ? "加工中" : "待开始",
            },
          ];
  return (
    <Modal wide title={`面辅料备货单详情 · ${order.no}`} onClose={onClose}>
      <div className="mb-4 rounded-lg bg-gradient-to-r from-blue-700 to-blue-500 p-5 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-blue-100">面辅料备货单号</div>
            <b className="text-lg">{order.no}</b>
          </div>
          <span className="rounded-full bg-white/20 px-3 py-1 text-xs">
            {order.source}
          </span>
        </div>
        <div className="mt-3 flex gap-5 text-sm">
          <span>SKU：{order.sku}</span>
          <span>名称：{order.name}</span>
          <span>类型：{order.type}</span>
        </div>
      </div>
      <div className="mb-4 grid grid-cols-4 gap-3">
        {[
          ["备货状态", order.status, "text-blue-700"],
          [
            "下单数量",
            `${order.qty.toLocaleString()} ${order.type === "面料" ? "米" : "个"}`,
            "text-gray-900",
          ],
          ["当前工序", order.process, "text-amber-700"],
          ["当前节点", order.node, "text-emerald-700"],
        ].map(([a, b, c]) => (
          <div key={a} className="rounded-lg border bg-white p-4 shadow-sm">
            <div className="text-xs text-gray-500">{a}</div>
            <div className={`mt-1 text-lg font-semibold ${c}`}>{b}</div>
          </div>
        ))}
      </div>
      <div className="mb-4 grid grid-cols-2 gap-3 rounded-lg border border-blue-100 bg-blue-50/40 p-3 text-xs">
        <div>
          <b className="text-gray-800">当前工序：</b>
          <span className="text-gray-600">
            当前正在执行或即将执行的业务动作 /
            加工工序，例如待染色、染色中、最终入库。
          </span>
        </div>
        <div>
          <b className="text-gray-800">当前节点：</b>
          <span className="text-gray-600">
            货物当前所在的仓库、工厂或系统流转节点，例如原料仓、染厂、加工中转仓。
          </span>
        </div>
      </div>
      <FlowProgress order={order} route={route} />
      <div className="grid gap-4 lg:grid-cols-2">
        <Section title="一、备货基础信息">
          <div className="grid grid-cols-3 gap-4">
            <Info label="备货单号" value={order.no} />
            <Info label="来源" value={order.source} />
            <Info label="备货类型" value={`${order.type}备货`} />
            <Info label="采购主体" value="HiGOOD 香港公司" />
            <Info label="目标仓库" value="原料仓" />
            <Info label="业务模式" value={order.mode} />
            <Info
              label="当前进度"
              value={`${getProgress(order).label} · ${getProgress(order).detail}`}
            />
            <Info
              label="创建人"
              value={order.source === "系统自动" ? "系统" : "张三"}
            />
            <Info label="创建时间" value={order.createdAt} />
            <Info label="更新时间" value="2026-09-01 13:20" />
          </div>
        </Section>
        <Section title="三、库存与阈值信息">
          <div className="grid grid-cols-3 gap-4">
            <Info label="来源备料 SKU" value={order.sku} />
            <Info label="当前库存" value={order.stock} />
            <Info label="阈值" value={order.threshold} />
            <Info
              label="阈值触发线"
              value={`${order.threshold * 0.5}（阈值 × 0.5）`}
            />
            <Info label="建议下单数量" value={order.qty} />
            <Info label="下单类型" value={order.orderType} />
          </div>
        </Section>
        <Section title="二、面辅料信息">
          <div className="grid grid-cols-4 gap-4">
            <Info label="SPU" value={order.spu} />
            <Info label="SKU" value={order.sku} />
            <Info label="下单数量" value={order.qty} />
            <Info
              label="已入库数量"
              value={order.status === "待处理" ? 0 : order.qty}
            />
            <Info label="待加工数量" value={order.qty - order.delivered} />
            <Info label="已完成数量" value={order.delivered} />
            <Info label="损耗数量" value={order.loss} />
            <Info label="当前节点" value={order.node} />
            <Info label="当前工序" value={order.process} />
          </div>
        </Section>
        <Section title="四、下单与工序信息">
          {route.length ? (
            <table className="w-full text-left text-xs">
              <thead className="text-gray-500">
                <tr>
                  {[
                    "顺序",
                    "工序",
                    "加工厂",
                    "模式",
                    "是否调拨",
                    "计划投入",
                    "实际交出",
                    "损耗",
                    "状态",
                  ].map((x) => (
                    <th className="pb-2" key={x}>
                      {x}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {route.map((r, i) => (
                  <tr key={r.n} className="border-t">
                    <td className="py-2">第 {i + 1} 道</td>
                    <td>{r.n}</td>
                    <td>{r.factory}</td>
                    <td>{order.mode}</td>
                    <td>{order.mode === "GTG" ? "是" : "否"}</td>
                    <td>{i ? order.delivered : order.qty}</td>
                    <td>{i ? 0 : order.delivered}</td>
                    <td>{i ? 0 : order.loss}</td>
                    <td>{r.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-sm text-gray-500">
              采购类型直接补货，无加工工序。
            </p>
          )}
        </Section>
        <Section title="五、采购入库与调拨信息">
          <div className="grid grid-cols-3 gap-4">
            <Info
              label="采购单状态"
              value={order.status === "待处理" ? "待下单" : "已关联采购单"}
            />
            <Info
              label="调拨单号"
              value={
                order.mode === "GTG"
                  ? `DB-${order.no.slice(-4)}`
                  : "MGS 不生成调拨单"
              }
            />
            <Info
              label="调出 / 调入"
              value={
                order.mode === "GTG"
                  ? `原料仓 → ${order.factory}`
                  : `直接交付 ${order.factory}`
              }
            />
          </div>
        </Section>
        <Section title="六、工厂交出与中转记录">
          <div className="grid grid-cols-3 gap-4">
            <Info label="实际交出" value={order.delivered} />
            <Info label="损耗数量" value={order.loss} />
            <Info
              label="接收节点"
              value={route.length > 1 ? "加工中转仓" : "目标仓"}
            />
            <Info
              label="中转状态"
              value={route.length > 1 ? "待收货 / 待发出" : "无需中转"}
            />
            <Info label="下一道工序" value={route[1]?.n || "-"} />
          </div>
        </Section>
        <Section title="七、财务结算信息">
          <div className="grid grid-cols-4 gap-4">
            <Info
              label="采购成本"
              value={`¥${(order.qty * 8.6).toLocaleString()}`}
            />
            <Info
              label="加工费用"
              value={`¥${(order.delivered * 1.2).toLocaleString()}`}
            />
            <Info
              label="调拨费用"
              value={order.mode === "GTG" ? "¥320" : "¥0"}
            />
            <Info
              label="损耗成本"
              value={`¥${(order.loss * 8.6).toLocaleString()}`}
            />
            <Info label="工厂结算" value="未结算" />
            <Info label="对账状态" value={order.reconcile} />
            <Info label="请款状态" value="未请款" />
          </div>
        </Section>
        <Section title="八、操作日志">
          <div className="space-y-3 text-sm">
            <div className="flex gap-4">
              <span className="text-gray-400">{order.createdAt}</span>
              <b>{order.source === "系统自动" ? "系统" : "张三"}</b>
              <span>创建面辅料备货单，状态为 {order.status}</span>
            </div>
            {order.status === "加工中" && (
              <div className="flex gap-4">
                <span className="text-gray-400">2026-08-31 16:20</span>
                <b>仓库员</b>
                <span>工厂接收并开始 {order.orderType} 工序</span>
              </div>
            )}
          </div>
        </Section>
      </div>
    </Modal>
  );
}
