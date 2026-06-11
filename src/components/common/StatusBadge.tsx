import { statusColorMap } from "../../utils/statusColor";

export default function StatusBadge({ status }: { status: string }) {
  return <span className={`rounded-full px-2 py-0.5 text-xs ${statusColorMap[status] ?? "bg-gray-100 text-gray-700"}`}>{status}</span>;
}
