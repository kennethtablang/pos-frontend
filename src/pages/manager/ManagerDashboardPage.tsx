// src/pages/dashboard/AdminDashboardPage.tsx
import { Boxes, Users, BarChart3 } from "lucide-react";
import { useEffect } from "react";
import toast from "react-hot-toast";

/**
 * Manager Dashboard Page
 * - Displays oversight on inventory, team, and sales
 */
const ManagerDashboardPage = () => {
  useEffect(() => {
    toast.success("Welcome, Manager!");
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-primary">Manager Dashboard</h1>
        <p className="text-sm text-gray-500">
          Manage store operations and insights
        </p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-base-100 shadow-lg rounded-xl p-6 flex items-center space-x-4">
          <Boxes className="w-10 h-10 text-primary" />
          <div>
            <p className="text-lg font-semibold">Inventory</p>
            <p className="text-sm text-gray-500">
              Monitor current stock levels
            </p>
          </div>
        </div>

        <div className="bg-base-100 shadow-lg rounded-xl p-6 flex items-center space-x-4">
          <Users className="w-10 h-10 text-primary" />
          <div>
            <p className="text-lg font-semibold">Staff</p>
            <p className="text-sm text-gray-500">Review staff activity</p>
          </div>
        </div>

        <div className="bg-base-100 shadow-lg rounded-xl p-6 flex items-center space-x-4">
          <BarChart3 className="w-10 h-10 text-primary" />
          <div>
            <p className="text-lg font-semibold">Reports</p>
            <p className="text-sm text-gray-500">View sales analytics</p>
          </div>
        </div>
      </div>

      {/* Future additions: charts, low stock alerts, staff attendance summary */}
    </div>
  );
};

export default ManagerDashboardPage;
