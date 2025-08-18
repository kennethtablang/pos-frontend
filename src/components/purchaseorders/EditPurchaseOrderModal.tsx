/* eslint-disable @typescript-eslint/no-explicit-any */
/* src/components/purchaseorders/EditPurchaseOrderModal.tsx */
import React, { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { purchaseOrderService } from "@/services/purchaseOrderService";
import { productService } from "@/services/productService";
import { unitService } from "@/services/unitService";
import { supplierService } from "@/services/supplierServices";
import type {
  PurchaseOrderReadDto,
  PurchaseOrderUpdateDto,
  PurchaseOrderItemUpdateDto,
  PurchaseOrderItemReadDto,
} from "@/types/purchaseOrder";
import type { SupplierReadDto } from "@/types/supplier";
import type { ProductReadDto } from "@/types/product";
import type { UnitReadDto } from "@/types/unit";
import { Plus, Trash, Save } from "lucide-react";

export type EditPurchaseOrderModalProps = {
  isOpen: boolean;
  onClose: () => void;
  order?: PurchaseOrderReadDto | null;
  onUpdated?: () => Promise<void> | void;
  suppliers?: SupplierReadDto[];
};

type ItemLocal = {
  id?: number; // existing = number, new = undefined
  productId: number;
  productName?: string;
  unitId: number;
  unitName?: string;
  quantityOrdered: number;
  quantityReceived?: number;
  unitCost: number;
  remarks?: string | null;
};

export default function EditPurchaseOrderModal({
  isOpen,
  onClose,
  order,
  onUpdated,
  suppliers: suppliersProp = [],
}: EditPurchaseOrderModalProps) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PurchaseOrderUpdateDto>({
    defaultValues: {
      id: 0,
      supplierId: 0,
      purchaseOrderNumber: "",
      expectedDeliveryDate: undefined,
      remarks: undefined,
      items: [],
    },
  });

  // local items editable by the user
  const [items, setItems] = useState<ItemLocal[]>([]);

  // lookup lists
  const [productOptions, setProductOptions] = useState<ProductReadDto[]>([]);
  const [unitOptions, setUnitOptions] = useState<UnitReadDto[]>([]);
  const [suppliers, setSuppliers] = useState<SupplierReadDto[]>(suppliersProp);

  // loading flags
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingUnits, setLoadingUnits] = useState(false);
  const [loadingSuppliers, setLoadingSuppliers] = useState(false);

  // controls for adding new line
  const [productSearch, setProductSearch] = useState("");
  const [addingProductId, setAddingProductId] = useState<number | "">("");
  const [addingUnitId, setAddingUnitId] = useState<number | "">("");
  const [addingQty, setAddingQty] = useState<number>(1);
  const [addingCost, setAddingCost] = useState<number>(0);
  const [addingNotes, setAddingNotes] = useState<string>("");

  const formatDateForInput = (iso?: string | null) =>
    iso ? new Date(iso).toISOString().slice(0, 10) : undefined;

  // --- load lookups when modal opens ---
  useEffect(() => {
    if (!isOpen) return;

    const fetch = async () => {
      setLoadingProducts(true);
      setLoadingUnits(true);
      setLoadingSuppliers(true);
      try {
        const [p, u] = await Promise.all([
          productService.getAll(),
          unitService.getAll(),
        ]);
        setProductOptions(p);
        setUnitOptions(u);

        if (!suppliersProp || suppliersProp.length === 0) {
          const s = await supplierService.getAll();
          setSuppliers(s);
        } else {
          setSuppliers(suppliersProp);
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load products / units / suppliers.");
      } finally {
        setLoadingProducts(false);
        setLoadingUnits(false);
        setLoadingSuppliers(false);
      }
    };

    fetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // load order into form & local items when provided
  useEffect(() => {
    if (!isOpen || !order) return;

    reset({
      id: order.id,
      supplierId: order.supplierId,
      purchaseOrderNumber: order.purchaseOrderNumber,
      expectedDeliveryDate: formatDateForInput(order.expectedDeliveryDate),
      remarks: order.remarks ?? undefined,
      items: [],
    });

    // Map backend item shape to our local editable shape
    const mapped: ItemLocal[] = (order.items ?? []).map(
      (it: PurchaseOrderItemReadDto) => ({
        id: it.id,
        productId: it.productId,
        productName: it.productName ?? undefined,
        unitId: (it as any).unitId ?? 0,
        unitName: it.unitName ?? undefined,
        quantityOrdered: it.quantityOrdered,
        quantityReceived: it.quantityReceived,
        unitCost: it.unitCost,
        remarks: it.remarks ?? undefined,
      })
    );

    setItems(mapped);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, order]);

  const total = useMemo(
    () => items.reduce((acc, it) => acc + it.quantityOrdered * it.unitCost, 0),
    [items]
  );

  // --- mutation: update full purchase order ---
  const updateMutation = useMutation({
    mutationFn: (payload: { id: number; dto: PurchaseOrderUpdateDto }) =>
      purchaseOrderService.update(payload.id, payload.dto),
    onSuccess: async () => {
      toast.success("Purchase order updated");
      await queryClient.invalidateQueries({ queryKey: ["purchaseOrders"] });
      if (onUpdated) await onUpdated();
      closeAndReset();
    },
    onError: (err: any) => {
      console.error(err);
      toast.error(
        err?.response?.data?.message ?? "Failed to update purchase order"
      );
    },
  });

  // --- handlers for local CRUD of lines (saved on Save PO) ---
  const handleAddItem = () => {
    // Type-safe checks: compare to "" because state is number | ""
    if (addingProductId === "" || addingUnitId === "") {
      toast.error("Select product and unit.");
      return;
    }
    if (!addingQty || addingQty <= 0) {
      toast.error("Quantity must be > 0");
      return;
    }
    if (addingCost == null || addingCost < 0) {
      toast.error("Cost must be >= 0");
      return;
    }

    // avoid duplicate product+unit combos locally
    if (
      items.some(
        (i) =>
          i.productId === Number(addingProductId) &&
          i.unitId === Number(addingUnitId)
      )
    ) {
      toast.error(
        "This product (with selected unit) already exists in the order."
      );
      return;
    }

    const prod = productOptions.find((p) => p.id === Number(addingProductId));
    const unit = unitOptions.find((u) => u.id === Number(addingUnitId));

    const newItem: ItemLocal = {
      productId: Number(addingProductId),
      productName: prod?.name,
      unitId: Number(addingUnitId),
      unitName: unit?.name,
      quantityOrdered: Number(addingQty),
      quantityReceived: 0,
      unitCost: Number(addingCost),
      remarks: addingNotes || undefined,
    };

    setItems((prev) => [...prev, newItem]);

    // reset add controls
    setAddingProductId("");
    setAddingUnitId("");
    setAddingQty(1);
    setAddingCost(0);
    setAddingNotes("");
    setProductSearch("");
  };

  const handleRemoveItem = (it: ItemLocal) => {
    if ((it.quantityReceived ?? 0) > 0) {
      toast.error("Cannot remove an item that already has received quantity.");
      return;
    }
    if (!confirm("Remove item from purchase order?")) return;
    setItems((prev) => prev.filter((x) => x !== it));
  };

  // Save whole update
  const onSubmit = (form: any) => {
    if (!order) return;

    const supplierId = Number(form.supplierId);
    if (!supplierId || supplierId === 0) {
      toast.error("Supplier is required.");
      return;
    }

    if (items.length === 0) {
      toast.error("Add at least one item.");
      return;
    }

    // Build PurchaseOrderUpdateDto (camelCase)
    const dto: PurchaseOrderUpdateDto = {
      id: order.id,
      supplierId: supplierId,
      purchaseOrderNumber:
        form.purchaseOrderNumber?.trim() ?? order.purchaseOrderNumber,
      expectedDeliveryDate: form.expectedDeliveryDate
        ? new Date(form.expectedDeliveryDate).toISOString()
        : undefined,
      remarks: form.remarks?.trim() ?? undefined,
      items: items.map<PurchaseOrderItemUpdateDto>((it) => ({
        // the frontend DTO uses camelCase property names
        id: it.id ?? undefined,
        productId: it.productId,
        unitId: it.unitId,
        quantityOrdered: it.quantityOrdered,
        unitCost: it.unitCost,
        remarks: it.remarks ?? undefined,
      })),
    };

    updateMutation.mutate({ id: order.id, dto });
  };

  const closeAndReset = () => {
    reset();
    setItems([]);
    setAddingProductId("");
    setAddingUnitId("");
    setAddingQty(1);
    setAddingCost(0);
    setAddingNotes("");
    setProductSearch("");
    onClose();
  };

  if (!isOpen || !order) return null;

  return (
    <dialog className={`modal ${isOpen ? "modal-open" : ""}`} aria-modal>
      <div
        className="modal-box max-w-4xl w-full"
        role="dialog"
        aria-labelledby="edit-po-title"
      >
        <h3 id="edit-po-title" className="font-bold text-lg mb-2">
          Edit Purchase Order — {order.purchaseOrderNumber}
        </h3>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Header */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label htmlFor="poNumber" className="label">
                PO Number
              </label>
              <input
                id="poNumber"
                {...register("purchaseOrderNumber", { required: true })}
                className="input input-bordered w-full"
                defaultValue={order.purchaseOrderNumber}
                title="Purchase Order Number"
              />
              {errors && (errors as any).purchaseOrderNumber && (
                <p className="text-red-500 text-sm">PO Number is required</p>
              )}
            </div>

            <div>
              <label htmlFor="supplierSelect" className="label">
                Supplier
              </label>
              <select
                id="supplierSelect"
                {...register("supplierId", {
                  valueAsNumber: true,
                  required: true,
                })}
                className="select select-bordered w-full"
                defaultValue={order.supplierId}
                title="Supplier"
                disabled={loadingSuppliers}
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
              {errors && (errors as any).supplierId && (
                <p className="text-red-500 text-sm">Supplier is required</p>
              )}
            </div>

            <div>
              <label htmlFor="expectedDeliveryDate" className="label">
                Expected Delivery
              </label>
              <input
                id="expectedDeliveryDate"
                type="date"
                {...register("expectedDeliveryDate")}
                className="input input-bordered w-full"
                defaultValue={formatDateForInput(order.expectedDeliveryDate)}
              />
            </div>
          </div>

          <div>
            <label htmlFor="remarks" className="label">
              Remarks
            </label>
            <textarea
              id="remarks"
              {...register("remarks")}
              className="textarea textarea-bordered w-full"
              defaultValue={order.remarks ?? ""}
            />
          </div>

          {/* Items editor */}
          <div className="border rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="font-medium">Items</div>
              <div className="text-sm text-gray-500">
                Total: <span className="font-semibold">{total.toFixed(2)}</span>
              </div>
            </div>

            {/* Add new item row */}
            <div className="grid grid-cols-4 gap-3 items-end">
              <div>
                <label htmlFor="productSearch" className="label">
                  Product
                </label>
                <input
                  id="productSearch"
                  type="text"
                  placeholder="Search product..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="input input-bordered w-full mb-2"
                />
                <select
                  className="select select-bordered w-full"
                  value={addingProductId}
                  onChange={(e) =>
                    setAddingProductId(
                      e.target.value === "" ? "" : Number(e.target.value)
                    )
                  }
                  disabled={loadingProducts}
                >
                  <option value="">Select product</option>
                  {productOptions
                    .filter((p) =>
                      (p.name ?? "")
                        .toLowerCase()
                        .includes(productSearch.toLowerCase())
                    )
                    .slice(0, 200)
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
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
                  className="select select-bordered w-full"
                  value={addingUnitId}
                  onChange={(e) =>
                    setAddingUnitId(
                      e.target.value === "" ? "" : Number(e.target.value)
                    )
                  }
                  disabled={loadingUnits}
                >
                  <option value="">Select unit</option>
                  {unitOptions.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                      {u.abbreviation ? ` (${u.abbreviation})` : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="addQty" className="label">
                  Qty
                </label>
                <input
                  id="addQty"
                  type="number"
                  min={0.0001}
                  step="any"
                  value={addingQty}
                  onChange={(e) => setAddingQty(Number(e.target.value))}
                  className="input input-bordered w-full"
                />
              </div>

              <div>
                <label htmlFor="addCost" className="label">
                  Cost/unit
                </label>
                <input
                  id="addCost"
                  type="number"
                  min={0}
                  step="any"
                  value={addingCost}
                  onChange={(e) => setAddingCost(Number(e.target.value))}
                  className="input input-bordered w-full"
                />
              </div>

              <div className="col-span-4">
                <label htmlFor="addNotes" className="label">
                  Notes
                </label>
                <input
                  id="addNotes"
                  value={addingNotes}
                  onChange={(e) => setAddingNotes(e.target.value)}
                  className="input input-bordered w-full"
                  placeholder="Optional notes"
                />
              </div>

              <div>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={handleAddItem}
                  disabled={
                    addingProductId === "" ||
                    addingUnitId === "" ||
                    addingQty <= 0 ||
                    addingCost < 0
                  }
                >
                  <Plus className="w-4 h-4" /> Add Item
                </button>
              </div>
            </div>

            {/* Items table */}
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
                        <tr
                          key={`${it.id ?? "new"}-${it.productId}-${it.unitId}`}
                        >
                          <td>
                            {prod?.name ?? it.productName ?? `#${it.productId}`}
                          </td>
                          <td>{it.quantityOrdered}</td>
                          <td>{it.quantityReceived ?? 0}</td>

                          <td>
                            <input
                              type="number"
                              min={0.0001}
                              step="any"
                              value={it.quantityOrdered}
                              onChange={(e) =>
                                setItems((prev) =>
                                  prev.map((x) =>
                                    x === it
                                      ? {
                                          ...x,
                                          quantityOrdered: Number(
                                            e.target.value
                                          ),
                                        }
                                      : x
                                  )
                                )
                              }
                              className="input input-sm input-bordered w-20"
                            />
                          </td>

                          <td>
                            <input
                              type="number"
                              min={0}
                              step="any"
                              value={it.unitCost}
                              onChange={(e) =>
                                setItems((prev) =>
                                  prev.map((x) =>
                                    x === it
                                      ? {
                                          ...x,
                                          unitCost: Number(e.target.value),
                                        }
                                      : x
                                  )
                                )
                              }
                              className="input input-sm input-bordered w-28"
                            />
                          </td>

                          <td>
                            {(it.quantityOrdered * it.unitCost).toFixed(2)}
                          </td>

                          <td>
                            <input
                              value={it.remarks ?? ""}
                              onChange={(e) =>
                                setItems((prev) =>
                                  prev.map((x) =>
                                    x === it
                                      ? { ...x, remarks: e.target.value }
                                      : x
                                  )
                                )
                              }
                              className="input input-sm input-bordered w-48"
                            />
                          </td>

                          <td className="flex gap-2">
                            <button
                              type="button"
                              className="btn btn-xs btn-outline"
                              onClick={() => {
                                toast(
                                  "Line edited locally; click Save PO to persist changes.",
                                  { icon: "⚡" }
                                );
                              }}
                              title="Line edits saved locally"
                            >
                              <Save className="w-3 h-3" />
                            </button>

                            <button
                              type="button"
                              className="btn btn-xs btn-outline btn-error"
                              onClick={() => handleRemoveItem(it)}
                              disabled={(it.quantityReceived ?? 0) > 0}
                              title={
                                (it.quantityReceived ?? 0) > 0
                                  ? "Cannot remove - already received"
                                  : "Remove line"
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
                updateMutation.status === "pending" || items.length === 0
              }
            >
              {updateMutation.status === "pending" ? "Saving..." : "Save PO"}
            </button>

            <button
              type="button"
              className="btn"
              onClick={closeAndReset}
              disabled={updateMutation.status === "pending"}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
}
