// src/routes/AppRoutes.tsx
import { Routes, Route, Outlet } from "react-router-dom";
import LandingPage from "../pages/LandingPage";
import LoginPage from "../pages/LoginPage";
import DashboardLayout from "../layouts/DashboardLayout";

import AdminDashboardPage from "../pages/admin/AdminDashboardPage";
import ManagerDashboardPage from "../pages/manager/ManagerDashboardPage";
import WarehouseDashboardPage from "../pages/warehouse/WarehouseDashboardPage";
import UnauthorizedPage from "../pages/NotFoundPage";

import RoleProtectedRoute from "../routes/RoleProtectedRoutes";

// Cashier POS layout & pages
import CashierLayout from "../layouts/CashierLayout";
import SalesTransactions from "../pages/cashier/sales/SalesTransactionsPage";

//sales pages
import SalesTransactionsPage from "../pages/sale/NewSalePage";
import SaleHistoryPage from "../pages/sale/SaleHistoryPage";
import ReturnsAndVoidsPage from "../pages/sale/ReturnsAndVoidsPage";
//products pages
import ProductsListPage from "../pages/products/ProductListPage";
import CategoriesPage from "../pages/products/CategoriesPage";
//inventory pages
import StockReceivingPage from "../pages/inventory/StockReceivingPage";
import StockAdjustmentPage from "../pages/inventory/StockAdjustmentsPage";
import BadOrderPage from "../pages/inventory/BadOrderPage";
import LowStockAlertPage from "../pages/inventory/LowStockAlertsPage";
import UnitPage from "../pages/inventory/UnitPage";
import ProductUnitConversionPage from "../pages/inventory/ProductUnitConversionPage";
// suppliers pages
import PurchaseOrderPage from "../pages/suppliers/PurchaseOrdersPage";
import SuppliersPage from "../pages/suppliers/SuppliersPage";
import PendingDeliveriesPage from "../pages/suppliers/PendingDeliveriesPage";
// reports pages
import SalesReportPage from "../pages/reports/SalesReportsPage";
import InventoryReportsPage from "../pages/reports/InventoryReportsPage";
import TopSellingProductsPage from "../pages/reports/TopSellingProductsPage";
import CashierSummariesPage from "../pages/reports/CashierSummariesPage";
// readings pages
import ZReadingPage from "../pages/readings/ZReadingPage";
import XReadingPage from "../pages/readings/XReadingPage";
import ReceiptLogsPage from "../pages/readings/ReceiptLogsPage";
//settings pages
import BusinessProfilePage from "../pages/settings/BusinessProfilePage";
import VatSettingsPage from "../pages/settings/VatSettingsPage";
import ReceiptSettingsPage from "../pages/settings/RecieptSettingsPage";
import DiscountSettingsPage from "../pages/settings/DiscountSettingsPage";
import SystemLogsPage from "../pages/settings/SystemLogsPage";
import UserManagementPage from "../pages/settings/UserManagementPage";
import CounterSettingPage from "../pages/settings/CounterSettingPage";
// utilities pages
import BackupAndRestorePage from "../pages/utilities/BackupAndRestorePage";
import ReprintRequestPage from "../pages/utilities/ReprintRequestPage";

const AppRoutes = () => (
  <Routes>
    {/* Public routes */}
    <Route path="/" element={<LandingPage />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/unauthorized" element={<UnauthorizedPage />} />

    {/* Admin, Manager, Warehouse under DashboardLayout */}
    <Route path="/dashboard" element={<DashboardLayout />}>
      {/* Admin */}
      <Route
        path="admin"
        element={
          <RoleProtectedRoute allowedRoles={["Admin"]}>
            <AdminDashboardPage />
          </RoleProtectedRoute>
        }
      />

      {/* Manager */}
      <Route
        path="manager"
        element={
          <RoleProtectedRoute allowedRoles={["Manager"]}>
            <ManagerDashboardPage />
          </RoleProtectedRoute>
        }
      />

      {/* Warehouse */}
      <Route
        path="warehouse"
        element={
          <RoleProtectedRoute allowedRoles={["Warehouse"]}>
            <WarehouseDashboardPage />
          </RoleProtectedRoute>
        }
      />

      {/* Sales Functions */}
      <Route
        path="sales/newsales"
        element={
          <RoleProtectedRoute allowedRoles={["Admin"]}>
            <SalesTransactionsPage />
          </RoleProtectedRoute>
        }
      />

      <Route
        path="sales/history"
        element={
          <RoleProtectedRoute allowedRoles={["Admin"]}>
            <SaleHistoryPage />
          </RoleProtectedRoute>
        }
      />

      <Route
        path="sales/returns"
        element={
          <RoleProtectedRoute allowedRoles={["Admin"]}>
            <ReturnsAndVoidsPage />
          </RoleProtectedRoute>
        }
      />

      {/* Products Functions */}
      <Route
        path="products"
        element={
          <RoleProtectedRoute allowedRoles={["Admin"]}>
            <ProductsListPage />
          </RoleProtectedRoute>
        }
      />

      <Route
        path="categories"
        element={
          <RoleProtectedRoute allowedRoles={["Admin"]}>
            <CategoriesPage />
          </RoleProtectedRoute>
        }
      />

      {/* Inventory Functions */}
      <Route
        path="inventory/receive"
        element={
          <RoleProtectedRoute allowedRoles={["Admin"]}>
            <StockReceivingPage />
          </RoleProtectedRoute>
        }
      />

      <Route
        path="inventory/adjust"
        element={
          <RoleProtectedRoute allowedRoles={["Admin"]}>
            <StockAdjustmentPage />
          </RoleProtectedRoute>
        }
      />

      <Route
        path="inventory/bad-orders"
        element={
          <RoleProtectedRoute allowedRoles={["Admin"]}>
            <BadOrderPage />
          </RoleProtectedRoute>
        }
      />

      <Route
        path="inventory/low-stock"
        element={
          <RoleProtectedRoute allowedRoles={["Admin"]}>
            <LowStockAlertPage />
          </RoleProtectedRoute>
        }
      />

      <Route
        path="inventory/units"
        element={
          <RoleProtectedRoute allowedRoles={["Admin"]}>
            <UnitPage />
          </RoleProtectedRoute>
        }
      />

      <Route
        path="inventory/unit-conversions"
        element={
          <RoleProtectedRoute allowedRoles={["Admin"]}>
            <ProductUnitConversionPage />
          </RoleProtectedRoute>
        }
      />

      {/* Suppliers Functions */}
      <Route
        path="purchase-orders"
        element={
          <RoleProtectedRoute allowedRoles={["Admin"]}>
            <PurchaseOrderPage />
          </RoleProtectedRoute>
        }
      />

      <Route
        path="suppliers"
        element={
          <RoleProtectedRoute allowedRoles={["Admin"]}>
            <SuppliersPage />
          </RoleProtectedRoute>
        }
      />

      <Route
        path="pending-deliveries"
        element={
          <RoleProtectedRoute allowedRoles={["Admin"]}>
            <PendingDeliveriesPage />
          </RoleProtectedRoute>
        }
      />

      {/* Reports Functions*/}
      <Route
        path="reports/sales"
        element={
          <RoleProtectedRoute allowedRoles={["Admin"]}>
            <SalesReportPage />
          </RoleProtectedRoute>
        }
      />

      <Route
        path="reports/inventory"
        element={
          <RoleProtectedRoute allowedRoles={["Admin"]}>
            <InventoryReportsPage />
          </RoleProtectedRoute>
        }
      />

      <Route
        path="reports/top-selling"
        element={
          <RoleProtectedRoute allowedRoles={["Admin"]}>
            <TopSellingProductsPage />
          </RoleProtectedRoute>
        }
      />

      <Route
        path="reports/cashiers"
        element={
          <RoleProtectedRoute allowedRoles={["Admin"]}>
            <CashierSummariesPage />
          </RoleProtectedRoute>
        }
      />

      {/* Readings */}
      <Route
        path="readings/x"
        element={
          <RoleProtectedRoute allowedRoles={["Admin"]}>
            <XReadingPage />
          </RoleProtectedRoute>
        }
      />

      <Route
        path="readings/z"
        element={
          <RoleProtectedRoute allowedRoles={["Admin"]}>
            <ZReadingPage />
          </RoleProtectedRoute>
        }
      />

      <Route
        path="receipt-logs"
        element={
          <RoleProtectedRoute allowedRoles={["Admin"]}>
            <ReceiptLogsPage />
          </RoleProtectedRoute>
        }
      />

      {/* Settings Functions */}
      <Route
        path="settings/vat"
        element={
          <RoleProtectedRoute allowedRoles={["Admin"]}>
            <VatSettingsPage />
          </RoleProtectedRoute>
        }
      />

      <Route
        path="settings/receipt"
        element={
          <RoleProtectedRoute allowedRoles={["Admin"]}>
            <ReceiptSettingsPage />
          </RoleProtectedRoute>
        }
      />

      <Route
        path="settings/logs"
        element={
          <RoleProtectedRoute allowedRoles={["Admin"]}>
            <SystemLogsPage />
          </RoleProtectedRoute>
        }
      />

      <Route
        path="settings/discount"
        element={
          <RoleProtectedRoute allowedRoles={["Admin"]}>
            <DiscountSettingsPage />
          </RoleProtectedRoute>
        }
      />

      <Route
        path="settings/users"
        element={
          <RoleProtectedRoute allowedRoles={["Admin"]}>
            <UserManagementPage />
          </RoleProtectedRoute>
        }
      />

      <Route
        path="settings/counters"
        element={
          <RoleProtectedRoute allowedRoles={["Admin"]}>
            <CounterSettingPage />
          </RoleProtectedRoute>
        }
      />

      <Route
        path="settings/business"
        element={
          <RoleProtectedRoute allowedRoles={["Admin"]}>
            <BusinessProfilePage />
          </RoleProtectedRoute>
        }
      />

      {/* Utilities */}
      <Route
        path="utilities/backup"
        element={
          <RoleProtectedRoute allowedRoles={["Admin"]}>
            <BackupAndRestorePage />
          </RoleProtectedRoute>
        }
      />

      <Route
        path="utilities/reprints"
        element={
          <RoleProtectedRoute allowedRoles={["Admin"]}>
            <ReprintRequestPage />
          </RoleProtectedRoute>
        }
      />
    </Route>

    {/* Cashier POS Flow under its own full‑screen layout */}
    <Route
      path="/dashboard/cashier/*"
      element={
        <RoleProtectedRoute allowedRoles={["Cashier"]}>
          <CashierLayout>
            {/* Outlet will render nested cashier routes */}
            <Outlet />
          </CashierLayout>
        </RoleProtectedRoute>
      }
    >
      {/* Default POS screen */}
      <Route index element={<SalesTransactions />} />
      {/* Additional POS routes can be added here */}
      {/* <Route path="some-other-pos-feature" element={<SomeOtherPOSFeature />} /> */}
    </Route>

    {/* 404 fallback */}
    <Route
      path="*"
      element={
        <div className="p-10 text-center text-2xl">404 - Page Not Found</div>
      }
    />
  </Routes>
);

export default AppRoutes;
