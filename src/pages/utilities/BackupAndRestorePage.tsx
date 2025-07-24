// src/pages/settings/BackupAndRestorePage.tsx
import { useEffect } from "react";
import toast from "react-hot-toast";
import { Database } from "lucide-react";

const BackupAndRestorePage = () => {
  useEffect(() => {
    toast.success("Navigated to Backup And Restore Page");
  }, []);

  return (
    <div className="space-p-4">
      <header className="flex items-center gap-2">
        <Database className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-bold text-primary">Backup And Restore</h1>
      </header>
      <p className="text-sm text-gray-500">
        This is a placeholder for the backup and restore interface where users
        can manage data backups and restorations, ensuring data integrity and
        availability in case of system failures or data loss.
      </p>
    </div>
  );
};

export default BackupAndRestorePage;
