// src/pages/dashboard/AdminDashboardPage.tsx
import { ReceiptText, CreditCard, Clock } from "lucide-react";
import { useEffect } from "react";
import toast from "react-hot-toast";

/**
 * Cashier Dashboard Page
 * - Displays quick access to POS functions
 * - Sales, receipts, shifts summary
 */
const CashierDashboardPage = () => {
  useEffect(() => {
    toast.success("Welcome, Cashier!");
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-primary">Cashier Dashboard</h1>
        <p className="text-sm text-gray-500">
          Point of Sale operations overview
        </p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-base-100 shadow-lg rounded-xl p-6 flex items-center space-x-4">
          <CreditCard className="w-10 h-10 text-primary" />
          <div>
            <p className="text-lg font-semibold">Sales</p>
            <p className="text-sm text-gray-500">Start new transaction</p>
          </div>
        </div>

        <div className="bg-base-100 shadow-lg rounded-xl p-6 flex items-center space-x-4">
          <ReceiptText className="w-10 h-10 text-primary" />
          <div>
            <p className="text-lg font-semibold">Receipts</p>
            <p className="text-sm text-gray-500">View issued receipts</p>
          </div>
        </div>

        <div className="bg-base-100 shadow-lg rounded-xl p-6 flex items-center space-x-4">
          <Clock className="w-10 h-10 text-primary" />
          <div>
            <p className="text-lg font-semibold">Shift Summary</p>
            <p className="text-sm text-gray-500">Track current shift totals</p>
          </div>
        </div>
      </div>

      {/* Future: Add charts like total sales, transaction count, etc. */}
    </div>
  );
};

export default CashierDashboardPage;
