// src/pages/settings/ReceiptLogs.tsx
import { useEffect } from "react";
import toast from "react-hot-toast";
import { Receipt } from "lucide-react";

const ReceiptLogs = () => {
  useEffect(() => {
    toast.success("Navigated to Receipt Logs Page");
  }, []);

  return (
    <div className="space-p-4">
      <header className="flex items-center gap-2">
        <Receipt className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-bold text-primary">Receipt Logs</h1>
      </header>
      <p className="text-sm text-gray-500">
        This is a placeholder for the receipt logs interface where users can
        view, search, and manage logs related to receipts generated in the
        system, helping to track sales and customer interactions.
      </p>
    </div>
  );
};

export default ReceiptLogs;
