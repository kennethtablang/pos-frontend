// src/pages/settings/SuppliersPage.tsx
import { useEffect } from "react";
import toast from "react-hot-toast";
import { Users } from "lucide-react";

const SuppliersPage = () => {
  useEffect(() => {
    toast.success("Navigated to Suppliers Page");
  }, []);

  return (
    <div className="space-p-4">
      <header className="flex items-center gap-2">
        <Users className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-bold text-primary">Suppliers</h1>
      </header>
      <p className="text-sm text-gray-500">
        This is a placeholder for the suppliers interface where users can view,
        search, and manage suppliers associated with the business.
      </p>
    </div>
  );
};

export default SuppliersPage;
