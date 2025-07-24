// src/pages/settings/DiscountSettingsPage.tsx
import { useEffect } from "react";
import toast from "react-hot-toast";
import { Percent } from "lucide-react";

const DiscountSettingsPage = () => {
  useEffect(() => {
    toast.success("Navigated to Discount Settings");
  }, []);

  return (
    <div className="space-p-4">
      <header className="flex items-center gap-2">
        <Percent className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-bold text-primary">Discount Settings</h1>
      </header>
      <p className="text-sm text-gray-500">
        Configure default discounts, promotional codes, and threshold rules for
        your POS.
      </p>
      {/* TODO: Add UI to create/edit discount rules */}
    </div>
  );
};

export default DiscountSettingsPage;
