// src/pages/settings/PendingDeliveriesPage.tsx
import { useEffect } from "react";
import toast from "react-hot-toast";
import { Bell } from "lucide-react";

const PendingDeliveriesPage = () => {
  useEffect(() => {
    toast.success("Navigated to Pending Deliveries Page");
  }, []);

  return (
    <div className="space-p-4">
      <header className="flex items-center gap-2">
        <Bell className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-bold text-primary">Pending Deliveries</h1>
      </header>
      <p className="text-sm text-gray-500">
        This is a placeholder for the pending deliveries interface where users
        can view, search, and manage deliveries that are yet to be received into
        the inventory.
      </p>
    </div>
  );
};

export default PendingDeliveriesPage;
