// src/pages/settings/PurchaseOrderPage.tsx
import { useEffect } from "react";
import toast from "react-hot-toast";
import { Clipboard } from "lucide-react";

const PurchaseOrderPage = () => {
  useEffect(() => {
    toast.success("Navigated to Purchase Order Page");
  }, []);

  return (
    <div className="space-p-4">
      <header className="flex items-center gap-2">
        <Clipboard className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-bold text-primary">Purchase Orders</h1>
      </header>
      <p className="text-sm text-gray-500">
        This is a placeholder for the purchase orders interface where users can
        view, search, and manage purchase orders made to suppliers.
      </p>
    </div>
  );
};

export default PurchaseOrderPage;
