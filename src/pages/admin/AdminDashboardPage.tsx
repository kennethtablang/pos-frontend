// src/pages/admin/AdminDashboardPage.tsx
import { Briefcase, Users, Settings } from "lucide-react";
import { useEffect } from "react";
import toast from "react-hot-toast";

/**
 * Admin Dashboard Page
 * - Displays high-level admin overview
 * - Example stats: users, roles, settings, etc.
 */
const AdminDashboardPage = () => {
  useEffect(() => {
    // Sample effect on load (optional)
    toast.success("Welcome, Admin!");
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-primary">Admin Dashboard</h1>
        <p className="text-sm text-gray-500">System overview and controls</p>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-base-100 shadow-lg rounded-xl p-6 flex items-center space-x-4">
          <Users className="w-10 h-10 text-primary" />
          <div>
            <p className="text-lg font-semibold">Users</p>
            <p className="text-sm text-gray-500">Manage accounts and roles</p>
          </div>
        </div>

        <div className="bg-base-100 shadow-lg rounded-xl p-6 flex items-center space-x-4">
          <Briefcase className="w-10 h-10 text-primary" />
          <div>
            <p className="text-lg font-semibold">Departments</p>
            <p className="text-sm text-gray-500">Manage business units</p>
          </div>
        </div>

        <div className="bg-base-100 shadow-lg rounded-xl p-6 flex items-center space-x-4">
          <Settings className="w-10 h-10 text-primary" />
          <div>
            <p className="text-lg font-semibold">System Settings</p>
            <p className="text-sm text-gray-500">VAT, receipts, backup</p>
          </div>
        </div>
      </div>

      {/* Add more sections like reports, logs, stats, etc. */}
    </div>
  );
};

export default AdminDashboardPage;
