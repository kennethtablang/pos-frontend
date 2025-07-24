// src/pages/settings/StockAdjustmentPage.tsx
import { useEffect } from "react";
import toast from "react-hot-toast";
import { Edit3 } from "lucide-react";

const StockAdjustmentPage = () => {
  useEffect(() => {
    toast.success("Navigated to Stock Adjustment Page ");
  }, []);

  return (
    <div className="space-p-4">
      <header className="flex items-center gap-2">
        <Edit3 className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-bold text-primary">Stock Adjustments</h1>
      </header>
      <p className="text-sm text-gray-500">
        This is a placeholder for the stock adjustments interface where users
        can view, search, and manage stock adjustments made to the inventory.
      </p>
    </div>
  );
};

export default StockAdjustmentPage;
