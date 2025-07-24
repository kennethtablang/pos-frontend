// src/pages/settings/BusinessProfilePage.tsx
import { useEffect } from "react";
import toast from "react-hot-toast";
import { Building2 } from "lucide-react";

const BusinessProfilePage = () => {
  useEffect(() => {
    toast.success("Navigated to Business Profile");
  }, []);

  return (
    <div className="space-p-4">
      <header className="flex items-center gap-2">
        <Building2 className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-bold text-primary">Business Profile</h1>
      </header>
      <p className="text-sm text-gray-500">
        This is a placeholder for business details like name, TIN, BIR permit,
        and contact info.
      </p>
    </div>
  );
};

export default BusinessProfilePage;
