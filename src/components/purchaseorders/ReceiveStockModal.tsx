/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/purchaseorders/ReceiveStockModal.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { purchaseOrderService } from "@/services/purchaseOrderService";
import type {
  PurchaseOrderReadDto,
  PurchaseOrderItemReadDto,
  ReceiveStockCreateDto, // ensure this exists in your types (see note)
} from "@/types/purchaseOrder";

interface ReceiveStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  purchaseOrder: PurchaseOrderReadDto;
  /**
   * Optional: if provided, modal will open pre-selected for this item.
   * If not provided, user will pick an item from the purchaseOrder.items list.
   */
  item?: PurchaseOrderItemReadDto;
  /**
   * Optional callback parent can provide to refresh data after receive completes.
   */
  onReceived?: () => Promise<void> | void;
}

export default function ReceiveStockModal({
  isOpen,
  onClose,
  purchaseOrder,
  item,
  onReceived,
}: ReceiveStockModalProps) {
  const queryClient = useQueryClient();

  // Use the standardized property name `items` (matches your current types)
  const items = purchaseOrder.items ?? [];

  // Helper: derive today's date in yyyy-mm-dd for <input type="date">
  const todayIso = new Date().toISOString().slice(0, 10);

  // selectedItemId can be number or empty string (for uncontrolled select)
  const [selectedItemId, setSelectedItemId] = useState<number | "">(
    () => item?.id ?? (items.length > 0 ? items[0].id : "")
  );

  // form fields
  const [quantityReceived, setQuantityReceived] = useState<number>(1);
  const [receivedDate, setReceivedDate] = useState<string>(todayIso);
  const [referenceNumber, setReferenceNumber] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  // When modal opens or items / prop item change, sync selection and defaults
  useEffect(() => {
    if (!isOpen) return;

    const initialId = item?.id ?? (items.length > 0 ? items[0].id : "");
    setSelectedItemId(initialId);

    // Set defaults for fields based on selected item
    const sel =
      item ??
      (items.length > 0 ? items.find((it) => it.id === initialId) : undefined);
    const remaining = sel
      ? Math.max(0, (sel.quantityOrdered ?? 0) - (sel.quantityReceived ?? 0))
      : 0;

    setQuantityReceived(remaining > 0 ? Number(remaining) : 1);
    setReceivedDate(todayIso);
    setReferenceNumber("");
    setNotes("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, item, items]);

  // Derived selected item from id or provided `item` prop
  const selectedItem = useMemo<PurchaseOrderItemReadDto | undefined>(() => {
    return item ?? items.find((it) => it.id === selectedItemId);
  }, [item, items, selectedItemId]);

  // Remaining to receive for selected item (decimal-safe)
  const remaining = selectedItem
    ? Math.max(
        0,
        Number(selectedItem.quantityOrdered ?? 0) -
          Number(selectedItem.quantityReceived ?? 0)
      )
    : 0;

  // Keep quantityReceived in bounds when selected item or remaining changes
  useEffect(() => {
    if (!isOpen) return;
    if (remaining <= 0) {
      setQuantityReceived(0);
    } else {
      // if current value exceeds remaining, clamp it
      setQuantityReceived((prev) => {
        if (!prev || prev <= 0) return Number(remaining);
        return prev > remaining ? Number(remaining) : prev;
      });
    }
  }, [remaining, isOpen]);

  // Mutation to call backend - expects `purchaseOrderService.receiveStock(dto)`
  const receiveMutation = useMutation({
    mutationFn: (dto: ReceiveStockCreateDto) =>
      purchaseOrderService.receiveStock(dto),
    onSuccess: async () => {
      toast.success("Received stock recorded");
      // Invalidate general lists and the PO detail to ensure UI refresh
      queryClient.invalidateQueries({ queryKey: ["purchaseOrders"] });
      queryClient.invalidateQueries({
        queryKey: ["purchase-order", purchaseOrder.id],
      });
      queryClient.invalidateQueries({
        queryKey: ["purchase-orders", purchaseOrder.id],
      });
      // call parent refresh if provided
      try {
        if (onReceived) await onReceived();
      } catch {
        // ignore parent refresh errors
      }
      onClose();
    },
    onError: (err: any) => {
      const msg =
        err?.response?.data?.message ??
        err?.message ??
        "Failed to record received stock.";
      console.error(err);
      toast.error(msg);
    },
  });

  const isLoading = receiveMutation.status === "pending";

  // Guard: don't render when closed
  if (!isOpen) return null;

  // Guard: ensure we have at least one selectable item
  if (!selectedItem) {
    return (
      <dialog className="modal modal-open" aria-modal>
        <div className="modal-box">
          <h3 className="font-bold text-lg">Receive Stock</h3>
          <div className="py-4 text-sm text-gray-600">
            No items available to receive for this purchase order.
          </div>
          <div className="modal-action">
            <button className="btn" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </dialog>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // quantity validation (backend allows fractional quantities)
    if (!quantityReceived || Number(quantityReceived) <= 0) {
      toast.error("Quantity received must be greater than 0.");
      return;
    }

    if (Number(quantityReceived) > Number(remaining)) {
      toast.error(
        `Quantity received cannot exceed remaining quantity (${remaining}).`
      );
      return;
    }

    const dto: ReceiveStockCreateDto = {
      purchaseOrderId: purchaseOrder.id,
      purchaseOrderItemId: selectedItem.id,
      quantityReceived: Number(quantityReceived),
      receivedDate: receivedDate
        ? new Date(receivedDate).toISOString()
        : undefined,
      referenceNumber: referenceNumber || undefined,
      notes: notes || undefined,
    };

    receiveMutation.mutate(dto);
  };

  const disableSave = isLoading || remaining <= 0;

  return (
    <dialog className={`modal ${isOpen ? "modal-open" : ""}`} aria-modal>
      <div
        className="modal-box max-w-md"
        role="dialog"
        aria-labelledby="receive-stock-title"
      >
        <h3 id="receive-stock-title" className="font-bold text-lg">
          Receive Stock
        </h3>

        <div className="text-sm text-gray-600 mb-3">
          PO:{" "}
          <span className="font-medium">
            {purchaseOrder.purchaseOrderNumber}
          </span>
          {" • "}
          Supplier:{" "}
          <span className="font-medium">
            {purchaseOrder.supplierName ?? "—"}
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* Item selector (hidden if item prop provided or single item) */}
          {!item && items.length > 1 && (
            <div>
              <label className="label">Select Item</label>
              <select
                value={selectedItemId}
                onChange={(e) =>
                  setSelectedItemId(
                    e.target.value === "" ? "" : Number(e.target.value)
                  )
                }
                className="select select-bordered w-full"
                disabled={isLoading}
              >
                {items.map((it) => {
                  const qtyOrdered = Number(it.quantityOrdered ?? 0);
                  const qtyReceived = Number(it.quantityReceived ?? 0);
                  return (
                    <option key={it.id} value={it.id}>
                      {it.productName ?? `#${it.productId}`} — Ordered:{" "}
                      {qtyOrdered} (Received: {qtyReceived})
                    </option>
                  );
                })}
              </select>
            </div>
          )}

          {/* Product (read-only) */}
          <div>
            <label className="label">Product</label>
            <div className="input input-bordered w-full bg-base-100 pointer-events-none">
              {selectedItem.productName ?? `#${selectedItem.productId}`}
            </div>
          </div>

          {/* Remaining & Qty */}
          <div>
            <label className="label">Remaining to receive</label>
            <div className="mb-2 text-sm">{remaining}</div>

            <input
              type="number"
              min={0.0001}
              step="any"
              value={quantityReceived}
              onChange={(e) => setQuantityReceived(Number(e.target.value))}
              className="input input-bordered w-full"
              disabled={isLoading || remaining <= 0}
              required
            />
          </div>

          {/* Date */}
          <div>
            <label className="label">Received Date</label>
            <input
              type="date"
              value={receivedDate}
              onChange={(e) => setReceivedDate(e.target.value)}
              className="input input-bordered w-full"
              disabled={isLoading}
              required
            />
          </div>

          {/* Reference */}
          <div>
            <label className="label">Reference Number (optional)</label>
            <input
              type="text"
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              className="input input-bordered w-full"
              disabled={isLoading}
            />
          </div>

          {/* Notes */}
          <div>
            <label className="label">Notes (optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="textarea textarea-bordered w-full"
              rows={3}
              disabled={isLoading}
            />
          </div>

          {/* Actions */}
          <div className="modal-action">
            <button
              type="button"
              className="btn"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={disableSave}
              title={
                remaining <= 0 ? "No remaining quantity to receive" : undefined
              }
            >
              {isLoading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
}
