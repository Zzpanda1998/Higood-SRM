import { useMemo, useState } from "react";
import Toast from "../../components/common/Toast";
import type { bomTemplates } from "../../mock/bomTemplates";

type PatternTemplate = (typeof bomTemplates)[number];

const sizes = ["S", "M", "L", "XL", "2XL"];
const colors = ["白色", "黑色", "藏青", "灰色", "卡其"];
const denseInput = "h-8 w-full border border-gray-300 bg-white px-2 text-sm outline-none focus:border-blue-500";
const labelCell = "w-32 border border-gray-300 bg-gray-100 px-3 py-2 text-right text-sm text-gray-700";
const valueCell = "border border-gray-300 px-3 py-2";

export default function PatternDetailPage({ template, onBack }: { template: PatternTemplate; onBack: () => void }) {
  const [toast, setToast] = useState("");
  const [materialCategory, setMaterialCategory] = useState("全部");
  const [form, setForm] = useState({
    productName: template.productName,
    applicant: "张选品",
    costPrice: "38.60",
    shipmentNo: `CH-${template.spu.replace(/\D/g, "") || "2601"}`,
    suggestedPrice: "129.00",
    weight: "0.42",
    unitCost: "38.60",
    totalCost: "43.80",
    purchasePrice: "36.00",
    freight: "3.20",
    packageFee: "2.00",
    targetMargin: "58",
    productionFactory: "佛山成衣加工厂",
    sampleFactory: "杭州样衣开发中心",
    fabricFactory: "广州华盛面料有限公司",
    accessoryFactory: "东莞宏远辅料有限公司",
    cuttingFactory: "佛山裁剪一厂",
    printingFactory: "广州印花工艺厂",
    fabricDescription: "180g 精梳纯棉针织布，手感柔软，色牢度达到 4 级。",
    accessoryDescription: "主唛、洗水唛、吊牌、备用扣按确认样执行。",
    processDescription: "领口双针压线，肩缝加固，底摆双针。",
    specialProcess: "成衣预缩、整烫定型",
    printingMethod: "丝网印花",
    embroideryMethod: "无",
    remark: "首版完成后寄回总部确认尺寸及面料手感。",
    supplemental: "大货生产前须提供完整尺码样。",
    factoryRequirement: "工厂需按工艺单逐项自检，不合格不得出货。",
    developmentRequirement: "版型偏宽松，胸围按成衣尺寸正负 1cm 控制。",
    isSampling: "是",
    isPatternMaking: "是",
    needPrinting: true,
    needEmbroidery: false,
    developmentStatus: "打板中",
    auditStatus: "待审核",
    productionMode: "工厂生产",
    transportMode: "国内快递",
  });
  const [description, setDescription] = useState("<p>本款为基础圆领款，重点确认领口罗纹回弹、肩宽和衣长比例。</p><p>样衣完成后需提供正面、背面、侧面及细节图片。</p>");

  const skuRows = useMemo(() => Array.from({ length: template.skuCount }, (_, index) => ({
    id: `${template.spu}-${index}`,
    area: index % 2 === 0 ? "ID" : "CN",
    spu: template.spu,
    color: colors[index % colors.length],
    sku: `${template.spu}-${colors[index % colors.length].slice(0, 1)}-${sizes[index % sizes.length]}`,
    shipmentNo: `${form.shipmentNo}-${index + 1}`,
    size: sizes[index % sizes.length],
    unitPrice: (36 + index * 1.5).toFixed(2),
    quantity: index + 1,
    remark: index === 0 ? "主推尺码" : "",
  })), [form.shipmentNo, template.skuCount, template.spu]);
  const materialCategories = ["面料", "辅料", "配件", "包材", "耗材"];
  const materialSummary = useMemo(() => materialCategories.map((category) => ({
    category,
    count: template.detailItems.filter((item) => item.category === category).length,
  })), [template.detailItems]);
  const displayedMaterials = useMemo(() => materialCategory === "全部"
    ? template.detailItems
    : template.detailItems.filter((item) => item.category === materialCategory), [materialCategory, template.detailItems]);

  const update = (key: keyof typeof form, value: string | boolean) => setForm((current) => ({ ...current, [key]: value }));
  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 1800);
  };
  const format = (command: string) => document.execCommand(command);

  return (
    <div className="-m-5 min-w-[1180px] bg-[#f2f2f2] p-4 text-sm text-gray-800">
      <div className="mb-3 flex items-center justify-between border-b border-gray-300 bg-white px-4 py-3">
        <h1 className="text-xl font-semibold text-gray-900">BOM / 打板详情</h1>
        <div className="text-xs text-gray-500">BOM编号：{template.bomNo}　版本：{template.version}　状态：{template.status}</div>
      </div>

      <div className="border border-gray-300 bg-white p-4">
        <div className="mb-3 border-b-2 border-blue-600 pb-2 font-semibold">商品基础信息</div>
        <div className="flex items-start gap-5">
          <div className="flex h-44 w-36 shrink-0 items-center justify-center border border-gray-300 bg-gray-50 p-2">
            <img src={`/mock/products/${template.spu.toLowerCase()}.svg`} alt={template.productName} className="max-h-full max-w-full object-contain" />
          </div>
          <table className="w-full border-collapse">
            <tbody>
              <tr><td className={labelCell}>商品名称 / 款式名称</td><td className={valueCell}><input className={denseInput} value={form.productName} onChange={(event) => update("productName", event.target.value)} /></td><td className={labelCell}>SPU / 款号</td><td className={valueCell}>{template.spu}</td></tr>
              <tr><td className={labelCell}>选品人 / 申请人</td><td className={valueCell}><input className={denseInput} value={form.applicant} onChange={(event) => update("applicant", event.target.value)} /></td><td className={labelCell}>成本价</td><td className={valueCell}><input className={denseInput} value={form.costPrice} onChange={(event) => update("costPrice", event.target.value)} /></td></tr>
              <tr><td className={labelCell}>出货号 / 货号</td><td className={valueCell}><input className={denseInput} value={form.shipmentNo} onChange={(event) => update("shipmentNo", event.target.value)} /></td><td className={labelCell}>创建人 / 创建时间</td><td className={valueCell}>{template.creator} / {template.createdAt}</td></tr>
              <tr><td className={labelCell}>BOM版本</td><td className={valueCell}>{template.version}</td><td className={labelCell}>物料种类数</td><td className={valueCell}>{template.materialKinds}</td></tr>
            </tbody>
          </table>
        </div>

        <LegacyTitle>SPU 配件 / 面辅料组成</LegacyTitle>
        <div className="border border-blue-200 bg-blue-50/40 p-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="font-semibold text-gray-900">{template.spu} · {template.productName}</div>
              <div className="mt-1 text-xs text-gray-500">以下物料共同组成该 SPU，单耗均按单件成衣计算；采购需求可按 BOM 单耗、损耗率与生产数量展开。</div>
            </div>
            <div className="text-right text-xs text-gray-500">BOM {template.version}<br /><b className="text-base text-blue-700">{template.detailItems.length}</b> 种物料</div>
          </div>
          <div className="mt-3 grid grid-cols-5 gap-2">
            {materialSummary.map((item) => <button key={item.category} className={`rounded border px-3 py-2 text-left ${materialCategory === item.category ? "border-blue-500 bg-blue-600 text-white" : "border-gray-200 bg-white hover:border-blue-300"}`} onClick={() => setMaterialCategory(materialCategory === item.category ? "全部" : item.category)}>
              <div className={`text-xs ${materialCategory === item.category ? "text-blue-100" : "text-gray-500"}`}>{item.category}</div>
              <div className="mt-1 text-lg font-semibold">{item.count}</div>
            </button>)}
          </div>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <div className="flex gap-1">
            {["全部", ...materialCategories].map((category) => <button key={category} className={`h-7 border px-3 text-xs ${materialCategory === category ? "border-blue-600 bg-blue-600 text-white" : "border-gray-300 bg-white text-gray-600"}`} onClick={() => setMaterialCategory(category)}>{category}</button>)}
          </div>
          <div className="text-xs text-gray-500">当前展示 {displayedMaterials.length} / {template.detailItems.length} 项</div>
        </div>
        <div className="mt-2 overflow-x-auto">
          <table className="w-full min-w-[1420px] border-collapse text-xs">
            <thead className="bg-slate-100">
              <tr>{["序号", "物料分类", "物料编码", "物料名称", "使用部位", "规格", "颜色", "单件净用量", "损耗率", "单件计划用量", "单位", "默认供应商", "备注"].map((title) => <th key={title} className="whitespace-nowrap border border-gray-400 px-2 py-2 font-medium">{title}</th>)}</tr>
            </thead>
            <tbody>
              {displayedMaterials.map((item, index) => {
                const loss = Number(item.lossRate.replace("%", "")) || 0;
                const plannedUsage = item.usage * (1 + loss / 100);
                return <tr key={`${item.materialCode}-${item.part}`} className="hover:bg-blue-50/40">
                  <td className="border border-gray-300 px-2 py-2 text-center">{index + 1}</td>
                  <td className="border border-gray-300 px-2 py-2 text-center"><MaterialCategoryTag category={item.category} /></td>
                  <td className="whitespace-nowrap border border-gray-300 px-2 py-2 font-medium text-blue-600">{item.materialCode}</td>
                  <td className="min-w-[170px] border border-gray-300 px-2 py-2 font-medium">{item.materialName}</td>
                  <td className="min-w-[130px] border border-gray-300 px-2 py-2">{item.part}</td>
                  <td className="min-w-[140px] border border-gray-300 px-2 py-2">{item.specification}</td>
                  <td className="border border-gray-300 px-2 py-2">{item.color}</td>
                  <td className="border border-gray-300 px-2 py-2 text-right font-medium">{item.usage.toLocaleString("zh-CN", { maximumFractionDigits: 3 })}</td>
                  <td className="border border-gray-300 px-2 py-2 text-right">{item.lossRate}</td>
                  <td className="border border-gray-300 bg-amber-50 px-2 py-2 text-right font-semibold text-amber-700">{plannedUsage.toLocaleString("zh-CN", { minimumFractionDigits: 2, maximumFractionDigits: 3 })}</td>
                  <td className="border border-gray-300 px-2 py-2 text-center">{item.unit}</td>
                  <td className="min-w-[190px] border border-gray-300 px-2 py-2">{item.defaultSupplier}</td>
                  <td className="min-w-[120px] border border-gray-300 px-2 py-2">{item.remark || "-"}</td>
                </tr>;
              })}
            </tbody>
            <tfoot><tr className="bg-gray-100 font-medium"><td colSpan={7} className="border border-gray-300 px-2 py-2 text-right">组成汇总</td><td colSpan={6} className="border border-gray-300 px-2 py-2">共 {displayedMaterials.length} 项；面料 {materialSummary[0].count} 项、辅料 {materialSummary[1].count} 项、配件 {materialSummary[2].count} 项、包材 {materialSummary[3].count} 项、耗材 {materialSummary[4].count} 项</td></tr></tfoot>
          </table>
        </div>

        <LegacyTitle>SKU / 款式明细</LegacyTitle>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1120px] border-collapse text-xs">
            <thead className="bg-gray-100">
              <tr>{["区域", "SPU", "颜色", "款式 / SKU", "出货号", "尺码", "单价 / 成本", "数量", "备注", "操作"].map((title) => <th key={title} className="border border-gray-400 px-2 py-2 font-medium">{title}</th>)}</tr>
            </thead>
            <tbody>{skuRows.map((row) => <tr key={row.id}>
              <td className="border border-gray-300 px-2 py-1.5 text-center">{row.area}</td><td className="border border-gray-300 px-2 py-1.5">{row.spu}</td><td className="border border-gray-300 px-2 py-1.5">{row.color}</td><td className="border border-gray-300 px-2 py-1.5">{row.sku}</td><td className="border border-gray-300 px-2 py-1.5">{row.shipmentNo}</td><td className="border border-gray-300 px-2 py-1.5 text-center">{row.size}</td><td className="border border-gray-300 px-2 py-1.5 text-right">{row.unitPrice}</td><td className="border border-gray-300 px-2 py-1.5 text-center"><input className="h-7 w-16 border border-gray-300 px-2 text-center" defaultValue={row.quantity} /></td><td className="border border-gray-300 px-2 py-1.5"><input className="h-7 w-full border border-gray-300 px-2" defaultValue={row.remark} /></td><td className="border border-gray-300 px-2 py-1.5 text-center"><button className="text-blue-600" onClick={() => notify(`查看 ${row.sku}`)}>查看</button></td>
            </tr>)}</tbody>
          </table>
        </div>

        <LegacyTitle>价格 / 成本 / 数量信息</LegacyTitle>
        <LegacyGrid fields={[
          ["建议售价", "suggestedPrice"], ["重量（KG）", "weight"], ["单件成本", "unitCost"], ["总成本", "totalCost"],
          ["采购价", "purchasePrice"], ["运费", "freight"], ["包材费用", "packageFee"], ["目标利润率（%）", "targetMargin"],
        ]} form={form} update={update} />

        <LegacyTitle>工厂 / 供应链信息</LegacyTitle>
        <LegacyGrid fields={[
          ["做货工厂", "productionFactory"], ["打样工厂", "sampleFactory"], ["面料工厂", "fabricFactory"],
          ["辅料工厂", "accessoryFactory"], ["裁剪工厂", "cuttingFactory"], ["印花工厂", "printingFactory"],
        ]} form={form} update={update} />

        <LegacyTitle>布料 / 辅料 / 工艺信息</LegacyTitle>
        <table className="w-full border-collapse">
          <tbody>
            {[
              ["面料说明", "fabricDescription"], ["辅料说明", "accessoryDescription"], ["工艺说明", "processDescription"],
              ["特殊工艺", "specialProcess"], ["印花方式", "printingMethod"], ["绣花方式", "embroideryMethod"],
            ].map(([label, key], index, list) => index % 2 === 0 && <tr key={key}>
              <td className={labelCell}>{label}</td><td className={valueCell}><input className={denseInput} value={String(form[key as keyof typeof form])} onChange={(event) => update(key as keyof typeof form, event.target.value)} /></td>
              <td className={labelCell}>{list[index + 1][0]}</td><td className={valueCell}><input className={denseInput} value={String(form[list[index + 1][1] as keyof typeof form])} onChange={(event) => update(list[index + 1][1] as keyof typeof form, event.target.value)} /></td>
            </tr>)}
          </tbody>
        </table>

        <LegacyTitle>打板 / 商品开发说明</LegacyTitle>
        <div className="border border-gray-400">
          <div className="flex h-9 items-center gap-1 border-b border-gray-300 bg-gray-100 px-2">
            {["B", "I", "U"].map((item) => <button key={item} className="h-7 min-w-8 border border-gray-300 bg-white px-2 font-serif" onMouseDown={(event) => event.preventDefault()} onClick={() => format(item === "B" ? "bold" : item === "I" ? "italic" : "underline")}>{item}</button>)}
            <span className="mx-1 h-5 border-l border-gray-300" />
            <button className="h-7 border border-gray-300 bg-white px-2" onMouseDown={(event) => event.preventDefault()} onClick={() => format("insertUnorderedList")}>项目符号</button>
            <button className="h-7 border border-gray-300 bg-white px-2" onMouseDown={(event) => event.preventDefault()} onClick={() => format("insertOrderedList")}>编号</button>
            <button className="h-7 border border-gray-300 bg-white px-2" onMouseDown={(event) => event.preventDefault()} onClick={() => format("justifyLeft")}>左对齐</button>
            <button className="h-7 border border-gray-300 bg-white px-2" onMouseDown={(event) => event.preventDefault()} onClick={() => format("justifyCenter")}>居中</button>
          </div>
          <div className="min-h-56 bg-white p-3 text-sm outline-none" contentEditable suppressContentEditableWarning dangerouslySetInnerHTML={{ __html: description }} onInput={(event) => setDescription(event.currentTarget.innerHTML)} />
        </div>

        <LegacyTitle>备注 / 说明 / 附加字段</LegacyTitle>
        <table className="w-full border-collapse">
          <tbody>{[
            ["备注", "remark"], ["补充说明", "supplemental"], ["工厂要求", "factoryRequirement"], ["开发要求", "developmentRequirement"],
          ].map(([label, key]) => <tr key={key}><td className={labelCell}>{label}</td><td className={valueCell}><textarea className="min-h-20 w-full resize-y border border-gray-300 p-2 text-sm outline-none focus:border-blue-500" value={String(form[key as keyof typeof form])} onChange={(event) => update(key as keyof typeof form, event.target.value)} /></td></tr>)}</tbody>
        </table>

        <LegacyTitle>业务选项</LegacyTitle>
        <div className="space-y-3 border border-gray-300 bg-gray-50 px-4 py-3">
          <OptionRow label="是否打样" options={["是", "否"]} value={form.isSampling} onChange={(value) => update("isSampling", value)} />
          <OptionRow label="是否开版" options={["是", "否"]} value={form.isPatternMaking} onChange={(value) => update("isPatternMaking", value)} />
          <div className="flex items-center gap-8"><span className="w-24 text-right">工艺选项</span><label><input type="checkbox" className="mr-1" checked={form.needPrinting} onChange={(event) => update("needPrinting", event.target.checked)} />需要印花</label><label><input type="checkbox" className="mr-1" checked={form.needEmbroidery} onChange={(event) => update("needEmbroidery", event.target.checked)} />需要绣花</label></div>
          <OptionRow label="开发状态" options={["待打板", "打板中", "已完成"]} value={form.developmentStatus} onChange={(value) => update("developmentStatus", value)} />
          <OptionRow label="审核状态" options={["待审核", "已通过", "已驳回"]} value={form.auditStatus} onChange={(value) => update("auditStatus", value)} />
          <OptionRow label="生产方式" options={["工厂生产", "外采成衣", "样衣开发"]} value={form.productionMode} onChange={(value) => update("productionMode", value)} />
          <OptionRow label="运输方式" options={["国内快递", "物流专线", "工厂送货"]} value={form.transportMode} onChange={(value) => update("transportMode", value)} />
        </div>

        <div className="mt-5 flex justify-center gap-3 border-t border-gray-300 bg-gray-100 py-4">
          <button className="h-9 border border-gray-400 bg-white px-7" onClick={onBack}>返回</button>
          <button className="h-9 border border-blue-600 bg-white px-7 text-blue-600" onClick={() => notify("打板详情已保存")}>保存</button>
          <button className="h-9 bg-blue-600 px-8 text-white" onClick={() => notify("打板详情已提交")}>提交</button>
        </div>
      </div>
      <Toast msg={toast} />
    </div>
  );
}

function LegacyTitle({ children }: { children: string }) {
  return <div className="mb-2 mt-5 border border-gray-300 bg-gray-100 px-3 py-2 font-semibold text-gray-800">{children}</div>;
}

function MaterialCategoryTag({ category }: { category: string }) {
  const className = category === "面料"
    ? "bg-blue-50 text-blue-700"
    : category === "辅料"
      ? "bg-violet-50 text-violet-700"
      : category === "配件"
        ? "bg-amber-50 text-amber-700"
        : category === "包材"
          ? "bg-emerald-50 text-emerald-700"
          : "bg-gray-100 text-gray-600";
  return <span className={`inline-block rounded-full px-2 py-1 ${className}`}>{category}</span>;
}

function LegacyGrid({
  fields,
  form,
  update,
}: {
  fields: string[][];
  form: Record<string, string | boolean>;
  update: (key: any, value: string) => void;
}) {
  return (
    <table className="w-full border-collapse">
      <tbody>{fields.map(([label, key], index) => index % 2 === 0 && <tr key={key}>
        <td className={labelCell}>{label}</td><td className={valueCell}><input className={denseInput} value={String(form[key])} onChange={(event) => update(key, event.target.value)} /></td>
        <td className={labelCell}>{fields[index + 1]?.[0]}</td><td className={valueCell}>{fields[index + 1] && <input className={denseInput} value={String(form[fields[index + 1][1]])} onChange={(event) => update(fields[index + 1][1], event.target.value)} />}</td>
      </tr>)}</tbody>
    </table>
  );
}

function OptionRow({ label, options, value, onChange }: { label: string; options: string[]; value: string; onChange: (value: string) => void }) {
  return <div className="flex items-center gap-6"><span className="w-24 text-right">{label}</span>{options.map((option) => <label key={option}><input type="radio" className="mr-1" checked={value === option} onChange={() => onChange(option)} />{option}</label>)}</div>;
}
