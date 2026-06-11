export default function EmptyState({ text }: { text: string }) {
  return <div className="rounded border border-dashed border-gray-300 bg-white p-8 text-center text-gray-500">{text}</div>;
}
