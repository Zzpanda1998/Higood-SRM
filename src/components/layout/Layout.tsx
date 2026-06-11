import type { ReactNode } from "react";
import type { Role, TabItem } from "../../types/common";
import Header from "./Header";
import Sidebar from "./Sidebar";
import TabsNav from "./TabsNav";

export default function Layout({
  role,
  setRole,
  activeMenu,
  onMenuClick,
  tabs,
  onTabSwitch,
  onTabClose,
  children,
}: {
  role: Role;
  setRole: (r: Role) => void;
  activeMenu: string;
  onMenuClick: (k: string) => void;
  tabs: TabItem[];
  onTabSwitch: (k: string) => void;
  onTabClose: (k: string) => void;
  children: ReactNode;
}) {
  return (
    <div className="h-screen overflow-hidden bg-page">
      <Header role={role} setRole={setRole} />
      <TabsNav tabs={tabs} active={activeMenu} onSwitch={onTabSwitch} onClose={onTabClose} />
      <div className="flex h-[calc(100vh-88px)]">
        <Sidebar active={activeMenu} onClick={onMenuClick} />
        <main className="min-w-0 flex-1 overflow-auto p-3">{children}</main>
      </div>
    </div>
  );
}
