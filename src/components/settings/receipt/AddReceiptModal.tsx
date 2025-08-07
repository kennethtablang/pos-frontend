import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { receiptSettingService } from "@/services/receiptSettingService";
import type { ReceiptSettingCreateDto } from "@/types/receiptSetting";
import toast from "react-hot-toast";

export type AddReceiptSettingModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onReceiptAdded: () => Promise<void>;
};

export const AddReceiptModal = ({
  isOpen,
  onClose,
  onReceiptAdded,
}: AddReceiptSettingModalProps) => {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ReceiptSettingCreateDto>();

  const mutation = useMutation({
    mutationFn: (data: ReceiptSettingCreateDto) =>
      receiptSettingService.create(data),
    onSuccess: async () => {
      toast.success("Receipt setting created successfully");
      queryClient.invalidateQueries({ queryKey: ["receiptSettings"] });
      await onReceiptAdded();
      reset();
      onClose();
    },
    onError: () => {
      toast.error("Failed to create receipt setting");
    },
  });

  const onSubmit = (data: ReceiptSettingCreateDto) => {
    mutation.mutate(data);
  };

  if (!isOpen) return null;

  return (
    <dialog className={`modal ${isOpen ? "modal-open" : ""}`}>
      <div className="modal-box">
        <h3 className="font-bold text-lg mb-4">Add Receipt Setting</h3>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Header Message */}
          <div>
            <label className="label">Header Message</label>
            <input
              type="text"
              {...register("headerMessage")}
              className="input input-bordered w-full"
            />
          </div>

          {/* Footer Message */}
          <div>
            <label className="label">Footer Message</label>
            <input
              type="text"
              {...register("footerMessage")}
              className="input input-bordered w-full"
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
              {...register("receiptSize", {
                required: "Receipt size is required",
              })}
              className="select select-bordered w-full"
              defaultValue=""
            >
              <option value="" disabled>
                Select size
              </option>
              <option value="58mm">58mm</option>
              <option value="80mm">80mm</option>
            </select>
            {errors.receiptSize && (
              <p className="text-red-500 text-sm">
                {errors.receiptSize.message}
              </p>
            )}
          </div>

          {/* Show VAT Breakdown */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              {...register("showVatBreakdown")}
              className="checkbox"
              defaultChecked
            />
            <label className="label cursor-pointer">Show VAT Breakdown</label>
          </div>

          {/* Show Serial & Permit Number */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              {...register("showSerialAndPermitNumber")}
              className="checkbox"
              defaultChecked
            />
            <label className="label cursor-pointer">
              Show Serial & Permit Number
            </label>
          </div>

          {/* Show Item Code */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              {...register("showItemCode")}
              className="checkbox"
              defaultChecked
            />
            <label className="label cursor-pointer">Show Item Code</label>
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
