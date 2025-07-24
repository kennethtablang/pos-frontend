// src/pages/settings/CashierSummariesPage.tsx
import { useEffect } from "react";
import toast from "react-hot-toast";
import { UserCheck } from "lucide-react";

const CashierSummariesPage = () => {
  useEffect(() => {
    toast.success("Navigated to Cashier Summaries Page");
  }, []);

  return (
    <div className="space-p-4">
      <header className="flex items-center gap-2">
        <UserCheck className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-bold text-primary">Cashier Summaries</h1>
      </header>
      <p className="text-sm text-gray-500">
        This is a placeholder for the cashier summaries interface where users
        can view, search, and manage summaries of transactions handled by
        cashiers.
      </p>
    </div>
  );
};

export default CashierSummariesPage;
