import type { ReactNode } from "react";

export default function SearchBar({ children }: { children: ReactNode }) {
  return <div className="mb-3 rounded border border-gray-200 bg-white p-3">{children}</div>;
}
