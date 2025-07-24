// src/layouts/DashboardLayout.tsx
import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/dashboard/Sidebar";
import Navbar from "../components/dashboard/Navbar";
import Footer from "../components/dashboard/Footer";

/**
 * Responsive Dashboard Layout for the POS System
 * - Toggles sidebar in mobile view
 * - Renders <Outlet /> for nested routes
 */
const DashboardLayout = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);

  return (
    <div className="flex h-screen bg-base-100 overflow-hidden relative">
      {/* Sidebar */}
      <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={() => setSidebarOpen((s) => !s)}
      />

      {/* Mobile backdrop when sidebar is open */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-40 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Main content area */}
      <div className="flex-1 flex flex-col">
        {/* Navbar with hamburger menu */}
        <Navbar toggleSidebar={toggleSidebar} />

        {/* Dynamic route content */}
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
};

export default DashboardLayout;
