export const homeMenu = "PMS首页";

export const menuGroups = [
  { title: "基础资料", items: ["供应商管理", "物料管理", "仓库管理", "单位管理", "BOM/样板管理"] },
  { title: "采购建议", items: ["商品采购建议", "KOL采购需求"] },
  { title: "商品采购", items: ["商品采购单"] },
  { title: "面辅料采购", items: ["面辅料需求分析", "面辅料采购单", "面辅料采购跟踪"] },
  { title: "头程物流", items: ["头程物流"] },
  { title: "到货协同", items: ["到货计划", "收货结果", "质检结果", "入库结果"] },
  { title: "采购对账", items: ["应付明细池", "面辅料采购对账", "物流费用对账", "对账单管理", "付款记录"] },
  { title: "系统设置", items: ["用户管理", "角色权限", "字典配置"] },
];

function MenuButton({
  item,
  active,
  onClick,
  standalone = false,
}: {
  item: string;
  active: string;
  onClick: (key: string) => void;
  standalone?: boolean;
}) {
  const isActive = active === item;

  return (
    <button
      key={item}
      onClick={() => onClick(item)}
      title={item}
      className={`relative mb-1 block h-8 w-full truncate rounded-md text-left text-[13px] leading-8 transition-colors ${
        standalone ? "px-2.5" : "pl-5 pr-2"
      } ${isActive ? "bg-blue-50 font-medium text-brand" : "font-normal text-gray-700 hover:bg-gray-50 hover:text-gray-900"}`}
    >
      {isActive && <span className="absolute left-0 top-1.5 h-5 w-0.5 rounded-full bg-brand" />}
      {item}
    </button>
  );
}

export default function Sidebar({ active, onClick }: { active: string; onClick: (key: string) => void }) {
  return (
    <aside className="grid h-full w-64 shrink-0 grid-rows-[auto_minmax(0,1fr)] overflow-hidden border-r border-gray-200 bg-white">
      <div className="border-b border-gray-100 p-3">
        <div className="mb-2 rounded-md bg-blue-50 px-3 py-2">
          <div className="truncate text-sm font-semibold text-gray-900">采购管理系统</div>
          <div className="mt-0.5 text-xs text-gray-500">PMS</div>
        </div>
        <input className="h-8 w-full rounded border border-gray-200 px-2 text-sm outline-none focus:border-brand" placeholder="搜索菜单..." />
      </div>

      <nav className="overflow-y-auto overflow-x-hidden px-3 py-2">
        <div className="mb-3">
          <MenuButton item={homeMenu} active={active} onClick={onClick} standalone />
        </div>

        {menuGroups.map((group, index) => (
          <section key={group.title} className={index === 0 ? "mb-3" : "mb-3 mt-3"}>
            <div className="mb-1.5 truncate px-2 text-[13px] font-semibold leading-6 text-gray-900">{group.title}</div>
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <MenuButton key={item} item={item} active={active} onClick={onClick} />
              ))}
            </div>
          </section>
        ))}
      </nav>
    </aside>
  );
}
