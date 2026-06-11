export type KolDemandStatus = "草稿" | "待入库" | "部分入库" | "全部入库" | "已驳回";

export interface KolDemandRemark {
  id: string;
  content: string;
  createdBy: string;
  createdAt: string;
}

export interface KolDemandInboundRecord {
  id: string;
  quantity: number;
  inboundBy: string;
  inboundAt: string;
  remark?: string;
}

export interface KolDemandLog {
  id: string;
  action: string;
  operator: string;
  operatedAt: string;
  detail: string;
}

export interface KolPurchaseDemand {
  id: string;
  demandNo: string;
  applicant: string;
  appliedAt: string;
  storeName?: string;
  status: KolDemandStatus;
  imageUrl: string;
  spu: string;
  sku: string;
  productName: string;
  color: string;
  size: string;
  styleId?: string;
  styleName?: string;
  category?: string;
  score?: string;
  kolApplyQty: number;
  kolInboundQty: number;
  inboundDiffQty: number;
  actualAvailableCount: number;
  kolInboundCount: number;
  lastAvailableQty?: number;
  lastInboundQty?: number;
  lastAvailableAt?: string;
  isHotSale: boolean;
  rejectReason?: string;
  rejectedBy?: string;
  rejectedAt?: string;
  skuRemark?: string;
  remarks: KolDemandRemark[];
  inboundRecords: KolDemandInboundRecord[];
  logs: KolDemandLog[];
}

const baseLog = (id: string, action: string, detail: string, operatedAt: string): KolDemandLog => ({
  id,
  action,
  operator: "张敏",
  operatedAt,
  detail,
});

export const kolPurchaseDemands: KolPurchaseDemand[] = [
  {
    id: "KOL-D-001",
    demandNo: "KOL-202606050001",
    applicant: "张敏",
    appliedAt: "2026-06-05 09:33:59",
    storeName: "Shopee印尼旗舰店",
    status: "待入库",
    imageUrl: "/mock/products/hg-ts-2601.svg",
    spu: "HG-TS-2601",
    sku: "HG-TS-2601-WH-M",
    productName: "男款圆领T恤",
    color: "白色",
    size: "M",
    styleId: "4413",
    styleName: "基础圆领短袖",
    category: "T恤",
    score: "4.8",
    kolApplyQty: 30,
    kolInboundQty: 0,
    inboundDiffQty: 30,
    actualAvailableCount: 1,
    kolInboundCount: 0,
    lastAvailableQty: 30,
    lastInboundQty: 0,
    lastAvailableAt: "2026-06-05 16:09:31",
    isHotSale: true,
    remarks: [{ id: "RM-001", content: "用于6月达人直播测款。", createdBy: "张敏", createdAt: "2026-06-05 09:34:12" }],
    inboundRecords: [],
    logs: [baseLog("LOG-001", "提交申请", "提交KOL采购需求30件", "2026-06-05 09:33:59")],
  },
  {
    id: "KOL-D-002",
    demandNo: "KOL-202606050002",
    applicant: "李婷",
    appliedAt: "2026-06-05 10:18:22",
    storeName: "TikTok印尼店",
    status: "部分入库",
    imageUrl: "/mock/products/hg-ts-2601.svg",
    spu: "HG-TS-2601",
    sku: "HG-TS-2601-BK-M",
    productName: "男款圆领T恤",
    color: "黑色",
    size: "M",
    styleId: "4413",
    styleName: "基础圆领短袖",
    category: "T恤",
    score: "4.8",
    kolApplyQty: 24,
    kolInboundQty: 10,
    inboundDiffQty: 14,
    actualAvailableCount: 2,
    kolInboundCount: 1,
    lastAvailableQty: 18,
    lastInboundQty: 10,
    lastAvailableAt: "2026-06-05 17:20:08",
    isHotSale: true,
    remarks: [],
    inboundRecords: [{ id: "IN-001", quantity: 10, inboundBy: "王伟", inboundAt: "2026-06-05 17:20:08", remark: "首批到货" }],
    logs: [
      baseLog("LOG-002", "提交申请", "提交KOL采购需求24件", "2026-06-05 10:18:22"),
      baseLog("LOG-003", "确认入库", "确认入库10件", "2026-06-05 17:20:08"),
    ],
  },
  {
    id: "KOL-D-003",
    demandNo: "KOL-202606050003",
    applicant: "陈洁",
    appliedAt: "2026-06-05 11:42:10",
    storeName: "Shopee印尼旗舰店",
    status: "全部入库",
    imageUrl: "/mock/products/hg-pt-2602.svg",
    spu: "HG-PT-2602",
    sku: "HG-PT-2602-BK-L",
    productName: "女款休闲裤",
    color: "黑色",
    size: "L",
    styleId: "4520",
    styleName: "高腰直筒休闲裤",
    category: "裤装",
    score: "4.7",
    kolApplyQty: 20,
    kolInboundQty: 20,
    inboundDiffQty: 0,
    actualAvailableCount: 1,
    kolInboundCount: 1,
    lastAvailableQty: 20,
    lastInboundQty: 20,
    lastAvailableAt: "2026-06-06 09:15:20",
    isHotSale: false,
    remarks: [],
    inboundRecords: [{ id: "IN-002", quantity: 20, inboundBy: "王伟", inboundAt: "2026-06-06 09:15:20", remark: "一次性入库" }],
    logs: [
      baseLog("LOG-004", "提交申请", "提交KOL采购需求20件", "2026-06-05 11:42:10"),
      baseLog("LOG-005", "确认入库", "确认入库20件，需求已完成", "2026-06-06 09:15:20"),
    ],
  },
  {
    id: "KOL-D-004",
    demandNo: "KOL-202606050004",
    applicant: "赵楠",
    appliedAt: "2026-06-05 14:06:35",
    storeName: "Lazada印尼店",
    status: "已驳回",
    imageUrl: "/mock/products/hg-hd-2603.svg",
    spu: "HG-HD-2603",
    sku: "HG-HD-2603-GY-M",
    productName: "连帽卫衣",
    color: "灰色",
    size: "M",
    styleId: "4631",
    styleName: "轻量连帽卫衣",
    category: "卫衣",
    score: "4.6",
    kolApplyQty: 16,
    kolInboundQty: 0,
    inboundDiffQty: 16,
    actualAvailableCount: 0,
    kolInboundCount: 0,
    isHotSale: false,
    rejectReason: "活动计划调整，本批需求取消。",
    rejectedBy: "采购主管",
    rejectedAt: "2026-06-05 15:12:06",
    remarks: [],
    inboundRecords: [],
    logs: [
      baseLog("LOG-006", "提交申请", "提交KOL采购需求16件", "2026-06-05 14:06:35"),
      baseLog("LOG-007", "驳回", "活动计划调整，本批需求取消。", "2026-06-05 15:12:06"),
    ],
  },
  {
    id: "KOL-D-005",
    demandNo: "KOL-202606060001",
    applicant: "张敏",
    appliedAt: "2026-06-06 08:40:18",
    storeName: "TikTok印尼店",
    status: "草稿",
    imageUrl: "/mock/products/hg-jk-2605.svg",
    spu: "HG-JK-2605",
    sku: "HG-JK-2605-KH-M",
    productName: "轻薄夹克",
    color: "卡其",
    size: "M",
    styleId: "4755",
    styleName: "轻薄防晒夹克",
    category: "外套",
    score: "-",
    kolApplyQty: 12,
    kolInboundQty: 0,
    inboundDiffQty: 12,
    actualAvailableCount: 0,
    kolInboundCount: 0,
    isHotSale: true,
    skuRemark: "待确认达人尺码",
    remarks: [],
    inboundRecords: [],
    logs: [baseLog("LOG-008", "保存草稿", "保存KOL采购需求草稿12件", "2026-06-06 08:40:18")],
  },
  {
    id: "KOL-D-006",
    demandNo: "KOL-202606060002",
    applicant: "吴芳",
    appliedAt: "2026-06-06 09:05:44",
    storeName: "Shopee印尼旗舰店",
    status: "待入库",
    imageUrl: "/mock/products/hg-jk-2605.svg",
    spu: "HG-JK-2605",
    sku: "HG-JK-2605-BK-L",
    productName: "轻薄夹克",
    color: "黑色",
    size: "L",
    styleId: "4755",
    styleName: "轻薄防晒夹克",
    category: "外套",
    score: "-",
    kolApplyQty: 18,
    kolInboundQty: 0,
    inboundDiffQty: 18,
    actualAvailableCount: 1,
    kolInboundCount: 0,
    lastAvailableQty: 18,
    lastInboundQty: 0,
    lastAvailableAt: "2026-06-06 09:40:12",
    isHotSale: true,
    remarks: [],
    inboundRecords: [],
    logs: [baseLog("LOG-009", "提交申请", "提交KOL采购需求18件", "2026-06-06 09:05:44")],
  },
];

