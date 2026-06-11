import DataTable from "../components/common/DataTable";
import DesignLogicCard from "../components/common/DesignLogicCard";
import PageHeader from "../components/common/PageHeader";
import SearchBar from "../components/common/SearchBar";
import StatusBadge from "../components/common/StatusBadge";

const rows = [
  { code: "PMS-TODO-001", name: "MVP预留事项", owner: "采购管理部", status: "待完善", remark: "已预留菜单入口，后续按业务优先级细化" },
];

export default function PlaceholderPage({ title, desc }: { title: string; desc: string }) {
  return (
    <div>
      <PageHeader title={title} desc={desc} />
      <SearchBar>
        <div className="flex gap-2">
          <input className="h-8 w-80 rounded border px-2 text-sm" placeholder={`搜索${title}关键词`} />
          <button className="h-8 rounded bg-brand px-3 text-sm text-white">查询</button>
          <button className="h-8 rounded border px-3 text-sm">清除</button>
        </div>
      </SearchBar>
      <DataTable columns={[
        { key: "code", title: "编号", render: (row) => <span className="text-brand">{row.code}</span> },
        { key: "name", title: "名称" },
        { key: "owner", title: "责任部门" },
        { key: "status", title: "状态", render: (row) => <StatusBadge status={row.status} /> },
        { key: "remark", title: "说明" },
      ]} rows={rows} />
      <DesignLogicCard sections={[
        { title: "页面定位", headers: ["项目", "说明"], rows: [["页面名称", title], ["所属系统", "采购管理系统 PMS"], ["页面目标", "MVP 预留入口，保持菜单与业务闭环完整"]] },
        { title: "开发注意事项", headers: ["事项", "要求"], rows: [["页面风格", "沿用蓝白灰企业后台风格"], ["后续扩展", "按真实字段、状态、按钮规则细化"], ["禁止内容", "不增加无关跨系统同步按钮"]] },
      ]} />
    </div>
  );
}
