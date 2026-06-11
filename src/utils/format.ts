export const money = (v: number, c = "RMB") =>
  `${c} ${v.toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
