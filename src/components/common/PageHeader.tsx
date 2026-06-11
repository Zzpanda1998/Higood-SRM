import type { ReactNode } from "react";

export default function PageHeader({ title, desc, extra }: { title: string; desc: string; extra?: ReactNode }) {
  return (
    <div className="mb-3 flex items-start justify-between">
      <div>
        <h1 className="text-lg font-semibold">{title}</h1>
        <p className="text-sm text-gray-500">{desc}</p>
      </div>
      {extra}
    </div>
  );
}
