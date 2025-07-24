// src/pages/settings/InventoryReportsPage.tsx
import { useEffect } from "react";
import toast from "react-hot-toast";
import { PieChart } from "lucide-react";

const InventoryReportsPage = () => {
  useEffect(() => {
    toast.success("Navigated to Inventory Reports Page");
  }, []);

  return (
    <div className="space-p-4">
      <header className="flex items-center gap-2">
        <PieChart className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-bold text-primary">Inventory Reports</h1>
      </header>
      <p className="text-sm text-gray-500">
        This is a placeholder for the inventory reports interface where users
        can view, search, and manage various reports related to inventory
        levels, stock movements, and other inventory metrics.
      </p>
    </div>
  );
};

export default InventoryReportsPage;
