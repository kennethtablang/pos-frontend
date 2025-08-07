import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { receiptSettingService } from "@/services/receiptSettingService";
import type {
  ReceiptSettingReadDto,
  ReceiptSettingUpdateDto,
} from "@/types/receiptSetting";
import toast from "react-hot-toast";

export type EditReceiptModalProps = {
  isOpen: boolean;
  onClose: () => void;
  receiptSetting: ReceiptSettingReadDto | null;
  onReceiptUpdated: () => Promise<void>;
};

export const EditReceiptModal = ({
  isOpen,
  onClose,
  receiptSetting,
  onReceiptUpdated,
}: EditReceiptModalProps) => {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    // formState: { errors },
  } = useForm<ReceiptSettingUpdateDto>();

  useEffect(() => {
    if (receiptSetting) {
      reset({
        headerMessage: receiptSetting.headerMessage || "",
        footerMessage: receiptSetting.footerMessage || "",
        logoUrl: receiptSetting.logoUrl || "",
        receiptSize: receiptSetting.receiptSize || "58mm",
        showVatBreakdown: receiptSetting.showVatBreakdown,
        showSerialAndPermitNumber: receiptSetting.showSerialAndPermitNumber,
        showItemCode: receiptSetting.showItemCode,
        isActive: receiptSetting.isActive,
      });
    }
  }, [receiptSetting, reset]);

  const mutation = useMutation({
    mutationFn: (data: ReceiptSettingUpdateDto) =>
      receiptSettingService.update(receiptSetting!.id, data),
    onSuccess: async () => {
      toast.success("Receipt setting updated successfully");
      queryClient.invalidateQueries({ queryKey: ["receiptSettings"] });
      await onReceiptUpdated();
      reset();
      onClose();
    },
    onError: () => {
      toast.error("Failed to update receipt setting");
    },
  });

  const onSubmit = (data: ReceiptSettingUpdateDto) => {
    mutation.mutate(data);
  };

  if (!isOpen || !receiptSetting) return null;

  return (
    <dialog className={`modal ${isOpen ? "modal-open" : ""}`}>
      <div className="modal-box">
        <h3 className="font-bold text-lg mb-4">Edit Receipt Setting</h3>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Header Message */}
          <div>
            <label className="label">Header Message</label>
            <textarea
              {...register("headerMessage")}
              className="textarea textarea-bordered w-full"
            />
          </div>

          {/* Footer Message */}
          <div>
            <label className="label">Footer Message</label>
            <textarea
              {...register("footerMessage")}
              className="textarea textarea-bordered w-full"
            />
          </div>

          {/* Logo URL */}
          <div>
            <label className="label">Logo URL</label>
            <input
              type="text"
              {...register("logoUrl")}
              className="input input-bordered w-full"
            />
          </div>

          {/* Receipt Size */}
          <div>
            <label className="label">Receipt Size</label>
            <select
              {...register("receiptSize")}
              className="select select-bordered w-full"
            >
              <option value="58mm">58mm</option>
              <option value="80mm">80mm</option>
            </select>
          </div>

          {/* Checkboxes */}
          <div className="flex flex-col gap-2">
            <label className="label cursor-pointer">
              <span className="label-text">Show VAT Breakdown</span>
              <input
                type="checkbox"
                className="checkbox ml-2"
                {...register("showVatBreakdown")}
              />
            </label>
            <label className="label cursor-pointer">
              <span className="label-text">Show Serial and Permit Number</span>
              <input
                type="checkbox"
                className="checkbox ml-2"
                {...register("showSerialAndPermitNumber")}
              />
            </label>
            <label className="label cursor-pointer">
              <span className="label-text">Show Item Code</span>
              <input
                type="checkbox"
                className="checkbox ml-2"
                {...register("showItemCode")}
              />
            </label>
            <label className="label cursor-pointer">
              <span className="label-text">Active</span>
              <input
                type="checkbox"
                className="checkbox ml-2"
                {...register("isActive")}
              />
            </label>
          </div>

          {/* Action Buttons */}
          <div className="modal-action">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={mutation.status === "pending"}
            >
              {mutation.status === "pending" ? "Saving..." : "Save"}
            </button>
            <button type="button" className="btn" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
};
