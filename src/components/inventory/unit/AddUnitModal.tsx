// src/components/inventory/unit/AddUnitModal.tsx
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { unitService } from "@/services/unitService";
import type { UnitCreateDto } from "@/types/unit";
import toast from "react-hot-toast";

export type AddUnitModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onUnitAdded: () => Promise<void>;
};

export const AddUnitModal = ({
  isOpen,
  onClose,
  onUnitAdded,
}: AddUnitModalProps) => {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UnitCreateDto>();

  const mutation = useMutation({
    mutationFn: (data: UnitCreateDto) => unitService.create(data),
    onSuccess: async () => {
      toast.success("Unit created successfully");
      queryClient.invalidateQueries({ queryKey: ["units"] });
      await onUnitAdded();
      reset();
      onClose();
    },
    onError: () => {
      toast.error("Failed to create unit");
    },
  });

  const onSubmit = (data: UnitCreateDto) => {
    mutation.mutate(data);
  };

  if (!isOpen) return null;

  return (
    <dialog className={`modal ${isOpen ? "modal-open" : ""}`}>
      <div className="modal-box">
        <h3 className="font-bold text-lg mb-4">Add Unit</h3>
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

          {/* Abbreviation Field */}
          <div>
            <label className="label">Abbreviation (Optional)</label>
            <input
              type="text"
              {...register("abbreviation")}
              className="input input-bordered w-full"
            />
          </div>

          {/* Unit Type Field */}
          <div>
            <label className="label">Unit Type (Optional)</label>
            <input
              type="text"
              {...register("unitType")}
              className="input input-bordered w-full"
            />
          </div>

          {/* Allows Decimal Checkbox */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              {...register("allowsDecimal")}
              className="checkbox"
            />
            <label className="label cursor-pointer">Allows Decimal</label>
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
