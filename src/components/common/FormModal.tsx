import type { ReactNode } from "react";

export default function FormModal({
  open,
  onClose,
  title,
  children,
  widthClass = "w-[720px]",
  description,
  sectionTitle = "一、业务信息",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  widthClass?: string;
  description?: string;
  sectionTitle?: string;
}) {
  if (!open) return null;
  const requestClose = () => {
    if (/新增|新建|编辑|修改|创建|维护|配置/.test(title) && !window.confirm("当前内容未保存，确认关闭吗？")) return;
    onClose();
  };
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-[1px]">
      <div className={`flex max-h-[85vh] max-w-[calc(100vw-32px)] flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl ${widthClass}`}>
        <div className="flex shrink-0 items-center justify-between border-b border-gray-200 bg-white px-5 py-4">
          <div>
            <div className="text-base font-semibold text-gray-900">{title}</div>
            {description && <div className="mt-1 text-xs text-gray-500">{description}</div>}
          </div>
          <button className="rounded-md px-3 py-1.5 text-sm text-gray-500 transition hover:bg-gray-100 hover:text-gray-800" onClick={requestClose}>
            关闭
          </button>
        </div>
        <div className="flex-1 overflow-y-auto bg-slate-50 p-5">
          <section className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <div className="mb-4 flex items-center gap-3 border-b border-gray-100 pb-3">
              <span className="h-5 w-1 rounded-full bg-brand" />
              <h3 className="text-sm font-semibold text-gray-900">{sectionTitle}</h3>
            </div>
            {children}
          </section>
        </div>
      </div>
    </div>
  );
}
