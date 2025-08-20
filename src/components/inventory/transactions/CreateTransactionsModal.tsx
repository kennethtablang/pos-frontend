/* eslint-disable @typescript-eslint/no-explicit-any */
/* src/components/inventory/transactions/CreateTransactionModal.tsx */
import React, { useMemo, useState } from "react";
import { Search as SearchIcon, X } from "lucide-react";
import toast from "react-hot-toast";

import type { ProductReadDto } from "@/types/product";
import { InventoryActionType } from "@/types/inventoryTransaction";

import type { InventoryTransactionCreateDto } from "@/types/inventoryTransaction";

const ACTION_LABELS: Record<InventoryActionType, string> = {
  [InventoryActionType.StockIn]: "Stock In",
  [InventoryActionType.Sale]: "Sale",
  [InventoryActionType.Return]: "Return",
  [InventoryActionType.Transfer]: "Transfer",
  [InventoryActionType.Adjustment]: "Adjustment",
  [InventoryActionType.BadOrder]: "Bad Order",
  [InventoryActionType.VoidedSale]: "Voided Sale",
};

type Props = {
  products: ProductReadDto[];
  isOpen: boolean;
  onClose: () => void;
  onCreate: (dto: InventoryTransactionCreateDto) => Promise<void>;
};

export default function CreateTransactionsModal({
  products,
  isOpen,
  onClose,
  onCreate,
}: Props) {
  const [productSearch, setProductSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<ProductReadDto | null>(
    null
  );

  const [actionType, setActionType] = useState<InventoryActionType>(
    InventoryActionType.StockIn
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [unitCost, setUnitCost] = useState<number | "">("");
  const [reference, setReference] = useState<string>("");
  const [remarks, setRemarks] = useState<string>("");
  const [date, setDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  const [submitting, setSubmitting] = useState(false);

  const filtered = useMemo(() => {
    const q = productSearch.trim().toLowerCase();
    if (!q) return products.slice(0, 50);
    return products
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.barcode ?? "").toLowerCase().includes(q)
      )
      .slice(0, 50);
  }, [products, productSearch]);

  const handleSelect = (p: ProductReadDto) => {
    setSelectedProduct(p);
    setProductSearch(p.name);
  };

  const submit = async () => {
    if (!selectedProduct) {
      toast.error("Select a product");
      return;
    }
    if (!quantity || Number.isNaN(quantity)) {
      toast.error("Enter valid quantity");
      return;
    }

    const dto: InventoryTransactionCreateDto = {
      productId: selectedProduct.id,
      actionType,
      quantity,
      unitCost: unitCost === "" ? undefined : Number(unitCost),
      referenceNumber: reference || undefined,
      remarks: remarks || undefined,
      transactionDate: date ? new Date(date).toISOString() : undefined,
    };

    setSubmitting(true);
    try {
      await onCreate(dto);
      // parent will close modal on success typically
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data ?? "Failed to create transaction");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <dialog className="modal modal-open" aria-modal>
      <div className="modal-box max-w-xl">
        <div className="flex items-start justify-between">
          <h3 className="font-bold text-lg">Add Inventory Transaction</h3>
          <button
            className="btn btn-ghost btn-sm"
            onClick={onClose}
            aria-label="Close add transaction modal"
            title="Close"
            disabled={submitting}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-3 space-y-3">
          <label className="block text-sm">Product (search)</label>
          <div className="relative">
            <input
              type="text"
              className="input input-sm input-bordered w-full pr-10"
              value={productSearch}
              onChange={(e) => {
                setProductSearch(e.target.value);
                setSelectedProduct(null);
              }}
              placeholder="Type product name or barcode..."
              aria-label="Search product for transaction"
            />
            <div className="absolute right-2 top-2">
              <SearchIcon className="w-4 h-4 text-gray-400" />
            </div>
          </div>

          {productSearch.trim() !== "" && (
            <div className="border rounded max-h-56 overflow-auto bg-white mt-1 z-10">
              {filtered.length === 0 ? (
                <div className="p-2 text-sm text-gray-500">No products</div>
              ) : (
                filtered.map((p) => (
                  <div
                    key={p.id}
                    className={`p-2 cursor-pointer hover:bg-base-200 ${
                      selectedProduct?.id === p.id ? "bg-base-200" : ""
                    }`}
                    onClick={() => handleSelect(p)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSelect(p);
                    }}
                    title={`${p.name} (${p.barcode ?? "—"})`}
                  >
                    <div className="text-sm font-medium">{p.name}</div>
                    <div className="text-xs text-gray-500">
                      {p.barcode ?? "—"} • {p.categoryName ?? "—"}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm">Action</label>
              <select
                className="select select-sm select-bordered w-full"
                value={String(actionType)}
                onChange={(e) =>
                  setActionType(Number(e.target.value) as InventoryActionType)
                }
                aria-label="Transaction action"
                title="Transaction action"
              >
                {Object.keys(ACTION_LABELS).map((k) => {
                  const keyNum = Number(k) as InventoryActionType;
                  return (
                    <option key={k} value={String(keyNum)}>
                      {ACTION_LABELS[keyNum]}
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <label className="block text-sm">Quantity</label>
              <input
                type="number"
                className="input input-sm input-bordered w-full"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                min={0}
                step="any"
                aria-label="Transaction quantity"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm">Unit cost</label>
              <input
                type="number"
                className="input input-sm input-bordered w-full"
                value={unitCost === "" ? "" : String(unitCost)}
                onChange={(e) =>
                  setUnitCost(
                    e.target.value === "" ? "" : Number(e.target.value)
                  )
                }
                step="0.01"
                aria-label="Unit cost"
              />
            </div>

            <div>
              <label className="block text-sm">Date</label>
              <input
                type="date"
                className="input input-sm input-bordered w-full"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                aria-label="Transaction date"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm">Reference</label>
            <input
              type="text"
              className="input input-sm input-bordered w-full"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              aria-label="Reference number"
            />
          </div>

          <div>
            <label className="block text-sm">Remarks</label>
            <textarea
              className="textarea textarea-sm textarea-bordered w-full"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              aria-label="Remarks"
            />
          </div>

          {selectedProduct && (
            <div className="text-xs text-gray-600">
              Selected: <strong>{selectedProduct.name}</strong> • On-hand:{" "}
              {selectedProduct.onHand ?? "—"}
            </div>
          )}
        </div>

        <div className="modal-action">
          <button className="btn" onClick={onClose} disabled={submitting}>
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={submit}
            disabled={submitting}
            aria-label="Create inventory transaction"
            title="Create"
          >
            {submitting ? "Creating..." : "Create"}
          </button>
        </div>
      </div>
    </dialog>
  );
}
