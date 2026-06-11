import type { TabItem } from "../../types/common";

export default function TabsNav({
  tabs,
  active,
  onSwitch,
  onClose,
}: {
  tabs: TabItem[];
  active: string;
  onSwitch: (key: string) => void;
  onClose: (key: string) => void;
}) {
  return (
    <div className="flex h-10 items-end gap-1 overflow-x-auto border-b bg-gray-100 px-2">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onSwitch(tab.key)}
          className={`flex h-8 shrink-0 items-center gap-2 rounded-t px-3 text-sm ${active === tab.key ? "bg-white text-brand" : "bg-gray-200 text-gray-600"}`}
        >
          <span>{tab.title}</span>
          {tab.key !== "PMS首页" && (
            <span
              onClick={(event) => {
                event.stopPropagation();
                onClose(tab.key);
              }}
            >
              x
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
