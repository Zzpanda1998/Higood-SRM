import { Bell } from "lucide-react";
import type { Role } from "../../types/common";

const systems = [
  "商品中心系统 PCS",
  "采购管理系统 PMS",
  "工厂生产协同系统 FCS",
  "仓储物流系统 WLS",
  "直播运营系统 LOS",
  "订单管理系统 OMS",
  "业财一体化系统 BFIS",
  "数据决策系统",
];

const roles: Role[] = ["系统管理员", "采购员", "采购主管", "供应商用户", "仓库人员", "质检人员", "财务人员", "管理者"];

const subjects = ["HiGOOD 香港公司", "印尼第三方进口公司（权限待确认）", "雅加达品牌运营公司（预留）"];

export default function Header({ role, setRole, subject, setSubject }: { role: Role; setRole: (r: Role) => void; subject: string; setSubject: (value: string) => void }) {
  return (
    <header className="border-b bg-white">
      <div className="flex h-12 items-center justify-between px-4">
        <div className="flex min-w-0 items-center gap-4">
          <div className="flex shrink-0 items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded bg-brand text-xs font-bold text-white">HG</div>
            <span className="font-semibold">HiGood</span>
          </div>
          <nav className="hidden min-w-0 gap-4 overflow-hidden whitespace-nowrap text-sm text-gray-600 lg:flex">
            {systems.map((system) => (
              <span key={system} className={system.includes("PMS") ? "border-b-2 border-brand pb-1 text-brand" : ""}>
                {system}
              </span>
            ))}
          </nav>
        </div>
        <div className="flex shrink-0 items-center gap-3 text-sm">
          <label className="hidden items-center gap-1 text-xs text-gray-500 xl:flex">当前主体：<select className="h-8 max-w-[210px] rounded border border-blue-200 bg-blue-50 px-2 text-sm text-blue-800 outline-none focus:border-brand" value={subject} onChange={(e) => setSubject(e.target.value)}>{subjects.map((item) => <option key={item}>{item}</option>)}</select></label>
          <select className="h-8 rounded border border-gray-200 px-2 outline-none focus:border-brand" value={role} onChange={(e) => setRole(e.target.value as Role)}>
            {roles.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
          <Bell size={16} />
          <button className="rounded bg-brand px-2.5 py-1 text-white">VM</button>
        </div>
      </div>
    </header>
  );
}
