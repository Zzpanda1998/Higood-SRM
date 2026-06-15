export type BomTemplateItem = {
  materialCode: string;
  materialName: string;
  category: "面料" | "辅料" | "配件" | "包材" | "耗材";
  part: string;
  specification: string;
  color: string;
  usage: number;
  lossRate: string;
  unit: string;
  defaultSupplier: string;
  remark?: string;
};

const commonPacking: BomTemplateItem[] = [
  { materialCode: "PKG-2026-0101", materialName: "透明自封包装袋", category: "包材", part: "单件包装", specification: "40 × 60cm / 8丝", color: "透明", usage: 1, lossRate: "1%", unit: "个", defaultSupplier: "深圳优品包材有限公司" },
  { materialCode: "CON-2026-0102", materialName: "服装定位贴", category: "耗材", part: "包装定位", specification: "30mm / 可移胶", color: "透明", usage: 0.03, lossRate: "2%", unit: "卷", defaultSupplier: "杭州新锐耗材有限公司" },
];

const componentsBySpu: Record<string, BomTemplateItem[]> = {
  "HG-TS-2601": [
    { materialCode: "FAB-2026-0001", materialName: "180g 精梳纯棉针织布", category: "面料", part: "前片 / 后片 / 袖片", specification: "180g / 32S", color: "随 SKU", usage: 1.45, lossRate: "3%", unit: "米", defaultSupplier: "广州华盛面料有限公司", remark: "主身面料" },
    { materialCode: "FAB-2026-0011", materialName: "1×1 棉氨罗纹", category: "面料", part: "领口", specification: "240g / 95%棉5%氨纶", color: "随 SKU", usage: 0.12, lossRate: "4%", unit: "米", defaultSupplier: "绍兴锦达纺织有限公司" },
    { materialCode: "ACC-2026-0002", materialName: "主唛织标", category: "辅料", part: "后领", specification: "45 × 20mm", color: "黑底白字", usage: 1, lossRate: "2%", unit: "个", defaultSupplier: "东莞宏远辅料有限公司" },
    { materialCode: "ACC-2026-0012", materialName: "洗水唛", category: "辅料", part: "左侧缝", specification: "30 × 60mm", color: "白色", usage: 1, lossRate: "2%", unit: "个", defaultSupplier: "东莞宏远辅料有限公司" },
    { materialCode: "ACC-2026-0013", materialName: "吊牌及吊绳", category: "配件", part: "领口吊挂", specification: "60 × 100mm", color: "品牌色", usage: 1, lossRate: "1%", unit: "套", defaultSupplier: "中山综合服饰供应链有限公司" },
    ...commonPacking,
  ],
  "HG-PT-2602": [
    { materialCode: "FAB-2026-0021", materialName: "弹力斜纹布", category: "面料", part: "裤身", specification: "260g / 棉锦弹", color: "随 SKU", usage: 1.65, lossRate: "4%", unit: "米", defaultSupplier: "广州华盛面料有限公司" },
    { materialCode: "FAB-2026-0022", materialName: "涤棉口袋布", category: "面料", part: "前后口袋", specification: "110g", color: "本白", usage: 0.35, lossRate: "3%", unit: "米", defaultSupplier: "绍兴锦达纺织有限公司" },
    { materialCode: "ACC-2026-0023", materialName: "YKK 5号尼龙拉链", category: "配件", part: "前门襟", specification: "18cm", color: "随面料", usage: 1, lossRate: "1%", unit: "条", defaultSupplier: "东莞宏远辅料有限公司" },
    { materialCode: "ACC-2026-0024", materialName: "四眼树脂纽扣", category: "配件", part: "腰头", specification: "18mm", color: "随面料", usage: 1, lossRate: "2%", unit: "个", defaultSupplier: "泉州瑞达服装辅料有限公司" },
    { materialCode: "ACC-2026-0025", materialName: "裤钩", category: "配件", part: "腰头内侧", specification: "两件套", color: "枪色", usage: 1, lossRate: "2%", unit: "套", defaultSupplier: "东莞宏远辅料有限公司" },
    ...commonPacking,
  ],
  "HG-HD-2603": [
    { materialCode: "FAB-2026-0031", materialName: "320g 棉涤卫衣布", category: "面料", part: "衣身 / 袖片 / 帽片", specification: "320g / 抓毛", color: "随 SKU", usage: 2.15, lossRate: "5%", unit: "米", defaultSupplier: "绍兴锦达纺织有限公司" },
    { materialCode: "FAB-2026-0032", materialName: "2×2 棉氨罗纹", category: "面料", part: "袖口 / 下摆", specification: "380g", color: "随 SKU", usage: 0.42, lossRate: "4%", unit: "米", defaultSupplier: "广州华盛面料有限公司" },
    { materialCode: "ACC-2026-0033", materialName: "涤纶帽绳", category: "辅料", part: "帽口", specification: "8mm", color: "随 SKU", usage: 1.35, lossRate: "3%", unit: "米", defaultSupplier: "东莞宏远辅料有限公司" },
    { materialCode: "ACC-2026-0034", materialName: "金属绳头", category: "配件", part: "帽绳两端", specification: "12 × 20mm", color: "哑黑", usage: 2, lossRate: "2%", unit: "个", defaultSupplier: "泉州瑞达服装辅料有限公司" },
    { materialCode: "ACC-2026-0035", materialName: "金属鸡眼", category: "配件", part: "帽口", specification: "10mm", color: "哑黑", usage: 2, lossRate: "2%", unit: "个", defaultSupplier: "泉州瑞达服装辅料有限公司" },
    { materialCode: "ACC-2026-0036", materialName: "主唛 + 洗水唛", category: "辅料", part: "后领 / 侧缝", specification: "品牌标准", color: "黑白", usage: 1, lossRate: "2%", unit: "套", defaultSupplier: "东莞宏远辅料有限公司" },
    ...commonPacking,
  ],
  "HG-JK-2605": [
    { materialCode: "FAB-2026-0051", materialName: "轻薄防风尼龙布", category: "面料", part: "外层衣身 / 袖片", specification: "70D / 防泼水", color: "随 SKU", usage: 1.85, lossRate: "5%", unit: "米", defaultSupplier: "广州华盛面料有限公司" },
    { materialCode: "FAB-2026-0052", materialName: "涤纶网眼里布", category: "面料", part: "衣身内里", specification: "75g", color: "黑色", usage: 1.55, lossRate: "4%", unit: "米", defaultSupplier: "绍兴锦达纺织有限公司" },
    { materialCode: "ACC-2026-0053", materialName: "YKK 5号防水拉链", category: "配件", part: "前中", specification: "开尾 / 65cm", color: "随面料", usage: 1, lossRate: "1%", unit: "条", defaultSupplier: "东莞宏远辅料有限公司" },
    { materialCode: "ACC-2026-0054", materialName: "口袋尼龙拉链", category: "配件", part: "左右口袋", specification: "18cm", color: "随面料", usage: 2, lossRate: "2%", unit: "条", defaultSupplier: "东莞宏远辅料有限公司" },
    { materialCode: "ACC-2026-0055", materialName: "弹力包边带", category: "辅料", part: "袖口", specification: "20mm", color: "黑色", usage: 0.55, lossRate: "3%", unit: "米", defaultSupplier: "泉州瑞达服装辅料有限公司" },
    { materialCode: "ACC-2026-0056", materialName: "调节扣及橡筋绳", category: "配件", part: "下摆", specification: "标准套件", color: "黑色", usage: 1, lossRate: "2%", unit: "套", defaultSupplier: "泉州瑞达服装辅料有限公司" },
    ...commonPacking,
  ],
  "HG-SH-2607": [
    { materialCode: "FAB-2026-0071", materialName: "高支棉府绸", category: "面料", part: "衣身 / 袖片 / 领座", specification: "100S 双股", color: "随 SKU", usage: 1.75, lossRate: "4%", unit: "米", defaultSupplier: "广州华盛面料有限公司" },
    { materialCode: "ACC-2026-0072", materialName: "有纺粘合衬", category: "辅料", part: "领 / 门襟 / 袖克夫", specification: "30D", color: "白色", usage: 0.35, lossRate: "5%", unit: "米", defaultSupplier: "绍兴锦达纺织有限公司" },
    { materialCode: "ACC-2026-0073", materialName: "贝壳四眼扣", category: "配件", part: "门襟 / 袖口", specification: "11.5mm", color: "白色", usage: 12, lossRate: "3%", unit: "个", defaultSupplier: "泉州瑞达服装辅料有限公司" },
    { materialCode: "ACC-2026-0074", materialName: "备用纽扣袋", category: "包材", part: "吊牌附件", specification: "50 × 70mm", color: "透明", usage: 1, lossRate: "1%", unit: "个", defaultSupplier: "深圳优品包材有限公司" },
    { materialCode: "ACC-2026-0075", materialName: "领插片", category: "配件", part: "领尖", specification: "55mm", color: "透明", usage: 2, lossRate: "2%", unit: "片", defaultSupplier: "东莞宏远辅料有限公司" },
    ...commonPacking,
  ],
  "HG-DR-2606": [
    { materialCode: "FAB-2026-0061", materialName: "弹力针织罗马布", category: "面料", part: "裙身", specification: "280g", color: "随 SKU", usage: 2.2, lossRate: "5%", unit: "米", defaultSupplier: "绍兴锦达纺织有限公司" },
    { materialCode: "FAB-2026-0062", materialName: "防静电针织里布", category: "面料", part: "裙身内里", specification: "80g", color: "随面料", usage: 1.5, lossRate: "4%", unit: "米", defaultSupplier: "广州华盛面料有限公司" },
    { materialCode: "ACC-2026-0063", materialName: "隐形拉链", category: "配件", part: "后中", specification: "55cm", color: "随面料", usage: 1, lossRate: "2%", unit: "条", defaultSupplier: "东莞宏远辅料有限公司" },
    { materialCode: "ACC-2026-0064", materialName: "透明防滑肩带", category: "辅料", part: "肩部", specification: "10mm", color: "透明", usage: 0.55, lossRate: "3%", unit: "米", defaultSupplier: "泉州瑞达服装辅料有限公司" },
    ...commonPacking,
  ],
  "HG-CT-2608": [
    { materialCode: "FAB-2026-0081", materialName: "高密棉锦风衣布", category: "面料", part: "外层衣身", specification: "210g / 防泼水", color: "随 SKU", usage: 2.65, lossRate: "6%", unit: "米", defaultSupplier: "广州华盛面料有限公司" },
    { materialCode: "FAB-2026-0082", materialName: "斜纹涤纶里布", category: "面料", part: "衣身内里", specification: "90g", color: "卡其", usage: 2.2, lossRate: "5%", unit: "米", defaultSupplier: "绍兴锦达纺织有限公司" },
    { materialCode: "ACC-2026-0083", materialName: "牛角风衣扣", category: "配件", part: "前门襟 / 袖袢", specification: "25mm", color: "深咖", usage: 10, lossRate: "3%", unit: "个", defaultSupplier: "泉州瑞达服装辅料有限公司" },
    { materialCode: "ACC-2026-0084", materialName: "金属日字扣", category: "配件", part: "腰带", specification: "40mm", color: "枪色", usage: 1, lossRate: "2%", unit: "个", defaultSupplier: "东莞宏远辅料有限公司" },
    { materialCode: "ACC-2026-0085", materialName: "垫肩", category: "辅料", part: "左右肩", specification: "薄款 8mm", color: "本白", usage: 2, lossRate: "2%", unit: "片", defaultSupplier: "中山综合服饰供应链有限公司" },
    { materialCode: "ACC-2026-0086", materialName: "胸衬 / 领底呢", category: "辅料", part: "前胸 / 领底", specification: "风衣专用", color: "本白", usage: 0.65, lossRate: "5%", unit: "米", defaultSupplier: "中山综合服饰供应链有限公司" },
    ...commonPacking,
  ],
  "HG-SK-2604": [
    { materialCode: "FAB-2026-0041", materialName: "西装斜纹面料", category: "面料", part: "裙身", specification: "240g", color: "随 SKU", usage: 1.35, lossRate: "4%", unit: "米", defaultSupplier: "广州华盛面料有限公司" },
    { materialCode: "FAB-2026-0042", materialName: "防静电里布", category: "面料", part: "裙身内里", specification: "75g", color: "随面料", usage: 0.85, lossRate: "3%", unit: "米", defaultSupplier: "绍兴锦达纺织有限公司" },
    { materialCode: "ACC-2026-0043", materialName: "隐形拉链", category: "配件", part: "后中", specification: "22cm", color: "随面料", usage: 1, lossRate: "2%", unit: "条", defaultSupplier: "东莞宏远辅料有限公司" },
    { materialCode: "ACC-2026-0044", materialName: "腰头衬", category: "辅料", part: "腰头", specification: "50mm", color: "本白", usage: 0.8, lossRate: "4%", unit: "米", defaultSupplier: "中山综合服饰供应链有限公司" },
    { materialCode: "ACC-2026-0045", materialName: "裙钩", category: "配件", part: "腰头", specification: "两件套", color: "枪色", usage: 1, lossRate: "2%", unit: "套", defaultSupplier: "泉州瑞达服装辅料有限公司" },
    ...commonPacking,
  ],
};

const templates = [
  ["BOM-2026-0001", "HG-TS-2601", 4, "男款圆领T恤", "V1", "已启用", "版房A组", "2026-05-20 09:00"],
  ["BOM-2026-0002", "HG-PT-2602", 3, "女款休闲裤", "V1", "已启用", "版房B组", "2026-05-21 09:00"],
  ["BOM-2026-0003", "HG-HD-2603", 4, "连帽卫衣", "V2", "草稿", "版房A组", "2026-05-22 09:00"],
  ["BOM-2026-0004", "HG-JK-2605", 3, "轻薄夹克", "V1", "已启用", "版房C组", "2026-05-23 09:00"],
  ["BOM-2026-0005", "HG-SH-2607", 5, "商务衬衫", "V1", "已启用", "版房A组", "2026-05-24 09:00"],
  ["BOM-2026-0006", "HG-DR-2606", 3, "针织连衣裙", "V1", "已停用", "版房B组", "2026-05-25 09:00"],
  ["BOM-2026-0007", "HG-CT-2608", 4, "风衣外套", "V0", "草稿", "版房C组", "2026-05-26 09:00"],
  ["BOM-2026-0008", "HG-SK-2604", 2, "女款半身裙", "V1", "已启用", "版房A组", "2026-05-27 09:00"],
] as const;

export const bomTemplates = templates.map(([bomNo, spu, skuCount, productName, version, status, creator, createdAt]) => ({
  bomNo,
  spu,
  skuCount,
  productName,
  version,
  materialKinds: componentsBySpu[spu].length,
  status,
  creator,
  createdAt,
  detailItems: componentsBySpu[spu],
}));
