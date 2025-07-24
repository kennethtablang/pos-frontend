// src/pages/dashboard/AdminDashboardPage.tsx
import { Truck, Boxes, AlertCircle } from "lucide-react";
import { useEffect } from "react";
import toast from "react-hot-toast";

/**
 * Warehouse Dashboard Page
 * - Provides quick access to stock, deliveries, and alerts
 */
const WarehouseDashboardPage = () => {
  useEffect(() => {
    toast.success("Welcome, Warehouse Team!");
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-primary">Warehouse Dashboard</h1>
        <p className="text-sm text-gray-500">Monitor stock and deliveries</p>
      </div>

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-base-100 shadow-lg rounded-xl p-6 flex items-center space-x-4">
          <Boxes className="w-10 h-10 text-primary" />
          <div>
            <p className="text-lg font-semibold">Current Stock</p>
            <p className="text-sm text-gray-500">Total available items</p>
          </div>
        </div>

        <div className="bg-base-100 shadow-lg rounded-xl p-6 flex items-center space-x-4">
          <Truck className="w-10 h-10 text-primary" />
          <div>
            <p className="text-lg font-semibold">Incoming Deliveries</p>
            <p className="text-sm text-gray-500">Pending stock arrivals</p>
          </div>
        </div>

        <div className="bg-base-100 shadow-lg rounded-xl p-6 flex items-center space-x-4">
          <AlertCircle className="w-10 h-10 text-warning" />
          <div>
            <p className="text-lg font-semibold">Low Stock Alerts</p>
            <p className="text-sm text-gray-500">Items below reorder level</p>
          </div>
        </div>
      </div>

      {/* Future additions: stock adjustment logs, reorder suggestions */}
    </div>
  );
};

export default WarehouseDashboardPage;
