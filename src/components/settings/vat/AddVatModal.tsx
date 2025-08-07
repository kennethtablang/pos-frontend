// src/components/settings/vat/AddVatModal.tsx
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { vatSettingService } from "@/services/vatSettingService";
import type { VatSettingCreateDto } from "@/types/vatSetting"; // type-only import
import { TaxType } from "@/types/vatSetting"; // runtime enum import
import toast from "react-hot-toast";

export type AddVatModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onVatAdded: () => Promise<void>;
};

export const AddVatModal = ({
  isOpen,
  onClose,
  onVatAdded,
}: AddVatModalProps) => {
  const queryClient = useQueryClient();

  // Initialize the form
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<VatSettingCreateDto>();

  // Mutation for creating a new VAT setting
  const mutation = useMutation({
    mutationFn: (data: VatSettingCreateDto) => vatSettingService.create(data),
    onSuccess: async () => {
      toast.success("VAT setting created successfully");
      // Invalidate queries in React Query v5 style
      queryClient.invalidateQueries({ queryKey: ["vatSettings"] });
      await onVatAdded();
      reset();
      onClose();
    },
    onError: () => {
      toast.error("Failed to create VAT setting");
    },
  });

  // Handle form submission
  const onSubmit = (data: VatSettingCreateDto) => {
    mutation.mutate(data);
  };

  if (!isOpen) return null;

  return (
    <dialog className={`modal ${isOpen ? "modal-open" : ""}`}>
      <div className="modal-box">
        <h3 className="font-bold text-lg mb-4">Add VAT Setting</h3>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
              <option value="">Select tax type</option>
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
