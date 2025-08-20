/* src/components/inventory/transactions/ViewTransactionModal.tsx */
import { X } from "lucide-react";
import type { InventoryTransactionReadDto } from "@/types/inventoryTransaction";

type Props = {
  isOpen: boolean;
  transaction: InventoryTransactionReadDto | null;
  onClose: () => void;
};

export default function ViewTransactionModal({
  isOpen,
  transaction,
  onClose,
}: Props) {
  if (!isOpen || !transaction) return null;

  return (
    <dialog className="modal modal-open" aria-modal>
      <div className="modal-box max-w-md">
        <div className="flex items-start justify-between">
          <h3 className="font-bold text-lg">Transaction #{transaction.id}</h3>
          <button
            className="btn btn-ghost btn-sm"
            onClick={onClose}
            aria-label="Close view transaction"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="py-3 text-sm text-gray-700 space-y-2">
          <div>
            <div className="text-xs text-gray-500">When</div>
            <div>{new Date(transaction.transactionDate).toLocaleString()}</div>
          </div>

          <div>
            <div className="text-xs text-gray-500">Product</div>
            <div>{transaction.productName ?? `#${transaction.productId}`}</div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="text-xs text-gray-500">Quantity</div>
              <div>{transaction.quantity}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Unit cost</div>
              <div>
                {transaction.unitCost != null
                  ? transaction.unitCost.toFixed(2)
                  : "—"}
              </div>
            </div>
          </div>

          <div>
            <div className="text-xs text-gray-500">Action</div>
            <div>{transaction.actionType}</div>
          </div>

          <div>
            <div className="text-xs text-gray-500">Reference</div>
            <div>{transaction.referenceNumber ?? "—"}</div>
          </div>

          <div>
            <div className="text-xs text-gray-500">Remarks</div>
            <div>{transaction.remarks ?? "—"}</div>
          </div>

          <div>
            <div className="text-xs text-gray-500">Performed by</div>
            <div>
              {transaction.performedByUserName ??
                transaction.performedByUserId ??
                "—"}
            </div>
          </div>
        </div>

        <div className="modal-action">
          <button className="btn" onClick={onClose} aria-label="Close">
            Close
          </button>
        </div>
      </div>
    </dialog>
  );
}
