import type { ReactNode } from "react";

export default function DetailModal({
  open,
  onClose,
  title,
  children,
  widthClass = "w-[min(960px,calc(100vw-32px))]",
  description,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  widthClass?: string;
  description?: string;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[65] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-[1px]">
      <div className={`flex max-h-[85vh] flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl ${widthClass}`}>
        <div className="flex shrink-0 items-center justify-between border-b border-gray-200 px-5 py-4">
          <div>
            <div className="text-base font-semibold text-gray-900">{title}</div>
            {description && <div className="mt-1 text-xs text-gray-500">{description}</div>}
          </div>
          <button className="rounded-md px-3 py-1.5 text-sm text-gray-500 transition hover:bg-gray-100 hover:text-gray-800" onClick={onClose}>关闭</button>
        </div>
        <div className="flex-1 overflow-y-auto bg-slate-50 p-5">{children}</div>
      </div>
    </div>
  );
}
