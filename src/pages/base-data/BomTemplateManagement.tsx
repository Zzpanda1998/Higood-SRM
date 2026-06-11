import PmsListPage from "../pms/PmsListPage";
import { bomTemplates } from "../../mock/bomTemplates";

const columns = [
  { key: "bomNo", title: "BOM编号" },
  { key: "spu", title: "款号 / SPU" },
  { key: "skuCount", title: "SKU数量" },
  { key: "productName", title: "商品名称" },
  { key: "version", title: "BOM版本" },
  { key: "materialKinds", title: "物料种类数" },
  { key: "status", title: "状态", status: true },
  { key: "creator", title: "创建人" },
  { key: "createdAt", title: "创建时间" },
];

const detailItemColumns = [
  { key: "materialCode", title: "物料编码" },
  { key: "materialName", title: "物料名称" },
  { key: "category", title: "物料分类" },
  { key: "part", title: "使用部位" },
  { key: "usage", title: "单件用量" },
  { key: "lossRate", title: "损耗率" },
  { key: "unit", title: "单位" },
  { key: "defaultSupplier", title: "默认供应商" },
];

export default function BomTemplateManagement() {
  return (
    <PmsListPage
      title="BOM/样板管理"
      desc="维护商品SKU的用料结构，记录每个SKU由哪些面料、辅料、包材和耗材组成。"
      rows={bomTemplates}
      columns={columns}
      detailItemsKey="detailItems"
      detailItemColumns={detailItemColumns}
      primaryActionText="新增BOM"
      logic={{
        module: "基础资料",
        upstream: "物料档案、样衣打板资料",
        downstream: "商品采购单、面辅料需求分析",
        rules: [
          ["BOM维护", "按SPU/SKU维护物料用量、损耗率和默认供应商", "形成面辅料拆解依据"],
          ["版本管理", "保留BOM编号、版本和状态", "方便后续追溯"],
          ["需求分析", "只引用已启用BOM", "避免草稿或停用版本参与计算"],
        ],
      }}
    />
  );
}
