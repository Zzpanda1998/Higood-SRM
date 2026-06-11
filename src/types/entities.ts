export type Supplier = {
  id: string;
  code: string;
  name: string;
  shortName: string;
  type: string;
  country: string;
  city: string;
  contact: string;
  phone: string;
  payment: string;
  currency: string;
  status: string;
};

export type Material = {
  id: string;
  code: string;
  name: string;
  category: string;
  spec: string;
  color: string;
  unit: string;
  purchaseUnit: string;
  stockUnit: string;
  defaultSupplier: string;
  needQc: boolean;
  status: string;
};

export type Warehouse = {
  id: string;
  code: string;
  name: string;
  type: string;
  country: string;
  city: string;
  owner: string;
  status: string;
};

export type PurchaseOrder = {
  id: string;
  orderNo: string;
  sourceType?: string;
  sourceNo?: string;
  sourceItem?: string;
  materialTrackingNo?: string;
  materialTrackingGenerated?: boolean;
  supplier: string;
  purchaseType: string;
  targetWarehouse: string;
  skuCount: number;
  qty: number;
  shippedQty: number;
  receivedQty: number;
  inboundQty: number;
  amount: number;
  status: string;
  creator: string;
  dueDate: string;
};
