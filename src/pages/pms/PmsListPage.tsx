import { useMemo, useState } from "react";
import DataTable from "../../components/common/DataTable";
import DesignLogicCard from "../../components/common/DesignLogicCard";
import DetailModal from "../../components/common/DetailModal";
import PageHeader from "../../components/common/PageHeader";
import SearchBar from "../../components/common/SearchBar";
import StatusBadge from "../../components/common/StatusBadge";
import Toast from "../../components/common/Toast";

export type PmsColumn = { key: string; title: string; status?: boolean; link?: boolean };

export type PmsLogic = {
  module: string;
  upstream: string;
  downstream: string;
  rules: string[][];
  transitions?: string[][];
};

export default function PmsListPage({
  title,
  desc,
  rows,
  columns,
  logic,
  detailItemsKey,
  detailItemColumns,
  primaryActionText = "新增",
  onPrimaryAction,
}: {
  title: string;
  desc: string;
  rows: Record<string, any>[];
  columns: PmsColumn[];
  logic: PmsLogic;
  detailItemsKey?: string;
  detailItemColumns?: PmsColumn[];
  primaryActionText?: string;
  onPrimaryAction?: () => void;
}) {
  const [keyword, setKeyword] = useState("");
  const [detail, setDetail] = useState<Record<string, any> | null>(null);
  const [toast, setToast] = useState("");

  const filteredRows = useMemo(() => {
    const normalized = keyword.trim();
    if (!normalized) return rows;
    return rows.filter((row) => JSON.stringify(row).includes(normalized));
  }, [keyword, rows]);

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 1800);
  };

  const firstColumnKey = columns[0]?.key;
  const tableColumns = [
    ...columns.map((column) => ({
      key: column.key,
      title: column.title,
      render: (row: Record<string, any>) => {
        if (column.status || column.key === "status") return <StatusBadge status={String(row[column.key] ?? "-")} />;
        if (column.link || column.key === firstColumnKey) {
          return (
            <button className="text-brand" onClick={() => setDetail(row)}>
              {String(row[column.key] ?? "-")}
            </button>
          );
        }
        return String(row[column.key] ?? "-");
      },
    })),
    {
      key: "op",
      title: "操作",
      render: (row: Record<string, any>) => (
        <div className="space-x-2 whitespace-nowrap text-xs">
          <button className="text-brand" onClick={() => setDetail(row)}>
            查看
          </button>
          <button className="text-brand" onClick={() => showToast("MVP版本已预留编辑入口")}>
            编辑
          </button>
        </div>
      ),
    },
  ];

  const detailItems = detailItemsKey && detail ? detail[detailItemsKey] : null;

  return (
    <div>
      <PageHeader title={title} desc={desc} />
      <SearchBar>
        <div className="flex flex-wrap items-center gap-2">
          <input
            className="h-8 w-96 rounded border px-2 text-sm outline-none focus:border-brand"
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder={`搜索${title}单号 / 商品 / 供应商 / 状态`}
          />
          <button className="h-8 rounded bg-brand px-3 text-sm text-white">查询</button>
          <button className="h-8 rounded border px-3 text-sm" onClick={() => setKeyword("")}>
            清除
          </button>
          <button
            className="ml-auto h-8 rounded bg-brand px-3 text-sm text-white"
            onClick={onPrimaryAction ?? (() => showToast(`${primaryActionText}入口已预留`))}
          >
            {primaryActionText}
          </button>
        </div>
      </SearchBar>

      <DataTable columns={tableColumns} rows={filteredRows} />

      <DesignLogicCard
        sections={[
          {
            title: "页面定位",
            headers: ["项目", "说明"],
            rows: [
              ["页面名称", title],
              ["所属模块", logic.module],
              ["页面目标", desc],
              ["上游来源", logic.upstream],
              ["下游去向", logic.downstream],
            ],
          },
          { title: "核心业务规则", headers: ["业务场景", "核心规则", "结果"], rows: logic.rules },
          {
            title: "按钮交互规则",
            headers: ["按钮", "出现位置", "点击后动作", "是否改变数据"],
            rows: [
              ["查询", "查询区", "按关键词过滤列表", "否"],
              ["清除", "查询区", "清空关键词并恢复列表", "否"],
              [primaryActionText, "查询区右侧", "MVP版本预留创建入口", "否"],
              ["查看", "表格操作列", "打开详情弹窗", "否"],
              ["编辑", "表格操作列", "预留编辑入口并提示", "否"],
            ],
          },
          {
            title: "状态流转规则",
            headers: ["当前状态", "触发动作", "目标状态", "说明"],
            rows: logic.transitions ?? [
              ["草稿", "提交", "待确认", "进入后续业务协同"],
              ["待确认", "确认", "已确认", "业务信息已确认"],
              ["已确认", "下推", "已生成", "生成后续业务单据"],
            ],
          },
          {
            title: "查询筛选规则",
            headers: ["筛选项", "匹配字段", "匹配方式", "说明"],
            rows: [["关键词", "当前列表全部字段", "模糊匹配", "输入为空时展示全部数据"]],
          },
          {
            title: "异常与边界规则",
            headers: ["场景", "处理规则"],
            rows: [
              ["查询结果为空", "表格展示空状态"],
              ["字段较多", "允许横向滚动"],
              ["详情无明细", "只展示主表字段"],
              ["MVP操作", "只做前端提示，不写入后端"],
            ],
          },
          {
            title: "开发注意事项",
            headers: ["注意事项", "要求"],
            rows: [
              ["页面风格", "保持蓝白灰企业后台风格"],
              ["数据来源", "使用 mock 数据初始化"],
              ["基础资料", "不覆盖已细化的供应商、物料、仓库、单位逻辑"],
              ["设计说明", "使用表格展示，不写大段说明"],
            ],
          },
        ]}
      />

      <DetailModal open={!!detail} title={`${title}详情`} onClose={() => setDetail(null)}>
        {detail && (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(detail)
                .filter(([key]) => key !== detailItemsKey)
                .map(([key, value]) => (
                  <div key={key} className="min-w-0">
                    <span className="text-gray-500">{key}：</span>
                    <span className="break-all text-gray-800">{String(value ?? "-")}</span>
                  </div>
                ))}
            </div>
            {Array.isArray(detailItems) && detailItemColumns && (
              <DataTable
                columns={detailItemColumns.map((column) => ({
                  key: column.key,
                  title: column.title,
                  render: (row: Record<string, any>) => String(row[column.key] ?? "-"),
                }))}
                rows={detailItems}
              />
            )}
          </div>
        )}
      </DetailModal>
      <Toast msg={toast} />
    </div>
  );
}
