import { useEffect, useMemo, useState } from "react";
import type { MaterialLogisticsRecord } from "./MaterialPurchaseTracking";

export type HeadLogisticsAllocation = {
  record: MaterialLogisticsRecord;
  quantity: number;
  rolls: number;
  originalBox: boolean;
};

export type JoinHeadLogisticsPayload = {
  headLogisticsNo: string;
  allocations: HeadLogisticsAllocation[];
};

export type ExistingHeadAllocation = {
  headLogisticsNos: string[];
  quantity: number;
  rolls: number;
};

type RowDraft = {
  quantity: string;
  rolls: string;
  originalBox: boolean;
};

type RowErrors = {
  quantity?: string;
  rolls?: string;
};

const recordKey = (record: MaterialLogisticsRecord) => `${record.idOrderNo}::${record.logisticsNo}`;
const qty = (value?: number) => (value ?? 0).toLocaleString("zh-CN", { maximumFractionDigits: 3 });

const createHeadLogisticsNo = () => {
  const now = new Date();
  const date = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}`;
  return `TC${date}${String(now.getTime()).slice(-4)}`;
};

export default function JoinHeadLogisticsModal({
  open,
  records,
  existingAllocations,
  existingHeadLogisticsNos,
  onClose,
  onSubmit,
}: {
  open: boolean;
  records: MaterialLogisticsRecord[];
  existingAllocations: Record<string, ExistingHeadAllocation>;
  existingHeadLogisticsNos: string[];
  onClose: () => void;
  onSubmit: (payload: JoinHeadLogisticsPayload) => string | undefined;
}) {
  const [headLogisticsNo, setHeadLogisticsNo] = useState("");
  const [headLogisticsNoError, setHeadLogisticsNoError] = useState("");
  const [drafts, setDrafts] = useState<Record<string, RowDraft>>({});
  const [rowErrors, setRowErrors] = useState<Record<string, RowErrors>>({});

  const rowData = useMemo(() => records.map((record) => {
    const key = recordKey(record);
    const purchasedQty = record.actualPurchaseQty ?? record.purchaseQty;
    const allocatedQty = existingAllocations[key]?.quantity ?? 0;
    return {
      key,
      record,
      purchasedQty,
      allocatedQty,
      pendingQty: Math.max(0, purchasedQty - allocatedQty),
    };
  }), [existingAllocations, records]);

  useEffect(() => {
    if (!open) return;
    const nextDrafts: Record<string, RowDraft> = {};
    rowData.forEach(({ key, pendingQty }) => {
      nextDrafts[key] = {
        quantity: pendingQty ? String(pendingQty) : "0",
        rolls: "0",
        originalBox: true,
      };
    });
    setHeadLogisticsNo(createHeadLogisticsNo());
    setHeadLogisticsNoError("");
    setDrafts(nextDrafts);
    setRowErrors({});
  }, [open, rowData]);

  if (!open) return null;

  const updateDraft = (key: string, patch: Partial<RowDraft>) => {
    setDrafts((current) => ({ ...current, [key]: { ...current[key], ...patch } }));
    setRowErrors((current) => ({ ...current, [key]: {} }));
  };

  const toggleOriginalBox = (key: string, pendingQty: number, checked: boolean) => {
    updateDraft(key, {
      originalBox: checked,
      quantity: checked ? String(pendingQty) : drafts[key]?.quantity ?? "",
    });
  };

  const close = () => {
    setHeadLogisticsNo("");
    setDrafts({});
    setRowErrors({});
    onClose();
  };

  const submit = () => {
    const trimmedNo = headLogisticsNo.trim();
    let noError = "";
    if (!trimmedNo) noError = "请输入头程物流单号";
    else if (existingHeadLogisticsNos.includes(trimmedNo)) noError = "头程物流单号已存在";

    const nextRowErrors: Record<string, RowErrors> = {};
    const allocations: HeadLogisticsAllocation[] = [];

    rowData.forEach(({ key, record, pendingQty }) => {
      const draft = drafts[key];
      const quantity = Number(draft?.quantity);
      const rolls = Number(draft?.rolls || 0);
      const errors: RowErrors = {};

      if (pendingQty <= 0) errors.quantity = "该记录已全部加入头程物流单";
      else if (!draft?.quantity.trim() || !Number.isFinite(quantity) || quantity <= 0) errors.quantity = "请输入大于 0 的头程数量";
      else if (quantity > pendingQty) errors.quantity = `不能超过待头程数量 ${qty(pendingQty)}`;
      if (!Number.isInteger(rolls) || rolls < 0) errors.rolls = "头程卷数须为非负整数";

      if (Object.keys(errors).length) nextRowErrors[key] = errors;
      else allocations.push({ record, quantity, rolls, originalBox: draft.originalBox });
    });

    setHeadLogisticsNoError(noError);
    setRowErrors(nextRowErrors);
    if (noError || Object.keys(nextRowErrors).length) return;

    const submitError = onSubmit({ headLogisticsNo: trimmedNo, allocations });
    if (submitError) {
      setHeadLogisticsNoError(submitError);
      return;
    }
    close();
  };

  const totalQuantity = rowData.reduce((sum, { key }) => sum + (Number(drafts[key]?.quantity) || 0), 0);
  const totalRolls = rowData.reduce((sum, { key }) => sum + (Number(drafts[key]?.rolls) || 0), 0);
  const inputClass = "h-7 rounded-sm border border-gray-300 px-2 text-xs outline-none focus:border-brand";

  return (
    <div className="fixed inset-0 z-[75] flex items-center justify-center bg-black/30 p-3">
      <div className="flex max-h-[85vh] w-[min(1240px,calc(100vw-24px))] flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl">
        <div className="flex shrink-0 items-center justify-between border-b border-gray-200 px-5 py-4">
          <div>
            <div className="text-base font-semibold text-gray-900">加入头程物流单</div>
            <div className="mt-1 text-xs text-gray-500">选择头程物流单并分配本次加入的物料数量与卷数</div>
          </div>
          <button className="rounded-md px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-100" onClick={close} aria-label="关闭加入头程物流单">关闭</button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto bg-slate-50 p-5">
          <section className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <div className="mb-3 border-l-4 border-brand pl-3 text-sm font-semibold text-gray-900">一、头程单信息</div>
            <div className="flex min-h-9 items-start rounded-md bg-gray-50 px-3 py-2 text-xs">
            <div className="flex items-center">
              <span className="mr-1 text-red-500">*</span>
              <span className="mr-2 w-24 text-right">头程物流单号</span>
              <div>
                <input
                  className={`${inputClass} w-64`}
                  value={headLogisticsNo}
                  onChange={(event) => {
                    setHeadLogisticsNo(event.target.value);
                    setHeadLogisticsNoError("");
                  }}
                />
                {headLogisticsNoError && <div className="mt-1 text-red-500">{headLogisticsNoError}</div>}
              </div>
            </div>
            </div>
          </section>

          <section className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <div className="mb-3 border-l-4 border-brand pl-3 text-sm font-semibold text-gray-900">二、物料分配明细</div>
            <div className="overflow-x-auto border border-gray-200">
            <table className="min-w-[1120px] table-fixed text-left text-xs text-gray-800">
              <colgroup>{[145, 165, 170, 95, 95, 95, 95, 95, 105, 95].map((width, index) => <col key={index} style={{ width }} />)}</colgroup>
              <thead className="bg-gray-50">
                <tr>
                  {["物流信息", "采购单信息", "物料信息", "采购数量", "可头程数量", "已头程数量", "待头程数量", "原箱头程", "头程数量", "头程卷数"].map((title) => (
                    <th key={title} className="border-b border-r border-gray-200 px-2 py-2 font-medium last:border-r-0">{title}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rowData.map(({ key, record, purchasedQty, allocatedQty, pendingQty }) => {
                  const draft = drafts[key] ?? { quantity: "", rolls: "", originalBox: true };
                  const previousNos = existingAllocations[key]?.headLogisticsNos ?? [];
                  return (
                    <tr key={key} className="border-b border-gray-200 align-top last:border-b-0">
                      <td className="border-r px-2 py-2 leading-5"><div>{record.company}</div><div className="break-all text-brand">{record.logisticsNo}</div><div>{record.boxCount}箱 / {qty(record.logisticsWeight)}KG</div></td>
                      <td className="border-r px-2 py-2 leading-5"><div className="text-brand">{record.idOrderNo}</div><div>{record.supplier}</div></td>
                      <td className="border-r px-2 py-2 leading-5"><div>{record.materialName}</div><div>{record.materialCode}</div><div>单位：{record.unit}</div></td>
                      <td className="border-r px-2 py-2">{qty(purchasedQty)}</td>
                      <td className="border-r px-2 py-2">{qty(pendingQty)}</td>
                      <td className="border-r px-2 py-2 leading-5"><div>{qty(allocatedQty)}</div>{previousNos.map((no) => <div key={no} className="break-all text-gray-500">{no}</div>)}</td>
                      <td className="border-r px-2 py-2">{qty(pendingQty)}</td>
                      <td className="border-r px-2 py-2 text-center"><input type="checkbox" checked={draft.originalBox} disabled={pendingQty <= 0} onChange={(event) => toggleOriginalBox(key, pendingQty, event.target.checked)} /></td>
                      <td className="border-r px-2 py-2">
                        <input className={`${inputClass} w-full ${rowErrors[key]?.quantity ? "border-red-500" : ""}`} value={draft.quantity} disabled={draft.originalBox || pendingQty <= 0} onChange={(event) => updateDraft(key, { quantity: event.target.value })} />
                        {rowErrors[key]?.quantity && <div className="mt-1 leading-4 text-red-500">{rowErrors[key].quantity}</div>}
                      </td>
                      <td className="px-2 py-2">
                        <input className={`${inputClass} w-full ${rowErrors[key]?.rolls ? "border-red-500" : ""}`} value={draft.rolls} disabled={pendingQty <= 0} onChange={(event) => updateDraft(key, { rolls: event.target.value })} />
                        {rowErrors[key]?.rolls && <div className="mt-1 leading-4 text-red-500">{rowErrors[key].rolls}</div>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            </div>

            <div className="mt-2 flex justify-end gap-8 border border-gray-200 bg-gray-50 px-4 py-2 text-xs">
            <span>物流票数：<strong>{records.length}</strong></span>
            <span>头程数量合计：<strong>{qty(totalQuantity)}</strong></span>
            <span>头程卷数合计：<strong>{qty(totalRolls)}</strong></span>
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
