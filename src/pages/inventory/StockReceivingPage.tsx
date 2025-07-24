// src/pages/settings/StockReceivingPage.tsx
import { useEffect } from "react";
import toast from "react-hot-toast";
import { Download } from "lucide-react";

const StockReceivingPage = () => {
  useEffect(() => {
    toast.success("Navigated to Stock Receiving Page");
  }, []);

  return (
    <div className="space-p-4">
      <header className="flex items-center gap-2">
        <Download className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-bold text-primary">Stock Receiving</h1>
      </header>
      <p className="text-sm text-gray-500">
        This is a placeholder for the stock receiving interface where users can
        view, search, and manage stock received into the inventory.
      </p>
    </div>
  );
};

export default StockReceivingPage;
