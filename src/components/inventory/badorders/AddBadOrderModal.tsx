/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* src/components/inventory/badorders/AddBadOrderModal.tsx */
import React, { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { X, Search } from "lucide-react";

import { badOrderService } from "@/services/badOrderService";
import { productService } from "@/services/productService";
import type { ProductReadDto } from "@/types/product";
import type { BadOrderCreateDto } from "@/types/badOrder";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: () => void;
};

export default function AddBadOrderModal({
  isOpen,
  onClose,
  onCreated,
}: Props) {
  const [products, setProducts] = useState<ProductReadDto[]>([]);
  const [productSearch, setProductSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<ProductReadDto | null>(
    null
  );

  const [quantity, setQuantity] = useState<number>(1);
  const [reason, setReason] = useState<string>("");
  const [remarks, setRemarks] = useState<string>("");

  const [loadingProducts, setLoadingProducts] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    // load products lazily
    const load = async () => {
      setLoadingProducts(true);
      try {
        const all = await productService.getAll();
        setProducts(all);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load products");
      } finally {
        setLoadingProducts(false);
      }
    };
    load();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      // reset
      setSelectedProduct(null);
      setProductSearch("");
      setQuantity(1);
      setReason("");
      setRemarks("");
    }
  }, [isOpen]);

  const filteredProducts = useMemo(() => {
    const t = productSearch.trim().toLowerCase();
    if (!t) return products;
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(t) ||
        (p.barcode ?? "").toLowerCase().includes(t) ||
        (p.categoryName ?? "").toLowerCase().includes(t)
    );
  }, [products, productSearch]);

  const selectProduct = (p: ProductReadDto) => {
    setSelectedProduct(p);
    setProductSearch(p.name);
  };

  const handleSubmit = async () => {
    if (!selectedProduct) {
      toast.error("Select a product first");
      return;
    }
    if (!reason.trim()) {
      toast.error("Enter reason");
      return;
    }
    if (!quantity || quantity <= 0) {
      toast.error("Enter valid quantity");
      return;
    }

    const dto: BadOrderCreateDto = {
      productId: selectedProduct.id,
      quantity,
      reason: reason.trim(),
      remarks: remarks.trim() || undefined,
    };

    setSubmitting(true);
    try {
      await badOrderService.create(dto);
      toast.success("Bad order created");
      onCreated && (await onCreated());
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message ?? "Failed to create bad order");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <dialog className="modal modal-open" aria-modal>
      <div className="modal-box max-w-xl">
        <div className="flex items-start justify-between">
          <h3 className="font-bold text-lg">Add Bad Order</h3>
          <button
            className="btn btn-ghost btn-sm"
            onClick={onClose}
            aria-label="Close add bad order modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-3 space-y-3">
          <label className="block text-sm">
            Product (search barcode or name)
          </label>
          <div className="relative">
            <input
              className="input input-sm input-bordered w-full pr-10"
              value={productSearch}
              onChange={(e) => {
                setProductSearch(e.target.value);
                setSelectedProduct(null);
              }}
              placeholder="Type product name or barcode..."
              aria-label="Search product"
            />
            <div className="absolute right-2 top-2">
              <Search className="w-4 h-4 text-gray-400" />
            </div>
          </div>

          {/* suggestions */}
          {productSearch.trim() !== "" && (
            <div className="border rounded max-h-40 overflow-auto bg-white mt-1">
              {loadingProducts ? (
                <div className="p-2 text-sm text-gray-500">
                  Loading products...
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="p-2 text-sm text-gray-500">
                  No products match.
                </div>
              ) : (
                filteredProducts.slice(0, 20).map((p) => (
                  <div
                    key={p.id}
                    className={`p-2 cursor-pointer hover:bg-base-200 ${selectedProduct?.id === p.id ? "bg-base-200" : ""}`}
                    onClick={() => selectProduct(p)}
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
              <label className="block text-sm">Quantity</label>
              <input
                type="number"
                className="input input-sm input-bordered w-full"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
              />
            </div>

            <div>
              <label className="block text-sm">Reason</label>
              <input
                type="text"
                className="input input-sm input-bordered w-full"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Expired, Damaged"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm">Remarks (optional)</label>
            <textarea
              className="textarea textarea-sm textarea-bordered w-full"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
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
          <button
            className="btn"
            onClick={onClose}
            disabled={submitting}
            aria-label="Cancel add bad order"
          >
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={handleSubmit}
            disabled={submitting}
            aria-label="Create bad order"
          >
            {submitting ? "Submitting..." : "Create"}
          </button>
        </div>
      </div>
    </dialog>
  );
}
