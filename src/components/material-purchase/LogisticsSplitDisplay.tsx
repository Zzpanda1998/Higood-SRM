import type { DomesticLogisticsInfo, FirstLegLogisticsInfo } from "../../types/logisticsSplit";

const value = (text: string | number | undefined) => text === "" || text === undefined ? "-" : text;
const logisticStatus = (status: string) => status === "已入库" ? "已签收" : status;

function StageBadge({ status, tone }: { status: string; tone: "green" | "blue" }) {
  const className = tone === "green" ? "bg-emerald-50 text-emerald-700" : "bg-blue-50 text-blue-700";
  return <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium ${className}`}>{logisticStatus(status) || "-"}</span>;
}

function Line({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><span className="text-gray-500">{label}：</span>{children}</div>;
}

export function DomesticLogisticsCell({ data, compact = false }: { data?: DomesticLogisticsInfo; compact?: boolean }) {
  if (!data) return <div className="text-gray-400">暂无国内物流信息</div>;
  return (
    <div className="space-y-0.5 leading-5">
      <Line label="国内物流渠道"><span className="font-medium text-emerald-700">{data.channel}</span></Line>
      {!compact && <Line label="国内快递公司">{data.company}</Line>}
      <Line label="国内快递单号"><span className="break-all">{data.trackingNo}</span></Line>
      <Line label="发货">{value(data.shippedAt)}</Line>
      {!compact && <Line label="承运签收">{value(data.signedAt)}</Line>}
      <Line label="签收">{value(data.inboundAt || data.signedAt)}</Line>
      <Line label="状态"><StageBadge status={data.status} tone="green" /></Line>
      <Line label="件数">{data.packageCount}件</Line>
      {!compact && (
        <>
          <Line label="重量">{data.weightKg} KG</Line>
          <Line label="体积">{data.volume}</Line>
        </>
      )}
    </div>
  );
}

export function FirstLegLogisticsCell({ data, compact = false }: { data?: FirstLegLogisticsInfo; compact?: boolean }) {
  if (!data) return <div className="text-gray-400">暂无头程物流信息</div>;
  return (
    <div className="space-y-0.5 leading-5">
      <Line label="头程物流商">{value(data.carrierName)}</Line>
      <Line label="头程物流渠道"><span className="font-medium text-blue-700">{data.channel}</span></Line>
      <Line label="头程物流单号"><span className="break-all text-blue-700">{value(data.logisticsNo)}</span></Line>
      {!compact && <Line label="头程批次号">{value(data.batchNo)}</Line>}
      <Line label="运输方式">{value(data.transportMethod)}</Line>
      <Line label="发运">{value(data.shippedAt)}</Line>
      {!compact && <Line label="预计到达">{value(data.estimatedArrivedAt)}</Line>}
      {!compact && <Line label="实际到达">{value(data.actualArrivedAt)}</Line>}
      <Line label="签收">{value(data.inboundAt || data.actualArrivedAt)}</Line>
      <Line label="状态"><StageBadge status={data.status} tone="blue" /></Line>
      <Line label="时效">{value(data.transitDays)}</Line>
      {!compact && (
        <>
          <Line label="箱数">{data.boxCount}箱</Line>
          <Line label="重量">{data.weightKg} KG</Line>
          <Line label="体积">{data.volume}</Line>
        </>
      )}
    </div>
  );
}

function DetailGroup({ title, tone, children }: { title: string; tone: "green" | "blue"; children: React.ReactNode }) {
  const titleClass = tone === "green" ? "text-emerald-700" : "text-blue-700";
  return (
    <section className="rounded border border-gray-200 bg-white p-3">
      <h3 className={`mb-2 text-sm font-semibold ${titleClass}`}>{title}</h3>
      {children}
    </section>
  );
}

export function LogisticsSplitDetail({
  domestic,
  firstLeg,
}: {
  domestic?: DomesticLogisticsInfo;
  firstLeg?: FirstLegLogisticsInfo;
}) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      <DetailGroup title="国内物流信息" tone="green">
        <DomesticLogisticsCell data={domestic} />
        {domestic?.remark && <div className="mt-2 border-t pt-2 text-xs text-gray-500">国内物流备注：{domestic.remark}</div>}
      </DetailGroup>
      <DetailGroup title="头程物流信息" tone="blue">
        <FirstLegLogisticsCell data={firstLeg} />
        {firstLeg?.remark && <div className="mt-2 border-t pt-2 text-xs text-gray-500">头程物流备注：{firstLeg.remark}</div>}
      </DetailGroup>
    </div>
  );
}

export function SplitLogisticsActions({
  hasDomestic,
  hasFirstLeg,
  onAction,
}: {
  hasDomestic: boolean;
  hasFirstLeg: boolean;
  onAction: (label: string) => void;
}) {
  const button = (label: string, className: string) => (
    <button key={label} className={`${className} whitespace-nowrap rounded-sm px-1.5 py-0.5 text-[11px] leading-[18px] text-white`} onClick={() => onAction(label)}>
      {label}
    </button>
  );

  return (
    <>
      {button(hasDomestic ? "编辑国内物流信息" : "添加国内物流信息", "bg-[#009688]")}
      {hasDomestic && button("查看国内物流", "bg-[#009688]")}
      {button(hasFirstLeg ? "编辑头程物流信息" : "加入头程物流单", "bg-[#1677ff]")}
      {hasFirstLeg && button("查看头程物流", "bg-[#1677ff]")}
      {button("加载头程物流信息", "bg-[#1677ff]")}
    </>
  );
}
