// src/pages/settings/ReceiptSettingsPage.tsx
import { useEffect } from "react";
import toast from "react-hot-toast";
import { Printer } from "lucide-react";

const ReceiptSettingsPage = () => {
  useEffect(() => {
    toast.success("Navigated to Receipt Settings");
  }, []);

  return (
    <div className="space-p-4">
      <header className="flex items-center gap-2">
        <Printer className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-bold text-primary">Receipt Settings</h1>
      </header>
      <p className="text-sm text-gray-500">
        Configure receipt layout, print options, footer notes, and series number
        rules.
      </p>
    </div>
  );
};

export default ReceiptSettingsPage;
