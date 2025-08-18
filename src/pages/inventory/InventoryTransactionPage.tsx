// src/pages/settings/InventoryTransactionPage.tsx
import { useEffect } from "react";
import toast from "react-hot-toast";
import { Bell } from "lucide-react";

const InventoryTransactionPage = () => {
  useEffect(() => {
    toast.success("Navigated to Inventory Transaction Page ");
  }, []);

  return (
    <div className="space-p-4">
      <header className="flex items-center gap-2">
        <Bell className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-bold text-primary">
          Inventory Transactions Page
        </h1>
      </header>
      <p className="text-sm text-gray-500">
        This is a placeholder for the inventory transactions interface where
        users can view, search, and manage inventory transactions.
      </p>
    </div>
  );
};

export default InventoryTransactionPage;
