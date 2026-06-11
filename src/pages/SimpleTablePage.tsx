import PmsListPage from "./pms/PmsListPage";

export default function SimpleTablePage({
  title,
  desc,
  rows,
  columns,
}: {
  title: string;
  desc: string;
  rows: any[];
  columns: { key: string; title: string }[];
}) {
  return (
    <PmsListPage
      title={title}
      desc={desc}
      rows={rows}
      columns={columns.map((column) => ({ ...column, status: column.key === "status" }))}
      logic={{
        module: "PMS基础展示模块",
        upstream: "mock数据",
        downstream: "后续业务单据或报表",
        rules: [
          ["列表展示", "展示当前模块基础字段", "用户可快速浏览数据"],
          ["查看详情", "点击单号或查看按钮", "打开只读详情弹窗"],
          ["MVP预留", "复杂审批和联动后续细化", "当前保持流程入口完整"],
        ],
      }}
    />
  );
}
