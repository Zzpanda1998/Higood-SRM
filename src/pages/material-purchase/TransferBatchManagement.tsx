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
import CreateTransferBatchModal from "./CreateTransferBatchModal";
import type { MaterialLogisticsRecord } from "./MaterialPurchaseTracking";

type Draft = {
  batchName: string;
  transferCenter: string;
  destinationWarehouse: string;
  carrier: string;
  plannedShipDate: string;
  remark: string;
};

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

const emptyDraft: Draft = {
  batchName: "",
  transferCenter: "广州转运中心",
  destinationWarehouse: "印尼雅加达面辅料仓",
  carrier: "空运专线",
  plannedShipDate: "2026-06-12",
  remark: "",
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

const statusFlow: TransferBatchStatus[] = ["待转运", "头程中", "已到仓", "已完成"];
const qty = (value?: number) => (value ?? 0).toLocaleString("zh-CN", { maximumFractionDigits: 3 });
const money = (value?: number) => (value ?? 0).toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const totalWeight = (records: MaterialLogisticsRecord[]) => records.reduce((sum, item) => sum + (item.logisticsWeight ?? 0), 0);
const packageCount = (records: MaterialLogisticsRecord[]) => records.reduce((sum, item) => sum + (item.boxCount ?? 0), 0);
const todayTime = () => "2026-06-09 10:30";
const createBatchNo = (batches: TransferBatch[]) => `TB-2026-${String(Math.max(0, ...batches.map((batch) => Number(batch.batchNo.split("-").at(-1)) || 0)) + 1).padStart(4, "0")}`;

function inRange(value: string, from: string, to: string) {
  const date = value.slice(0, 10);
  if (from && date < from) return false;
  if (to && date > to) return false;
  return true;
}

function SmallButton({ children, color = "blue", onClick }: { children: React.ReactNode; color?: "blue" | "green" | "orange" | "gray"; onClick: () => void }) {
  const colorClass = color === "green" ? "bg-[#009688]" : color === "orange" ? "bg-[#fa8c16]" : color === "gray" ? "bg-gray-500" : "bg-[#1677ff]";
  return <button className={`${colorClass} h-[22px] whitespace-nowrap rounded-sm px-1.5 text-[11px] leading-[22px] text-white`} onClick={onClick}>{children}</button>;
}

export default function TransferBatchManagement({
  batches,
  setBatches,
  availableRecords,
}: {
  batches: TransferBatch[];
  setBatches: Dispatch<SetStateAction<TransferBatch[]>>;
  availableRecords: MaterialLogisticsRecord[];
}) {
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [selectedBatches, setSelectedBatches] = useState<string[]>([]);
  const [selectedRecords, setSelectedRecords] = useState<string[]>([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingBatchNo, setEditingBatchNo] = useState("");
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [detail, setDetail] = useState<TransferBatch | null>(null);
  const [toast, setToast] = useState("");

  useEffect(() => {
    if (!batches.length && availableRecords.length) setBatches(createMockTransferBatches(availableRecords));
  }, [availableRecords, batches.length, setBatches]);

  const batchRecordIds = useMemo(() => new Set(batches.flatMap((batch) => batch.records.map((record) => record.idOrderNo))), [batches]);
  const pendingRecords = useMemo(() => availableRecords.filter((record) => !batchRecordIds.has(record.idOrderNo) || batches.find((batch) => batch.batchNo === editingBatchNo)?.records.some((item) => item.idOrderNo === record.idOrderNo)), [availableRecords, batchRecordIds, batches, editingBatchNo]);
  const rows = useMemo(() => batches.filter((batch) => {
    const text = [batch.batchNo, batch.batchName, batch.transferCenter, batch.destinationWarehouse, ...batch.records.flatMap((record) => [record.logisticsNo, record.idOrderNo])].join(" ");
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
  const updateDraft = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft((current) => ({ ...current, [key]: value }));
  const toggleBatch = (batchNo: string) => setSelectedBatches((current) => current.includes(batchNo) ? current.filter((item) => item !== batchNo) : [...current, batchNo]);
  const toggleRecord = (id: string) => setSelectedRecords((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);

  const openCreate = () => {
    setCreateOpen(true);
  };

  const openEdit = (batch: TransferBatch) => {
    setEditingBatchNo(batch.batchNo);
    setDraft({
      batchName: batch.batchName,
      transferCenter: batch.transferCenter,
      destinationWarehouse: batch.destinationWarehouse,
      carrier: batch.carrier,
      plannedShipDate: batch.plannedShipDate,
      remark: batch.remark,
    });
    setSelectedRecords(batch.records.map((record) => record.idOrderNo));
    setFormOpen(true);
  };

  const saveBatch = () => {
    const records = pendingRecords.filter((record) => selectedRecords.includes(record.idOrderNo));
    if (!draft.batchName.trim()) return showToast("请填写头程物流名称");
    if (!records.length) return showToast("请至少选择一条物流记录");
    if (editingBatchNo) {
      setBatches((current) => current.map((batch) => batch.batchNo === editingBatchNo ? { ...batch, ...draft, records } : batch));
      showToast(`已保存头程物流：${editingBatchNo}`);
    } else {
      const batchNo = createBatchNo(batches);
      setBatches((current) => [{
        batchNo,
        ...draft,
        creator: "王采购",
        createdAt: todayTime(),
        status: "待转运",
        records,
      }, ...current]);
      showToast(`已新增头程物流：${batchNo}`);
    }
    setFormOpen(false);
  };

  const setStatus = (batch: TransferBatch, status: TransferBatchStatus) => {
    setBatches((current) => current.map((item) => item.batchNo === batch.batchNo ? {
      ...item,
      status,
      actualShipDate: status === "头程中" && !item.actualShipDate ? todayTime() : item.actualShipDate,
      arrivedAt: status === "已到仓" && !item.arrivedAt ? todayTime() : item.arrivedAt,
    } : item));
    setDetail((current) => current?.batchNo === batch.batchNo ? { ...current, status } : current);
    showToast(`${batch.batchNo} 已更新为 ${status}`);
  };

  const nextStatus = (batch: TransferBatch) => {
    const index = statusFlow.indexOf(batch.status);
    if (index < 0) return showToast("当前状态请通过编辑费用或交货流程维护");
    if (index >= statusFlow.length - 1) return showToast("当前头程物流已完成");
    setStatus(batch, statusFlow[index + 1]);
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

  const batchAction = (action: string) => selectedBatches.length ? showToast(`${action}：已选择 ${selectedBatches.length} 个头程物流`) : showToast("请先勾选头程物流");

  return (
    <div>
      <PageHeader title="头程物流" desc="面辅料采购物流组批、头程、到仓和完成状态管理。" />

      <section className="mb-2 flex flex-wrap gap-1 border border-gray-200 bg-white px-3 py-2">
        <button className="h-7 rounded-sm bg-[#1677ff] px-3 text-xs text-white" onClick={() => batchAction("批量开始头程")}>批量开始头程</button>
        <button className="h-7 rounded-sm bg-[#1677ff] px-3 text-xs text-white" onClick={() => batchAction("批量确认到仓")}>批量确认到仓</button>
        <button className="h-7 rounded-sm bg-[#009688] px-3 text-xs text-white" onClick={() => batchAction("批量完成")}>批量完成</button>
        <button className="h-7 rounded-sm bg-[#fa8c16] px-3 text-xs text-white" onClick={() => batchAction("批量导出")}>批量导出</button>
      </section>

      <section className="mb-2 border border-gray-200 bg-white px-3 py-2 text-xs">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <label className="flex items-center gap-1">头程物流信息<div className="flex"><select className="h-8 w-28 rounded-l border border-r-0 px-1"><option>头程物流单号</option><option>头程物流名称</option><option>物流单号</option></select><input className="h-8 w-48 rounded-r border px-2 text-sm" value={filters.keyword} onChange={(event) => updateFilter("keyword", event.target.value)} /></div></label>
          <label className="flex items-center gap-1">状态<select className="h-8 w-28 rounded border px-2 text-sm" value={filters.status} onChange={(event) => updateFilter("status", event.target.value)}>{["请选择", ...statusFlow].map((item) => <option key={item}>{item}</option>)}</select></label>
          <label className="flex items-center gap-1">转运中心<select className="h-8 w-36 rounded border px-2 text-sm" value={filters.transferCenter} onChange={(event) => updateFilter("transferCenter", event.target.value)}>{["请选择", "广州转运中心", "深圳转运中心", "义乌转运中心"].map((item) => <option key={item}>{item}</option>)}</select></label>
          <label className="flex items-center gap-1">目的仓<select className="h-8 w-44 rounded border px-2 text-sm" value={filters.destinationWarehouse} onChange={(event) => updateFilter("destinationWarehouse", event.target.value)}>{["请选择", "印尼雅加达面辅料仓", "印尼泗水面辅料仓", "菲律宾马尼拉仓"].map((item) => <option key={item}>{item}</option>)}</select></label>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2">
          <label className="flex items-center gap-1">创建时间<input className="h-8 w-32 rounded border px-1" type="date" value={filters.createdFrom} onChange={(event) => updateFilter("createdFrom", event.target.value)} /><span>至</span><input className="h-8 w-32 rounded border px-1" type="date" value={filters.createdTo} onChange={(event) => updateFilter("createdTo", event.target.value)} /></label>
          <label className="flex items-center gap-1">计划转运时间<input className="h-8 w-32 rounded border px-1" type="date" value={filters.plannedFrom} onChange={(event) => updateFilter("plannedFrom", event.target.value)} /><span>至</span><input className="h-8 w-32 rounded border px-1" type="date" value={filters.plannedTo} onChange={(event) => updateFilter("plannedTo", event.target.value)} /></label>
          <label className="flex items-center gap-1">每页显示<input className="h-8 w-16 rounded border px-2 text-sm" value={filters.pageSize} onChange={(event) => updateFilter("pageSize", event.target.value.replace(/\D/g, ""))} /></label>
          <button className="h-8 rounded-sm bg-[#1677ff] px-4 text-sm text-white" onClick={() => showToast("已按当前条件查询")}>查询</button>
          <button className="h-8 rounded-sm border px-4 text-sm" onClick={() => setFilters(emptyFilters)}>默认</button>
          <button className="h-8 rounded-sm bg-[#009688] px-4 text-sm text-white" onClick={openCreate}>添加</button>
        </div>
      </section>

      <section className="mb-2 flex gap-8 border border-gray-200 bg-white px-4 py-2 text-sm">
        <div>头程物流批次数：<strong>{rows.length}</strong></div>
        <div>物流票数：<strong>{rows.reduce((sum, batch) => sum + batch.records.length, 0)}</strong></div>
        <div>总箱数：<strong>{rows.reduce((sum, batch) => sum + packageCount(batch.records), 0)}</strong></div>
        <div>总重量：<strong>{qty(rows.reduce((sum, batch) => sum + totalWeight(batch.records), 0))} KG</strong></div>
      </section>

      <div className="overflow-x-auto border border-gray-200 bg-white">
        <table className="min-w-[2450px] table-fixed text-left text-xs text-gray-800">
          <colgroup>{[45,190,290,300,260,245,120,220,220,310].map((width, index) => <col key={index} style={{ width }} />)}</colgroup>
          <thead className="bg-gray-50"><tr>{["勾选框", "头程物流信息", "物流信息", "采购单信息", "头程物流数据", "时间", "状态", "备注", "添加人", "操作"].map((title) => <th key={title} className="border-b px-2 py-2 font-medium">{title}</th>)}</tr></thead>
          <tbody>
            {rows.map((batch) => (
              <tr key={batch.batchNo} className="border-b border-gray-200 align-top hover:bg-gray-50">
                <td className="px-2 py-2 text-center"><input type="checkbox" checked={selectedBatches.includes(batch.batchNo)} onChange={() => toggleBatch(batch.batchNo)} /></td>
                <td className="px-2 py-2 leading-5"><button className="font-medium text-brand" onClick={() => setDetail(batch)}>{batch.batchNo}</button><div>{batch.batchName}</div><div>货运类型：{batch.shippingType || batch.carrier}</div><div>仓库：{batch.warehouse || batch.destinationWarehouse}</div><div>地区：{batch.regionRoute || batch.sourceRegion || "-"}</div></td>
                <td className="px-2 py-2 leading-5">{batch.records.length ? batch.records.map((record, index) => <div key={record.idOrderNo} className={index ? "mt-1 border-t border-dashed pt-1" : ""}><span>{record.company}</span>：<span className="text-brand">{record.logisticsNo}</span><br />箱数：{record.boxCount}，重量：{qty(record.logisticsWeight)} KG<br />物流费：{money(record.freightAmount)}</div>) : <div>物流公司：{batch.logisticsProvider || "-"}<br />头程单号：-<br />箱数：{batch.boxCount ?? 0}</div>}</td>
                <td className="px-2 py-2 leading-5">{batch.records.map((record, index) => <div key={record.idOrderNo} className={index ? "mt-1 border-t border-dashed pt-1" : ""}><span className="text-brand">{record.idOrderNo}</span><br />{record.materialName}<br />供应商：{record.supplier}<br />数量：{qty(record.purchaseQty)} {record.unit}</div>)}</td>
                <td className="px-2 py-2 leading-5"><div>物流票数：{batch.records.length}</div><div>总箱数：{batch.boxCount ?? packageCount(batch.records)}</div><div>大货数量：{batch.bulkQty ?? 0}</div><div>总体积：{qty(batch.totalVolumeM3)} m³</div><div>总重量：{qty(batch.totalWeightKg ?? totalWeight(batch.records))} KG</div><div>运费 RMB：{money(batch.freightRmb ?? batch.records.reduce((sum, record) => sum + (record.domesticFreight ?? 0), 0))}</div><div>运费 USD：{money(batch.freightUsd)}</div><div>所得税：{money(batch.incomeTaxIdr)}</div><div>增值税：{money(batch.vatIdr)}</div><div>关税：{money(batch.customsDutyIdr)}</div><div>罚款：{money(batch.fineIdr)}</div><div>清关费用：{money(batch.clearanceFeeIdr)}</div></td>
                <td className="px-2 py-2 leading-5"><div>创建时间：{batch.createdAt}</div><div>计划转运：{batch.plannedShipDate || "-"}</div><div>预计送达万隆：{batch.expectedBandungArrivalAt || "-"}</div><div>实际转运：{batch.actualShipDate || "-"}</div><div>到仓时间：{batch.arrivedAt || "-"}</div><div>路途天数：{batch.transitDays ?? 0}天</div></td>
                <td className="px-2 py-2 leading-5"><StatusBadge status={batch.status} /><div className="mt-1">{batch.status === "待转运" ? "等待转运中心发出" : batch.status === "头程中" ? "头程运输途中" : batch.status === "已到仓" ? "目的仓已签收" : batch.status === "待交货" ? "等待交货" : batch.status === "已交货" ? "已完成交货" : batch.status === "已发货" ? "货物已发出" : batch.status === "已入库" ? "仓库已入库" : "头程物流流程已完成"}</div></td>
                <td className="whitespace-normal px-2 py-2 leading-5">{batch.remark}<br />头程来源：面辅料采购物流信息<br />单据要求：随货附采购明细</td>
                <td className="px-2 py-2 leading-5"><div>添加人：{batch.creator}</div><div>添加时间：{batch.createdAt}</div><div>更新人：系统管理员</div><div>更新时间：{batch.actualShipDate || batch.createdAt}</div></td>
                <td className="px-2 py-2"><div className="flex w-[285px] flex-wrap gap-1">{batch.records.length === 0 ? <><SmallButton color="green" onClick={() => setDetail(batch)}>详情</SmallButton><SmallButton onClick={() => showToast(`编辑费用：${batch.batchNo}`)}>编辑费用</SmallButton><SmallButton color="orange" onClick={() => showToast(`设置到港时间：${batch.batchNo}`)}>设置到港时间</SmallButton></> : <><SmallButton color="green" onClick={() => setDetail(batch)}>查看头程物流</SmallButton><SmallButton onClick={() => openEdit(batch)}>编辑头程物流</SmallButton><SmallButton onClick={() => nextStatus(batch)}>状态流转</SmallButton><SmallButton color="green" onClick={() => showToast(`查看物流明细：${batch.batchNo}`)}>物流明细</SmallButton><SmallButton color="orange" onClick={() => showToast(`打印头程物流：${batch.batchNo}`)}>打印头程物流</SmallButton><SmallButton color="green" onClick={() => showToast(`上传头程凭证：${batch.batchNo}`)}>上传凭证</SmallButton><SmallButton onClick={() => showToast(`导出头程物流：${batch.batchNo}`)}>导出</SmallButton><SmallButton color="gray" onClick={() => showToast(`日志记录：${batch.batchNo}`)}>日志记录</SmallButton></>}</div></td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={10} className="p-8 text-center text-gray-400">暂无头程物流</td></tr>}
          </tbody>
        </table>
      </div>

      <DesignLogicCard sections={[
        { title: "页面定位", headers: ["项目", "说明"], rows: [["页面名称", "头程物流"], ["所属业务", "面辅料采购头程物流"], ["上游来源", "面辅料采购物流信息"], ["展示结构", "批量操作、两行筛选、统计条、高密度多行列表、新增编辑入口"]] },
        { title: "筛选与操作", headers: ["区域", "规则", "结果"], rows: [["筛选区", "头程物流信息、状态、转运中心、目的仓、创建时间、计划转运时间、每页显示", "字段常驻，不使用高级筛选抽屉"], ["创建头程物流", "点击添加打开单列创建头程物流弹窗，必填货运批次、货源地区、仓库、货运类型、区域", "立即提交后创建记录，关闭或右上角 X 不保存"], ["操作列", "查看、编辑、状态流转、物流明细、打印、凭证、导出、日志", "按钮全部外露，不收进更多操作"]] },
        { title: "列表字段", headers: ["分区", "内容", "展示方式"], rows: [["头程物流", "头程物流单号、名称、中心、目的仓、承运方式", "同列多行堆叠"], ["物流与采购", "快递单、箱数、重量、采购单、物料、供应商、数量", "按物流记录分隔展示"], ["头程物流数据", "票数、箱数、重量、国内运费、转运费、物流费用", "汇总信息集中展示"], ["时间与状态", "创建、计划、实际转运、到仓、完成时间和当前节点", "全过程信息不隐藏"]] },
        { title: "创建头程物流字段", headers: ["字段", "说明"], rows: [["货运批次 / 货源地区 / 仓库 / 货运类型 / 区域", "创建头程物流必填字段"], ["货运公司", "头程物流公司"], ["物流费用 RMB / USD", "人民币和美元运费"], ["所得税 / 增值税 / 关税 / 罚款 / 清关费用", "印尼 IDR 费用，填写时必须为非负数字"], ["入库状态", "横向单选：待交货、已交货、已发货、已入库，默认待交货"], ["预计送达万隆时间 / 备注", "预计到达时间和补充说明"]] },
      ]} />

      <CreateTransferBatchModal open={createOpen} onClose={() => setCreateOpen(false)} onSubmit={createLegacyBatch} />

      <FormModal open={formOpen} title="编辑头程物流" widthClass="w-[940px]" onClose={() => setFormOpen(false)}>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3 text-xs md:grid-cols-3">
            <label className="grid gap-1 text-gray-600">头程物流名称<input className="h-8 rounded border px-2 text-sm" value={draft.batchName} onChange={(event) => updateDraft("batchName", event.target.value)} /></label>
            <label className="grid gap-1 text-gray-600">转运中心<select className="h-8 rounded border px-2 text-sm" value={draft.transferCenter} onChange={(event) => updateDraft("transferCenter", event.target.value)}><option>广州转运中心</option><option>深圳转运中心</option><option>义乌转运中心</option></select></label>
            <label className="grid gap-1 text-gray-600">目的仓<select className="h-8 rounded border px-2 text-sm" value={draft.destinationWarehouse} onChange={(event) => updateDraft("destinationWarehouse", event.target.value)}><option>印尼雅加达面辅料仓</option><option>印尼泗水面辅料仓</option><option>菲律宾马尼拉仓</option></select></label>
            <label className="grid gap-1 text-gray-600">承运方式<select className="h-8 rounded border px-2 text-sm" value={draft.carrier} onChange={(event) => updateDraft("carrier", event.target.value)}><option>空运专线</option><option>海运拼柜</option><option>陆运快线</option></select></label>
            <label className="grid gap-1 text-gray-600">计划转运日期<input className="h-8 rounded border px-2 text-sm" type="date" value={draft.plannedShipDate} onChange={(event) => updateDraft("plannedShipDate", event.target.value)} /></label>
            <label className="grid gap-1 text-gray-600">备注<input className="h-8 rounded border px-2 text-sm" value={draft.remark} onChange={(event) => updateDraft("remark", event.target.value)} /></label>
          </div>
          <div className="overflow-x-auto border border-gray-200">
            <table className="min-w-[1050px] text-left text-xs"><thead className="bg-gray-50"><tr>{["勾选", "物流信息", "采购单信息", "物料信息", "采购地区", "重量 / 箱数", "状态", "备注"].map((title) => <th key={title} className="border-b px-2 py-2 font-medium">{title}</th>)}</tr></thead><tbody>{pendingRecords.map((record) => <tr key={record.idOrderNo} className="border-b last:border-0"><td className="px-2 py-2 text-center"><input type="checkbox" checked={selectedRecords.includes(record.idOrderNo)} onChange={() => toggleRecord(record.idOrderNo)} /></td><td className="px-2 py-2">{record.company}<br /><span className="text-brand">{record.logisticsNo}</span></td><td className="px-2 py-2">{record.idOrderNo}<br />{record.sourceProductOrderNo}</td><td className="px-2 py-2">{record.materialName}<br />{record.supplier}</td><td className="px-2 py-2">{record.purchaseRegion}</td><td className="px-2 py-2">{qty(record.logisticsWeight)} KG<br />{record.boxCount}箱</td><td className="px-2 py-2">{record.actionStatus}</td><td className="px-2 py-2">{record.logisticRemark}</td></tr>)}</tbody></table>
          </div>
          <div className="flex justify-end gap-2 border-t pt-3"><button className="h-8 rounded border px-4 text-sm" onClick={() => setFormOpen(false)}>取消</button><button className="h-8 rounded bg-[#009688] px-4 text-sm text-white" onClick={saveBatch}>保存</button></div>
        </div>
      </FormModal>

      <DetailModal open={!!detail} title="头程物流详情" onClose={() => setDetail(null)}>
        {detail && <div className="space-y-3 text-sm"><div className="grid grid-cols-2 gap-2 leading-6"><div>头程物流单号：<span className="text-brand">{detail.batchNo}</span></div><div>状态：{detail.status}</div><div>头程物流名称：{detail.batchName}</div><div>承运方式：{detail.carrier}</div><div>转运中心：{detail.transferCenter}</div><div>目的仓：{detail.destinationWarehouse}</div><div>计划转运：{detail.plannedShipDate}</div><div>总重量：{qty(totalWeight(detail.records))} KG</div></div><div className="overflow-x-auto border border-gray-200"><table className="min-w-[900px] text-left text-xs"><thead className="bg-gray-50"><tr>{["物流信息", "采购单", "物料 / 供应商", "数量", "重量 / 箱数", "物流费用", "状态"].map((title) => <th key={title} className="border-b px-2 py-2 font-medium">{title}</th>)}</tr></thead><tbody>{detail.records.map((record) => <tr key={record.idOrderNo} className="border-b last:border-0"><td className="px-2 py-2">{record.company}<br /><span className="text-brand">{record.logisticsNo}</span></td><td className="px-2 py-2">{record.idOrderNo}</td><td className="px-2 py-2">{record.materialName}<br />{record.supplier}</td><td className="px-2 py-2">{qty(record.purchaseQty)} {record.unit}</td><td className="px-2 py-2">{qty(record.logisticsWeight)} KG<br />{record.boxCount}箱</td><td className="px-2 py-2">{money(record.freightAmount)}</td><td className="px-2 py-2">{record.actionStatus}</td></tr>)}</tbody></table></div></div>}
      </DetailModal>
      <Toast msg={toast} />
    </div>
  );
}
