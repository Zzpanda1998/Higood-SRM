import { useMemo, useState, type Dispatch, type ReactNode, type SetStateAction } from "react";
import DesignLogicCard from "../../components/common/DesignLogicCard";
import PageHeader from "../../components/common/PageHeader";
import Toast from "../../components/common/Toast";
import type {
  BillingMethod,
  CarrierCurrency,
  FirstLegCarrier,
  FirstLegCarrierChannel,
  FirstLegTransportMethod,
  TaxMethod,
} from "../../types/firstLegCarrier";

type CarrierDraft = Omit<FirstLegCarrier, "id" | "channelCount" | "createdAt" | "createdBy" | "updatedAt" | "updatedBy">;
type ChannelDraft = Omit<FirstLegCarrierChannel, "id" | "carrierId" | "carrierName" | "createdAt" | "createdBy" | "updatedAt" | "updatedBy">;
type CarrierModal = { mode: "create" | "edit" | "view"; row?: FirstLegCarrier } | null;
type ChannelModal = { mode: "create" | "edit" | "view"; carrier: FirstLegCarrier; row?: FirstLegCarrierChannel } | null;

const transportMethods: FirstLegTransportMethod[] = ["海卡", "海派", "空卡", "空派", "铁路", "快递", "卡航"];
const billingMethods: BillingMethod[] = ["计费重", "实重", "体积"];
const taxMethods: TaxMethod[] = ["报税", "不报税"];
const currencies: CarrierCurrency[] = ["RMB", "USD", "IDR"];
const controlClass = "h-8 w-full rounded border border-gray-300 bg-white px-2 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-100";
const now = () => new Date().toLocaleString("zh-CN", { hour12: false });

const emptyCarrier: CarrierDraft = {
  carrierCode: "",
  carrierName: "",
  carrierShortName: "",
  countryOrRegion: "中国",
  city: "",
  carrierLevel: "B级",
  contactName: "",
  contactPhone: "",
  email: "",
  wechat: "",
  address: "",
  settlementCurrency: "RMB",
  paymentMethod: "月结",
  accountPeriodDays: 30,
  invoiceInfo: "",
  bankAccount: "",
  payeeName: "",
  supportedTransportMethods: [],
  supportedDestinations: [],
  supportTaxDeclaration: true,
  supportCustomsClearance: true,
  supportDelivery: true,
  status: "启用",
  remark: "",
};

const emptyChannel: ChannelDraft = {
  channelCode: "",
  channelName: "",
  transportMethod: "空派",
  estimatedTransitDays: 7,
  minTransitDays: 5,
  maxTransitDays: 10,
  cutoffTime: "18:00",
  departureFrequency: "每周一三五",
  billingMethod: "计费重",
  chargeWeightFactor: 1,
  volumeDivisor: 6000,
  minChargeWeight: 21,
  firstWeightPrice: 0,
  additionalWeightPrice: 0,
  unitPrice: 0,
  feeCurrency: "RMB",
  taxMethod: "报税",
  includeTax: true,
  includeCustomsClearance: true,
  includeDelivery: true,
  taxRemark: "",
  originPlace: "广州",
  destinationCountry: "印尼",
  destinationWarehouse: "印尼雅加达仓",
  applicableArea: "雅加达",
  transferCenter: "广州转运中心",
  supportBattery: false,
  supportLiquid: false,
  supportSensitiveGoods: false,
  supportNormalGoods: true,
  maxBoxWeight: 30,
  maxBoxVolume: 0.5,
  status: "启用",
  remark: "",
};

function Modal({ title, description, children, footer, onClose, width = "w-[1040px]" }: { title: string; description?: string; children: ReactNode; footer?: ReactNode; onClose: () => void; width?: string }) {
  return <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/40 p-4">
    <div className={`flex max-h-[88vh] max-w-[calc(100vw-32px)] flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl ${width}`}>
      <div className="flex items-center justify-between border-b px-6 py-4"><div><h2 className="text-lg font-semibold">{title}</h2>{description && <p className="mt-1 text-xs text-gray-500">{description}</p>}</div><button className="rounded px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-100" onClick={onClose}>关闭</button></div>
      <div className="flex-1 space-y-4 overflow-y-auto bg-slate-50 p-5">{children}</div>
      {footer && <div className="flex justify-end gap-2 border-t bg-white px-6 py-4">{footer}</div>}
    </div>
  </div>;
}

function FormSection({ title, children }: { title: string; children: ReactNode }) {
  return <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm"><div className="mb-4 flex items-center gap-3 border-b pb-3"><span className="h-5 w-1 rounded bg-blue-600" /><h3 className="text-sm font-semibold">{title}</h3></div>{children}</section>;
}

function Field({ label, required, error, children, wide }: { label: string; required?: boolean; error?: string; children: ReactNode; wide?: boolean }) {
  return <label className={wide ? "col-span-2 block" : "block"}><div className="mb-1 text-xs font-medium text-gray-600">{required && <span className="mr-1 text-red-500">*</span>}{label}</div>{children}{error && <div className="mt-1 text-xs text-red-500">{error}</div>}</label>;
}

function BooleanChoice({ value, onChange, disabled }: { value?: boolean; onChange: (value: boolean) => void; disabled?: boolean }) {
  return <div className="flex h-8 items-center gap-5">{[true, false].map((item) => <label key={String(item)} className="flex items-center gap-1 text-sm"><input type="radio" disabled={disabled} checked={Boolean(value) === item} onChange={() => onChange(item)} />{item ? "是" : "否"}</label>)}</div>;
}

function StatusTag({ status }: { status: string }) {
  return <span className={`rounded-full px-2 py-1 text-xs ${status === "启用" ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-500"}`}>{status}</span>;
}

export default function FirstLegCarrierManagement({
  carriers,
  setCarriers,
  channels,
  setChannels,
}: {
  carriers: FirstLegCarrier[];
  setCarriers: Dispatch<SetStateAction<FirstLegCarrier[]>>;
  channels: FirstLegCarrierChannel[];
  setChannels: Dispatch<SetStateAction<FirstLegCarrierChannel[]>>;
}) {
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [contact, setContact] = useState("");
  const [country, setCountry] = useState("");
  const [status, setStatus] = useState("");
  const [method, setMethod] = useState("");
  const [currency, setCurrency] = useState("");
  const [carrierModal, setCarrierModal] = useState<CarrierModal>(null);
  const [channelModal, setChannelModal] = useState<ChannelModal>(null);
  const [selectedCarrierId, setSelectedCarrierId] = useState(carriers[0]?.id ?? "");
  const [selectedChannelId, setSelectedChannelId] = useState("");
  const [carrierDraft, setCarrierDraft] = useState<CarrierDraft>(emptyCarrier);
  const [channelDraft, setChannelDraft] = useState<ChannelDraft>(emptyChannel);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState("");
  const showToast = (message: string) => { setToast(message); window.setTimeout(() => setToast(""), 2200); };

  const rows = useMemo(() => carriers.filter((row) =>
    (!name || row.carrierName.includes(name))
    && (!code || row.carrierCode.toLowerCase().includes(code.toLowerCase()))
    && (!contact || row.contactName.includes(contact))
    && (!country || row.countryOrRegion === country)
    && (!status || row.status === status)
    && (!currency || row.settlementCurrency === currency)
    && (!method || channels.some((channel) => channel.carrierId === row.id && channel.transportMethod === method))
  ), [carriers, channels, code, contact, country, currency, method, name, status]);
  const selectedCarrier = rows.find((row) => row.id === selectedCarrierId) ?? rows[0];
  const selectedCarrierChannels = selectedCarrier ? channels.filter((row) => row.carrierId === selectedCarrier.id) : [];
  const selectedChannel = selectedCarrierChannels.find((row) => row.id === selectedChannelId) ?? selectedCarrierChannels[0];

  const nextCarrierCode = () => `FLP-2026-${String(Math.max(0, ...carriers.map((row) => Number(row.carrierCode.split("-").at(-1)) || 0)) + 1).padStart(4, "0")}`;
  const nextChannelCode = () => `CH-2026-${String(Math.max(0, ...channels.map((row) => Number(row.channelCode.split("-").at(-1)) || 0)) + 1).padStart(4, "0")}`;
  const openCarrier = (mode: "create" | "edit" | "view", row?: FirstLegCarrier) => {
    setErrors({});
    setCarrierModal({ mode, row });
    setCarrierDraft(row ? { ...row, supportedTransportMethods: [...(row.supportedTransportMethods ?? [])], supportedDestinations: [...(row.supportedDestinations ?? [])] } : { ...emptyCarrier, carrierCode: nextCarrierCode() });
  };
  const openChannel = (mode: "create" | "edit" | "view", carrier: FirstLegCarrier, row?: FirstLegCarrierChannel) => {
    setErrors({});
    setChannelModal({ mode, carrier, row });
    setChannelDraft(row ? { ...row } : { ...emptyChannel, channelCode: nextChannelCode(), feeCurrency: carrier.settlementCurrency });
  };
  const validateCarrier = () => {
    const next: Record<string, string> = {};
    if (!carrierDraft.carrierName.trim()) next.carrierName = "请输入物流商名称";
    if (!carrierDraft.countryOrRegion) next.countryOrRegion = "请选择国家 / 地区";
    if (!carrierDraft.contactName.trim()) next.contactName = "请输入联系人";
    if (!carrierDraft.contactPhone.trim()) next.contactPhone = "请输入联系电话";
    if (!carrierDraft.settlementCurrency) next.settlementCurrency = "请选择结算币种";
    if (!carrierDraft.paymentMethod) next.paymentMethod = "请选择付款方式";
    if (carriers.some((row) => row.carrierName === carrierDraft.carrierName && row.id !== carrierModal?.row?.id)) next.carrierName = "物流商名称已存在";
    setErrors(next);
    return !Object.keys(next).length;
  };
  const saveCarrier = () => {
    if (!validateCarrier()) return;
    if (carrierModal?.mode === "edit" && carrierModal.row) {
      setCarriers((current) => current.map((row) => row.id === carrierModal.row?.id ? { ...row, ...carrierDraft, updatedBy: "当前用户", updatedAt: now() } : row));
      setChannels((current) => current.map((row) => row.carrierId === carrierModal.row?.id ? { ...row, carrierName: carrierDraft.carrierName } : row));
      showToast("物流商信息已更新");
    } else {
      const item: FirstLegCarrier = { ...carrierDraft, id: `flc-${Date.now()}`, channelCount: 0, status: carrierDraft.status || "启用", createdBy: "当前用户", createdAt: now() };
      setCarriers((current) => [item, ...current]);
      showToast("头程物流商新增成功");
    }
    setCarrierModal(null);
  };
  const validateChannel = () => {
    const next: Record<string, string> = {};
    if (!channelDraft.channelName.trim()) next.channelName = "请输入渠道名称";
    if (!channelDraft.transportMethod) next.transportMethod = "请选择运输方式";
    if (!(channelDraft.estimatedTransitDays > 0)) next.estimatedTransitDays = "预计运输天数必须大于 0";
    if (channelDraft.minTransitDays != null && channelDraft.maxTransitDays != null && channelDraft.minTransitDays > channelDraft.maxTransitDays) next.minTransitDays = "最短运输天数不能大于最长运输天数";
    if (!channelDraft.billingMethod) next.billingMethod = "请选择计费方式";
    if (!channelDraft.feeCurrency) next.feeCurrency = "请选择费用币种";
    if (!channelDraft.taxMethod) next.taxMethod = "请选择交税方式";
    if (!channelDraft.destinationCountry.trim()) next.destinationCountry = "请输入目的国家";
    setErrors(next);
    return !Object.keys(next).length;
  };
  const saveChannel = () => {
    if (!channelModal || !validateChannel()) return;
    if (channelModal.mode === "edit" && channelModal.row) {
      setChannels((current) => current.map((row) => row.id === channelModal.row?.id ? { ...row, ...channelDraft, updatedBy: "当前用户", updatedAt: now() } : row));
      showToast("物流渠道已更新");
    } else {
      const item: FirstLegCarrierChannel = { ...channelDraft, id: `flch-${Date.now()}`, carrierId: channelModal.carrier.id, carrierName: channelModal.carrier.carrierName, createdBy: "当前用户", createdAt: now() };
      setChannels((current) => [item, ...current]);
      setCarriers((current) => current.map((row) => row.id === channelModal.carrier.id ? { ...row, channelCount: row.channelCount + 1 } : row));
      setSelectedCarrierId(channelModal.carrier.id);
      setSelectedChannelId(item.id);
      showToast("物流渠道新增成功");
    }
    setChannelModal(null);
  };
  const toggleCarrier = (row: FirstLegCarrier) => {
    const next = row.status === "启用" ? "停用" : "启用";
    if (!window.confirm(`${next}物流商“${row.carrierName}”？${next === "停用" ? "停用后不能用于新建头程物流单，历史单据不受影响。" : ""}`)) return;
    setCarriers((current) => current.map((item) => item.id === row.id ? { ...item, status: next } : item));
    showToast(`物流商已${next}`);
  };
  const toggleChannel = (row: FirstLegCarrierChannel) => {
    const next = row.status === "启用" ? "停用" : "启用";
    setChannels((current) => current.map((item) => item.id === row.id ? { ...item, status: next } : item));
    showToast(`渠道已${next}，历史头程物流单不受影响`);
  };

  return <div>
    <PageHeader title="头程物流商管理" desc="维护头程物流服务商及其运输渠道，用于头程物流单创建、费用对账和渠道时效管理。" />
    <section className="mb-2 border border-gray-200 bg-white px-3 py-2">
      <div className="flex flex-wrap items-end gap-2">
        <Field label="物流商名称"><input className={`${controlClass} w-[170px]`} value={name} onChange={(event) => setName(event.target.value)} /></Field>
        <Field label="物流商编码"><input className={`${controlClass} w-[150px]`} value={code} onChange={(event) => setCode(event.target.value)} /></Field>
        <Field label="联系人"><input className={`${controlClass} w-[130px]`} value={contact} onChange={(event) => setContact(event.target.value)} /></Field>
        <Field label="国家 / 地区"><select className={`${controlClass} w-[110px]`} value={country} onChange={(event) => setCountry(event.target.value)}><option value="">全部</option>{["中国", "印尼", "美国", "其他"].map((item) => <option key={item}>{item}</option>)}</select></Field>
        <Field label="状态"><select className={`${controlClass} w-[90px]`} value={status} onChange={(event) => setStatus(event.target.value)}><option value="">全部</option><option>启用</option><option>停用</option></select></Field>
        <Field label="渠道运输方式"><select className={`${controlClass} w-[110px]`} value={method} onChange={(event) => setMethod(event.target.value)}><option value="">全部</option>{transportMethods.map((item) => <option key={item}>{item}</option>)}</select></Field>
        <Field label="结算币种"><select className={`${controlClass} w-[90px]`} value={currency} onChange={(event) => setCurrency(event.target.value)}><option value="">全部</option>{currencies.map((item) => <option key={item}>{item}</option>)}</select></Field>
        <button className="h-8 rounded bg-blue-600 px-4 text-sm text-white">查询</button>
        <button className="h-8 rounded border px-4 text-sm" onClick={() => { setName(""); setCode(""); setContact(""); setCountry(""); setStatus(""); setMethod(""); setCurrency(""); }}>清空</button>
      </div>
    </section>
    <section className="mb-2 flex items-center justify-between border border-gray-200 bg-white px-3 py-2">
      <div className="flex gap-6 text-sm text-gray-500"><span>物流商 <b className="text-gray-900">{rows.length}</b> 家</span><span>渠道 <b className="text-gray-900">{channels.length}</b> 条</span><span>启用渠道 <b className="text-emerald-600">{channels.filter((row) => row.status === "启用").length}</b> 条</span></div>
      <button className="h-8 rounded bg-blue-600 px-4 text-sm text-white" onClick={() => openCarrier("create")}>新增物流商</button>
    </section>

    <section className="grid min-h-[610px] grid-cols-[280px_minmax(360px,0.9fr)_minmax(430px,1.15fr)] overflow-hidden border border-gray-200 bg-white">
      <div className="flex min-h-0 flex-col border-r border-gray-200 bg-slate-50/70">
        <div className="flex h-12 shrink-0 items-center justify-between border-b bg-white px-3">
          <div><b className="text-sm">物流商列表</b><span className="ml-2 text-xs text-gray-400">{rows.length}</span></div>
          <button className="text-xs text-blue-600" onClick={() => openCarrier("create")}>+ 新增</button>
        </div>
        <div className="flex-1 space-y-2 overflow-y-auto p-2">
          {rows.map((row) => {
            const active = selectedCarrier?.id === row.id;
            const channelCount = channels.filter((channel) => channel.carrierId === row.id).length;
            return <button key={row.id} className={`w-full rounded-lg border p-3 text-left transition ${active ? "border-blue-400 bg-blue-50 shadow-sm" : "border-gray-200 bg-white hover:border-blue-200 hover:bg-blue-50/40"}`} onClick={() => { setSelectedCarrierId(row.id); setSelectedChannelId(""); }}>
              <div className="flex items-start justify-between gap-2"><div className="min-w-0"><div className="truncate text-sm font-semibold text-gray-900">{row.carrierName}</div><div className="mt-1 text-[11px] text-gray-400">{row.carrierCode}</div></div><StatusTag status={row.status} /></div>
              <div className="mt-3 flex items-center justify-between text-xs text-gray-500"><span>{row.countryOrRegion} · {row.city || "-"}</span><span>{channelCount} 条渠道</span></div>
              <div className="mt-2 flex items-center justify-between text-xs"><span className="text-gray-500">{row.settlementCurrency} · {row.paymentMethod}</span><span className="text-gray-400">{row.contactName}</span></div>
            </button>;
          })}
          {!rows.length && <div className="py-16 text-center text-sm text-gray-400">暂无匹配物流商</div>}
        </div>
      </div>

      <div className="flex min-h-0 flex-col border-r border-gray-200">
        <div className="flex h-12 shrink-0 items-center justify-between border-b px-3">
          <div className="min-w-0"><b className="text-sm">渠道列表</b>{selectedCarrier && <span className="ml-2 text-xs text-gray-400">{selectedCarrier.carrierShortName || selectedCarrier.carrierName}</span>}</div>
          {selectedCarrier && <button className="whitespace-nowrap text-xs text-blue-600" onClick={() => openChannel("create", selectedCarrier)}>+ 新建渠道</button>}
        </div>
        {selectedCarrier && <div className="flex shrink-0 items-center justify-between border-b bg-gray-50 px-3 py-2 text-xs">
          <span className="text-gray-500">{selectedCarrierChannels.length} 条渠道，启用 {selectedCarrierChannels.filter((row) => row.status === "启用").length} 条</span>
          <div className="flex gap-3"><button className="text-blue-600" onClick={() => openCarrier("view", selectedCarrier)}>查看物流商</button><button className="text-blue-600" onClick={() => openCarrier("edit", selectedCarrier)}>编辑</button><button className={selectedCarrier.status === "启用" ? "text-red-600" : "text-emerald-600"} onClick={() => toggleCarrier(selectedCarrier)}>{selectedCarrier.status === "启用" ? "停用" : "启用"}</button></div>
        </div>}
        <div className="flex-1 space-y-2 overflow-y-auto p-3">
          {selectedCarrierChannels.map((row) => {
            const active = selectedChannel?.id === row.id;
            return <button key={row.id} className={`w-full rounded-lg border p-3 text-left transition ${active ? "border-blue-400 bg-blue-50 shadow-sm" : "border-gray-200 bg-white hover:border-blue-200"}`} onClick={() => setSelectedChannelId(row.id)}>
              <div className="flex items-start justify-between gap-3"><div><div className="font-medium text-gray-900">{row.channelName}</div><div className="mt-1 text-[11px] text-gray-400">{row.channelCode}</div></div><StatusTag status={row.status} /></div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-xs"><div><span className="text-gray-400">运输</span><div className="mt-0.5 font-medium">{row.transportMethod}</div></div><div><span className="text-gray-400">时效</span><div className="mt-0.5 font-medium">{row.estimatedTransitDays} 天</div></div><div><span className="text-gray-400">计费</span><div className="mt-0.5 font-medium">{row.billingMethod}</div></div></div>
              <div className="mt-3 flex justify-between border-t border-dashed pt-2 text-xs text-gray-500"><span>{row.originPlace || "-"} → {row.destinationCountry}</span><span>{row.feeCurrency}</span></div>
            </button>;
          })}
          {selectedCarrier && !selectedCarrierChannels.length && <div className="py-20 text-center text-sm text-gray-400"><div>该物流商暂无渠道</div><button className="mt-3 text-blue-600" onClick={() => openChannel("create", selectedCarrier)}>新建第一条渠道</button></div>}
          {!selectedCarrier && <div className="py-20 text-center text-sm text-gray-400">请先选择物流商</div>}
        </div>
      </div>

      <div className="flex min-h-0 flex-col bg-slate-50/40">
        <div className="flex h-12 shrink-0 items-center justify-between border-b bg-white px-4"><div><b className="text-sm">渠道详情</b>{selectedChannel && <span className="ml-2 text-xs text-gray-400">{selectedChannel.channelCode}</span>}</div>{selectedCarrier && selectedChannel && <div className="flex gap-3 text-xs"><button className="text-blue-600" onClick={() => openChannel("view", selectedCarrier, selectedChannel)}>完整查看</button><button className="text-blue-600" onClick={() => openChannel("edit", selectedCarrier, selectedChannel)}>编辑</button><button className={selectedChannel.status === "启用" ? "text-red-600" : "text-emerald-600"} onClick={() => toggleChannel(selectedChannel)}>{selectedChannel.status === "启用" ? "停用" : "启用"}</button></div>}</div>
        {selectedCarrier && selectedChannel ? <div className="flex-1 space-y-3 overflow-y-auto p-4">
          <div className="rounded-lg border border-blue-100 bg-white p-4 shadow-sm"><div className="flex items-start justify-between"><div><h3 className="text-base font-semibold">{selectedChannel.channelName}</h3><p className="mt-1 text-xs text-gray-500">{selectedCarrier.carrierName} · {selectedChannel.channelCode}</p></div><StatusTag status={selectedChannel.status} /></div><div className="mt-4 grid grid-cols-4 gap-3"><Metric label="运输方式" value={selectedChannel.transportMethod} /><Metric label="预计时效" value={`${selectedChannel.estimatedTransitDays} 天`} /><Metric label="计费方式" value={selectedChannel.billingMethod} /><Metric label="费用币种" value={selectedChannel.feeCurrency} /></div></div>
          <DetailSection title="时效与计费" items={[["时效区间", `${selectedChannel.minTransitDays ?? 0} - ${selectedChannel.maxTransitDays ?? 0} 天`], ["截单时间", selectedChannel.cutoffTime || "-"], ["发车 / 起飞", selectedChannel.departureFrequency || "-"], ["体积重除数", String(selectedChannel.volumeDivisor ?? 0)], ["最低计费重量", `${selectedChannel.minChargeWeight ?? 0} KG`], ["单价", `${selectedChannel.feeCurrency} ${selectedChannel.unitPrice ?? 0}`]]} />
          <DetailSection title="税务与服务" items={[["交税方式", selectedChannel.taxMethod], ["是否含税", selectedChannel.includeTax ? "是" : "否"], ["包清关", selectedChannel.includeCustomsClearance ? "是" : "否"], ["包派送", selectedChannel.includeDelivery ? "是" : "否"], ["支持带电", selectedChannel.supportBattery ? "是" : "否"], ["支持敏感货", selectedChannel.supportSensitiveGoods ? "是" : "否"]]} />
          <DetailSection title="路线信息" items={[["起运地", selectedChannel.originPlace || "-"], ["目的国家", selectedChannel.destinationCountry], ["目的仓", selectedChannel.destinationWarehouse || "-"], ["适用区域", selectedChannel.applicableArea || "-"], ["转运中心", selectedChannel.transferCenter || "-"], ["最大单箱", `${selectedChannel.maxBoxWeight ?? 0} KG / ${selectedChannel.maxBoxVolume ?? 0} m³`]]} />
          <div className="rounded-lg border bg-white p-4"><div className="text-xs font-semibold text-gray-700">渠道备注</div><div className="mt-2 text-sm leading-6 text-gray-600">{selectedChannel.remark || "暂无备注"}</div></div>
        </div> : <div className="flex flex-1 items-center justify-center text-sm text-gray-400">选择渠道后查看详细配置</div>}
      </div>
    </section>
    <DesignLogicCard sections={[
      { title: "页面定位", headers: ["项目", "说明"], rows: [["页面名称", "头程物流商管理"], ["所属模块", "头程物流"], ["页面目标", "维护头程物流商和运输渠道"], ["展示结构", "左侧物流商、中间渠道、右侧渠道详情"], ["下游去向", "头程物流单、物流费用对账"], ["核心规则", "一个物流商可以维护多个渠道"]] },
      { title: "三栏交互", headers: ["区域", "作用"], rows: [["左侧物流商", "切换物流商并查看状态、币种、付款方式及渠道数量"], ["中间渠道", "仅展示当前物流商渠道，支持新增和切换"], ["右侧详情", "即时查看渠道时效、计费、税务、路线和限制信息"], ["新增 / 编辑 / 完整查看", "继续使用居中分组弹窗，不改变保存逻辑"]] },
      { title: "核心规则", headers: ["场景", "规则"], rows: [["新增物流商", "维护物流商基础信息"], ["新建渠道", "必须归属于某个物流商"], ["运输方式", transportMethods.join(" / ")], ["计费方式", billingMethods.join(" / ")], ["交税方式", taxMethods.join(" / ")], ["停用物流商", "不能被新头程物流单选择"], ["停用渠道", "不能被新头程物流单选择"], ["历史数据", "已经生成的头程物流单不受停用影响"]] },
    ]} />

    {carrierModal && <Modal title={`${carrierModal.mode === "create" ? "新增" : carrierModal.mode === "edit" ? "编辑" : "查看"}头程物流商`} description="按章节维护物流商主体、联系人、结算及服务能力" onClose={() => setCarrierModal(null)} footer={carrierModal.mode !== "view" ? <><button className="h-9 rounded border px-4" onClick={() => setCarrierModal(null)}>取消</button><button className="h-9 rounded bg-blue-600 px-5 text-white" onClick={saveCarrier}>保存</button></> : undefined}>
      <CarrierForm draft={carrierDraft} setDraft={setCarrierDraft} errors={errors} disabled={carrierModal.mode === "view"} />
    </Modal>}
    {channelModal && <Modal title={`${channelModal.mode === "create" ? "新增" : channelModal.mode === "edit" ? "编辑" : "查看"}物流渠道`} description={`所属物流商：${channelModal.carrier.carrierName}`} onClose={() => setChannelModal(null)} footer={channelModal.mode !== "view" ? <><button className="h-9 rounded border px-4" onClick={() => setChannelModal(null)}>取消</button><button className="h-9 rounded bg-blue-600 px-5 text-white" onClick={saveChannel}>保存</button></> : undefined}>
      <ChannelForm carrier={channelModal.carrier} draft={channelDraft} setDraft={setChannelDraft} errors={errors} disabled={channelModal.mode === "view"} editing={channelModal.mode === "edit"} />
    </Modal>}
    <Toast msg={toast} />
  </div>;
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="rounded bg-slate-50 px-3 py-2"><div className="text-[11px] text-gray-400">{label}</div><div className="mt-1 text-sm font-semibold text-gray-800">{value}</div></div>;
}

function DetailSection({ title, items }: { title: string; items: Array<[string, string]> }) {
  return <section className="rounded-lg border bg-white p-4"><div className="mb-3 text-xs font-semibold text-gray-700">{title}</div><div className="grid grid-cols-2 gap-x-5 gap-y-3">{items.map(([label, value]) => <div key={label} className="flex items-start justify-between gap-3 border-b border-dashed border-gray-100 pb-2 text-xs"><span className="text-gray-400">{label}</span><span className="text-right font-medium text-gray-700">{value}</span></div>)}</div></section>;
}

function CarrierForm({ draft, setDraft, errors, disabled }: { draft: CarrierDraft; setDraft: Dispatch<SetStateAction<CarrierDraft>>; errors: Record<string, string>; disabled: boolean }) {
  const update = <K extends keyof CarrierDraft>(key: K, value: CarrierDraft[K]) => setDraft((current) => ({ ...current, [key]: value }));
  const text = (key: keyof CarrierDraft, label: string, required = false, type = "text") => <Field label={label} required={required} error={errors[String(key)]}><input disabled={disabled} type={type} className={controlClass} value={String(draft[key] ?? "")} onChange={(event) => update(key, (type === "number" ? Number(event.target.value) : event.target.value) as CarrierDraft[typeof key])} /></Field>;
  const select = (key: keyof CarrierDraft, label: string, options: string[], required = false) => <Field label={label} required={required} error={errors[String(key)]}><select disabled={disabled} className={controlClass} value={String(draft[key] ?? "")} onChange={(event) => update(key, event.target.value as CarrierDraft[typeof key])}>{options.map((item) => <option key={item}>{item}</option>)}</select></Field>;
  return <>
    <FormSection title="一、基础信息"><div className="grid grid-cols-2 gap-4">{text("carrierCode", "物流商编码")}{text("carrierName", "物流商名称", true)}{text("carrierShortName", "物流商简称")}{select("countryOrRegion", "国家 / 地区", ["中国", "印尼", "美国", "其他"], true)}{text("city", "所在城市")}{select("carrierLevel", "物流商等级", ["A级", "B级", "C级"])}{select("status", "状态", ["启用", "停用"], true)}</div></FormSection>
    <FormSection title="二、联系人信息"><div className="grid grid-cols-2 gap-4">{text("contactName", "联系人", true)}{text("contactPhone", "联系电话", true)}{text("email", "邮箱")}{text("wechat", "微信")}<Field label="联系地址" wide><input disabled={disabled} className={controlClass} value={draft.address ?? ""} onChange={(event) => update("address", event.target.value)} /></Field></div></FormSection>
    <FormSection title="三、结算信息"><div className="grid grid-cols-2 gap-4">{select("settlementCurrency", "结算币种", currencies, true)}{select("paymentMethod", "付款方式", ["月结", "票结", "预付", "到付"], true)}{text("accountPeriodDays", "账期天数", false, "number")}{text("invoiceInfo", "开票信息")}{text("bankAccount", "银行账户")}{text("payeeName", "收款人")}</div></FormSection>
    <FormSection title="四、服务信息"><div className="grid grid-cols-2 gap-4"><Field label="支持运输方式" wide><div className="flex flex-wrap gap-3">{transportMethods.map((item) => <label key={item} className="flex items-center gap-1 text-sm"><input disabled={disabled} type="checkbox" checked={draft.supportedTransportMethods?.includes(item)} onChange={(event) => update("supportedTransportMethods", event.target.checked ? [...(draft.supportedTransportMethods ?? []), item] : (draft.supportedTransportMethods ?? []).filter((value) => value !== item))} />{item}</label>)}</div></Field><Field label="支持目的地" wide><input disabled={disabled} className={controlClass} value={draft.supportedDestinations?.join("、") ?? ""} onChange={(event) => update("supportedDestinations", event.target.value.split(/[、,，]/).filter(Boolean))} /></Field><Field label="是否支持报税"><BooleanChoice disabled={disabled} value={draft.supportTaxDeclaration} onChange={(value) => update("supportTaxDeclaration", value)} /></Field><Field label="是否支持清关"><BooleanChoice disabled={disabled} value={draft.supportCustomsClearance} onChange={(value) => update("supportCustomsClearance", value)} /></Field><Field label="是否支持派送"><BooleanChoice disabled={disabled} value={draft.supportDelivery} onChange={(value) => update("supportDelivery", value)} /></Field></div></FormSection>
    <FormSection title="五、备注说明"><textarea disabled={disabled} className="min-h-24 w-full rounded border p-2 text-sm" value={draft.remark ?? ""} onChange={(event) => update("remark", event.target.value)} /></FormSection>
  </>;
}

function ChannelForm({ carrier, draft, setDraft, errors, disabled, editing }: { carrier: FirstLegCarrier; draft: ChannelDraft; setDraft: Dispatch<SetStateAction<ChannelDraft>>; errors: Record<string, string>; disabled: boolean; editing: boolean }) {
  const update = <K extends keyof ChannelDraft>(key: K, value: ChannelDraft[K]) => setDraft((current) => ({ ...current, [key]: value }));
  const text = (key: keyof ChannelDraft, label: string, required = false, type = "text", readOnly = false) => <Field label={label} required={required} error={errors[String(key)]}><input disabled={disabled || readOnly} type={type} className={controlClass} value={String(draft[key] ?? "")} onChange={(event) => update(key, (type === "number" ? Number(event.target.value) : event.target.value) as ChannelDraft[typeof key])} /></Field>;
  const select = (key: keyof ChannelDraft, label: string, options: string[], required = false) => <Field label={label} required={required} error={errors[String(key)]}><select disabled={disabled} className={controlClass} value={String(draft[key] ?? "")} onChange={(event) => update(key, event.target.value as ChannelDraft[typeof key])}>{options.map((item) => <option key={item}>{item}</option>)}</select></Field>;
  return <>
    <FormSection title="一、渠道基础信息"><div className="grid grid-cols-2 gap-4"><Field label="所属物流商" required><input disabled className={controlClass} value={carrier.carrierName} /></Field>{text("channelCode", "渠道编码", false, "text", editing)}{text("channelName", "渠道名称", true)}{select("transportMethod", "运输方式", transportMethods, true)}{select("status", "状态", ["启用", "停用"], true)}</div></FormSection>
    <FormSection title="二、时效信息"><div className="grid grid-cols-2 gap-4">{text("estimatedTransitDays", "预计运输天数", true, "number")}{text("minTransitDays", "最短运输天数", false, "number")}{text("maxTransitDays", "最长运输天数", false, "number")}{text("cutoffTime", "截单时间", false, "time")}{text("departureFrequency", "发车 / 起飞频率")}</div></FormSection>
    <FormSection title="三、计费信息"><div className="grid grid-cols-2 gap-4">{select("billingMethod", "计费方式", billingMethods, true)}{text("chargeWeightFactor", "计费重系数", false, "number")}{text("volumeDivisor", "体积重除数", false, "number")}{text("minChargeWeight", "最低计费重量 KG", false, "number")}{text("firstWeightPrice", "首重价格", false, "number")}{text("additionalWeightPrice", "续重价格", false, "number")}{text("unitPrice", "单价", false, "number")}{select("feeCurrency", "费用币种", currencies, true)}</div></FormSection>
    <FormSection title="四、税务与清关信息"><div className="grid grid-cols-2 gap-4">{select("taxMethod", "交税方式", taxMethods, true)}<Field label="是否含税"><BooleanChoice disabled={disabled} value={draft.includeTax} onChange={(value) => update("includeTax", value)} /></Field><Field label="是否包清关"><BooleanChoice disabled={disabled} value={draft.includeCustomsClearance} onChange={(value) => update("includeCustomsClearance", value)} /></Field><Field label="是否包派送"><BooleanChoice disabled={disabled} value={draft.includeDelivery} onChange={(value) => update("includeDelivery", value)} /></Field><Field label="报税说明" wide><textarea disabled={disabled} className="min-h-16 w-full rounded border p-2 text-sm" value={draft.taxRemark ?? ""} onChange={(event) => update("taxRemark", event.target.value)} /></Field></div></FormSection>
    <FormSection title="五、路线信息"><div className="grid grid-cols-2 gap-4">{text("originPlace", "起运地")}{text("destinationCountry", "目的国家", true)}{text("destinationWarehouse", "目的仓")}{text("applicableArea", "适用区域")}{text("transferCenter", "转运中心")}</div></FormSection>
    <FormSection title="六、限制与备注"><div className="grid grid-cols-2 gap-4"><Field label="是否支持带电"><BooleanChoice disabled={disabled} value={draft.supportBattery} onChange={(value) => update("supportBattery", value)} /></Field><Field label="是否支持液体"><BooleanChoice disabled={disabled} value={draft.supportLiquid} onChange={(value) => update("supportLiquid", value)} /></Field><Field label="是否支持敏感货"><BooleanChoice disabled={disabled} value={draft.supportSensitiveGoods} onChange={(value) => update("supportSensitiveGoods", value)} /></Field><Field label="是否支持普货"><BooleanChoice disabled={disabled} value={draft.supportNormalGoods} onChange={(value) => update("supportNormalGoods", value)} /></Field>{text("maxBoxWeight", "最大单箱重量", false, "number")}{text("maxBoxVolume", "最大单箱体积", false, "number")}<Field label="渠道备注" wide><textarea disabled={disabled} className="min-h-20 w-full rounded border p-2 text-sm" value={draft.remark ?? ""} onChange={(event) => update("remark", event.target.value)} /></Field></div></FormSection>
  </>;
}
