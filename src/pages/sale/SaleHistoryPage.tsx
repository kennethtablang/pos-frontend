// src/pages/settings/SaleHistoryPage.tsx
import { useEffect } from "react";
import toast from "react-hot-toast";
import { FileText } from "lucide-react";

const SaleHistoryPage = () => {
  useEffect(() => {
    toast.success("Navigated to Sale History Page ");
  }, []);

  return (
    <div className="space-p-4">
      <header className="flex items-center gap-2">
        <FileText className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-bold text-primary">Sale History Page</h1>
      </header>
      <p className="text-sm text-gray-500">
        This is a placeholder for the sale history interface where users can
        view past transactions, search for specific sales, and manage customer
        interactions.
      </p>
    </div>
  );
};

export default SaleHistoryPage;
