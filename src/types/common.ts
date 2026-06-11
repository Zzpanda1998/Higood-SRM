export type Role =
  | "系统管理员"
  | "采购员"
  | "采购主管"
  | "供应商用户"
  | "仓库人员"
  | "质检人员"
  | "财务人员"
  | "管理者";

export type TabItem = { key: string; title: string };
export type Option = { label: string; value: string };
export type Status = string;
