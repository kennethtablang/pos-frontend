// src/components/settings/vat/EditVatModal.tsx
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { vatSettingService } from "@/services/vatSettingService";
import type {
  VatSettingReadDto,
  VatSettingUpdateDto,
} from "@/types/vatSetting"; // type-only imports
import { TaxType } from "@/types/vatSetting"; // value import for enum
import toast from "react-hot-toast";

export type EditVatModalProps = {
  isOpen: boolean;
  onClose: () => void;
  vatSetting: VatSettingReadDto;
  onVatUpdated: () => Promise<void>;
};

export const EditVatModal = ({
  isOpen,
  onClose,
  vatSetting,
  onVatUpdated,
}: EditVatModalProps) => {
  const queryClient = useQueryClient();

  // Initialize form; we'll reset its values when vatSetting changes
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<VatSettingUpdateDto>();

  // Populate form with existing values
  useEffect(() => {
    if (!vatSetting) return;
    reset({
      id: vatSetting.id,
      name: vatSetting.name,
      rate: vatSetting.rate,
      taxType: vatSetting.taxType,
      isVatInclusive: vatSetting.isVatInclusive,
      isActive: vatSetting.isActive,
      description: vatSetting.description ?? "",
    });
  }, [vatSetting, reset]);

  // Define the mutation for updating
  const mutation = useMutation({
    mutationFn: (data: VatSettingUpdateDto) => vatSettingService.update(data),
    onSuccess: async () => {
      toast.success("VAT setting updated successfully");
      queryClient.invalidateQueries({ queryKey: ["vatSettings"] });
      await onVatUpdated();
      reset();
      onClose();
    },
    onError: () => {
      toast.error("Failed to update VAT setting");
    },
  });

  // Submit handler—no extra mapping needed, rate & taxType are correct types
  const onSubmit = (data: VatSettingUpdateDto) => {
    mutation.mutate(data);
  };

  // Only render when open
  if (!isOpen) return null;

  return (
    <dialog className={`modal ${isOpen ? "modal-open" : ""}`}>
      <div className="modal-box">
        <h3 className="font-bold text-lg mb-4">Edit VAT Setting</h3>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Hidden ID */}
          <input type="hidden" {...register("id")} />

          {/* Name */}
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

          {/* Rate */}
          <div>
            <label className="label">Rate (%)</label>
            <input
              type="number"
              step="0.01"
              {...register("rate", {
                required: "Rate is required",
                valueAsNumber: true,
                min: { value: 0, message: "Rate cannot be negative" },
              })}
              className="input input-bordered w-full"
            />
            {errors.rate && (
              <p className="text-red-500 text-sm">{errors.rate.message}</p>
            )}
          </div>

          {/* Tax Type */}
          <div>
            <label className="label">Tax Type</label>
            <select
              {...register("taxType", {
                required: "Tax type is required",
                valueAsNumber: true,
              })}
              className="select select-bordered w-full"
            >
              <option value={TaxType.Vatable}>VATABLE</option>
              <option value={TaxType.Exempt}>EXEMPT</option>
              <option value={TaxType.ZeroRated}>ZERO RATED</option>
            </select>
            {errors.taxType && (
              <p className="text-red-500 text-sm">{errors.taxType.message}</p>
            )}
          </div>

          {/* Is VAT Inclusive */}
          <div className="form-control">
            <label className="label cursor-pointer">
              <span className="label-text">Is VAT Inclusive?</span>
              <input
                type="checkbox"
                {...register("isVatInclusive")}
                className="checkbox"
              />
            </label>
          </div>

          {/* Is Active */}
          <div className="form-control">
            <label className="label cursor-pointer">
              <span className="label-text">Is Active?</span>
              <input
                type="checkbox"
                {...register("isActive")}
                className="checkbox"
              />
            </label>
          </div>

          {/* Description */}
          <div>
            <label className="label">Description (Optional)</label>
            <textarea
              {...register("description")}
              className="textarea textarea-bordered w-full"
            />
          </div>

          {/* Actions */}
          <div className="modal-action">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={mutation.status === "pending"}
            >
              {mutation.status === "pending" ? "Updating..." : "Update"}
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
