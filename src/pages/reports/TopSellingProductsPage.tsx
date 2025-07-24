// src/pages/settings/TopSellingProductsPage.tsx
import { useEffect } from "react";
import toast from "react-hot-toast";
import { Star } from "lucide-react";

const TopSellingProductsPage = () => {
  useEffect(() => {
    toast.success("Navigated to Top Selling Products Page");
  }, []);

  return (
    <div className="space-p-4">
      <header className="flex items-center gap-2">
        <Star className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-bold text-primary">
          Top Selling Products
        </h1>
      </header>
      <p className="text-sm text-gray-500">
        This is a placeholder for the top selling products interface where users
        can view, search, and manage reports related to the best-selling
        products in the inventory, helping to identify trends and optimize stock
        levels.
      </p>
    </div>
  );
};

export default TopSellingProductsPage;
