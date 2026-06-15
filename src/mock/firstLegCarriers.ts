import type { FirstLegCarrier, FirstLegCarrierChannel, FirstLegTransportMethod } from "../types/firstLegCarrier";

export const initialFirstLegCarriers: FirstLegCarrier[] = [
  { id: "flc-1", carrierCode: "FLP-2026-0001", carrierName: "龙邦正清空运", carrierShortName: "龙邦正清", countryOrRegion: "中国", city: "广州", carrierLevel: "A级", contactName: "陈志强", contactPhone: "13800138001", email: "chen@longbang.com", wechat: "longbang-air", address: "广州市白云区机场路", settlementCurrency: "RMB", paymentMethod: "月结", accountPeriodDays: 30, supportedTransportMethods: ["空卡", "空派", "快递"], supportedDestinations: ["美国", "印尼"], supportTaxDeclaration: true, supportCustomsClearance: true, supportDelivery: true, status: "启用", channelCount: 3, remark: "空运与快递优势渠道", createdBy: "系统管理员", createdAt: "2026-01-08 09:30" },
  { id: "flc-2", carrierCode: "FLP-2026-0002", carrierName: "盐田COSCO", carrierShortName: "盐田中远", countryOrRegion: "中国", city: "深圳", carrierLevel: "A级", contactName: "林海", contactPhone: "13900139002", email: "linhai@cosco.com", settlementCurrency: "USD", paymentMethod: "票结", accountPeriodDays: 15, supportedTransportMethods: ["海卡", "海派"], supportedDestinations: ["美国", "欧洲"], supportTaxDeclaration: true, supportCustomsClearance: true, supportDelivery: true, status: "启用", channelCount: 3, createdBy: "系统管理员", createdAt: "2026-01-12 14:20" },
  { id: "flc-3", carrierCode: "FLP-2026-0003", carrierName: "DHL Global Forwarding", carrierShortName: "DHL货代", countryOrRegion: "美国", city: "洛杉矶", carrierLevel: "A级", contactName: "David Chen", contactPhone: "+1 213 555 0188", email: "david@dhl.com", settlementCurrency: "USD", paymentMethod: "月结", accountPeriodDays: 30, supportedTransportMethods: ["空派", "快递"], supportedDestinations: ["美国", "欧洲", "印尼"], supportTaxDeclaration: true, supportCustomsClearance: true, supportDelivery: true, status: "启用", channelCount: 3, createdBy: "系统管理员", createdAt: "2026-02-03 10:00" },
  { id: "flc-4", carrierCode: "FLP-2026-0004", carrierName: "Maersk Logistics", carrierShortName: "马士基物流", countryOrRegion: "其他", city: "哥本哈根", carrierLevel: "A级", contactName: "Anna Lee", contactPhone: "+45 3363 3363", email: "anna@maersk.com", settlementCurrency: "USD", paymentMethod: "预付", supportedTransportMethods: ["海卡", "海派", "铁路"], supportedDestinations: ["美国", "欧洲"], supportTaxDeclaration: false, supportCustomsClearance: true, supportDelivery: true, status: "启用", channelCount: 3, createdBy: "系统管理员", createdAt: "2026-02-18 16:40" },
  { id: "flc-5", carrierCode: "FLP-2026-0005", carrierName: "顺丰速运", carrierShortName: "顺丰", countryOrRegion: "中国", city: "深圳", carrierLevel: "B级", contactName: "周敏", contactPhone: "95338", email: "global@sf-express.com", settlementCurrency: "RMB", paymentMethod: "月结", accountPeriodDays: 30, supportedTransportMethods: ["快递", "卡航"], supportedDestinations: ["印尼", "美国"], supportTaxDeclaration: true, supportCustomsClearance: false, supportDelivery: true, status: "停用", channelCount: 2, createdBy: "系统管理员", createdAt: "2026-03-05 11:15" },
];

type ChannelSeed = {
  carrier: number;
  name: string;
  method: FirstLegTransportMethod;
  days: number;
  billing: "计费重" | "实重" | "体积";
  tax: "报税" | "不报税";
  currency: "RMB" | "USD" | "IDR";
  destination: string;
  warehouse: string;
  origin: string;
  status?: "启用" | "停用";
};

const seeds: ChannelSeed[] = [
  { carrier: 0, name: "广州空派美东线", method: "空派", days: 8, billing: "计费重", tax: "报税", currency: "RMB", destination: "美国", warehouse: "美东新泽西仓", origin: "广州" },
  { carrier: 0, name: "广州空卡美西线", method: "空卡", days: 10, billing: "实重", tax: "报税", currency: "USD", destination: "美国", warehouse: "美西洛杉矶仓", origin: "广州" },
  { carrier: 0, name: "广州快递印尼线", method: "快递", days: 5, billing: "计费重", tax: "不报税", currency: "RMB", destination: "印尼", warehouse: "印尼雅加达仓", origin: "广州" },
  { carrier: 1, name: "深圳海卡美西线", method: "海卡", days: 25, billing: "体积", tax: "报税", currency: "USD", destination: "美国", warehouse: "美西洛杉矶仓", origin: "深圳" },
  { carrier: 1, name: "盐田海派美东线", method: "海派", days: 30, billing: "体积", tax: "报税", currency: "USD", destination: "美国", warehouse: "美东新泽西仓", origin: "深圳" },
  { carrier: 1, name: "盐田海派欧洲线", method: "海派", days: 32, billing: "体积", tax: "不报税", currency: "USD", destination: "欧洲", warehouse: "德国杜塞尔多夫仓", origin: "深圳" },
  { carrier: 2, name: "DHL空派美东线", method: "空派", days: 7, billing: "计费重", tax: "报税", currency: "USD", destination: "美国", warehouse: "美东新泽西仓", origin: "广州" },
  { carrier: 2, name: "DHL国际快递印尼线", method: "快递", days: 4, billing: "实重", tax: "不报税", currency: "USD", destination: "印尼", warehouse: "印尼雅加达仓", origin: "深圳" },
  { carrier: 2, name: "DHL空派欧洲线", method: "空派", days: 9, billing: "计费重", tax: "报税", currency: "USD", destination: "欧洲", warehouse: "荷兰海外仓", origin: "广州" },
  { carrier: 3, name: "马士基海卡美西线", method: "海卡", days: 24, billing: "体积", tax: "报税", currency: "USD", destination: "美国", warehouse: "美西洛杉矶仓", origin: "深圳" },
  { carrier: 3, name: "马士基海派欧洲线", method: "海派", days: 28, billing: "体积", tax: "不报税", currency: "USD", destination: "欧洲", warehouse: "德国杜塞尔多夫仓", origin: "宁波" },
  { carrier: 3, name: "义乌铁路欧洲线", method: "铁路", days: 18, billing: "实重", tax: "报税", currency: "USD", destination: "欧洲", warehouse: "波兰华沙仓", origin: "义乌" },
  { carrier: 4, name: "顺丰快递印尼线", method: "快递", days: 6, billing: "计费重", tax: "报税", currency: "RMB", destination: "印尼", warehouse: "印尼雅加达仓", origin: "深圳" },
  { carrier: 4, name: "深圳卡航东南亚线", method: "卡航", days: 12, billing: "实重", tax: "不报税", currency: "RMB", destination: "印尼", warehouse: "印尼泗水仓", origin: "深圳", status: "停用" },
];

export const initialFirstLegCarrierChannels: FirstLegCarrierChannel[] = seeds.map((seed, index) => {
  const carrier = initialFirstLegCarriers[seed.carrier];
  return {
    id: `flch-${index + 1}`,
    carrierId: carrier.id,
    carrierName: carrier.carrierName,
    channelCode: `CH-2026-${String(index + 1).padStart(4, "0")}`,
    channelName: seed.name,
    transportMethod: seed.method,
    estimatedTransitDays: seed.days,
    minTransitDays: Math.max(1, seed.days - 2),
    maxTransitDays: seed.days + 3,
    cutoffTime: "18:00",
    departureFrequency: seed.method.includes("空") || seed.method === "快递" ? "每日发运" : "每周一三五",
    billingMethod: seed.billing,
    chargeWeightFactor: 1,
    volumeDivisor: seed.billing === "计费重" ? 6000 : 8000,
    minChargeWeight: 21,
    firstWeightPrice: seed.method === "快递" ? 35 : undefined,
    additionalWeightPrice: seed.method === "快递" ? 8 : undefined,
    unitPrice: seed.billing === "体积" ? 120 : 12.5,
    feeCurrency: seed.currency,
    taxMethod: seed.tax,
    includeTax: seed.tax === "报税",
    includeCustomsClearance: true,
    includeDelivery: true,
    originPlace: seed.origin,
    destinationCountry: seed.destination,
    destinationWarehouse: seed.warehouse,
    applicableArea: seed.destination === "美国" ? (seed.name.includes("美东") ? "美东" : "美西") : seed.destination,
    transferCenter: `${seed.origin}转运中心`,
    supportBattery: index % 3 === 0,
    supportLiquid: false,
    supportSensitiveGoods: index % 4 === 0,
    supportNormalGoods: true,
    maxBoxWeight: 30,
    maxBoxVolume: 0.5,
    status: seed.status ?? "启用",
    remark: "停用不影响历史头程物流单",
    createdBy: "系统管理员",
    createdAt: `2026-0${(index % 3) + 1}-${String((index % 20) + 5).padStart(2, "0")} 10:00`,
  };
});
