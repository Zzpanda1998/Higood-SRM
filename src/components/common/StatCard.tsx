export default function StatCard({ title, value }: { title: string; value: string | number }) {
  return (
    <div className="rounded border border-gray-200 bg-white p-3">
      <div className="text-xs text-gray-500">{title}</div>
      <div className="mt-1 text-xl font-semibold text-brand">{value}</div>
    </div>
  );
}
