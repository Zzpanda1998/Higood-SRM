export const nextCode = (prefix: string, year: number, idx: number) =>
  `${prefix}-${year}-${String(idx).padStart(4, "0")}`;
