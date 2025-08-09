/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/purchaseorders/ReceiveStockModal.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { purchaseOrderService } from "@/services/purchaseOrderService";
import type {
  PurchaseOrderReadDto,
  PurchaseItemReadDto,
  ReceivedStockCreateDto,
} from "@/types/purchaseOrder";

interface ReceiveStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  purchaseOrder: PurchaseOrderReadDto;
  /**
   * Optional: if provided, modal will open pre-selected for this item.
   * If not provided, user will pick an item from the purchaseOrder.purchaseItems list.
   */
  item?: PurchaseItemReadDto;
  /**
   * Optional callback parent can provide to refresh data after receive completes.
   */
  onReceived?: () => Promise<void>;
}

export default function ReceiveStockModal({
  isOpen,
  onClose,
  purchaseOrder,
  item,
  onReceived,
}: ReceiveStockModalProps) {
  const queryClient = useQueryClient();

  // Available items for this PO
  const items = purchaseOrder.purchaseItems ?? [];

  // Selected item id (if `item` prop not provided)
  const [selectedItemId, setSelectedItemId] = useState<number | "">(
    item ? item.id : items.length > 0 ? items[0].id : ""
  );

  // Derived currently selected item
  const selectedItem = useMemo<PurchaseItemReadDto | undefined>(() => {
    return item ?? items.find((it) => it.id === selectedItemId);
  }, [item, items, selectedItemId]);

  // Remaining quantity for selected item
  const remaining = selectedItem
    ? Math.max(
        0,
        (selectedItem.quantity ?? 0) - (selectedItem.receivedQuantity ?? 0)
      )
    : 0;

  // Default values
  const todayIso = new Date().toISOString().slice(0, 10); // yyyy-mm-dd

  // Form state
  const [quantityReceived, setQuantityReceived] = useState<number>(
    remaining || 1
  );
  const [receivedDate, setReceivedDate] = useState<string>(todayIso);
  const [referenceNumber, setReferenceNumber] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  // Keep form values in sync when item changes
  useEffect(() => {
    setSelectedItemId(item ? item.id : items.length > 0 ? items[0].id : "");
    // set default quantity to remaining of the newly selected item
    setQuantityReceived(remaining || 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item, items, selectedItem?.id]);

  // Mutation for adding received stock
  const addReceivedStockMutation = useMutation({
    mutationFn: (dto: ReceivedStockCreateDto) =>
      purchaseOrderService.addReceivedStock(dto),
    onSuccess: async () => {
      // Invalidate PO details so any detail page/query refreshes
      queryClient.invalidateQueries({
        queryKey: ["purchase-orders", purchaseOrder.id],
      });
      // optional parent refresh
      if (onReceived) {
        try {
          await onReceived();
        } catch {
          /* ignore parent refresh errors */
        }
      }
      onClose();
    },
    onError: (err: any) => {
      // surface server message if present
      const msg =
        err?.response?.data?.message ?? "Failed to record received stock.";
      // eslint-disable-next-line no-console
      console.error(err);
      // Use toast if you have it; otherwise could bubble up error — keep console for now
      alert(msg);
    },
  });

  // Guard: don't render when closed
  if (!isOpen) return null;

  // Guard: ensure we have at least one selectable item
  if (!selectedItem) {
    return (
      <dialog className="modal modal-open">
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

    // Validate quantityReceived
    if (!quantityReceived || quantityReceived < 1) {
      alert("Quantity received must be at least 1.");
      return;
    }
    if (quantityReceived > remaining) {
      alert(
        `Quantity received cannot exceed remaining quantity (${remaining}).`
      );
      return;
    }

    const dto: ReceivedStockCreateDto = {
      purchaseOrderId: purchaseOrder.id,
      productId: selectedItem.productId,
      quantityReceived,
      receivedDate: receivedDate || undefined,
      referenceNumber: referenceNumber || undefined,
      notes: notes || undefined,
    };

    addReceivedStockMutation.mutate(dto);
  };

  const isLoading = addReceivedStockMutation.status === "pending";

  return (
    <dialog className="modal modal-open">
      <div className="modal-box max-w-md">
        <h3 className="font-bold text-lg">Receive Stock</h3>

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
          {/* Item selector if parent did not supply specific item */}
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
                {items.map((it) => (
                  <option key={it.id} value={it.id}>
                    {it.productName ?? `#${it.productId}`} — Qty: {it.quantity}{" "}
                    (Received: {it.receivedQuantity ?? 0})
                  </option>
                ))}
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
              min={1}
              max={remaining}
              value={quantityReceived}
              onChange={(e) => setQuantityReceived(Number(e.target.value))}
              className="input input-bordered w-full"
              required
              disabled={isLoading}
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
              disabled={isLoading}
            >
              {isLoading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
}
