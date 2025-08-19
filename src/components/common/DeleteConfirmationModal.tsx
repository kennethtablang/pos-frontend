// src/components/common/DeleteConfirmationModal.tsx
interface DeleteConfirmationModalProps {
  isOpen: boolean;
  title?: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  /**
   * Called when user confirms deletion.
   * Should return a promise if the parent needs to await it.
   */
  onConfirm: () => Promise<void> | void;
  onClose: () => void;
}

export default function DeleteConfirmationModal({
  isOpen,
  title = "Confirm delete",
  message = "Are you sure you want to delete this item? This action cannot be undone.",
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  loading = false,
  onConfirm,
  onClose,
}: DeleteConfirmationModalProps) {
  if (!isOpen) return null;

  const handleConfirm = async () => {
    try {
      await onConfirm();
    } catch {
      // parent will handle errors / toasts; close modal only if parent wants to
    }
  };

  return (
    <dialog
      className={`modal modal-open`}
      aria-modal
      aria-labelledby="delete-modal-title"
    >
      <div className="modal-box max-w-md" role="dialog">
        <div className="flex items-start justify-between">
          <h3 id="delete-modal-title" className="font-bold text-lg">
            {title}
          </h3>
          <button
            className="btn btn-ghost btn-sm"
            onClick={onClose}
            aria-label="Close delete dialog"
            title="Close"
            disabled={loading}
          >
            ✕
          </button>
        </div>

        <div className="py-4 text-sm text-gray-700">
          <p>{message}</p>
        </div>

        <div className="modal-action mt-2">
          <button
            className="btn"
            onClick={onClose}
            disabled={loading}
            aria-label={cancelLabel}
            title={cancelLabel}
          >
            {cancelLabel}
          </button>
          <button
            className="btn btn-error"
            onClick={handleConfirm}
            disabled={loading}
            aria-label={confirmLabel}
            title={confirmLabel}
          >
            {loading ? "Deleting..." : confirmLabel}
          </button>
        </div>
      </div>
    </dialog>
  );
}
