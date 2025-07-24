// src/components/dashboard/Sidebar.tsx
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "../../store/authStore";
import {
  Home,
  ShoppingCart,
  Box,
  FileText,
  Clipboard,
  Users,
  Folder,
  Download,
  Edit3,
  AlertCircle,
  Bell,
  BarChart2,
  PieChart,
  Star,
  UserCheck,
  Sun,
  Moon,
  Receipt,
  Home as ShopHome,
  Percent,
  Printer,
  UserPlus,
  Activity,
  Database,
  RotateCw,
  X,
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

interface MenuItem {
  to?: string;
  label: string;
  icon: React.ReactNode;
  children?: MenuItem[];
}

const menuItems: MenuItem[] = [
  {
    label: "Dashboard",
    to: "/dashboard/admin",
    icon: <Home className="w-5 h-5" />,
  },
  {
    label: "Sales",
    icon: <ShoppingCart className="w-5 h-5" />,
    children: [
      {
        to: "/dashboard/sales/newsales",
        label: "New Sale",
        icon: <ShoppingCart className="w-5 h-5" />,
      },
      {
        to: "/dashboard/sales/history",
        label: "Sales History",
        icon: <FileText className="w-5 h-5" />,
      },
      {
        to: "/dashboard/sales/returns",
        label: "Returns & Voids",
        icon: <ShoppingCart className="w-5 h-5" />,
      },
    ],
  },
  {
    label: "Products",
    icon: <Box className="w-5 h-5" />,
    children: [
      {
        to: "/dashboard/products",
        label: "Product List",
        icon: <Box className="w-5 h-5" />,
      },
      {
        to: "/dashboard/categories",
        label: "Categories",
        icon: <Folder className="w-5 h-5" />,
      },
    ],
  },
  {
    label: "Inventory",
    icon: <Download className="w-5 h-5" />,
    children: [
      {
        to: "/dashboard/stock/receive",
        label: "Stock Receiving",
        icon: <Download className="w-5 h-5" />,
      },
      {
        to: "/dashboard/stock/adjust",
        label: "Stock Adjustments",
        icon: <Edit3 className="w-5 h-5" />,
      },
      {
        to: "/dashboard/stock/bad-orders",
        label: "Bad Orders",
        icon: <AlertCircle className="w-5 h-5" />,
      },
      {
        to: "/dashboard/stock/low-stock",
        label: "Low-Stock Alerts",
        icon: <Bell className="w-5 h-5" />,
      },
    ],
  },
  {
    label: "Suppliers",
    icon: <Clipboard className="w-5 h-5" />,
    children: [
      {
        to: "/dashboard/purchase-orders",
        label: "Purchase Orders",
        icon: <Clipboard className="w-5 h-5" />,
      },
      {
        to: "/dashboard/suppliers",
        label: "Suppliers",
        icon: <Users className="w-5 h-5" />,
      },
      {
        to: "/dashboard/pending-deliveries",
        label: "Pending Deliveries",
        icon: <Bell className="w-5 h-5" />,
      },
    ],
  },
  {
    label: "Reports",
    icon: <BarChart2 className="w-5 h-5" />,
    children: [
      {
        to: "/dashboard/reports/sales",
        label: "Sales Reports",
        icon: <BarChart2 className="w-5 h-5" />,
      },
      {
        to: "/dashboard/reports/inventory",
        label: "Inventory Reports",
        icon: <PieChart className="w-5 h-5" />,
      },
      {
        to: "/dashboard/reports/top-selling",
        label: "Top-Selling Products",
        icon: <Star className="w-5 h-5" />,
      },
      {
        to: "/dashboard/reports/cashiers",
        label: "Cashier Summaries",
        icon: <UserCheck className="w-5 h-5" />,
      },
    ],
  },
  {
    label: "Readings",
    icon: <FileText className="w-5 h-5" />,
    children: [
      {
        to: "/dashboard/readings/x",
        label: "X-Reading",
        icon: <Sun className="w-5 h-5" />,
      },
      {
        to: "/dashboard/readings/z",
        label: "Z-Reading",
        icon: <Moon className="w-5 h-5" />,
      },
      {
        to: "/dashboard/receipt-logs",
        label: "Receipt Logs",
        icon: <Receipt className="w-5 h-5" />,
      },
    ],
  },
  {
    label: "Settings",
    icon: <ShopHome className="w-5 h-5" />,
    children: [
      {
        to: "/dashboard/settings/business",
        label: "Business Profile",
        icon: <ShopHome className="w-5 h-5" />,
      },
      {
        to: "/dashboard/settings/vat",
        label: "VAT Settings",
        icon: <Percent className="w-5 h-5" />,
      },
      {
        to: "/dashboard/settings/discount",
        label: "Discount Settings",
        icon: <Percent className="w-5 h-5" />,
      },
      {
        to: "/dashboard/settings/receipt",
        label: "Receipt Settings",
        icon: <Printer className="w-5 h-5" />,
      },
      {
        to: "/dashboard/settings/users",
        label: "User Management",
        icon: <UserPlus className="w-5 h-5" />,
      },
      {
        to: "/dashboard/settings/logs",
        label: "System Logs",
        icon: <Activity className="w-5 h-5" />,
      },
    ],
  },
  {
    label: "Utilities",
    icon: <Database className="w-5 h-5" />,
    children: [
      {
        to: "/dashboard/utilities/backup",
        label: "Backup & Restore",
        icon: <Database className="w-5 h-5" />,
      },
      {
        to: "/dashboard/utilities/reprints",
        label: "Reprint Requests",
        icon: <RotateCw className="w-5 h-5" />,
      },
    ],
  },
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar }) => {
  const location = useLocation();
  const [openSection, setOpenSection] = useState<string | null>(null);

  // Pull the role from Zustand (e.g. "Admin", "Cashier", etc.)
  const role = useAuthStore((s) => s.user?.role);

  // Format to "POS Admin", "POS Cashier", etc.
  const titleRole = role
    ? `POS ${role.charAt(0).toUpperCase() + role.slice(1).toLowerCase()}`
    : "POS";

  const isActive = (path: string) =>
    location.pathname.startsWith(path)
      ? "bg-primary/10 text-primary font-semibold"
      : "hover:bg-base-300";

  const handleSection = (label: string) => {
    setOpenSection(openSection === label ? null : label);
  };

  return (
    <aside
      className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-base-200 p-4
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0 md:static md:flex-shrink-0
      `}
    >
      <div className="mb-8">
        <div className="flex items-center">
          <img
            src="../src/assets/logo.svg"
            alt="POS Logo"
            className="w-8 h-8 mr-2"
          />
          <h2 className="text-2xl font-bold">{titleRole}</h2>
        </div>
        <p className="text-sm text-gray-500 ml-10">Smart Point of Sale Sytem</p>

        <button
          type="button"
          aria-label="Close sidebar"
          className="md:hidden absolute top-4 right-4 p-2"
          onClick={toggleSidebar}
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <nav className="space-y-2">
        {menuItems.map((item) => (
          <div key={item.label}>
            {item.to ? (
              <Link
                to={item.to}
                className={`flex items-center gap-3 px-3 py-2 rounded ${isActive(item.to)}`}
                onClick={() => isOpen && toggleSidebar()}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ) : (
              <button
                className="flex items-center gap-3 w-full px-3 py-2 rounded hover:bg-base-300"
                onClick={() => handleSection(item.label)}
              >
                {item.icon}
                <span className="flex-1 text-left">{item.label}</span>
                <motion.svg
                  className="w-4 h-4"
                  animate={{ rotate: openSection === item.label ? 90 : 0 }}
                  transition={{ duration: 0.2 }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </motion.svg>
              </button>
            )}

            <AnimatePresence>
              {item.children && openSection === item.label && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden ml-6 mt-1 space-y-1"
                >
                  {item.children.map((child) => (
                    <Link
                      key={child.to}
                      to={child.to!}
                      className={`flex items-center gap-2 px-3 py-2 rounded text-sm ${isActive(child.to!)}`}
                      onClick={() => isOpen && toggleSidebar()}
                    >
                      {child.icon}
                      <span>{child.label}</span>
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
