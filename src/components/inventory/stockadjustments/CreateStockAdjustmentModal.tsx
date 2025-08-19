/* eslint-disable @typescript-eslint/no-explicit-any */
/* src/components/inventory/CreateStockAdjustment.tsx */
import React, { useEffect, useMemo, useState } from "react";
import { X, Search } from "lucide-react";
import toast from "react-hot-toast";

import { productService } from "@/services/productService";
import { unitService } from "@/services/unitService";
import { stockAdjustmentService } from "@/services/stockAdjustmentService";

import type { ProductReadDto } from "@/types/product";
import type { UnitReadDto } from "@/types/unit";
import type { StockAdjustmentCreateDto } from "@/types/stockAdjustment";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: () => void;
};

export function CreateStockAdjustment({ isOpen, onClose, onCreated }: Props) {
  const [products, setProducts] = useState<ProductReadDto[]>([]);
  const [units, setUnits] = useState<UnitReadDto[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingUnits, setLoadingUnits] = useState(false);

  // form
  const [productQuery, setProductQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<ProductReadDto | null>(
    null
  );
  const [quantity, setQuantity] = useState<number | "">("");
  const [unitId, setUnitId] = useState<number | "">("");
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);

  // product search state
  const [showMatches, setShowMatches] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    // load small caches when opened
    (async () => {
      setLoadingProducts(true);
      try {
        const p = await productService.getAll();
        setProducts(p);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load products.");
      } finally {
        setLoadingProducts(false);
      }
    })();

    (async () => {
      setLoadingUnits(true);
      try {
        const u = await unitService.getAll();
        setUnits(u);
      } catch (err) {
        // if no unit service is present, just ignore
        console.warn("unitService.getAll failed", err);
        setUnits([]);
      } finally {
        setLoadingUnits(false);
      }
    })();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      // reset on close
      setProductQuery("");
      setSelectedProduct(null);
      setQuantity("");
      setUnitId("");
      setReason("");
      setShowMatches(false);
    }
  }, [isOpen]);

  // filter matches (very simple, client-side)
  const matches = useMemo(() => {
    const q = productQuery.trim().toLowerCase();
    if (!q) return products.slice(0, 10);
    return products
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.barcode ?? "").toLowerCase().includes(q)
      )
      .slice(0, 10);
  }, [productQuery, products]);

  const pickProduct = (p: ProductReadDto) => {
    setSelectedProduct(p);
    setProductQuery(`${p.name} ${p.barcode ? `(${p.barcode})` : ""}`.trim());
    setShowMatches(false);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!selectedProduct) {
      toast.error("Please select a product.");
      return;
    }
    const qty = Number(quantity);
    if (Number.isNaN(qty) || qty === 0) {
      toast.error("Quantity must be a non-zero number.");
      return;
    }

    setSaving(true);
    try {
      const dto: StockAdjustmentCreateDto = {
        productId: selectedProduct.id,
        quantity: qty,
        unitId: unitId === "" ? undefined : Number(unitId),
        reason: reason || undefined,
        isSystemGenerated: false,
      };

      await stockAdjustmentService.create(dto);
      toast.success("Stock adjustment created");
      onCreated?.();
      onClose();
    } catch (err: any) {
      console.error(err);
      toast.error(
        err?.response?.data?.message ?? "Failed to create adjustment."
      );
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <dialog className="modal modal-open" aria-modal>
      <div className="modal-box max-w-md">
        <div className="flex items-start justify-between">
          <h3 className="font-bold text-lg">Create Stock Adjustment</h3>
          <button
            className="btn btn-ghost btn-sm"
            onClick={onClose}
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <div>
            <label className="label">Product (search by name or barcode)</label>
            <div className="relative">
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  className="input input-bordered w-full"
                  placeholder="Type product name or barcode..."
                  value={productQuery}
                  onChange={(e) => {
                    setProductQuery(e.target.value);
                    setSelectedProduct(null);
                    setShowMatches(true);
                  }}
                  onFocus={() => setShowMatches(true)}
                  autoComplete="off"
                />
              </div>

              {showMatches && (
                <div className="absolute z-50 mt-1 w-full bg-white border rounded-md shadow max-h-56 overflow-auto">
                  {loadingProducts ? (
                    <div className="p-3 text-sm text-gray-500">
                      Loading products...
                    </div>
                  ) : matches.length === 0 ? (
                    <div className="p-3 text-sm text-gray-500">No matches</div>
                  ) : (
                    matches.map((p) => (
                      <button
                        type="button"
                        key={p.id}
                        className="w-full text-left px-3 py-2 hover:bg-base-200"
                        onClick={() => pickProduct(p)}
                      >
                        <div className="font-medium">{p.name}</div>
                        <div className="text-xs text-gray-500">
                          {p.barcode ? `#${p.barcode}` : `#${p.id}`} •{" "}
                          {p.categoryName ?? "—"}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
            {selectedProduct && (
              <div className="text-xs text-gray-600 mt-1">
                Selected: <strong>{selectedProduct.name}</strong> •{" "}
                {selectedProduct.barcode ?? "—"}
              </div>
            )}
          </div>

          <div>
            <label className="label">
              Quantity (positive increases, negative decreases)
            </label>
            <input
              type="number"
              step="any"
              className="input input-bordered w-full"
              value={quantity}
              onChange={(e) =>
                setQuantity(e.target.value === "" ? "" : Number(e.target.value))
              }
              required
            />
          </div>

          <div>
            <label className="label">Unit (optional)</label>
            <select
              className="select select-bordered w-full"
              value={unitId}
              onChange={(e) =>
                setUnitId(e.target.value === "" ? "" : Number(e.target.value))
              }
              disabled={loadingUnits}
            >
              <option value="">(none)</option>
              {units.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Reason (optional)</label>
            <input
              type="text"
              className="input input-bordered w-full"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              maxLength={150}
            />
          </div>

          <div className="modal-action">
            <button
              type="button"
              className="btn"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Saving..." : "Create Adjustment"}
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
}
