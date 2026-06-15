import { useMemo, useState } from "react";
import DataTable from "../../components/common/DataTable";
import DesignLogicCard from "../../components/common/DesignLogicCard";
import PageHeader from "../../components/common/PageHeader";
import SearchBar from "../../components/common/SearchBar";
import StatusBadge from "../../components/common/StatusBadge";
import { bomTemplates } from "../../mock/bomTemplates";
import PatternDetailPage from "./PatternDetailPage";

type Template = (typeof bomTemplates)[number];

export default function BomTemplateManagement() {
  const [keyword, setKeyword] = useState("");
  const [query, setQuery] = useState("");
  const [detail, setDetail] = useState<Template | null>(null);
  const filtered = useMemo(() => bomTemplates.filter((row) => !query || [row.bomNo, row.spu, row.productName, row.version].some((value) => value.toLowerCase().includes(query.toLowerCase()))), [query]);

  if (detail) return <PatternDetailPage template={detail} onBack={() => setDetail(null)} />;

  return (
    <div>
      <PageHeader title="BOM/样板管理" desc="查看已有 BOM / 样板结构，点击查看进入整页打板详情。" />
      <SearchBar>
        <div className="flex gap-2">
          <input className="h-8 w-80 rounded border px-2 text-sm" value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder="搜索 BOM 编号 / SPU / 商品名称 / 版本" />
          <button className="h-8 rounded bg-brand px-3 text-sm text-white" onClick={() => setQuery(keyword.trim())}>查询</button>
          <button className="h-8 rounded border px-3 text-sm" onClick={() => { setKeyword(""); setQuery(""); }}>清除</button>
        </div>
      </SearchBar>
      <DataTable columns={[
        { key: "bomNo", title: "BOM编号", render: (row) => <button className="text-brand" onClick={() => setDetail(row)}>{row.bomNo}</button> },
        { key: "spu", title: "款号 / SPU" }, { key: "skuCount", title: "SKU数量" }, { key: "productName", title: "商品名称" },
        { key: "version", title: "BOM版本" }, { key: "materialKinds", title: "物料种类数" },
        { key: "status", title: "状态", render: (row) => <StatusBadge status={row.status} /> },
        { key: "creator", title: "创建人" }, { key: "createdAt", title: "创建时间" },
        { key: "operation", title: "操作", render: (row) => <button className="text-brand" onClick={() => setDetail(row)}>查看</button> },
      ]} rows={filtered} />
      <DesignLogicCard sections={[
        { title: "页面定位", headers: ["项目", "说明"], rows: [["页面名称", "BOM/样板管理"], ["详情形式", "整页打板详情"], ["数据来源", "商品中心 PCS、版房 / 样板系统"]] },
        { title: "按钮规则", headers: ["按钮", "动作", "结果"], rows: [["查看", "进入整页打板详情", "展示商品、SKU、成本、工厂、工艺、说明及业务选项"], ["返回", "返回 BOM/样板列表", "不关闭当前 PMS 标签页"]] },
      ]} />
    </div>
  );
}
