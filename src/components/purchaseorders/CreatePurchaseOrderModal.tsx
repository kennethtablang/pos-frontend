/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { purchaseOrderService } from "@/services/purchaseOrderService";
import { productService } from "@/services/productService";
import type {
  PurchaseOrderCreateDto,
  PurchaseItemCreateDto,
} from "@/types/purchaseOrder";
import type { SupplierReadDto } from "@/types/supplier";
import type { ProductReadDto } from "@/types/product";
import { Plus, Trash } from "lucide-react";

export type CreatePurchaseOrderModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => Promise<void>;
  suppliers: SupplierReadDto[]; // parent provides suppliers; modal will use them
};

export default function CreatePurchaseOrderModal({
  isOpen,
  onClose,
  onCreated,
  suppliers,
}: CreatePurchaseOrderModalProps) {
  // React Query client for invalidation
  const queryClient = useQueryClient();

  // Main form: supplierId, expectedDeliveryDate, remarks
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PurchaseOrderCreateDto>({
    defaultValues: {
      supplierId: 0,
      remarks: "",
      expectedDeliveryDate: undefined,
      purchaseItems: [],
    },
  });

  // Search term for the product picker (new)
  const [searchTerm, setSearchTerm] = useState("");

  // Local state: items being added to this PO (PurchaseItemCreateDto)
  const [items, setItems] = useState<PurchaseItemCreateDto[]>([]);
  const [productOptions, setProductOptions] = useState<ProductReadDto[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  // Add-item form local state (keeps the item inputs small and isolated)
  const [addingProductId, setAddingProductId] = useState<number | "">("");
  const [addingQuantity, setAddingQuantity] = useState<number>(1);
  const [addingCostPerUnit, setAddingCostPerUnit] = useState<number>(0);
  const [addingNotes, setAddingNotes] = useState<string>("");

  // Fetch products (for item dropdown). Only when modal opens.
  useEffect(() => {
    if (!isOpen) return;

    const fetchProducts = async () => {
      setLoadingProducts(true);
      try {
        const p = await productService.getAll();
        setProductOptions(p);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load products for items.");
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchProducts();
  }, [isOpen]);

  // Filter productOptions based on searchTerm.
  // Limit results shown to avoid rendering huge lists on the client (top 200).
  const filteredProductOptions = useMemo(() => {
    if (!searchTerm || searchTerm.trim() === "") {
      // show first N results when no search (keeps UI snappy)
      return productOptions.slice(0, 200);
    }
    const t = searchTerm.trim().toLowerCase();
    const matches = productOptions.filter((p) => {
      if (p.name && p.name.toLowerCase().includes(t)) return true;
      if ((p.barcode ?? "").toLowerCase().includes(t)) return true;
      if ((p.categoryName ?? "").toLowerCase().includes(t)) return true;
      // Also allow id search
      if (String(p.id) === t) return true;
      return false;
    });
    return matches.slice(0, 200);
  }, [productOptions, searchTerm]);

  // Compute PO total from items
  const total = useMemo(() => {
    return items.reduce((acc, it) => acc + it.quantity * it.costPerUnit, 0);
  }, [items]);

  // Add item to local items list (with validation)
  const handleAddItem = () => {
    // validations
    if (addingProductId === "" || addingProductId === 0) {
      toast.error("Please select a product.");
      return;
    }
    if (!addingQuantity || addingQuantity < 1) {
      toast.error("Quantity must be at least 1.");
      return;
    }
    if (!addingCostPerUnit || addingCostPerUnit <= 0) {
      toast.error("Cost per unit must be greater than 0.");
      return;
    }

    // prevent duplicate product lines (you may allow duplicates if desired)
    if (items.some((i) => i.productId === Number(addingProductId))) {
      toast.error(
        "Product already added to this PO. Edit the existing line instead."
      );
      return;
    }

    const newItem: PurchaseItemCreateDto = {
      productId: Number(addingProductId),
      quantity: addingQuantity,
      costPerUnit: addingCostPerUnit,
      notes: addingNotes || undefined,
    };

    setItems((prev) => [...prev, newItem]);

    // reset add-item inputs & search
    setAddingProductId("");
    setAddingQuantity(1);
    setAddingCostPerUnit(0);
    setAddingNotes("");
    setSearchTerm("");
  };

  const handleRemoveItem = (productId: number) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  };

  // Mutation: create purchase order
  const mutation = useMutation({
    mutationFn: (data: PurchaseOrderCreateDto) =>
      purchaseOrderService.create(data),
    onSuccess: async () => {
      toast.success("Purchase order created");
      queryClient.invalidateQueries({ queryKey: ["purchaseOrders"] });
      await onCreated();
      resetModal();
    },
    onError: (err: any) => {
      console.error(err);
      toast.error(
        err?.response?.data?.message ?? "Failed to create purchase order."
      );
    },
  });

  const onSubmit = (data: PurchaseOrderCreateDto) => {
    // require supplier
    if (!data.supplierId || data.supplierId === 0) {
      toast.error("Supplier is required.");
      return;
    }

    // require at least one item
    if (items.length === 0) {
      toast.error("Add at least one item to the purchase order.");
      return;
    }

    // assemble create DTO
    const createDto: PurchaseOrderCreateDto = {
      supplierId: data.supplierId,
      remarks: data.remarks,
      expectedDeliveryDate: data.expectedDeliveryDate
        ? data.expectedDeliveryDate
        : undefined,
      purchaseItems: items,
    };

    mutation.mutate(createDto);
  };

  // Reset modal state and close
  const resetModal = () => {
    reset();
    setItems([]);
    setAddingProductId("");
    setAddingQuantity(1);
    setAddingCostPerUnit(0);
    setAddingNotes("");
    setSearchTerm("");
    onClose();
  };

  // If not open, don't render
  if (!isOpen) return null;

  return (
    <dialog className={`modal ${isOpen ? "modal-open" : ""}`}>
      <div className="modal-box max-w-4xl w-full">
        <h3 className="font-bold text-lg mb-2">Create Purchase Order</h3>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Header fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Supplier</label>
              <select
                {...register("supplierId", { valueAsNumber: true })}
                defaultValue={0}
                className="select select-bordered w-full"
              >
                <option value={0} disabled>
                  Select supplier
                </option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
              {errors.supplierId && (
                <p className="text-red-500 text-sm">
                  {(errors.supplierId as any).message}
                </p>
              )}
            </div>

            <div>
              <label className="label">Expected Delivery Date (optional)</label>
              <input
                type="date"
                {...register("expectedDeliveryDate")}
                className="input input-bordered w-full"
              />
            </div>
          </div>

          <div>
            <label className="label">Remarks (optional)</label>
            <textarea
              {...register("remarks")}
              className="textarea textarea-bordered w-full"
            />
          </div>

          {/* Add items section */}
          <div className="border rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="font-medium">Items</div>
              <div className="text-sm text-gray-500">
                Total: <span className="font-semibold">{total.toFixed(2)}</span>
              </div>
            </div>

            {/* Add item form */}
            <div className="grid grid-cols-4 gap-3 items-end">
              <div>
                <label className="label">Product</label>

                {/* search input */}
                <input
                  type="text"
                  placeholder="Search product (name, barcode, category or id)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input input-bordered w-full mb-2"
                />

                <select
                  value={addingProductId}
                  onChange={(e) =>
                    setAddingProductId(
                      e.target.value === "" ? "" : Number(e.target.value)
                    )
                  }
                  className="select select-bordered w-full"
                  disabled={loadingProducts}
                >
                  <option value="">Select product</option>
                  {filteredProductOptions.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                      {p.barcode ? ` — ${p.barcode}` : ""}
                      {p.categoryName ? ` (${p.categoryName})` : ""}
                    </option>
                  ))}
                </select>

                {/* show count when limited */}
                {productOptions.length > filteredProductOptions.length && (
                  <div className="text-xs text-gray-500 mt-1">
                    Showing {filteredProductOptions.length} of{" "}
                    {productOptions.length} products. Refine search to narrow
                    results.
                  </div>
                )}
              </div>

              <div>
                <label className="label">Quantity</label>
                <input
                  type="number"
                  min={1}
                  value={addingQuantity}
                  onChange={(e) => setAddingQuantity(Number(e.target.value))}
                  className="input input-bordered w-full"
                />
              </div>

              <div>
                <label className="label">Cost per unit</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={addingCostPerUnit}
                  onChange={(e) => setAddingCostPerUnit(Number(e.target.value))}
                  className="input input-bordered w-full"
                />
              </div>

              <div>
                <label className="label">&nbsp;</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="btn btn-primary btn-sm gap-2"
                    onClick={handleAddItem}
                  >
                    <Plus className="w-4 h-4" /> Add Item
                  </button>
                </div>
              </div>

              <div className="col-span-4">
                <label className="label">Notes (for item)</label>
                <input
                  value={addingNotes}
                  onChange={(e) => setAddingNotes(e.target.value)}
                  className="input input-bordered w-full"
                  placeholder="Optional notes for the item"
                />
              </div>
            </div>

            {/* Items table */}
            <div className="overflow-x-auto mt-4">
              {items.length === 0 ? (
                <div className="text-sm text-gray-500 p-4">
                  No items added yet.
                </div>
              ) : (
                <table className="table table-zebra table-sm w-full">
                  <thead className="bg-base-200">
                    <tr>
                      <th>Product</th>
                      <th>Qty</th>
                      <th>Cost/unit</th>
                      <th>Line Total</th>
                      <th>Notes</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((it) => {
                      const prod = productOptions.find(
                        (p) => p.id === it.productId
                      );
                      return (
                        <tr key={it.productId}>
                          <td>{prod ? prod.name : `#${it.productId}`}</td>
                          <td>{it.quantity}</td>
                          <td>{it.costPerUnit.toFixed(2)}</td>
                          <td>{(it.quantity * it.costPerUnit).toFixed(2)}</td>
                          <td>{it.notes ?? "—"}</td>
                          <td>
                            <button
                              className="btn btn-xs btn-outline btn-error"
                              type="button"
                              onClick={() => handleRemoveItem(it.productId)}
                            >
                              <Trash className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="modal-action">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={mutation.status === "pending"}
            >
              {mutation.status === "pending" ? "Creating..." : "Create PO"}
            </button>

            <button
              type="button"
              className="btn"
              onClick={() => {
                resetModal();
              }}
              disabled={mutation.status === "pending"}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
}
