import { useEffect, useMemo, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import DesignLogicCard from "../../components/common/DesignLogicCard";
import DetailModal from "../../components/common/DetailModal";
import FormModal from "../../components/common/FormModal";
import PageHeader from "../../components/common/PageHeader";
import StatusBadge from "../../components/common/StatusBadge";
import Toast from "../../components/common/Toast";
import { createMockTransferBatches } from "../../mock/transferBatches";
import type { TransferBatch, TransferBatchStatus } from "../../types/transferBatch";
import type { FirstLegCarrier, FirstLegCarrierChannel } from "../../types/firstLegCarrier";
import CreateTransferBatchModal from "./CreateTransferBatchModal";
import type { MaterialLogisticsRecord } from "./MaterialPurchaseTracking";

type Filters = {
  keyword: string;
  status: string;
  transferCenter: string;
  destinationWarehouse: string;
  createdFrom: string;
  createdTo: string;
  plannedFrom: string;
  plannedTo: string;
  pageSize: string;
};

type TimeAction = {
  kind: "load" | "ship";
  batch?: TransferBatch;
  batchNos: string[];
};

const emptyFilters: Filters = {
  keyword: "",
  status: "请选择",
  transferCenter: "请选择",
  destinationWarehouse: "请选择",
  createdFrom: "",
  createdTo: "",
  plannedFrom: "",
  plannedTo: "",
  pageSize: "100",
};

const statusOptions: TransferBatchStatus[] = ["待起运", "已装柜", "头程中", "已到仓", "已完成"];
const qty = (value?: number) => (value ?? 0).toLocaleString("zh-CN", { maximumFractionDigits: 3 });
const money = (value?: number) => (value ?? 0).toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const totalWeight = (records: MaterialLogisticsRecord[]) => records.reduce((sum, item) => sum + (item.logisticsWeight ?? 0), 0);
const packageCount = (records: MaterialLogisticsRecord[]) => records.reduce((sum, item) => sum + (item.boxCount ?? 0), 0);
const todayTime = () => "2026-06-09 10:30";

const addDays = (date: string, days?: number) => {
  if (!date || !days) return "-";
  const [year, month, day] = date.slice(0, 10).split("-").map(Number);
  const current = new Date(Date.UTC(year, month - 1, day));
  if (Number.isNaN(current.getTime())) return "-";
  current.setDate(current.getDate() + days);
  return current.toISOString().slice(0, 10);
};
const diffDays = (from?: string, to?: string) => {
  if (!from || !to) return "-";
  const [startYear, startMonth, startDay] = from.slice(0, 10).split("-").map(Number);
  const [endYear, endMonth, endDay] = to.slice(0, 10).split("-").map(Number);
  const start = new Date(Date.UTC(startYear, startMonth - 1, startDay));
  const end = new Date(Date.UTC(endYear, endMonth - 1, endDay));
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return "-";
  return `${Math.max(0, Math.round((end.getTime() - start.getTime()) / 86400000))}天`;
};
const expectedDeliveryDate = (batch: TransferBatch) => addDays(batch.plannedShipDate, batch.estimatedTransitDays ?? batch.transitDays);
const actualSignedAt = (batch: TransferBatch) => batch.actualWarehouseSignedAt || batch.arrivedAt || "";
const actualTransitDays = (batch: TransferBatch) => diffDays(batch.actualShipDate, actualSignedAt(batch));

function inRange(value: string, from: string, to: string) {
  const date = value.slice(0, 10);
  if (from && date < from) return false;
  if (to && date > to) return false;
  return true;
}

function SmallButton({
  children,
  color = "blue",
  disabled = false,
  onClick,
}: {
  children: React.ReactNode;
  color?: "blue" | "green" | "orange" | "gray";
  disabled?: boolean;
  onClick: () => void;
}) {
  const colorClass = color === "green" ? "bg-[#009688]" : color === "orange" ? "bg-[#fa8c16]" : color === "gray" ? "bg-gray-500" : "bg-[#1677ff]";
  return (
    <button
      className={`${disabled ? "cursor-not-allowed bg-gray-300" : colorClass} h-[22px] whitespace-nowrap rounded-sm px-1.5 text-[11px] leading-[22px] text-white`}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function statusText(status: string) {
  if (status === "待起运") return "等待装柜和出运";
  if (status === "已装柜") return "已装柜，等待实际出运";
  if (status === "头程中") return "头程运输途中";
  if (status === "已到仓") return "目的仓已签收";
  if (status === "已完成") return "头程物流流程已完成";
  return status || "-";
}

export default function TransferBatchManagement({
  batches,
  setBatches,
  availableRecords,
  targetBatchNo = "",
  onTargetHandled,
  carriers,
  channels,
}: {
  batches: TransferBatch[];
  setBatches: Dispatch<SetStateAction<TransferBatch[]>>;
  availableRecords: MaterialLogisticsRecord[];
  targetBatchNo?: string;
  onTargetHandled?: () => void;
  carriers: FirstLegCarrier[];
  channels: FirstLegCarrierChannel[];
}) {
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [selectedBatches, setSelectedBatches] = useState<string[]>([]);
  const [detail, setDetail] = useState<TransferBatch | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [timeAction, setTimeAction] = useState<TimeAction | null>(null);
  const [timeValue, setTimeValue] = useState(todayTime());
  const [timeRemark, setTimeRemark] = useState("");
  const [toast, setToast] = useState("");

  useEffect(() => {
    if (!batches.length && availableRecords.length) setBatches(createMockTransferBatches(availableRecords));
  }, [availableRecords, batches.length, setBatches]);

  useEffect(() => {
    if (!targetBatchNo) return;
    const matched = batches.some((batch) => batch.batchNo === targetBatchNo);
    if (matched) {
      setFilters((current) => ({ ...current, keyword: targetBatchNo }));
      showToast(`已定位头程物流单：${targetBatchNo}`);
      onTargetHandled?.();
    } else if (batches.length) {
      showToast("未找到对应头程物流单");
      onTargetHandled?.();
    }
  }, [batches, targetBatchNo, onTargetHandled]);

  const rows = useMemo(() => batches.filter((batch) => {
    const text = [batch.batchNo, batch.batchName, batch.carrierName, batch.logisticsProvider, batch.channelName, batch.transferCenter, batch.destinationWarehouse, ...batch.records.flatMap((record) => [record.logisticsNo, record.idOrderNo])].join(" ");
    return (!filters.keyword || text.includes(filters.keyword))
      && (filters.status === "请选择" || batch.status === filters.status)
      && (filters.transferCenter === "请选择" || batch.transferCenter === filters.transferCenter)
      && (filters.destinationWarehouse === "请选择" || batch.destinationWarehouse === filters.destinationWarehouse)
      && inRange(batch.createdAt, filters.createdFrom, filters.createdTo)
      && inRange(batch.plannedShipDate, filters.plannedFrom, filters.plannedTo);
  }).slice(0, Math.max(1, Number(filters.pageSize) || 100)), [batches, filters]);

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 1800);
  };
  const updateFilter = <K extends keyof Filters>(key: K, value: Filters[K]) => setFilters((current) => ({ ...current, [key]: value }));
  const toggleBatch = (batchNo: string) => setSelectedBatches((current) => current.includes(batchNo) ? current.filter((item) => item !== batchNo) : [...current, batchNo]);

  const openTimeAction = (kind: "load" | "ship", batch?: TransferBatch) => {
    const batchNos = batch ? [batch.batchNo] : selectedBatches;
    if (!batchNos.length) {
      showToast("请先勾选头程物流");
      return;
    }
    setTimeAction({ kind, batch, batchNos });
    setTimeValue(todayTime());
    setTimeRemark("");
  };

  const applyTimeAction = () => {
    if (!timeAction) return;
    setBatches((current) => current.map((batch) => {
      if (!timeAction.batchNos.includes(batch.batchNo)) return batch;
      if (timeAction.kind === "load") {
        return {
          ...batch,
          containerLoadedAt: timeValue,
          status: batch.status === "待起运" ? "已装柜" : batch.status,
          remark: timeRemark || batch.remark,
        };
      }
      return {
        ...batch,
        actualShipDate: timeValue,
        status: batch.status === "待起运" || batch.status === "已装柜" ? "头程中" : batch.status,
        remark: timeRemark || batch.remark,
      };
    }));
    setDetail((current) => current && timeAction.batchNos.includes(current.batchNo)
      ? { ...current, ...(timeAction.kind === "load" ? { containerLoadedAt: timeValue } : { actualShipDate: timeValue, status: "头程中" }) }
      : current);
    showToast(timeAction.kind === "load" ? "装柜日期已更新" : "实际出运日期已更新");
    setTimeAction(null);
    if (!timeAction.batch) setSelectedBatches([]);
  };

  const createLegacyBatch = (batch: TransferBatch) => {
    if (batches.some((item) => item.batchNo === batch.batchNo)) {
      showToast("货运批次已存在");
      return;
    }
    setBatches((current) => [batch, ...current]);
    setCreateOpen(false);
    showToast("创建成功");
  };

  const actionButtons = (batch: TransferBatch) => {
    if (batch.status === "待起运") {
      return (
        <>
          <SmallButton color="green" onClick={() => openTimeAction("load", batch)}>装柜完成</SmallButton>
          <SmallButton onClick={() => openTimeAction("ship", batch)}>确认出运</SmallButton>
        </>
      );
    }
    if (batch.status === "已装柜") {
      return (
        <>
          <SmallButton color="green" onClick={() => openTimeAction("load", batch)}>修改装柜日期</SmallButton>
          <SmallButton onClick={() => openTimeAction("ship", batch)}>确认出运</SmallButton>
        </>
      );
    }
    if (batch.status === "头程中") {
      return (
        <>
          <SmallButton color="green" onClick={() => openTimeAction("load", batch)}>修改装柜日期</SmallButton>
          <SmallButton onClick={() => openTimeAction("ship", batch)}>修改出运日期</SmallButton>
          <SmallButton color="orange" onClick={() => showToast(`确认签收：${batch.batchNo}`)}>确认签收</SmallButton>
        </>
      );
    }
    if (batch.status === "已到仓") {
      return (
        <>
          <SmallButton color="green" onClick={() => setDetail(batch)}>查看时间记录</SmallButton>
          <SmallButton onClick={() => openTimeAction("ship", batch)}>修改时间</SmallButton>
        </>
      );
    }
    return <SmallButton color="green" onClick={() => setDetail(batch)}>查看时间记录</SmallButton>;
  };

  return (
    <div>
      <PageHeader title="头程物流" desc="面辅料采购头程物流批次、物流商、渠道、时间节点和状态管理。" />

      <section className="mb-2 flex flex-wrap gap-1 border border-gray-200 bg-white px-3 py-2">
        <button className="h-7 rounded-sm bg-[#009688] px-3 text-xs text-white" onClick={() => openTimeAction("load")}>批量装柜完成</button>
        <button className="h-7 rounded-sm bg-[#1677ff] px-3 text-xs text-white" onClick={() => openTimeAction("ship")}>批量确认出运</button>
        <button className="h-7 rounded-sm bg-[#1677ff] px-3 text-xs text-white" onClick={() => showToast(selectedBatches.length ? `批量确认到仓：已选择 ${selectedBatches.length} 个头程物流` : "请先勾选头程物流")}>批量确认到仓</button>
        <button className="h-7 rounded-sm bg-[#fa8c16] px-3 text-xs text-white" onClick={() => showToast(selectedBatches.length ? `批量导出：已选择 ${selectedBatches.length} 个头程物流` : "请先勾选头程物流")}>批量导出</button>
      </section>

      <section className="mb-2 border border-gray-200 bg-white px-3 py-2 text-xs">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <label className="flex items-center gap-1">头程物流信息<div className="flex"><select className="h-8 w-28 rounded-l border border-r-0 px-1"><option>头程物流单号</option><option>批次名称</option><option>头程物流商</option></select><input className="h-8 w-48 rounded-r border px-2 text-sm" value={filters.keyword} onChange={(event) => updateFilter("keyword", event.target.value)} /></div></label>
          <label className="flex items-center gap-1">状态<select className="h-8 w-28 rounded border px-2 text-sm" value={filters.status} onChange={(event) => updateFilter("status", event.target.value)}>{["请选择", ...statusOptions].map((item) => <option key={item}>{item}</option>)}</select></label>
          <label className="flex items-center gap-1">转运中心<select className="h-8 w-36 rounded border px-2 text-sm" value={filters.transferCenter} onChange={(event) => updateFilter("transferCenter", event.target.value)}>{["请选择", "广州转运中心", "深圳转运中心", "义乌转运中心"].map((item) => <option key={item}>{item}</option>)}</select></label>
          <label className="flex items-center gap-1">目的仓<select className="h-8 w-44 rounded border px-2 text-sm" value={filters.destinationWarehouse} onChange={(event) => updateFilter("destinationWarehouse", event.target.value)}>{["请选择", "印尼雅加达面辅料仓", "印尼泗水面辅料仓", "菲律宾马尼拉仓"].map((item) => <option key={item}>{item}</option>)}</select></label>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2">
          <label className="flex items-center gap-1">创建时间<input className="h-8 w-32 rounded border px-1" type="date" value={filters.createdFrom} onChange={(event) => updateFilter("createdFrom", event.target.value)} /><span>至</span><input className="h-8 w-32 rounded border px-1" type="date" value={filters.createdTo} onChange={(event) => updateFilter("createdTo", event.target.value)} /></label>
          <label className="flex items-center gap-1">预计起运时间<input className="h-8 w-32 rounded border px-1" type="date" value={filters.plannedFrom} onChange={(event) => updateFilter("plannedFrom", event.target.value)} /><span>至</span><input className="h-8 w-32 rounded border px-1" type="date" value={filters.plannedTo} onChange={(event) => updateFilter("plannedTo", event.target.value)} /></label>
          <label className="flex items-center gap-1">每页显示<input className="h-8 w-16 rounded border px-2 text-sm" value={filters.pageSize} onChange={(event) => updateFilter("pageSize", event.target.value.replace(/\D/g, ""))} /></label>
          <button className="h-8 rounded-sm bg-[#1677ff] px-4 text-sm text-white" onClick={() => showToast("已按当前条件查询")}>查询</button>
          <button className="h-8 rounded-sm border px-4 text-sm" onClick={() => setFilters(emptyFilters)}>默认</button>
          <button className="h-8 rounded-sm bg-[#009688] px-4 text-sm text-white" onClick={() => setCreateOpen(true)}>添加</button>
        </div>
      </section>

      <section className="mb-2 flex gap-8 border border-gray-200 bg-white px-4 py-2 text-sm">
        <div>头程物流批次数：<strong>{rows.length}</strong></div>
        <div>物流票数：<strong>{rows.reduce((sum, batch) => sum + batch.records.length, 0)}</strong></div>
        <div>总箱数：<strong>{rows.reduce((sum, batch) => sum + (batch.boxCount ?? packageCount(batch.records)), 0)}</strong></div>
        <div>总重量：<strong>{qty(rows.reduce((sum, batch) => sum + (batch.totalWeightKg ?? totalWeight(batch.records)), 0))} KG</strong></div>
      </section>

      <div className="overflow-x-auto border border-gray-200 bg-white">
        <table className="min-w-[2500px] table-fixed text-left text-xs text-gray-800">
          <colgroup>{[45,280,300,300,260,330,150,220,210,300].map((width, index) => <col key={index} style={{ width }} />)}</colgroup>
          <thead className="bg-gray-50"><tr>{["勾选框", "头程物流信息", "物流信息", "采购单信息", "头程物流数据", "时间", "状态", "备注", "添加人", "操作"].map((title) => <th key={title} className="border-b px-2 py-2 font-medium">{title}</th>)}</tr></thead>
          <tbody>
            {rows.map((batch) => (
              <tr key={batch.batchNo} className={`border-b border-gray-200 align-top hover:bg-gray-50 ${filters.keyword === batch.batchNo ? "bg-blue-50 ring-1 ring-inset ring-blue-300" : ""}`}>
                <td className="px-2 py-2 text-center"><input type="checkbox" checked={selectedBatches.includes(batch.batchNo)} onChange={() => toggleBatch(batch.batchNo)} /></td>
                <td className="px-2 py-2 leading-5">
                  <button className="font-medium text-brand" onClick={() => setDetail(batch)}>{batch.batchNo}</button>
                  <div>{batch.batchName}</div>
                  <div>头程物流商：{batch.carrierName || batch.logisticsProvider || "-"}</div>
                  <div>运输方式：{batch.transportMethod || batch.shippingType || batch.carrier}</div>
                  <div>渠道：<span className="font-medium text-blue-700">{batch.channelName || batch.channelCode || "-"}</span></div>
                  <div>仓库：{batch.warehouse || batch.destinationWarehouse}</div>
                  <div>地区：{batch.regionRoute || batch.sourceRegion || "-"}</div>
                </td>
                <td className="px-2 py-2 leading-5">{batch.records.length ? batch.records.map((record, index) => <div key={record.idOrderNo} className={index ? "mt-1 border-t border-dashed pt-1" : ""}><span>{record.company}</span>：<span className="text-brand">{record.logisticsNo}</span><br />箱数：{record.boxCount}，重量：{qty(record.logisticsWeight)} KG<br />物流费：{money(record.freightAmount)}</div>) : <div>物流公司：{batch.logisticsProvider || "-"}<br />头程单号：-<br />箱数：{batch.boxCount ?? 0}</div>}</td>
                <td className="px-2 py-2 leading-5">{batch.records.map((record, index) => <div key={record.idOrderNo} className={index ? "mt-1 border-t border-dashed pt-1" : ""}><span className="text-brand">{record.idOrderNo}</span><br />{record.materialName}<br />供应商：{record.supplier}<br />数量：{qty(record.purchaseQty)} {record.unit}</div>)}</td>
                <td className="px-2 py-2 leading-5"><div>物流票数：{batch.records.length}</div><div>总箱数：{batch.boxCount ?? packageCount(batch.records)}</div><div>大货数量：{batch.bulkQty ?? 0}</div><div>总体积：{qty(batch.totalVolumeM3)} m³</div><div>总重量：{qty(batch.totalWeightKg ?? totalWeight(batch.records))} KG</div><div>运费 RMB：{money(batch.freightRmb ?? batch.records.reduce((sum, record) => sum + (record.domesticFreight ?? 0), 0))}</div><div>运费 USD：{money(batch.freightUsd)}</div><div>所得税：{money(batch.incomeTaxIdr)}</div><div>增值税：{money(batch.vatIdr)}</div><div>关税：{money(batch.customsDutyIdr)}</div><div>罚款：{money(batch.fineIdr)}</div><div>清关费用：{money(batch.clearanceFeeIdr)}</div></td>
                <td className="px-2 py-2 leading-5">
                  <div>创建时间：{batch.createdAt}</div>
                  <div>预计起运时间：{batch.plannedShipDate || "-"}</div>
                  <div>预计运输天数：{batch.estimatedTransitDays ?? batch.transitDays ?? "-"}天</div>
                  <div>预计送到日期：{batch.expectedBandungArrivalAt || expectedDeliveryDate(batch)}</div>
                  <div>装柜日期：{batch.containerLoadedAt || "-"}</div>
                  <div>实际出运日期：{batch.actualShipDate || "-"}</div>
                  <div>实际仓库签收日期：{actualSignedAt(batch) || "-"}</div>
                  <div>实际运输天数：{actualTransitDays(batch)}</div>
                </td>
                <td className="px-2 py-2 leading-5"><StatusBadge status={batch.status} /><div className="mt-1">{statusText(batch.status)}</div>{batch.containerLoadedAt && <span className="mt-1 inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] text-emerald-700">已装柜</span>}</td>
                <td className="whitespace-normal px-2 py-2 leading-5">{batch.remark}<br />头程来源：面辅料采购物流信息<br />单据要求：随货附采购明细</td>
                <td className="px-2 py-2 leading-5"><div>添加人：{batch.creator}</div><div>添加时间：{batch.createdAt}</div><div>更新人：系统管理员</div><div>更新时间：{batch.actualShipDate || batch.containerLoadedAt || batch.createdAt}</div></td>
                <td className="px-2 py-2"><div className="flex w-[285px] flex-wrap gap-1"><SmallButton color="green" onClick={() => setDetail(batch)}>查看头程物流</SmallButton>{actionButtons(batch)}<SmallButton color="green" onClick={() => showToast(`查看物流明细：${batch.batchNo}`)}>物流明细</SmallButton><SmallButton color="orange" onClick={() => showToast(`打印头程物流：${batch.batchNo}`)}>打印</SmallButton><SmallButton onClick={() => showToast(`导出头程物流：${batch.batchNo}`)}>导出</SmallButton><SmallButton color="gray" onClick={() => showToast(`日志记录：${batch.batchNo}`)}>日志</SmallButton></div></td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={10} className="p-8 text-center text-gray-400">暂无头程物流</td></tr>}
          </tbody>
        </table>
      </div>

      <DesignLogicCard sections={[
        { title: "页面功能说明", headers: ["功能", "说明"], rows: [["头程物流批次管理", "管理面辅料采购相关头程物流批次。"], ["物流信息展示", "查看头程物流商、运输方式、渠道、物流数据和时间节点。"], ["装柜完成", "点击装柜完成记录装柜日期。"], ["确认出运", "点击确认出运记录实际出运日期。"], ["预计送到日期", "根据预计起运时间 + 预计运输天数自动计算。"], ["实际运输天数", "根据实际仓库签收日期 - 实际出运日期自动计算。"]] },
        { title: "业务逻辑说明", headers: ["业务场景", "规则说明", "页面结果"], rows: [["头程物流商", "每个头程物流单关联一个头程物流商", "页面展示物流商名称"], ["运输方式", "来自头程物流渠道配置", "页面展示空派、海派、快递等"], ["渠道", "头程物流单绑定具体渠道", "页面展示渠道名称"], ["预计运输天数", "来自渠道配置", "页面展示预计运输天数"], ["预计送到日期", "预计起运时间 + 预计运输天数", "自动展示预计送到日期"], ["装柜完成", "点击装柜完成并选择时间", "生成装柜日期"], ["确认出运", "点击确认出运并选择时间", "生成实际出运日期"], ["实际运输天数", "实际仓库签收日期 - 实际出运日期", "自动展示实际运输天数"], ["数据为空", "缺少实际时间时", "显示 -"], ["状态变化", "确认出运后", "状态可变为头程中"]] },
      ]} />

      <CreateTransferBatchModal open={createOpen} onClose={() => setCreateOpen(false)} onSubmit={createLegacyBatch} carriers={carriers} channels={channels} />

      <FormModal open={Boolean(timeAction)} title={timeAction?.kind === "load" ? "确认装柜完成" : "确认实际出运"} widthClass="w-[520px]" onClose={() => setTimeAction(null)}>
        <div className="space-y-3 text-sm">
          {timeAction?.batch ? (
            <div className="grid gap-2 rounded border border-gray-200 bg-gray-50 p-3 text-xs">
              <div>头程物流单号：<span className="font-medium text-blue-700">{timeAction.batch.batchNo}</span></div>
              <div>头程物流商：{timeAction.batch.carrierName || timeAction.batch.logisticsProvider || "-"}</div>
              <div>渠道：{timeAction.batch.channelName || "-"}</div>
            </div>
          ) : (
            <div className="rounded border border-gray-200 bg-gray-50 p-3 text-xs">本次选择记录数：<span className="font-medium text-blue-700">{timeAction?.batchNos.length ?? 0}</span></div>
          )}
          <label className="grid gap-1 text-xs text-gray-600">{timeAction?.kind === "load" ? "装柜日期" : "实际出运日期"}<input className="h-8 rounded border px-2 text-sm" value={timeValue} onChange={(event) => setTimeValue(event.target.value)} /></label>
          <label className="grid gap-1 text-xs text-gray-600">备注<textarea className="h-20 rounded border px-2 py-1 text-sm" value={timeRemark} onChange={(event) => setTimeRemark(event.target.value)} /></label>
          <div className="flex justify-end gap-2 border-t pt-3"><button className="h-8 rounded border px-4 text-sm" onClick={() => setTimeAction(null)}>取消</button><button className="h-8 rounded bg-[#1677ff] px-4 text-sm text-white" onClick={applyTimeAction}>{timeAction?.kind === "load" ? "确认装柜完成" : "确认出运"}</button></div>
        </div>
      </FormModal>

      <DetailModal open={!!detail} title="头程物流详情" onClose={() => setDetail(null)}>
        {detail && <div className="space-y-3 text-sm"><div className="grid grid-cols-2 gap-2 leading-6"><div>头程物流单号：<span className="text-brand">{detail.batchNo}</span></div><div>状态：{detail.status}</div><div>批次名称：{detail.batchName}</div><div>头程物流商：{detail.carrierName || detail.logisticsProvider || "-"}</div><div>运输方式：{detail.transportMethod || detail.shippingType || detail.carrier}</div><div>渠道：{detail.channelName || "-"}</div><div>仓库：{detail.warehouse || detail.destinationWarehouse}</div><div>预计送到日期：{expectedDeliveryDate(detail)}</div><div>装柜日期：{detail.containerLoadedAt || "-"}</div><div>实际运输天数：{actualTransitDays(detail)}</div></div><div className="overflow-x-auto border border-gray-200"><table className="min-w-[900px] text-left text-xs"><thead className="bg-gray-50"><tr>{["物流信息", "采购单", "物料 / 供应商", "数量", "重量 / 箱数", "物流费用", "状态"].map((title) => <th key={title} className="border-b px-2 py-2 font-medium">{title}</th>)}</tr></thead><tbody>{detail.records.map((record) => <tr key={record.idOrderNo} className="border-b last:border-0"><td className="px-2 py-2">{record.company}<br /><span className="text-brand">{record.logisticsNo}</span></td><td className="px-2 py-2">{record.idOrderNo}</td><td className="px-2 py-2">{record.materialName}<br />{record.supplier}</td><td className="px-2 py-2">{qty(record.purchaseQty)} {record.unit}</td><td className="px-2 py-2">{qty(record.logisticsWeight)} KG<br />{record.boxCount}箱</td><td className="px-2 py-2">{money(record.freightAmount)}</td><td className="px-2 py-2">{record.actionStatus}</td></tr>)}</tbody></table></div></div>}
      </DetailModal>
      <Toast msg={toast} />
    </div>
  );
}
