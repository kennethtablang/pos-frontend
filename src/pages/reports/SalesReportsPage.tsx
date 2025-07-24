// src/pages/settings/SalesReportPage.tsx
import { useEffect } from "react";
import toast from "react-hot-toast";
import { BarChart2 } from "lucide-react";

const SalesReportPage = () => {
  useEffect(() => {
    toast.success("Navigated to Sales Report Page");
  }, []);

  return (
    <div className="space-p-4">
      <header className="flex items-center gap-2">
        <BarChart2 className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-bold text-primary">Sales Report</h1>
      </header>
      <p className="text-sm text-gray-500">
        This is a placeholder for the sales report interface where users can
        view, search, and manage various reports related to sales transactions,
        revenue, and other sales metrics.
      </p>
    </div>
  );
};

export default SalesReportPage;
