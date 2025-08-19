/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* src/components/inventory/badorders/EditBadOrderModal.tsx */
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { X } from "lucide-react";

import { badOrderService } from "@/services/badOrderService";
import type { BadOrderReadDto } from "@/types/badOrder";
import type { BadOrderUpdateDto } from "@/types/badOrder";

type Props = {
  isOpen: boolean;
  badOrder: BadOrderReadDto;
  onClose: () => void;
  onUpdated?: () => void;
};

export default function EditBadOrderModal({
  isOpen,
  badOrder,
  onClose,
  onUpdated,
}: Props) {
  const [quantity, setQuantity] = useState<number>(badOrder.quantity);
  const [reason, setReason] = useState<string>(badOrder.reason);
  const [remarks, setRemarks] = useState<string | undefined>(
    badOrder.remarks ?? ""
  );
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setQuantity(badOrder.quantity);
      setReason(badOrder.reason);
      setRemarks(badOrder.remarks ?? "");
    }
  }, [isOpen, badOrder]);

  if (!isOpen) return null;

  const handleUpdate = async () => {
    if (!reason.trim()) {
      toast.error("Enter reason");
      return;
    }
    if (!quantity || quantity <= 0) {
      toast.error("Enter valid quantity");
      return;
    }

    const dto: BadOrderUpdateDto = {
      quantity,
      reason: reason.trim(),
      remarks: remarks?.trim() || undefined,
    };

    setSubmitting(true);
    try {
      await badOrderService.update(badOrder.id, dto);
      toast.success("Bad order updated");
      onUpdated && (await onUpdated());
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message ?? "Failed to update bad order");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <dialog className="modal modal-open" aria-modal>
      <div className="modal-box max-w-lg">
        <div className="flex items-start justify-between">
          <h3 className="font-bold text-lg">Edit Bad Order</h3>
          <button
            className="btn btn-ghost btn-sm"
            onClick={onClose}
            aria-label="Close edit bad order"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-3 space-y-3">
          <div>
            <div className="text-sm text-gray-600">Product</div>
            <div className="font-medium">{badOrder.productName}</div>
          </div>

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
              />
            </div>
          </div>

          <div>
            <label className="block text-sm">Remarks</label>
            <textarea
              className="textarea textarea-sm textarea-bordered w-full"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />
          </div>
        </div>

        <div className="modal-action">
          <button
            className="btn"
            onClick={onClose}
            disabled={submitting}
            aria-label="Cancel edit bad order"
          >
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={handleUpdate}
            disabled={submitting}
            aria-label="Save bad order changes"
          >
            {submitting ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </dialog>
  );
}
