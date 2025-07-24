// src/layouts/CashierLayout.tsx
import type { ReactNode } from "react";
import Navbar from "../components/dashboard/Navbar";
import Footer from "../components/dashboard/Footer";

interface CashierLayoutProps {
  children: ReactNode;
}

export default function CashierLayout({ children }: CashierLayoutProps) {
  return (
    <div className="flex flex-col h-screen bg-base-100">
      {/* Navbar only (no sidebar toggle needed) */}
      <Navbar
        toggleSidebar={() => {
          /* no-op */
        }}
      />

      {/* Main POS area */}
      <main className="flex-1 overflow-y-auto p-4">{children}</main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
