/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/purchaseorders/EditPurchaseOrderModal.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { purchaseOrderService } from "@/services/purchaseOrderService";
import { productService } from "@/services/productService";
import { supplierService } from "@/services/supplierServices";
import type {
  PurchaseOrderReadDto,
  PurchaseOrderUpdateDto,
  PurchaseItemReadDto,
  PurchaseItemCreateDto,
  PurchaseItemUpdateDto,
} from "@/types/purchaseOrder";
import type { SupplierReadDto } from "@/types/supplier";
import type { ProductReadDto } from "@/types/product";
import { Plus, Trash, Save } from "lucide-react";
import {
  PurchaseOrderStatus,
  PurchaseOrderStatusLabels,
} from "@/types/purchaseOrder";

export type EditPurchaseOrderModalProps = {
  isOpen: boolean;
  onClose: () => void;
  order: PurchaseOrderReadDto | null;
  onUpdated: () => Promise<void>;
  suppliers?: SupplierReadDto[]; // parent can pass suppliers (optional)
};

export default function EditPurchaseOrderModal({
  isOpen,
  onClose,
  order,
  onUpdated,
  suppliers: suppliersProp = [],
}: EditPurchaseOrderModalProps) {
  const queryClient = useQueryClient();

  // Form for header-level PO fields
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PurchaseOrderUpdateDto>({
    defaultValues: {
      supplierId: 0,
      remarks: "",
      expectedDeliveryDate: undefined,
      status: PurchaseOrderStatus.Draft,
    },
  });

  const [productSearchTerm, setProductSearchTerm] = useState("");

  // Local state: editable items (copy from order.purchaseItems)
  const [items, setItems] = useState<PurchaseItemReadDto[]>([]);
  // products list for adding new items
  const [productOptions, setProductOptions] = useState<ProductReadDto[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  // suppliers state: use prop if present, otherwise fetch inside modal
  const [suppliers, setSuppliers] = useState<SupplierReadDto[]>(suppliersProp);
  const [loadingSuppliers, setLoadingSuppliers] = useState(false);

  // Add-item controls (local)
  const [addingProductId, setAddingProductId] = useState<number | "">("");
  const [addingQuantity, setAddingQuantity] = useState<number>(1);
  const [addingCostPerUnit, setAddingCostPerUnit] = useState<number>(0);
  const [addingNotes, setAddingNotes] = useState<string>("");

  // Helper: format backend datetime to yyyy-MM-dd for <input type="date">
  const formatDateForInput = (d?: string | null) => {
    if (!d) return undefined;
    const dt = new Date(d);
    if (Number.isNaN(dt.getTime())) return undefined;
    // toISOString() gives yyyy-mm-ddThh:mm:ss.sssZ -> take first 10 chars
    return dt.toISOString().slice(0, 10);
  };

  // If parent didn't pass suppliers, fetch them once when modal opens
  useEffect(() => {
    if (!isOpen) return;
    if (suppliersProp && suppliersProp.length > 0) {
      setSuppliers(suppliersProp);
      return;
    }

    const fetchSuppliers = async () => {
      setLoadingSuppliers(true);
      try {
        const s = await supplierService.getAll();
        setSuppliers(s);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load suppliers.");
      } finally {
        setLoadingSuppliers(false);
      }
    };

    fetchSuppliers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, suppliersProp]);

  // Load product list when modal opens
  useEffect(() => {
    if (!isOpen) return;

    const fetchProducts = async () => {
      setLoadingProducts(true);
      try {
        const p = await productService.getAll();
        setProductOptions(p);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load products.");
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchProducts();
  }, [isOpen]);

  // When `order` changes (or modal opens), populate form and items
  useEffect(() => {
    if (!isOpen || !order) return;

    reset({
      supplierId: order.supplierId,
      remarks: order.remarks ?? undefined,
      // format expectedDeliveryDate to yyyy-MM-dd so date input shows it
      expectedDeliveryDate: formatDateForInput(order.expectedDeliveryDate),
      status: order.status,
    });

    // deep-copy items so UI edits don't mutate prop
    setItems(
      order.purchaseItems ? order.purchaseItems.map((i) => ({ ...i })) : []
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, order]);

  // Compute live total from local items
  const total = useMemo(() => {
    return items.reduce((acc, it) => acc + it.quantity * it.costPerUnit, 0);
  }, [items]);

  // ---------- Mutations ----------
  const updateOrderMutation = useMutation({
    mutationFn: (payload: { id: number; dto: PurchaseOrderUpdateDto }) =>
      purchaseOrderService.update(payload.id, payload.dto),
    onSuccess: async () => {
      toast.success("Purchase order updated");
      await queryClient.invalidateQueries({ queryKey: ["purchaseOrders"] });
      await onUpdated();
      onClose();
    },
    onError: (err: any) => {
      console.error(err);
      toast.error(
        err?.response?.data?.message ?? "Failed to update purchase order"
      );
    },
  });

  const addItemMutation = useMutation({
    mutationFn: (payload: {
      purchaseOrderId: number;
      dto: PurchaseItemCreateDto;
    }) => purchaseOrderService.addItem(payload.purchaseOrderId, payload.dto),
    onSuccess: async (created) => {
      toast.success("Item added");
      // reflect created item (API returns full item)
      setItems((prev) => [...prev, created]);
      await queryClient.invalidateQueries({ queryKey: ["purchaseOrders"] });
    },
    onError: (err: any) => {
      console.error(err);
      toast.error(err?.response?.data?.message ?? "Failed to add item");
    },
  });

  const updateItemMutation = useMutation({
    mutationFn: (payload: { id: number; dto: PurchaseItemUpdateDto }) =>
      purchaseOrderService.updateItem(payload.id, payload.dto),
    onSuccess: async () => {
      toast.success("Item updated");
      await queryClient.invalidateQueries({ queryKey: ["purchaseOrders"] });
    },
    onError: (err: any) => {
      console.error(err);
      toast.error(err?.response?.data?.message ?? "Failed to update item");
    },
  });

  const removeItemMutation = useMutation({
    mutationFn: (id: number) => purchaseOrderService.removeItem(id),
    onSuccess: async () => {
      toast.success("Item removed");
      await queryClient.invalidateQueries({ queryKey: ["purchaseOrders"] });
    },
    onError: (err: any) => {
      console.error(err);
      toast.error(err?.response?.data?.message ?? "Failed to remove item");
    },
  });

  // ---------- Handlers ----------
  // Header update submit
  const onSubmit = (data: PurchaseOrderUpdateDto) => {
    if (!order) return;
    updateOrderMutation.mutate({ id: order.id, dto: data });
  };

  // Add new item
  const handleAddItem = () => {
    if (!order) return;
    if (addingProductId === "" || addingProductId === 0) {
      toast.error("Select product");
      return;
    }
    if (!addingQuantity || addingQuantity < 1) {
      toast.error("Quantity must be >= 1");
      return;
    }
    if (!addingCostPerUnit || addingCostPerUnit <= 0) {
      toast.error("Cost must be > 0");
      return;
    }

    // Prevent duplicate product lines in same PO
    if (items.some((i) => i.productId === Number(addingProductId))) {
      toast.error("Product already exists in this order");
      return;
    }

    const dto: PurchaseItemCreateDto = {
      productId: Number(addingProductId),
      quantity: addingQuantity,
      costPerUnit: addingCostPerUnit,
      notes: addingNotes || undefined,
    };

    addItemMutation.mutate({ purchaseOrderId: order.id, dto });

    // reset add inputs
    setAddingProductId("");
    setAddingQuantity(1);
    setAddingCostPerUnit(0);
    setAddingNotes("");
  };

  // Save edited existing item
  const handleSaveItem = (item: PurchaseItemReadDto) => {
    const dto: PurchaseItemUpdateDto = {
      costPerUnit: item.costPerUnit,
      quantity: item.quantity,
      notes: item.notes || undefined,
    };

    updateItemMutation.mutate({ id: item.id, dto });
  };

  // Remove item
  const handleRemoveItem = async (item: PurchaseItemReadDto) => {
    if (!order) return;
    if (item.receivedQuantity && item.receivedQuantity > 0) {
      toast.error("Cannot remove item that has received quantity");
      return;
    }
    if (!confirm("Remove item from purchase order?")) return;

    await removeItemMutation.mutateAsync(item.id);
    // update local items list after deletion
    setItems((prev) => prev.filter((i) => i.id !== item.id));
  };

  // Local inline edits to quantity/cost/notes update local state
  const setItemField = <K extends keyof PurchaseItemReadDto>(
    id: number,
    field: K,
    value: PurchaseItemReadDto[K]
  ) => {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, [field]: value } : it))
    );
  };

  // Close -> reset local state
  const closeAndReset = () => {
    reset();
    setItems([]);
    setAddingProductId("");
    setAddingQuantity(1);
    setAddingCostPerUnit(0);
    setAddingNotes("");
    onClose();
  };

  // If modal not open or no order, don't render
  if (!isOpen || !order) return null;

  // helper to detect whether suppliers list already contains the order supplier
  const suppliersContainOrderSupplier = suppliers.some(
    (s) => s.id === order.supplierId
  );

  return (
    <dialog className={`modal ${isOpen ? "modal-open" : ""}`}>
      <div className="modal-box max-w-4xl w-full">
        <h3 className="font-bold text-lg mb-2">
          Edit Purchase Order — {order.purchaseOrderNumber}
        </h3>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Header fields: supplier, expected date, status, remarks */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="label">Supplier</label>
              <select
                {...register("supplierId", { valueAsNumber: true })}
                className="select select-bordered w-full"
                disabled={loadingSuppliers}
              >
                {/* fallback selected option so the select shows something even if suppliers array doesn't contain it */}
                {!suppliersContainOrderSupplier && (
                  <option value={order.supplierId}>
                    {order.supplierName ?? `#${order.supplierId}`}
                  </option>
                )}

                <option value={0} disabled>
                  Select supplier
                </option>

                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
              {errors && (errors as any).supplierId && (
                <p className="text-red-500 text-sm">Supplier is required</p>
              )}
            </div>

            <div>
              <label className="label">Expected Delivery Date</label>
              {/* using formatted date value provided via reset */}
              <input
                type="date"
                {...register("expectedDeliveryDate")}
                className="input input-bordered w-full"
              />
            </div>

            <div>
              <label className="label">Status</label>
              <select
                {...register("status", { valueAsNumber: true })}
                className="select select-bordered w-full"
              >
                {Object.entries(PurchaseOrderStatusLabels).map(([k, v]) => (
                  <option key={k} value={Number(k)}>
                    {v}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="label">Remarks</label>
            <textarea
              {...register("remarks")}
              className="textarea textarea-bordered w-full"
            />
          </div>

          {/* Items section */}
          <div className="border rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="font-medium">Items</div>
              <div className="text-sm text-gray-500">
                Total: <span className="font-semibold">{total.toFixed(2)}</span>
              </div>
            </div>

            {/* Add existing item */}
            <div className="grid grid-cols-4 gap-3 items-end">
              <div>
                <label className="label">Search Product</label>
                <input
                  type="text"
                  placeholder="Type to search..."
                  value={productSearchTerm}
                  onChange={(e) => setProductSearchTerm(e.target.value)}
                  className="input input-bordered w-full mb-2"
                />

                <label className="label">Product</label>
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
                  {productOptions
                    .filter((p) =>
                      p.name
                        .toLowerCase()
                        .includes(productSearchTerm.toLowerCase())
                    )
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                </select>
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
                  placeholder="Optional notes"
                />
              </div>
            </div>

            {/* Items table with inline edit */}
            <div className="overflow-x-auto mt-4">
              {items.length === 0 ? (
                <div className="text-sm text-gray-500 p-4">
                  No items in this purchase order.
                </div>
              ) : (
                <table className="table table-zebra table-sm w-full">
                  <thead className="bg-base-200">
                    <tr>
                      <th>Product</th>
                      <th>Ordered</th>
                      <th>Received</th>
                      <th>Qty (edit)</th>
                      <th>Cost/unit (edit)</th>
                      <th>Line Total</th>
                      <th>Notes</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((it) => {
                      const prod = productOptions.find(
                        (p) => p.id === it.productId
                      );
                      return (
                        <tr key={it.id}>
                          <td>{prod ? prod.name : `#${it.productId}`}</td>
                          <td>{it.quantity}</td>
                          <td>{it.receivedQuantity ?? 0}</td>

                          {/* Editable qty */}
                          <td>
                            <input
                              type="number"
                              min={1}
                              value={it.quantity}
                              onChange={(e) =>
                                setItemField(
                                  it.id,
                                  "quantity",
                                  Number(e.target.value)
                                )
                              }
                              className="input input-sm input-bordered w-20"
                            />
                          </td>

                          {/* Editable cost */}
                          <td>
                            <input
                              type="number"
                              step="0.01"
                              value={it.costPerUnit}
                              onChange={(e) =>
                                setItemField(
                                  it.id,
                                  "costPerUnit",
                                  Number(e.target.value)
                                )
                              }
                              className="input input-sm input-bordered w-28"
                            />
                          </td>

                          <td>{(it.quantity * it.costPerUnit).toFixed(2)}</td>

                          <td>
                            <input
                              value={it.notes ?? ""}
                              onChange={(e) =>
                                setItemField(it.id, "notes", e.target.value)
                              }
                              className="input input-sm input-bordered w-48"
                            />
                          </td>

                          <td className="flex gap-2">
                            <button
                              type="button"
                              className="btn btn-xs btn-outline"
                              onClick={() => handleSaveItem(it)}
                              disabled={updateItemMutation.status === "pending"}
                            >
                              <Save className="w-3 h-3" />
                            </button>

                            <button
                              type="button"
                              className="btn btn-xs btn-outline btn-error"
                              onClick={() => handleRemoveItem(it)}
                              disabled={
                                (it.receivedQuantity ?? 0) > 0 ||
                                removeItemMutation.status === "pending"
                              }
                              title={
                                (it.receivedQuantity ?? 0) > 0
                                  ? "Cannot remove: item already received"
                                  : "Remove item"
                              }
                            >
                              <Trash className="w-3 h-3" />
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
              disabled={
                updateOrderMutation.status === "pending" || !order.supplierId
              }
            >
              {updateOrderMutation.status === "pending"
                ? "Saving..."
                : "Save PO"}
            </button>

            <button
              type="button"
              className="btn"
              onClick={closeAndReset}
              disabled={updateOrderMutation.status === "pending"}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
}
