// src/pages/settings/VatSettingsPage.tsx
import { useEffect } from "react";
import toast from "react-hot-toast";
import { Percent } from "lucide-react";

const VatSettingsPage = () => {
  useEffect(() => {
    toast.success("Navigated to VAT Settings");
  }, []);

  return (
    <div className="space-p-4">
      <header className="flex items-center gap-2">
        <Percent className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-bold text-primary">VAT Settings</h1>
      </header>
      <p className="text-sm text-gray-500">
        Define VAT rates, breakdown rules, and exemptions for transactions.
      </p>
    </div>
  );
};

export default VatSettingsPage;
