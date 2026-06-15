import type { ReactNode } from "react";

export function SectionCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm md:p-5">
      <div className="mb-4 flex items-start gap-3 border-b border-gray-100 pb-3">
        <span className="mt-0.5 h-5 w-1 shrink-0 rounded-full bg-brand" />
        <div>
          <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
          {description && <p className="mt-1 text-xs text-gray-500">{description}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}

export function FormGrid({ children, columns = 2 }: { children: ReactNode; columns?: 1 | 2 | 3 }) {
  const gridClass = columns === 3 ? "md:grid-cols-3" : columns === 2 ? "md:grid-cols-2" : "grid-cols-1";
  return <div className={`grid grid-cols-1 gap-x-5 gap-y-4 ${gridClass}`}>{children}</div>;
}

export function ReadOnlyField({
  label,
  value,
  fullWidth = false,
}: {
  label: string;
  value: ReactNode;
  fullWidth?: boolean;
}) {
  return (
    <div className={fullWidth ? "md:col-span-2" : ""}>
      <div className="text-xs text-gray-500">{label}</div>
      <div className="mt-1 min-h-9 rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-800">{value ?? "-"}</div>
    </div>
  );
}

export const modalInputClass = "h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 hover:border-gray-400 focus:border-brand focus:ring-2 focus:ring-blue-100";

