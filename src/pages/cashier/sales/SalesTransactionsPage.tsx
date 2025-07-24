// src/pages/cashier/sales/SalesTransactionsPage.tsx
import { useEffect } from "react";
import toast from "react-hot-toast";
import { ShoppingCart } from "lucide-react";

/**
 * SalesTransactionsPage
 * - Main POS interface for cashiers
 * - Mounted under CashierLayout at /dashboard/cashier
 */
const SalesTransactionsPage = () => {
  useEffect(() => {
    toast.success("Welcome to the POS Terminal!");
  }, []);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <header className="flex items-center gap-3 mb-4">
        <ShoppingCart className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-bold">New Sale</h1>
      </header>

      {/* Placeholder POS Interface */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg h-[500px] flex flex-col">
        {/* Top: Barcode scanner/input */}
        <div className="p-4 border-b border-gray-200 flex items-center gap-2">
          <input
            type="text"
            placeholder="Scan or enter barcode"
            className="input input-bordered flex-1"
          />
          <button className="btn btn-primary">Add</button>
        </div>

        {/* Middle: Cart items */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* TODO: render cart items list here */}
          <p className="text-gray-400 text-center">
            Cart items will appear here
          </p>
        </div>

        {/* Bottom: Payment summary */}
        <div className="p-4 border-t border-gray-200 flex justify-between items-center">
          <div>
            <p className="text-lg">
              Total: <span className="font-bold">₱0.00</span>
            </p>
          </div>
          <button className="btn btn-success btn-lg">Checkout</button>
        </div>
      </div>
    </div>
  );
};

export default SalesTransactionsPage;
