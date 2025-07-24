// src/pages/settings/UserManagementPage.tsx
import { useEffect } from "react";
import toast from "react-hot-toast";
import { UserPlus } from "lucide-react";

const UserManagementPage = () => {
  useEffect(() => {
    toast.success("Navigated to User Management");
  }, []);

  return (
    <div className="space-p-4">
      <header className="flex items-center gap-2">
        <UserPlus className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-bold text-primary">User Management</h1>
      </header>
      <p className="text-sm text-gray-500">
        This is a placeholder page for managing user accounts.
      </p>
    </div>
  );
};

export default UserManagementPage;
