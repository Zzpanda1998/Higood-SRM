import type { ReactNode } from "react";

export default function DataTable({
  columns,
  rows,
}: {
  columns: { key: string; title: string; render?: (row: any) => ReactNode }[];
  rows: any[];
}) {
  return (
    <div className="overflow-x-auto rounded border border-gray-200 bg-white">
      <table className="min-w-full text-left text-[13px]">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((c) => (
              <th key={c.key} className="border-b border-gray-200 px-3 py-2.5 font-medium text-gray-700">
                {c.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
              {columns.map((c) => (
                <td key={c.key} className="px-3 py-2.5 text-gray-700">
                  {c.render ? c.render(r) : r[c.key]}
                </td>
              ))}
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td className="p-8 text-center text-gray-400" colSpan={columns.length}>
                暂无数据
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
