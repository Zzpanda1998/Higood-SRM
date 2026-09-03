import type { ReactNode } from "react";
import type { Role, TabItem } from "../../types/common";
import Header from "./Header";
import Sidebar from "./Sidebar";
import TabsNav from "./TabsNav";

export default function Layout({
  role,
  setRole,
  subject,
  setSubject,
  activeMenu,
  onMenuClick,
  tabs,
  onTabSwitch,
  onTabClose,
  children,
}: {
  role: Role;
  setRole: (r: Role) => void;
  subject: string;
  setSubject: (value: string) => void;
  activeMenu: string;
  onMenuClick: (k: string) => void;
  tabs: TabItem[];
  onTabSwitch: (k: string) => void;
  onTabClose: (k: string) => void;
  children: ReactNode;
}) {
  return (
    <div className="h-screen overflow-hidden bg-page">
      <Header role={role} setRole={setRole} subject={subject} setSubject={setSubject} />
      <TabsNav tabs={tabs} active={activeMenu} onSwitch={onTabSwitch} onClose={onTabClose} />
      <div className="flex h-[calc(100vh-88px)]">
        <Sidebar active={activeMenu} onClick={onMenuClick} />
        <main className="min-w-0 flex-1 overflow-auto p-3">{subject !== "HiGOOD 香港公司" && <div className="mb-3 rounded border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">该主体权限规则暂未确认，当前仅展示预留效果。</div>}{children}</main>
      </div>
    </div>
  );
}
