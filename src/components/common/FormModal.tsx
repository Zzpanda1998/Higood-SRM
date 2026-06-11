import type { ReactNode } from "react";

export default function FormModal({
  open,
  onClose,
  title,
  children,
  widthClass = "w-[720px]",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  widthClass?: string;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] bg-black/30">
      <div className={`absolute right-0 top-0 h-full ${widthClass} overflow-auto bg-white shadow-xl`}>
        <div className="flex h-12 items-center justify-between border-b px-4">
          <div className="font-semibold">{title}</div>
          <button className="text-sm text-gray-500" onClick={onClose}>
            关闭
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
}
