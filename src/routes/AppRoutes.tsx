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
      {/* You can add more /dashboard/cashier/... child routes here */}
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
