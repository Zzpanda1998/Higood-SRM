import type { Role } from "../types/common";

export const users: { id: string; name: string; username: string; role: Role; dept: string; status: string }[] = [
  { id: "u1", name: "系统管理员", username: "admin", role: "系统管理员", dept: "信息部", status: "已启用" },
  { id: "u2", name: "王采购", username: "wangc", role: "采购员", dept: "采购部", status: "已启用" },
  { id: "u3", name: "刘主管", username: "liuzg", role: "采购主管", dept: "采购部", status: "已启用" },
  { id: "u4", name: "供应商A", username: "venda", role: "供应商用户", dept: "供应商", status: "已启用" },
  { id: "u5", name: "Rizky", username: "rizky", role: "仓库人员", dept: "印尼仓", status: "已启用" },
  { id: "u6", name: "Ayu", username: "ayu", role: "质检人员", dept: "质检部", status: "已启用" },
  { id: "u7", name: "财务A", username: "fin_a", role: "财务人员", dept: "财务部", status: "已启用" },
  { id: "u8", name: "总监", username: "director", role: "管理者", dept: "管理层", status: "已启用" },
];
