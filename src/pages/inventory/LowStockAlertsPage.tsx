// src/pages/settings/LowStockAlertPage.tsx
import { useEffect } from "react";
import toast from "react-hot-toast";
import { Bell } from "lucide-react";

const LowStockAlertPage = () => {
  useEffect(() => {
    toast.success("Navigated to Low Stock Alert Page ");
  }, []);

  return (
    <div className="space-p-4">
      <header className="flex items-center gap-2">
        <Bell className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-bold text-primary">Low Stocks</h1>
      </header>
      <p className="text-sm text-gray-500">
        This is a placeholder for the low stock alerts interface where users can
        view, search, and manage products that are running low in stock.
      </p>
    </div>
  );
};

export default LowStockAlertPage;
