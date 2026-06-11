export const reportCards = {
  purchase: { monthOrders: 46, monthAmount: 2860000, byType: [["面料采购", 14], ["辅料采购", 11], ["成衣采购", 8], ["包材采购", 7], ["其他", 6]] },
  arrivalException: { abnormalCount: 12, shortage: 8, overage: 2, damaged: 1, wrong: 1 },
  supplierDelivery: [
    { supplier: "广州华盛面料有限公司", orders: 12, onTimeRate: 93, qcRate: 96, abnormal: 1, score: 94 },
    { supplier: "东莞宏远辅料有限公司", orders: 10, onTimeRate: 88, qcRate: 90, abnormal: 3, score: 87 },
    { supplier: "绍兴锦达纺织有限公司", orders: 8, onTimeRate: 91, qcRate: 95, abnormal: 1, score: 92 },
  ],
};
