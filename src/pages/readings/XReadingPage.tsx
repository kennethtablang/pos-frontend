// src/pages/settings/XReadingPage.tsx
import { useEffect } from "react";
import toast from "react-hot-toast";
import { Sun } from "lucide-react";

const XReadingPage = () => {
  useEffect(() => {
    toast.success("Navigated to X-Reading Page");
  }, []);

  return (
    <div className="space-p-4">
      <header className="flex items-center gap-2">
        <Sun className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-bold text-primary">X-Reading</h1>
      </header>
      <p className="text-sm text-gray-500">
        This is a placeholder for the X-Reading interface where users can view,
        search, and manage logs related to the X-Reading reports generated in
        the system, helping to track sales and customer interactions.
      </p>
    </div>
  );
};

export default XReadingPage;
