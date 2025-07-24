// src/pages/settings/SystemLogsPage.tsx
import { useEffect } from "react";
import toast from "react-hot-toast";
import { Activity } from "lucide-react";

const SystemLogsPage = () => {
  useEffect(() => {
    toast.success("Navigated to System Logs");
  }, []);

  return (
    <div className="space-p-4">
      <header className="flex items-center gap-2">
        <Activity className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-bold text-primary">System Logs</h1>
      </header>
      <p className="text-sm text-gray-500">
        View audit trails, login attempts, and key system activities.
      </p>
    </div>
  );
};

export default SystemLogsPage;
