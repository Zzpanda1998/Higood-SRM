export default function Toast({ msg }: { msg: string }) {
  if (!msg) return null;
  return <div className="fixed bottom-4 right-4 z-[70] rounded bg-brand px-3 py-2 text-sm text-white shadow">{msg}</div>;
}
