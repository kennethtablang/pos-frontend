/* eslint-disable @typescript-eslint/no-explicit-any */
/* src/components/purchaseorders/CreatePurchaseOrderModal.tsx */
import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { purchaseOrderService } from "@/services/purchaseOrderService";
import { productService } from "@/services/productService";
import { unitService } from "@/services/unitService"; // assume this exists
import type { SupplierReadDto } from "@/types/supplier";
import type { ProductReadDto } from "@/types/product";
import type { UnitReadDto } from "@/types/unit"; // if you have this type
import { Plus, Trash } from "lucide-react";

/**
 * We build a payload that matches the backend PurchaseOrderCreateDto:
 * {
 *   supplierId: number,
 *   // purchaseOrderNumber is optional (backend will generate if omitted)
 *   orderDate?: string,
 *   expectedDeliveryDate?: string,
 *   remarks?: string,
 *   items: [{ productId, unitId, quantityOrdered, unitCost, remarks }]
 * }
 */

// Component props
export type CreatePurchaseOrderModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: () => Promise<void> | void;
  suppliers: SupplierReadDto[];
};

// Local item shape used in modal UI
type ItemLocal = {
  productId: number;
  unitId: number;
  quantityOrdered: number;
  unitCost: number;
  remarks?: string;
};

export default function CreatePurchaseOrderModal({
  isOpen,
  onClose,
  onCreated,
  suppliers,
}: CreatePurchaseOrderModalProps) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      supplierId: 0,
      orderDate: "",
      expectedDeliveryDate: "",
      remarks: "",
    },
  });

  const [productOptions, setProductOptions] = useState<ProductReadDto[]>([]);
  const [unitOptions, setUnitOptions] = useState<UnitReadDto[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingUnits, setLoadingUnits] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [items, setItems] = useState<ItemLocal[]>([]);

  // per-item inputs
  const [addingProductId, setAddingProductId] = useState<number | "">("");
  const [addingUnitId, setAddingUnitId] = useState<number | "">("");
  const [addingQty, setAddingQty] = useState<number>(1);
  const [addingCost, setAddingCost] = useState<number>(0);
  const [addingNotes, setAddingNotes] = useState<string>("");

  // Fetch products & units when modal opens
  useEffect(() => {
    if (!isOpen) return;

    const fetch = async () => {
      setLoadingProducts(true);
      setLoadingUnits(true);
      try {
        const [p, u] = await Promise.all([
          productService.getAll(),
          unitService.getAll(),
        ]);
        setProductOptions(p);
        setUnitOptions(u);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load products or units.");
      } finally {
        setLoadingProducts(false);
        setLoadingUnits(false);
      }
    };

    fetch();
  }, [isOpen]);

  // Filter product options by search term
  const filteredProductOptions = useMemo(() => {
    if (!searchTerm?.trim()) return productOptions.slice(0, 200);
    const t = searchTerm.trim().toLowerCase();
    return productOptions
      .filter((p) =>
        [
          p.name ?? "",
          p.barcode ?? "",
          p.categoryName ?? "",
          String(p.id),
        ].some((s) => s.toLowerCase().includes(t))
      )
      .slice(0, 200);
  }, [productOptions, searchTerm]);

  const total = useMemo(
    () => items.reduce((acc, it) => acc + it.quantityOrdered * it.unitCost, 0),
    [items]
  );

  // Add item to local items
  const handleAddItem = () => {
    if (addingProductId === "" || addingProductId === 0) {
      toast.error("Please select a product.");
      return;
    }
    if (addingUnitId === "" || addingUnitId === 0) {
      toast.error("Please select a unit for the item.");
      return;
    }
    if (!addingQty || addingQty < 0.0001) {
      toast.error("Quantity must be at least 0.0001.");
      return;
    }
    if (addingCost == null || addingCost < 0) {
      toast.error("Unit cost must be 0 or greater.");
      return;
    }

    // avoid duplicate product+unit combos
    if (
      items.some(
        (it) =>
          it.productId === Number(addingProductId) &&
          it.unitId === Number(addingUnitId)
      )
    ) {
      toast.error("This product with the selected unit is already added.");
      return;
    }

    const newItem: ItemLocal = {
      productId: Number(addingProductId),
      unitId: Number(addingUnitId),
      quantityOrdered: Number(addingQty),
      unitCost: Number(addingCost),
      remarks: addingNotes || undefined,
    };

    setItems((s) => [...s, newItem]);

    // reset add controls
    setAddingProductId("");
    setAddingUnitId("");
    setAddingQty(1);
    setAddingCost(0);
    setAddingNotes("");
    setSearchTerm("");
  };

  const handleRemoveItem = (index: number) => {
    setItems((s) => s.filter((_, i) => i !== index));
  };

  // Create mutation — payload shaped for backend (camelCase keys)
  const mutation = useMutation({
    mutationFn: (payload: any) => purchaseOrderService.create(payload),
    onSuccess: async () => {
      toast.success("Purchase order created");
      queryClient.invalidateQueries({ queryKey: ["purchaseOrders"] });
      if (onCreated) await onCreated();
      resetModal();
    },
    onError: (err: any) => {
      console.error(err);
      toast.error(
        err?.response?.data?.message ?? "Failed to create purchase order."
      );
    },
  });

  const onSubmit = (formValues: any) => {
    // Client-side validations: supplier and at least one item are required.
    if (!formValues.supplierId || formValues.supplierId === 0) {
      toast.error("Supplier is required.");
      return;
    }
    if (items.length === 0) {
      toast.error("Add at least one item.");
      return;
    }

    // Build backend payload using camelCase properties to match TS DTO
    const payload = {
      supplierId: formValues.supplierId,
      // do NOT include purchaseOrderNumber so backend will auto-generate it
      orderDate: formValues.orderDate
        ? new Date(formValues.orderDate).toISOString()
        : undefined,
      expectedDeliveryDate: formValues.expectedDeliveryDate
        ? new Date(formValues.expectedDeliveryDate).toISOString()
        : undefined,
      remarks: formValues.remarks?.trim(),
      items: items.map((it) => ({
        productId: it.productId,
        unitId: it.unitId,
        quantityOrdered: it.quantityOrdered,
        unitCost: it.unitCost,
        remarks: it.remarks,
      })),
    };

    mutation.mutate(payload as any);
  };

  const resetModal = () => {
    reset();
    setItems([]);
    setAddingProductId("");
    setAddingUnitId("");
    setAddingQty(1);
    setAddingCost(0);
    setAddingNotes("");
    setSearchTerm("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <dialog className={`modal ${isOpen ? "modal-open" : ""}`} aria-modal>
      <div
        className="modal-box max-w-4xl w-full"
        role="dialog"
        aria-labelledby="create-po-title"
      >
        <h3 id="create-po-title" className="font-bold text-lg mb-2">
          Create Purchase Order
        </h3>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Header fields */}
          <div className="grid grid-cols-2 gap-4">
            {/* PO Number field removed: backend will auto-generate */}

            <div>
              <label htmlFor="supplierSelect" className="label">
                Supplier
              </label>
              <select
                id="supplierSelect"
                {...register("supplierId", { valueAsNumber: true })}
                defaultValue={0}
                className="select select-bordered w-full"
                required
                aria-required
                title="Select supplier"
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
                <p className="text-red-500 text-sm">Supplier is required</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="orderDate" className="label">
                Order Date (optional)
              </label>
              <input
                id="orderDate"
                type="date"
                {...register("orderDate")}
                className="input input-bordered w-full"
                title="Order date"
              />
            </div>

            <div>
              <label htmlFor="expectedDeliveryDate" className="label">
                Expected Delivery (optional)
              </label>
              <input
                id="expectedDeliveryDate"
                type="date"
                {...register("expectedDeliveryDate")}
                className="input input-bordered w-full"
                title="Expected delivery date"
              />
            </div>
          </div>

          <div>
            <label htmlFor="remarks" className="label">
              Remarks (optional)
            </label>
            <textarea
              id="remarks"
              {...register("remarks")}
              className="textarea textarea-bordered w-full"
              title="Remarks"
            />
          </div>

          {/* Items block */}
          <div className="border rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="font-medium">Items</div>
              <div className="text-sm text-gray-500">
                Total: <span className="font-semibold">{total.toFixed(2)}</span>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-3 items-end">
              <div>
                <label htmlFor="productSearch" className="label">
                  Product
                </label>
                <input
                  id="productSearch"
                  type="text"
                  placeholder="Search product (name, barcode, category or id)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input input-bordered w-full mb-2"
                  title="Search products"
                />

                <label htmlFor="productSelect" className="sr-only">
                  Choose product
                </label>
                <select
                  id="productSelect"
                  value={addingProductId}
                  onChange={(e) =>
                    setAddingProductId(
                      e.target.value === "" ? "" : Number(e.target.value)
                    )
                  }
                  className="select select-bordered w-full"
                  disabled={loadingProducts}
                  title="Select product"
                  aria-label="Select product"
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
              </div>

              <div>
                <label htmlFor="unitSelect" className="label">
                  Unit
                </label>
                <select
                  id="unitSelect"
                  value={addingUnitId}
                  onChange={(e) =>
                    setAddingUnitId(
                      e.target.value === "" ? "" : Number(e.target.value)
                    )
                  }
                  className="select select-bordered w-full"
                  disabled={loadingUnits}
                  title="Select unit"
                >
                  <option value="">Select unit</option>
                  {unitOptions.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} {u.abbreviation ? `(${u.abbreviation})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="qty" className="label">
                  Quantity
                </label>
                <input
                  id="qty"
                  type="number"
                  min="0.0001"
                  step="any"
                  value={addingQty}
                  onChange={(e) => setAddingQty(Number(e.target.value))}
                  className="input input-bordered w-full"
                  title="Quantity"
                />
              </div>

              <div>
                <label htmlFor="cost" className="label">
                  Unit Cost
                </label>
                <input
                  id="cost"
                  type="number"
                  min="0"
                  step="any"
                  value={addingCost}
                  onChange={(e) => setAddingCost(Number(e.target.value))}
                  className="input input-bordered w-full"
                  title="Unit cost"
                />
              </div>

              <div className="col-span-4">
                <label htmlFor="itemNotes" className="label">
                  Notes (for item)
                </label>
                <input
                  id="itemNotes"
                  value={addingNotes}
                  onChange={(e) => setAddingNotes(e.target.value)}
                  className="input input-bordered w-full"
                  placeholder="Optional notes for the item"
                  title="Item notes"
                />
              </div>

              <div>
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
            </div>

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
                      <th>Unit</th>
                      <th>Qty</th>
                      <th>Cost/unit</th>
                      <th>Line Total</th>
                      <th>Notes</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((it, idx) => {
                      const prod = productOptions.find(
                        (p) => p.id === it.productId
                      );
                      const unit = unitOptions.find((u) => u.id === it.unitId);
                      return (
                        <tr key={`${it.productId}-${it.unitId}-${idx}`}>
                          <td>{prod ? prod.name : `#${it.productId}`}</td>
                          <td>
                            {unit
                              ? `${unit.name}${unit.abbreviation ? ` (${unit.abbreviation})` : ""}`
                              : `#${it.unitId}`}
                          </td>
                          <td>{it.quantityOrdered}</td>
                          <td>{it.unitCost.toFixed(2)}</td>
                          <td>
                            {(it.quantityOrdered * it.unitCost).toFixed(2)}
                          </td>
                          <td>{it.remarks ?? "—"}</td>
                          <td>
                            <button
                              className="btn btn-xs btn-outline btn-error"
                              type="button"
                              onClick={() => handleRemoveItem(idx)}
                              title={`Remove ${prod?.name ?? `#${it.productId}`}`}
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
              disabled={mutation.status === "pending" || items.length === 0}
            >
              {mutation.status === "pending"
                ? "Creating..."
                : "Create Purchase Order"}
            </button>

            <button
              type="button"
              className="btn"
              onClick={resetModal}
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
