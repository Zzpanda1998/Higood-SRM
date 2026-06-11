import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import DesignLogicCard from "../../components/common/DesignLogicCard";
import PageHeader from "../../components/common/PageHeader";
import Toast from "../../components/common/Toast";
import { idMaterialPurchaseOrders, type IdMaterialPurchaseOrder } from "../../mock/idMaterialPurchaseOrders";
import type { ImportedLogisticsInfo } from "../../types/materialLogistics";
import type { TransferBatch } from "../../types/transferBatch";
import JoinHeadLogisticsModal, {
  type ExistingHeadAllocation,
  type JoinHeadLogisticsPayload,
} from "./JoinHeadLogisticsModal";

type Filters = {
  keywordType: string;
  logisticsNo: string;
  signedFrom: string;
  signedTo: string;
  status: string;
  purchaseRegion: string;
  pageSize: string;
};

const emptyFilters: Filters = {
  keywordType: "物流单号",
  logisticsNo: "",
  signedFrom: "",
  signedTo: "",
  status: "请选择",
  purchaseRegion: "请选择",
  pageSize: "100",
};

const logisticsCompanies = ["中通", "顺丰", "圆通", "跨越", "德邦", "韵达", "极兔", "京东"];
const trackingNumbers = ["79009539542096", "SF1574547229798", "YT739604284517", "KY2606060091", "DB202606080075", "432985601288", "JT00062671398", "JDVA2606080031"];

const qty = (value?: number) => (value ?? 0).toLocaleString("zh-CN", { maximumFractionDigits: 3 });
const money = (value?: number) => (value ?? 0).toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const dateOnly = (value?: string) => value?.slice(0, 10) ?? "";
const inRange = (value: string | undefined, from: string, to: string) => {
  const current = dateOnly(value);
  if (!current && (from || to)) return false;
  if (from && current < from) return false;
  if (to && current > to) return false;
  return true;
};

export const createMaterialLogisticsRows = (orders: IdMaterialPurchaseOrder[], importedLogistics: ImportedLogisticsInfo[] = []) => orders.map((order, index) => {
  const imported = importedLogistics.find((item) => item.idOrderNo === order.idOrderNo);
  const fallbackNo = trackingNumbers[index % trackingNumbers.length];
  const company = logisticsCompanies[index % logisticsCompanies.length];
  const logisticsNo = imported?.logisticsNo || order.logisticsNo || fallbackNo;
  const purchaseRegion = order.purchaseRegion || (index % 2 === 0 ? "CN" : "ID");
  const transferBatch = order.transitNo || `ID202606${String(index + 1).padStart(2, "0")}B`;
  const actualQty = order.actualPurchaseQty ?? order.purchaseQty;
  const arrivedQty = order.arrivedQty ?? 0;
  const logisticsWeight = Number(((order.unitWeight ?? 0.05) * actualQty).toFixed(2));

  return {
    ...order,
    company: imported?.company || company,
    logisticsNo,
    purchaseRegion,
    transferBatch,
    boxCount: index + 2,
    logisticsWeight,
    signedUser: index % 3 === 0 ? "仓库签收" : "采购签收",
    logisticRemark: imported?.remark || (index % 2 === 0 ? "按面辅料采购单转运，保留原物流信息" : "供应商已发货，等待转运中心扫描"),
    actionStatus: arrivedQty > 0 ? "已签收" : order.transitAt ? "待签收" : "待转运",
    freightAmount: (imported?.domesticFreight ?? order.domesticFreight ?? 0) + (order.transitFee ?? 0),
    freightMethod: imported?.freightMethod || order.freightMethod,
    contact: imported?.contact || order.contact,
    transitCenter: imported?.transitCenter || order.transitCenter,
    domesticFreight: imported?.domesticFreight ?? order.domesticFreight,
    estimatedTransitDays: imported?.estimatedTransitDays ?? order.estimatedTransitDays,
    shippedAt: imported?.shippedAt || order.shippedAt,
  };
});

export const logisticsRows = createMaterialLogisticsRows(idMaterialPurchaseOrders);

export type MaterialLogisticsRecord = ReturnType<typeof createMaterialLogisticsRows>[number];
const logisticsRecordKey = (record: MaterialLogisticsRecord) => `${record.idOrderNo}::${record.logisticsNo}`;

function FilterLabel({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex items-center gap-1.5 text-xs text-gray-700">
      <span className="shrink-0">{label}</span>
      {children}
    </label>
  );
}

function SmallAction({ children, color = "blue", onClick }: { children: React.ReactNode; color?: "blue" | "green" | "orange"; onClick: () => void }) {
  const className = color === "green" ? "bg-[#009688]" : color === "orange" ? "bg-[#fa8c16]" : "bg-[#1677ff]";
  return (
    <button className={`${className} h-[22px] whitespace-nowrap rounded-sm px-1.5 text-[11px] leading-[22px] text-white`} onClick={onClick}>
      {children}
    </button>
  );
}

export default function MaterialPurchaseTracking({
  onCreateTransferBatch,
  records = logisticsRows,
  transferBatches = [],
}: {
  onCreateTransferBatch?: (payload: JoinHeadLogisticsPayload) => string | undefined;
  records?: MaterialLogisticsRecord[];
  transferBatches?: TransferBatch[];
}) {
  const [filters, setFilters] = useState<Filters>(emptyFilters);
  const [selected, setSelected] = useState<string[]>([]);
  const [joinRecords, setJoinRecords] = useState<MaterialLogisticsRecord[]>([]);
  const [toast, setToast] = useState("");

  const existingAllocations = useMemo(() => {
    const allocations: Record<string, ExistingHeadAllocation> = {};
    transferBatches.forEach((batch) => {
      batch.records.forEach((record) => {
        const key = logisticsRecordKey(record);
        const quantity = record.headLogisticsQty ?? record.actualPurchaseQty ?? record.purchaseQty;
        const current = allocations[key] ?? { headLogisticsNos: [], quantity: 0, rolls: 0 };
        allocations[key] = {
          headLogisticsNos: current.headLogisticsNos.includes(batch.batchNo) ? current.headLogisticsNos : [...current.headLogisticsNos, batch.batchNo],
          quantity: current.quantity + quantity,
          rolls: current.rolls + (record.headLogisticsRolls ?? 0),
        };
      });
    });
    return allocations;
  }, [transferBatches]);

  const rows = useMemo(() => {
    return records
      .filter((row) => {
        return (!filters.logisticsNo || row.logisticsNo.includes(filters.logisticsNo))
          && inRange(row.signedAt, filters.signedFrom, filters.signedTo)
          && (filters.status === "请选择" || row.actionStatus === filters.status || row.status === filters.status)
          && (filters.purchaseRegion === "请选择" || row.purchaseRegion === filters.purchaseRegion);
      })
      .slice(0, Math.max(1, Number(filters.pageSize) || 100));
  }, [filters, records]);

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 1800);
  };

  const update = <K extends keyof Filters>(key: K, value: Filters[K]) => setFilters((current) => ({ ...current, [key]: value }));
  const toggle = (id: string) => setSelected((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  const selectedRecords = () => rows.filter((row) => selected.includes(row.idOrderNo));
  const runBatch = (action: string) => selected.length ? showToast(`${action}：已选择 ${selected.length} 条物流记录`) : showToast("请先勾选物流记录");
  const pendingQuantity = (record: MaterialLogisticsRecord) => Math.max(0, (record.actualPurchaseQty ?? record.purchaseQty) - (existingAllocations[logisticsRecordKey(record)]?.quantity ?? 0));
  const openJoinHeadLogistics = (targetRecords: MaterialLogisticsRecord[]) => {
    if (!targetRecords.length) {
      showToast("请先勾选物流记录");
      return;
    }
    const availableRecords = targetRecords.filter((record) => pendingQuantity(record) > 0);
    if (!availableRecords.length) {
      showToast("所选物流记录已全部加入头程物流单");
      return;
    }
    setJoinRecords(availableRecords);
  };
  const createBatchFromSelected = () => openJoinHeadLogistics(selectedRecords());
  const submitHeadLogistics = (payload: JoinHeadLogisticsPayload) => {
    const error = onCreateTransferBatch?.(payload);
    if (error) return error;
    setSelected([]);
    showToast(`已加入头程物流单：${payload.headLogisticsNo}`);
    return undefined;
  };

  return (
    <div>
      <PageHeader title="面辅料采购物流信息" desc="按老系统结构展示面辅料采购物流、采购单、头程物流、采购数据、时间、状态和备注信息。" />

      <section className="mb-2 flex flex-wrap gap-1 border border-gray-200 bg-white px-3 py-2">
        <button className="h-7 rounded-sm bg-[#009688] px-3 text-xs text-white" onClick={() => runBatch("批量签收")}>批量签收</button>
          <button className="h-7 rounded-sm bg-[#009688] px-3 text-xs text-white" onClick={createBatchFromSelected}>批量加入头程物流</button>
      </section>

      <section className="mb-2 border border-gray-200 bg-white px-3 py-2 text-xs">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <FilterLabel label="物流单号">
            <div className="flex">
              <select className="h-8 w-24 rounded-l border border-r-0 px-1 text-xs" value={filters.keywordType} onChange={(event) => update("keywordType", event.target.value)}>
                <option>物流单号</option>
              </select>
              <input className="h-8 w-48 rounded-r border px-2 text-sm" value={filters.logisticsNo} onChange={(event) => update("logisticsNo", event.target.value)} />
            </div>
          </FilterLabel>
          <FilterLabel label="签收时间">
            <div className="flex gap-1">
              <input className="h-8 w-36 rounded border px-2 text-xs" type="date" value={filters.signedFrom} onChange={(event) => update("signedFrom", event.target.value)} />
              <input className="h-8 w-36 rounded border px-2 text-xs" type="date" value={filters.signedTo} onChange={(event) => update("signedTo", event.target.value)} />
            </div>
          </FilterLabel>
          <FilterLabel label="状态">
            <select className="h-8 w-32 rounded border px-2 text-sm" value={filters.status} onChange={(event) => update("status", event.target.value)}>
              {["请选择", "待签收", "已签收", "待转运", "已发货", "在途", "已到仓", "已入库"].map((item) => <option key={item}>{item}</option>)}
            </select>
          </FilterLabel>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-2">
          <FilterLabel label="采购地区">
            <select className="h-8 w-32 rounded border px-2 text-sm" value={filters.purchaseRegion} onChange={(event) => update("purchaseRegion", event.target.value)}>
              {["请选择", "CN", "ID"].map((item) => <option key={item}>{item}</option>)}
            </select>
          </FilterLabel>
          <FilterLabel label="每页显示">
            <input className="h-8 w-20 rounded border px-2 text-sm" value={filters.pageSize} onChange={(event) => update("pageSize", event.target.value.replace(/\D/g, ""))} />
          </FilterLabel>
          <button className="flex h-8 w-9 items-center justify-center rounded-sm bg-[#1677ff] text-white" title="查询" onClick={() => showToast("已按当前条件查询")}>
            <Search size={15} />
          </button>
          <button className="h-8 rounded-sm border border-gray-300 px-4 text-sm text-gray-700" onClick={() => { setFilters(emptyFilters); setSelected([]); }}>默认</button>
        </div>
      </section>

      <div className="overflow-x-auto border border-gray-200 bg-white">
        <table className="min-w-[2250px] table-fixed text-left text-xs text-gray-800">
          <colgroup>
            {[50,170,260,140,260,235,110,235,210,300].map((width, index) => <col key={index} style={{ width }} />)}
          </colgroup>
          <thead className="bg-gray-50">
            <tr>
              {["勾选框", "物流信息", "采购单信息", "头程物流", "采购数据", "时间", "状态", "物流数据", "备注", "操作"].map((title) => (
                <th key={title} className="border-b border-gray-200 px-2 py-2 font-medium text-gray-700">{title}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={`${row.idOrderNo}-${row.logisticsNo}`} className="border-b border-gray-200 align-top hover:bg-gray-50">
                <td className="px-2 py-2 text-center">
                  <input type="checkbox" checked={selected.includes(row.idOrderNo)} disabled={pendingQuantity(row) <= 0} onChange={() => toggle(row.idOrderNo)} />
                </td>
                <td className="px-2 py-2 leading-5">
                  <div className="font-medium">{row.company}</div>
                  <button className="break-all text-brand" onClick={() => showToast(`查看物流单号：${row.logisticsNo}`)}>{row.logisticsNo}</button>
                  <div>货运方式：{row.freightMethod}</div>
                  <div>联系人：{row.contact}</div>
                  <div>转运中心：{row.transitCenter}</div>
                </td>
                <td className="px-2 py-2 leading-5">
                  <div>采购单：<button className="text-brand" onClick={() => showToast(`查看采购单：${row.idOrderNo}`)}>{row.idOrderNo}</button></div>
                  <div>源采购单：{row.sourceProductOrderNo}</div>
                  <div>物料：{row.materialName}</div>
                  <div>物料编码：{row.materialCode}</div>
                  <div>供应商：{row.supplier}</div>
                  <div>采购员：{row.buyer}</div>
                </td>
                <td className="px-2 py-2 leading-5">
                  {existingAllocations[logisticsRecordKey(row)] ? (
                    <>
                      {existingAllocations[logisticsRecordKey(row)].headLogisticsNos.map((no) => <div key={no} className="break-all text-brand">{no}</div>)}
                      <div>已头程数量：{qty(existingAllocations[logisticsRecordKey(row)].quantity)}</div>
                      <div>待头程数量：{qty(pendingQuantity(row))}</div>
                      <div>头程卷数：{existingAllocations[logisticsRecordKey(row)].rolls}</div>
                    </>
                  ) : <div>-</div>}
                  <div>采购地区：{row.purchaseRegion}</div>
                  <div>中心：{row.transitCenter}</div>
                  <div>入库单：{row.inboundNo || "-"}</div>
                </td>
                <td className="px-2 py-2 leading-5">
                  <div>采购数量：{qty(row.purchaseQty)} {row.unit}</div>
                  <div className="text-green-700">实际采购数量：{qty(row.actualPurchaseQty)} {row.unit}</div>
                  <div>商家到货数量：{qty(row.merchantArrivalQty)} {row.unit}</div>
                  <div className="text-blue-700">到货数量：{qty(row.arrivedQty)} {row.unit}</div>
                  <div>入库数量：{qty(row.inboundQty)} {row.unit}</div>
                  <div>实际采购价：{money(row.actualPurchasePrice)}</div>
                  <div>总成本：{money(row.totalCost)}</div>
                </td>
                <td className="px-2 py-2 leading-5">
                  <div>创建时间：{row.sourceCreatedAt}</div>
                  <div>发货时间：{row.shippedAt || "-"}</div>
                  <div>签收时间：{row.signedAt || "-"}</div>
                  <div>转运时间：{row.transitAt || "-"}</div>
                  <div>到仓时间：{row.warehouseAt || "-"}</div>
                  <div>入库时间：{row.inboundAt || "-"}</div>
                </td>
                <td className="px-2 py-2 leading-5">
                  <div className={pendingQuantity(row) <= 0 ? "text-green-700" : existingAllocations[logisticsRecordKey(row)] ? "text-blue-700" : row.actionStatus === "已签收" ? "text-green-700" : "text-orange-600"}>
                    {pendingQuantity(row) <= 0 ? "已加入头程物流" : existingAllocations[logisticsRecordKey(row)] ? "部分加入头程物流" : row.actionStatus}
                  </div>
                  <div>{row.status}</div>
                  <div>{row.transportNode}</div>
                  <div>{row.merchantArrivalStatus}</div>
                </td>
                <td className="px-2 py-2 leading-5">
                  <div>物流重量：{qty(row.logisticsWeight)} KG</div>
                  <div>箱数：{row.boxCount}</div>
                  <div>国内天数：<span className={(row.domesticDays ?? 0) > 5 ? "text-red-600" : ""}>{row.domesticDays}天</span></div>
                  <div>预计转运：<span className={(row.estimatedTransitDays ?? 0) > 12 ? "text-red-600" : ""}>{row.estimatedTransitDays}天</span></div>
                  <div>国内运费：{money(row.domesticFreight)}</div>
                  <div>转运费：{money(row.transitFee)}</div>
                  <div>物流费用：{money(row.freightAmount)}</div>
                </td>
                <td className="whitespace-normal px-2 py-2 leading-5">
                  <div>{row.logisticRemark}</div>
                  <div>采购备注：{row.purchaseRemark}</div>
                  <div>签收人：{row.signedUser}</div>
                  <div>质检结果：{row.qualityResult}</div>
                </td>
                <td className="px-2 py-2">
                  <div className="flex w-[280px] flex-wrap gap-1">
                    <SmallAction color="green" onClick={() => showToast(`签收：${row.logisticsNo}`)}>签收</SmallAction>
                    {pendingQuantity(row) > 0 && <SmallAction onClick={() => openJoinHeadLogistics([row])}>加入头程</SmallAction>}
                    <SmallAction onClick={() => showToast(`查看物流：${row.logisticsNo}`)}>查看物流</SmallAction>
                    <SmallAction color="green" onClick={() => showToast(`采购备注：${row.idOrderNo}`)}>采购备注</SmallAction>
                    <SmallAction color="orange" onClick={() => showToast(`异常登记：${row.logisticsNo}`)}>异常登记</SmallAction>
                    <SmallAction onClick={() => showToast(`上传凭证：${row.logisticsNo}`)}>上传凭证</SmallAction>
                    <SmallAction color="green" onClick={() => showToast(`日志记录：${row.logisticsNo}`)}>日志记录</SmallAction>
                    <SmallAction onClick={() => showToast(`打印采购详情：${row.idOrderNo}`)}>打印采购详情</SmallAction>
                  </div>
                </td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={10} className="p-8 text-center text-gray-400">暂无数据</td></tr>}
          </tbody>
        </table>
      </div>

      <DesignLogicCard sections={[
        { title: "页面定位", headers: ["项目", "说明"], rows: [["页面标题", "面辅料采购物流信息"], ["所属模块", "面辅料采购"], ["菜单名称", "面辅料采购跟踪"], ["结构要求", "标题区、批量按钮区、两行筛选区、物流列表区、设计逻辑说明区"]] },
        { title: "筛选与批量操作", headers: ["区域", "规则", "结果"], rows: [["批量按钮", "批量签收、批量加入头程物流两个按钮常驻横排", "不合并、不放入更多操作"], ["筛选第一行", "物流单号、签收时间、状态", "按老系统顺序紧凑排列"], ["筛选第二行", "采购地区、每页显示、查询、默认", "字段不隐藏、不使用抽屉"]] },
        { title: "加入头程物流单", headers: ["项目", "规则", "结果"], rows: [["打开方式", "勾选一条或多条国内物流记录后点击批量加入头程物流，或点击单行加入头程", "打开加入头程物流单弹窗"], ["数量字段", "展示采购数量、可头程数量、已头程数量、待头程数量，填写头程数量和头程卷数", "支持同一物流记录按剩余数量分批加入"], ["原箱头程", "勾选后头程数量自动等于待头程数量", "取消后允许手动填写本次头程数量"], ["提交校验", "头程物流单号必填且不能重复，头程数量不得超过待头程数量，头程卷数为非负整数", "校验失败不关闭弹窗"], ["状态回写", "部分分配显示部分加入头程物流，全部分配显示已加入头程物流", "全部分配后禁止再次勾选"]] },
        { title: "列表展示", headers: ["列名", "内容", "展示方式"], rows: [["物流信息", "快递公司、物流单号、货运方式、联系人、转运中心", "多行堆叠"], ["采购单信息", "采购单、源采购单、物料、供应商、采购员", "保留采购上下文"], ["头程物流单", "头程物流单号、已头程数量、待头程数量、头程卷数", "关联数据同列多行堆叠"], ["物流数据", "重量、箱数、国内天数、转运天数、运费", "时效异常标红"], ["操作", "签收、加入头程、查看物流、备注、异常、凭证、日志、打印", "小按钮常驻横向换行"]] },
      ]} />
      <JoinHeadLogisticsModal
        open={joinRecords.length > 0}
        records={joinRecords}
        existingAllocations={existingAllocations}
        existingHeadLogisticsNos={transferBatches.map((batch) => batch.batchNo)}
        onClose={() => setJoinRecords([])}
        onSubmit={submitHeadLogistics}
      />
      <Toast msg={toast} />
    </div>
  );
}
