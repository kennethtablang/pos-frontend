/* eslint-disable @typescript-eslint/no-explicit-any */
/* src/pages/inventory/StockAdjustmentsPage.tsx */
import React, { useEffect, useState } from "react";
import { Plus, Pencil, Trash, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import { stockAdjustmentService } from "@/services/stockAdjustmentService";
import { CreateStockAdjustment } from "@/components/inventory/stockadjustments/CreateStockAdjustmentModal";
import DeleteConfirmationModal from "@/components/common/DeleteConfirmationModal";

import type {
  StockAdjustmentListDto,
  StockAdjustmentReadDto,
} from "@/types/stockAdjustment";

export default function StockAdjustmentsPage() {
  const [list, setList] = useState<StockAdjustmentListDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [deleteTargetLabel, setDeleteTargetLabel] =
    useState<string>("this adjustment");
  const [deleting, setDeleting] = useState(false);

  // simple edit modal state (kept from previous version)
  const [editing, setEditing] = useState<StockAdjustmentReadDto | null>(null);
  const [editQuantity, setEditQuantity] = useState<number | "">("");
  const [editReason, setEditReason] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  const fetch = async () => {
    setLoading(true);
    try {
      const data = await stockAdjustmentService.getAll();
      setList(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load adjustments.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch();
  }, []);

  const openDeleteModal = (id: number, label?: string) => {
    setDeleteTargetId(id);
    setDeleteTargetLabel(label ?? `adjustment #${id}`);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setDeleteTargetId(null);
    setDeleteTargetLabel("this adjustment");
  };

  const confirmDelete = async () => {
    if (deleteTargetId == null) return;
    setDeleting(true);
    try {
      await stockAdjustmentService.delete(deleteTargetId);
      toast.success("Deleted");
      await fetch();
      closeDeleteModal();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message ?? "Failed to delete.");
    } finally {
      setDeleting(false);
    }
  };

  // open edit (unchanged)
  const openEdit = async (id: number) => {
    try {
      const dto = await stockAdjustmentService.getById(id);
      setEditing(dto);
      setEditQuantity(dto.quantity);
      setEditReason(dto.reason ?? "");
    } catch (err) {
      console.error(err);
      toast.error("Failed to load adjustment.");
    }
  };

  const submitEdit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!editing) return;
    const qty = Number(editQuantity);
    if (Number.isNaN(qty) || qty === 0) {
      toast.error("Quantity must be a non-zero number.");
      return;
    }
    setSavingEdit(true);
    try {
      await stockAdjustmentService.update(editing.id, {
        id: editing.id,
        quantity: qty,
        unitId: editing.unitId ?? undefined,
        reason: editReason || undefined,
        isSystemGenerated: editing.isSystemGenerated ?? false,
      });
      toast.success("Updated");
      setEditing(null);
      await fetch();
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message ?? "Failed to update.");
    } finally {
      setSavingEdit(false);
    }
  };

  return (
    <section className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-primary">Stock Adjustments</h2>
          <div className="text-sm text-gray-500">
            Manual inventory adjustments (audit recorded)
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            className="btn btn-ghost"
            onClick={() => fetch()}
            disabled={loading}
            aria-label="Refresh list"
            title="Refresh list"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            className="btn btn-primary btn-sm"
            onClick={() => setIsCreateOpen(true)}
          >
            <Plus className="w-4 h-4" />
            Create
          </button>
        </div>
      </div>

      <div className="rounded-lg border border-base-300 overflow-x-auto">
        {loading ? (
          <div className="p-6 text-center text-gray-500">
            Loading adjustments...
          </div>
        ) : list.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No adjustments found.
          </div>
        ) : (
          <table className="table table-zebra table-sm w-full">
            <thead className="bg-base-200 sticky top-0">
              <tr>
                <th>Product</th>
                <th className="text-right">Qty</th>
                <th>Unit</th>
                <th>Reason</th>
                <th>When</th>
                <th>By</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.map((s) => (
                <tr key={s.id} className="hover">
                  <td>{s.productName}</td>
                  <td className="text-right">{s.quantity}</td>
                  <td>{s.unitName ?? "—"}</td>
                  <td>{s.reason ?? "—"}</td>
                  <td>{new Date(s.adjustmentDate).toLocaleString()}</td>
                  <td>{s.adjustedByUserName ?? "—"}</td>
                  <td className="flex gap-2">
                    <button
                      className="btn btn-xs btn-outline"
                      onClick={() => openEdit(s.id)}
                      aria-label={`Edit adjustment ${s.id}`}
                      title="Edit"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      className="btn btn-xs btn-outline btn-error"
                      onClick={() => openDeleteModal(s.id, s.productName)}
                      aria-label={`Delete adjustment ${s.id}`}
                      title="Delete"
                    >
                      <Trash className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <CreateStockAdjustment
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreated={async () => {
          setIsCreateOpen(false);
          await fetch();
        }}
      />

      {/* Delete confirmation modal */}
      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        title="Delete stock adjustment?"
        message={`Are you sure you want to delete the stock adjustment for "${deleteTargetLabel}"? This will NOT automatically restore product stock.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        loading={deleting}
        onConfirm={confirmDelete}
        onClose={closeDeleteModal}
      />

      {/* Edit modal */}
      {editing && (
        <dialog className="modal modal-open" aria-modal>
          <div className="modal-box max-w-md">
            <div className="flex items-start justify-between">
              <h3 className="font-bold text-lg">Edit Stock Adjustment</h3>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setEditing(null)}
                aria-label="Close edit modal"
                title="Close"
                disabled={savingEdit}
              >
                ✕
              </button>
            </div>

            <form onSubmit={submitEdit} className="mt-4 space-y-3">
              <div>
                <label className="label">Product</label>
                <div className="input input-bordered w-full pointer-events-none bg-base-100">
                  {editing.productName}
                </div>
              </div>

              <div>
                <label className="label">Quantity</label>
                <input
                  type="number"
                  step="any"
                  className="input input-bordered w-full"
                  value={editQuantity}
                  onChange={(e) =>
                    setEditQuantity(
                      e.target.value === "" ? "" : Number(e.target.value)
                    )
                  }
                  required
                />
              </div>

              <div>
                <label className="label">Reason</label>
                <input
                  type="text"
                  className="input input-bordered w-full"
                  value={editReason}
                  onChange={(e) => setEditReason(e.target.value)}
                />
              </div>

              <div className="modal-action">
                <button
                  type="button"
                  className="btn"
                  onClick={() => setEditing(null)}
                  disabled={savingEdit}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={savingEdit}
                >
                  {savingEdit ? "Saving..." : "Save changes"}
                </button>
              </div>
            </form>
          </div>
        </dialog>
      )}
    </section>
  );
}
