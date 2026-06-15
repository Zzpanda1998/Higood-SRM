import { useState } from "react";
import type { TransferBatch, TransferBatchStatus } from "../../types/transferBatch";

export interface CreateTransferBatchForm {
  batchNo: string;
  sourceRegion: string;
  warehouse: string;
  shippingType: string;
  area: string;
  logisticsCompany: string;
  logisticsFeeRmb: string;
  logisticsFeeUsd: string;
  incomeTaxIdr: string;
  vatIdr: string;
  customsDutyIdr: string;
  fineIdr: string;
  clearanceFeeIdr: string;
  inboundStatus: "待交货" | "已交货" | "已发货" | "已入库";
  expectedBandungArrivalTime: string;
  remark: string;
}

export const defaultCreateTransferBatchForm: CreateTransferBatchForm = {
  batchNo: "20260609",
  sourceRegion: "CN",
  warehouse: "",
  shippingType: "",
  area: "",
  logisticsCompany: "",
  logisticsFeeRmb: "",
  logisticsFeeUsd: "",
  incomeTaxIdr: "",
  vatIdr: "",
  customsDutyIdr: "",
  fineIdr: "",
  clearanceFeeIdr: "",
  inboundStatus: "待交货",
  expectedBandungArrivalTime: "",
  remark: "",
};

type Errors = Partial<Record<keyof CreateTransferBatchForm, string>>;

const numericFields: Array<keyof CreateTransferBatchForm> = [
  "logisticsFeeRmb",
  "logisticsFeeUsd",
  "incomeTaxIdr",
  "vatIdr",
  "customsDutyIdr",
  "fineIdr",
  "clearanceFeeIdr",
];

const toNumber = (value: string) => value.trim() ? Number(value) : undefined;

function RequiredLabel({ children }: { children: React.ReactNode }) {
  return <><span className="mr-1 text-red-500">*</span>{children}</>;
}

function FieldRow({ label, required, error, children, top = false }: { label: string; required?: boolean; error?: string; children: React.ReactNode; top?: boolean }) {
  return (
    <div className={`flex ${top ? "items-start" : "items-center"} min-h-9`}>
      <div className="w-40 shrink-0 pr-4 text-right text-[13px] text-gray-700">{required ? <RequiredLabel>{label}</RequiredLabel> : label}</div>
      <div className="w-[520px]">
        {children}
        {error && <div className="mt-1 text-xs text-red-500">{error}</div>}
      </div>
    </div>
  );
}

export default function CreateTransferBatchModal({
  open,
  onClose,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (batch: TransferBatch) => void;
}) {
  const [form, setForm] = useState<CreateTransferBatchForm>(defaultCreateTransferBatchForm);
  const [errors, setErrors] = useState<Errors>({});

  if (!open) return null;

  const update = <K extends keyof CreateTransferBatchForm>(key: K, value: CreateTransferBatchForm[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const close = () => {
    setForm(defaultCreateTransferBatchForm);
    setErrors({});
    onClose();
  };

  const submit = () => {
    const nextErrors: Errors = {};
    if (!form.batchNo.trim()) nextErrors.batchNo = "请输入货运批次";
    if (!form.sourceRegion) nextErrors.sourceRegion = "请选择货源地区";
    if (!form.warehouse) nextErrors.warehouse = "请选择仓库";
    if (!form.shippingType) nextErrors.shippingType = "请选择货运类型";
    if (!form.area) nextErrors.area = "请选择区域";
    numericFields.forEach((key) => {
      const value = form[key];
      if (!value) return;
      const number = Number(value);
      if (!Number.isFinite(number)) nextErrors[key] = "请输入正确的数字";
      else if (number < 0) nextErrors[key] = "费用字段不能小于 0";
    });
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    const status = form.inboundStatus as TransferBatchStatus;
    onSubmit({
      batchNo: form.batchNo.trim(),
      batchName: form.batchNo.trim(),
      transferCenter: form.sourceRegion === "CN" ? "广州转运中心" : `${form.sourceRegion}转运中心`,
      destinationWarehouse: form.warehouse,
      carrier: form.shippingType,
      creator: "王采购",
      createdAt: "2026-06-09 10:30",
      plannedShipDate: form.expectedBandungArrivalTime.slice(0, 10),
      status,
      remark: form.remark,
      records: [],
      sourceRegion: form.sourceRegion,
      warehouse: form.warehouse,
      shippingType: form.shippingType,
      area: form.area,
      regionRoute: `${form.sourceRegion} => ${form.area}`,
      logisticsProvider: form.logisticsCompany,
      expectedBandungArrivalAt: form.expectedBandungArrivalTime,
      transitDays: 0,
      boxCount: 0,
      bulkQty: 0,
      totalVolumeM3: 0,
      totalWeightKg: 0,
      goodsValueRmb: 0,
      goodsValueUsd: 0,
      freightRmb: toNumber(form.logisticsFeeRmb),
      freightUsd: toNumber(form.logisticsFeeUsd),
      incomeTaxIdr: toNumber(form.incomeTaxIdr),
      vatIdr: toNumber(form.vatIdr),
      customsDutyIdr: toNumber(form.customsDutyIdr),
      fineIdr: toNumber(form.fineIdr),
      clearanceFeeIdr: toNumber(form.clearanceFeeIdr),
    });
    setForm(defaultCreateTransferBatchForm);
    setErrors({});
  };

  const inputClass = "h-8 w-full rounded-sm border border-gray-300 px-2 text-sm outline-none focus:border-brand";

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/30 p-3">
      <div className="flex max-h-[85vh] w-[min(920px,calc(100vw-24px))] flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl">
        <div className="flex shrink-0 items-center justify-between border-b border-gray-200 px-5 py-4">
          <div>
            <div className="text-base font-semibold text-gray-900">创建头程物流</div>
            <div className="mt-1 text-xs text-gray-500">维护运输批次、费用、交付状态与预计到达信息</div>
          </div>
          <button className="rounded-md px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-100" onClick={close} aria-label="关闭创建头程物流">关闭</button>
        </div>
        <div className="flex-1 space-y-4 overflow-y-auto bg-slate-50 p-5">
          <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <SectionHeading title="一、基础信息" description="设置头程物流批次、线路、仓库及承运信息" />
            <div className="space-y-2">
            <FieldRow label="货运批次" required error={errors.batchNo}><input className={inputClass} value={form.batchNo} onChange={(event) => update("batchNo", event.target.value)} /></FieldRow>
            <FieldRow label="货源地区" required error={errors.sourceRegion}><select className={inputClass} value={form.sourceRegion} onChange={(event) => update("sourceRegion", event.target.value)}><option>CN</option><option>ID</option><option>US</option></select></FieldRow>
            <FieldRow label="仓库" required error={errors.warehouse}><select className={inputClass} value={form.warehouse} onChange={(event) => update("warehouse", event.target.value)}><option value="">请选择仓库</option><option>印尼仓</option><option>广州主仓</option><option>深圳仓</option><option>面辅料仓</option><option>中转仓</option></select></FieldRow>
            <FieldRow label="货运类型" required error={errors.shippingType}><select className={inputClass} value={form.shippingType} onChange={(event) => update("shippingType", event.target.value)}><option value="">请选择货运类型</option><option>空运</option><option>海运</option><option>陆运</option><option>快递</option></select></FieldRow>
            <FieldRow label="区域" required error={errors.area}><select className={inputClass} value={form.area} onChange={(event) => update("area", event.target.value)}><option value="">请选择区域</option><option>ID</option><option>CN</option><option>CN =&gt; ID</option><option>US</option></select></FieldRow>
            <FieldRow label="货运公司"><input className={inputClass} value={form.logisticsCompany} placeholder="货运公司" onChange={(event) => update("logisticsCompany", event.target.value)} /></FieldRow>
            </div>
          </section>
          <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <SectionHeading title="二、费用信息" description="按币种维护物流、税费、关税及清关费用" />
            <div className="space-y-2">
            <FieldRow label="物流费用 / RMB" error={errors.logisticsFeeRmb}><input className={inputClass} value={form.logisticsFeeRmb} placeholder="物流费用" onChange={(event) => update("logisticsFeeRmb", event.target.value)} /></FieldRow>
            <FieldRow label="物流费用 / USD" error={errors.logisticsFeeUsd}><input className={inputClass} value={form.logisticsFeeUsd} placeholder="物流费用" onChange={(event) => update("logisticsFeeUsd", event.target.value)} /></FieldRow>
            <FieldRow label="所得税 / IDR" error={errors.incomeTaxIdr}><input className={inputClass} value={form.incomeTaxIdr} placeholder="所得税" onChange={(event) => update("incomeTaxIdr", event.target.value)} /></FieldRow>
            <FieldRow label="增值税 IDR" error={errors.vatIdr}><input className={inputClass} value={form.vatIdr} placeholder="增值税" onChange={(event) => update("vatIdr", event.target.value)} /></FieldRow>
            <FieldRow label="关税 / IDR" error={errors.customsDutyIdr}><input className={inputClass} value={form.customsDutyIdr} placeholder="关税" onChange={(event) => update("customsDutyIdr", event.target.value)} /></FieldRow>
            <FieldRow label="罚款 / IDR" error={errors.fineIdr}><input className={inputClass} value={form.fineIdr} placeholder="罚款" onChange={(event) => update("fineIdr", event.target.value)} /></FieldRow>
            <FieldRow label="清关费用 / IDR" error={errors.clearanceFeeIdr}><input className={inputClass} value={form.clearanceFeeIdr} placeholder="清关费用" onChange={(event) => update("clearanceFeeIdr", event.target.value)} /></FieldRow>
            </div>
          </section>
          <section className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
            <SectionHeading title="三、交付与备注" description="维护当前交付状态、预计到达时间及补充说明" />
            <div className="space-y-2">
            <FieldRow label="入库状态">
              <div className="flex h-8 items-center gap-5">
                {(["待交货", "已交货", "已发货", "已入库"] as const).map((item) => <label key={item} className="flex items-center gap-1.5 text-sm"><input type="radio" name="create-batch-inbound-status" checked={form.inboundStatus === item} onChange={() => update("inboundStatus", item)} />{item}</label>)}
              </div>
            </FieldRow>
            <FieldRow label="预计送达万隆时间"><input className={inputClass} type="datetime-local" value={form.expectedBandungArrivalTime} onChange={(event) => update("expectedBandungArrivalTime", event.target.value)} /></FieldRow>
            <FieldRow label="备注" top><textarea className="h-24 w-full resize-none rounded-sm border border-gray-300 px-2 py-1.5 text-sm outline-none focus:border-brand" value={form.remark} placeholder="请输入内容" onChange={(event) => update("remark", event.target.value)} /></FieldRow>
            </div>
          </section>
        </div>
        <div className="flex shrink-0 justify-end gap-3 border-t border-gray-200 bg-white px-5 py-3">
          <button className="h-9 rounded-md border border-gray-300 px-4 text-sm text-gray-700 hover:bg-gray-50" onClick={close}>取消</button>
          <button className="h-9 rounded-md bg-brand px-5 text-sm font-medium text-white" onClick={submit}>立即提交</button>
        </div>
      </div>
    </div>
  );
}

function SectionHeading({ title, description }: { title: string; description: string }) {
  return (
    <div className="mb-4 flex items-start gap-3 border-b border-gray-100 pb-3">
      <span className="mt-0.5 h-5 w-1 rounded-full bg-brand" />
      <div>
        <div className="text-sm font-semibold text-gray-900">{title}</div>
        <div className="mt-1 text-xs text-gray-500">{description}</div>
      </div>
    </div>
  );
}
