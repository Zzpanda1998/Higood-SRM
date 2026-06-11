export default function ProgressSteps({ steps, current }: { steps: string[]; current: number }) {
  return (
    <div className="mb-3 flex flex-wrap gap-2">
      {steps.map((s, i) => (
        <div key={s} className={`rounded px-2 py-1 text-xs ${i <= current ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500"}`}>
          {i + 1}. {s}
        </div>
      ))}
    </div>
  );
}
