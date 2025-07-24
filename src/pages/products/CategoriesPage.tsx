// src/pages/settings/CategoriesPage.tsx
import { useEffect } from "react";
import toast from "react-hot-toast";
import { Folder } from "lucide-react";

const CategoriesPage = () => {
  useEffect(() => {
    toast.success("Navigated to Categories Page ");
  }, []);

  return (
    <div className="space-p-4">
      <header className="flex items-center gap-2">
        <Folder className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-bold text-primary">Categories Page</h1>
      </header>
      <p className="text-sm text-gray-500">
        This is a placeholder for the categories interface where users can
        manage product categories, add new categories, and organize products
        effectively.
      </p>
    </div>
  );
};

export default CategoriesPage;
