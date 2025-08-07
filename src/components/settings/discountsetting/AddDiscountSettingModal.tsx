import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { discountSettingService } from "@/services/discountSettingService";
import type { DiscountSettingCreateDto } from "@/types/discountSetting";
import toast from "react-hot-toast";

export type AddDiscountSettingModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onDiscountAdded: () => Promise<void>;
};

export const AddDiscountSettingModal = ({
  isOpen,
  onClose,
  onDiscountAdded,
}: AddDiscountSettingModalProps) => {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DiscountSettingCreateDto>();

  const mutation = useMutation({
    mutationFn: (data: DiscountSettingCreateDto) =>
      discountSettingService.create(data),
    onSuccess: async () => {
      toast.success("Discount setting created successfully");
      queryClient.invalidateQueries({ queryKey: ["discountSettings"] });
      await onDiscountAdded();
      reset();
      onClose();
    },
    onError: () => {
      toast.error("Failed to create discount setting");
    },
  });

  const onSubmit = (data: DiscountSettingCreateDto) => {
    mutation.mutate(data);
  };

  if (!isOpen) return null;

  return (
    <dialog className={`modal ${isOpen ? "modal-open" : ""}`}>
      <div className="modal-box">
        <h3 className="font-bold text-lg mb-4">Add Discount Setting</h3>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Name Field */}
          <div>
            <label className="label">Name</label>
            <input
              type="text"
              {...register("name", { required: "Name is required" })}
              className="input input-bordered w-full"
            />
            {errors.name && (
              <p className="text-red-500 text-sm">{errors.name.message}</p>
            )}
          </div>

          {/* Discount Percent Field */}
          <div>
            <label className="label">Discount Percent (%)</label>
            <input
              type="number"
              step="0.01"
              {...register("discountPercent", {
                required: "Discount percent is required",
                valueAsNumber: true,
                min: { value: 0, message: "Value must be 0 or higher" },
              })}
              className="input input-bordered w-full"
            />
            {errors.discountPercent && (
              <p className="text-red-500 text-sm">
                {errors.discountPercent.message}
              </p>
            )}
          </div>

          {/* Requires Approval Checkbox */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              {...register("requiresApproval")}
              className="checkbox"
            />
            <label className="label cursor-pointer">Requires Approval</label>
          </div>

          {/* Description Field */}
          <div>
            <label className="label">Description (Optional)</label>
            <textarea
              {...register("description")}
              className="textarea textarea-bordered w-full"
            />
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
