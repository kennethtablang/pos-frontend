// src/pages/settings/BadOrderPage.tsx
import { useEffect } from "react";
import toast from "react-hot-toast";
import { AlertCircle } from "lucide-react";

const BadOrderPage = () => {
  useEffect(() => {
    toast.success("Navigated to Bad Order Page ");
  }, []);

  return (
    <div className="space-p-4">
      <header className="flex items-center gap-2">
        <AlertCircle className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-bold text-primary">Bad Orders</h1>
      </header>
      <p className="text-sm text-gray-500">
        This is a placeholder for the bad orders interface where users can view,
        search, and manage orders that have issues or require special attention.
      </p>
    </div>
  );
};

export default BadOrderPage;
