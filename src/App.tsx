import { useEffect, useMemo, useState, type ReactElement } from "react";
import Layout from "./components/layout/Layout";
import type { Role, TabItem } from "./types/common";
import Dashboard from "./pages/dashboard/Dashboard";
import SupplierManagement from "./pages/master-data/SupplierManagement";
import MaterialManagement from "./pages/master-data/MaterialManagement";
import ProductSkuListPage from "./pages/master-data/ProductSkuListPage";
import SupplierSupplyArchiveDemo from "./pages/master-data/SupplierSupplyArchiveDemo";
import WarehouseManagement from "./pages/master-data/WarehouseManagement";
import UnitManagement from "./pages/master-data/UnitManagement";
import BomTemplateManagement from "./pages/base-data/BomTemplateManagement";
import ProductPurchaseSuggestion from "./pages/purchase-suggestion/ProductPurchaseSuggestion";
import KolPurchaseRequirement from "./pages/purchase-suggestion/KolPurchaseRequirement";
import {
  applyKolDemandQuantities,
  createProductPurchaseSuggestions,
  type ProductPurchaseSuggestion as Suggestion,
} from "./mock/productPurchaseSuggestions";
import { kolPurchaseDemands, type KolPurchaseDemand } from "./mock/kolPurchaseDemands";
import ProductPurchaseOrder from "./pages/product-purchase/ProductPurchaseOrder";
import ProductionPurchaseOrder from "./pages/product-purchase/ProductionPurchaseOrder";
import GarmentPurchaseOrder from "./pages/product-purchase/GarmentPurchaseOrder";
import SamplePurchaseOrder from "./pages/product-purchase/SamplePurchaseOrder";
import MaterialRequirementAnalysis from "./pages/material-purchase/MaterialRequirementAnalysis";
import IdMaterialPurchaseOrder from "./pages/material-purchase/IdMaterialPurchaseOrder";
import MaterialPurchaseTracking, { createMaterialLogisticsRows } from "./pages/material-purchase/MaterialPurchaseTracking";
import type { JoinHeadLogisticsPayload } from "./pages/material-purchase/JoinHeadLogisticsModal";
import TransferBatchManagement from "./pages/material-purchase/TransferBatchManagement";
import FirstLegCarrierManagement from "./pages/material-purchase/FirstLegCarrierManagement";
import { idMaterialPurchaseOrders } from "./mock/idMaterialPurchaseOrders";
import { initialFirstLegCarriers, initialFirstLegCarrierChannels } from "./mock/firstLegCarriers";
import ProductPurchaseReconciliation from "./pages/finance/ProductPurchaseReconciliation";
import ProcurementReconciliation, { type ReconciliationView } from "./pages/finance/ProcurementReconciliation";
import LogisticsFeeReconciliation from "./pages/finance/LogisticsFeeReconciliation";
import MaterialPurchaseReconciliation from "./pages/finance/MaterialPurchaseReconciliation";
import { initialOrders, initialPayables, initialPayments } from "./mock/reconciliation";
import UserManagement from "./pages/settings/UserManagement";
import RoleManagement from "./pages/settings/RoleManagement";
import DictionaryConfig from "./pages/settings/DictionaryConfig";
import type { ImportedLogisticsInfo } from "./types/materialLogistics";
import type { TransferBatch } from "./types/transferBatch";
import type { FirstLegCarrier, FirstLegCarrierChannel } from "./types/firstLegCarrier";

const staticViews: Record<string, ReactElement> = {
  PMS首页: <Dashboard />,
  供应商供货档案: <SupplierSupplyArchiveDemo />,
  商品供应商管理: <SupplierManagement />,
  面辅料列表: <MaterialManagement title="面辅料列表" description="查看商品中心 PCS 同步的面料、辅料、纱线、包材及耗材资料，并维护采购、申报和报关补充信息。" allowedCategories={["面料", "辅料", "纱线", "包材", "耗材"]} />,
  成衣列表: <ProductSkuListPage kind="garment" />,
  样衣列表: <ProductSkuListPage kind="sample" />,
  仓库管理: <WarehouseManagement />,
  单位管理: <UnitManagement />,
  "BOM/样板管理": <BomTemplateManagement />,
  商品采购单: <ProductPurchaseOrder />,
  做货采购单: <ProductionPurchaseOrder />,
  成衣采购单: <GarmentPurchaseOrder />,
  样衣采购单: <SamplePurchaseOrder />,
  面辅料需求分析: <MaterialRequirementAnalysis />,
  商品采购对账: <ProductPurchaseReconciliation />,
  用户管理: <UserManagement />,
  角色权限: <RoleManagement />,
  字典配置: <DictionaryConfig />,
};

const reconciliationViews = new Set<ReconciliationView>(["应付明细池", "面辅料采购对账", "物流费用对账", "对账单管理", "付款记录"]);
const dynamicViewKeys = new Set(["商品采购建议", "KOL采购需求", "面辅料采购单", "面辅料采购跟踪", "头程物流", "头程物流商管理", ...reconciliationViews]);
const normalizeViewKey = (key: string) => {
  if (key === "供应商管理") return "商品供应商管理";
  if (key === "成衣 / 样衣列表") return "成衣列表";
  return key;
};
const isAvailableView = (key: string) => normalizeViewKey(key) in staticViews || dynamicViewKeys.has(normalizeViewKey(key));

export default function App() {
  const [role, setRole] = useState<Role>("采购员");
  const [active, setActive] = useState("PMS首页");
  const [tabs, setTabs] = useState<TabItem[]>([{ key: "PMS首页", title: "PMS首页" }]);
  const initialDemandQuantities = useMemo(() => {
    const quantities = new Map<string, number>();
    kolPurchaseDemands.filter((item) => item.status !== "草稿" && item.status !== "已驳回").forEach((item) => {
      quantities.set(item.sku, (quantities.get(item.sku) ?? 0) + item.kolApplyQty);
    });
    return quantities;
  }, []);
  const [suggestions, setSuggestions] = useState<Suggestion[]>(() => applyKolDemandQuantities(createProductPurchaseSuggestions(), initialDemandQuantities));
  const [kolDemands, setKolDemands] = useState<KolPurchaseDemand[]>(kolPurchaseDemands);
  const [materialOrders, setMaterialOrders] = useState(idMaterialPurchaseOrders);
  const [importedLogistics, setImportedLogistics] = useState<ImportedLogisticsInfo[]>([]);
  const [transferBatches, setTransferBatches] = useState<TransferBatch[]>([]);
  const [firstLegCarriers, setFirstLegCarriers] = useState<FirstLegCarrier[]>(initialFirstLegCarriers);
  const [firstLegCarrierChannels, setFirstLegCarrierChannels] = useState<FirstLegCarrierChannel[]>(initialFirstLegCarrierChannels);
  const [targetFirstLegNo, setTargetFirstLegNo] = useState("");
  const [payables, setPayables] = useState(initialPayables);
  const [reconciliationOrders, setReconciliationOrders] = useState(initialOrders);
  const [paymentRecords, setPaymentRecords] = useState(initialPayments);
  const materialLogisticsRecords = useMemo(() => createMaterialLogisticsRows(materialOrders, importedLogistics), [importedLogistics, materialOrders]);

  const openMenu = (key: string) => {
    const viewKey = normalizeViewKey(key);
    if (!isAvailableView(viewKey)) {
      setActive("PMS首页");
      return;
    }
    setActive(viewKey);
    setTabs((current) => (current.some((tab) => tab.key === viewKey) ? current : [...current, { key: viewKey, title: viewKey }]));
  };

  const switchTab = (key: string) => {
    const viewKey = normalizeViewKey(key);
    if (!isAvailableView(viewKey)) {
      setActive("PMS首页");
      setTabs((current) => current.filter((tab) => isAvailableView(tab.key)));
      return;
    }
    setActive(viewKey);
  };

  const closeTab = (key: string) => {
    setTabs((current) => current.filter((tab) => tab.key !== key));
    if (active === key) setActive("PMS首页");
  };

  const openFirstLegLogistics = (firstLegNo: string) => {
    setTargetFirstLegNo(firstLegNo);
    openMenu("头程物流");
  };

  const createTransferBatchFromLogistics = ({ headLogisticsNo, allocations }: JoinHeadLogisticsPayload) => {
    if (!allocations.length) return "请至少选择一条国内物流记录";
    if (transferBatches.some((batch) => batch.batchNo === headLogisticsNo)) return "头程物流单号已存在";
    const nextRecords = allocations.map(({ record, quantity, rolls, originalBox }) => ({
      ...record,
      headLogisticsQty: quantity,
      headLogisticsRolls: rolls,
      originalBoxHead: originalBox,
    }));
    const batch: TransferBatch = {
        batchNo: headLogisticsNo,
        batchName: `国内物流加入头程-${headLogisticsNo}`,
        transferCenter: nextRecords[0]?.transitCenter || "广州转运中心",
        destinationWarehouse: "印尼雅加达面辅料仓",
        carrier: "空运专线",
        creator: "王采购",
        createdAt: "2026-06-09 10:30",
        plannedShipDate: "2026-06-12",
        status: "待转运",
        remark: "由国内物流跟踪勾选后加入头程物流单",
        records: nextRecords,
      };
    setTransferBatches((current) => [batch, ...current]);
    return undefined;
  };

  useEffect(() => {
    setTabs((current) => current.filter((tab) => isAvailableView(tab.key)));
    if (!isAvailableView(active)) setActive("PMS首页");
  }, [active]);

  const updateKolDemands = (nextDemands: KolPurchaseDemand[]) => {
    setKolDemands(nextDemands);
    const quantities = new Map<string, number>();
    nextDemands.filter((item) => item.status !== "草稿" && item.status !== "已驳回").forEach((item) => {
      quantities.set(item.sku, (quantities.get(item.sku) ?? 0) + item.kolApplyQty);
    });
    setSuggestions((current) => applyKolDemandQuantities(current, quantities));
  };

  const page = useMemo(() => {
    if (active === "商品采购建议") {
      return <ProductPurchaseSuggestion rows={suggestions} setRows={setSuggestions} />;
    }
    if (active === "KOL采购需求") {
      return <KolPurchaseRequirement suggestions={suggestions} demands={kolDemands} onDemandsChange={updateKolDemands} />;
    }
    if (active === "面辅料采购单") {
      return (
        <IdMaterialPurchaseOrder
          orders={materialOrders}
          onOrdersChange={setMaterialOrders}
          onLogisticsImported={(records) => setImportedLogistics((current) => [...records, ...current.filter((item) => !records.some((record) => record.idOrderNo === item.idOrderNo))])}
        />
      );
    }
    if (active === "面辅料采购跟踪") {
      return <MaterialPurchaseTracking onCreateTransferBatch={createTransferBatchFromLogistics} records={materialLogisticsRecords} transferBatches={transferBatches} />;
    }
    if (active === "头程物流") {
      return <TransferBatchManagement batches={transferBatches} setBatches={setTransferBatches} availableRecords={materialLogisticsRecords} targetBatchNo={targetFirstLegNo} onTargetHandled={() => setTargetFirstLegNo("")} carriers={firstLegCarriers} channels={firstLegCarrierChannels} />;
    }
    if (active === "头程物流商管理") {
      return <FirstLegCarrierManagement carriers={firstLegCarriers} setCarriers={setFirstLegCarriers} channels={firstLegCarrierChannels} setChannels={setFirstLegCarrierChannels} />;
    }
    if (active === "物流费用对账") {
      return <LogisticsFeeReconciliation onOpenFirstLeg={openFirstLegLogistics} />;
    }
    if (active === "面辅料采购对账") {
      return <MaterialPurchaseReconciliation />;
    }
    if (reconciliationViews.has(active as ReconciliationView)) {
      return (
        <ProcurementReconciliation
          view={active as ReconciliationView}
          payables={payables}
          setPayables={setPayables}
          orders={reconciliationOrders}
          setOrders={setReconciliationOrders}
          payments={paymentRecords}
          setPayments={setPaymentRecords}
        />
      );
    }
    return staticViews[active] ?? <Dashboard />;
  }, [active, firstLegCarrierChannels, firstLegCarriers, importedLogistics, kolDemands, materialLogisticsRecords, materialOrders, paymentRecords, payables, reconciliationOrders, suggestions, targetFirstLegNo, transferBatches]);

  return (
    <Layout role={role} setRole={setRole} activeMenu={active} onMenuClick={openMenu} tabs={tabs} onTabSwitch={switchTab} onTabClose={closeTab}>
      {page}
    </Layout>
  );
}
