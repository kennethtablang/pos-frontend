// src/pages/settings/ProductsListPage.tsx
import { useEffect } from "react";
import toast from "react-hot-toast";
import { Box } from "lucide-react";

const ProductsListPage = () => {
  useEffect(() => {
    toast.success("Navigated to Products List Page ");
  }, []);

  return (
    <div className="space-p-4">
      <header className="flex items-center gap-2">
        <Box className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-bold text-primary">Products List Page</h1>
      </header>
      <p className="text-sm text-gray-500">
        This is a placeholder for the products list interface where users can
        view, search, and manage products in the inventory.
      </p>
    </div>
  );
};

export default ProductsListPage;
