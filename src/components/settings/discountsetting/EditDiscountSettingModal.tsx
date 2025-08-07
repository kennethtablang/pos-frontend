import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { discountSettingService } from "@/services/discountSettingService";
import type {
  DiscountSettingUpdateDto,
  DiscountSettingReadDto,
} from "@/types/discountSetting";
import toast from "react-hot-toast";

export type EditDiscountSettingModalProps = {
  isOpen: boolean;
  onClose: () => void;
  discountSetting: DiscountSettingReadDto | null;
  onDiscountUpdated: () => Promise<void>;
};

export const EditDiscountSettingModal = ({
  isOpen,
  onClose,
  discountSetting,
  onDiscountUpdated,
}: EditDiscountSettingModalProps) => {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DiscountSettingUpdateDto>();

  useEffect(() => {
    if (discountSetting) {
      reset({
        name: discountSetting.name,
        discountPercent: discountSetting.discountPercent,
        requiresApproval: discountSetting.requiresApproval,
        description: discountSetting.description || "",
      });
    }
  }, [discountSetting, reset]);

  const mutation = useMutation({
    mutationFn: (data: DiscountSettingUpdateDto) =>
      discountSettingService.update(discountSetting!.id, data),
    onSuccess: async () => {
      toast.success("Discount setting updated successfully");
      queryClient.invalidateQueries({ queryKey: ["discountSettings"] });
      await onDiscountUpdated();
      reset();
      onClose();
    },
    onError: () => {
      toast.error("Failed to update discount setting");
    },
  });

  const onSubmit = (data: DiscountSettingUpdateDto) => {
    mutation.mutate(data);
  };

  if (!isOpen || !discountSetting) return null;

  return (
    <dialog className={`modal ${isOpen ? "modal-open" : ""}`}>
      <div className="modal-box">
        <h3 className="font-bold text-lg mb-4">Edit Discount Setting</h3>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

          <div>
            <label className="label cursor-pointer">
              <span className="label-text">Requires Approval</span>
              <input
                type="checkbox"
                className="checkbox ml-2"
                {...register("requiresApproval")}
              />
            </label>
          </div>

          <div>
            <label className="label">Description (Optional)</label>
            <textarea
              {...register("description")}
              className="textarea textarea-bordered w-full"
            />
          </div>

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
