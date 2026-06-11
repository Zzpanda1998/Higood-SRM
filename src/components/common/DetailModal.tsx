import type { ReactNode } from "react";

export default function DetailModal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[65] flex items-center justify-center overflow-y-auto bg-black/25 p-3">
      <div className="max-h-[calc(100vh-24px)] w-full max-w-[760px] overflow-auto rounded bg-white p-4 shadow-xl">
        <div className="mb-3 flex items-center justify-between">
          <div className="font-semibold">{title}</div>
          <button onClick={onClose}>x</button>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
}
