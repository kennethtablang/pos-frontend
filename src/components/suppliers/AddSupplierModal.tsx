// src/components/suppliers/AddSupplierModal.tsx
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supplierService } from "@/services/supplierServices";
import type { SupplierCreateDto } from "@/types/supplier";
import toast from "react-hot-toast";

export type AddSupplierModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSupplierAdded: () => Promise<void>;
};

export const AddSupplierModal = ({
  isOpen,
  onClose,
  onSupplierAdded,
}: AddSupplierModalProps) => {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SupplierCreateDto>();

  const mutation = useMutation({
    mutationFn: (data: SupplierCreateDto) => supplierService.create(data),
    onSuccess: async () => {
      toast.success("Supplier created successfully");
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      await onSupplierAdded();
      reset();
      onClose();
    },
    onError: () => {
      toast.error("Failed to create supplier");
    },
  });

  const onSubmit = (data: SupplierCreateDto) => {
    mutation.mutate(data);
  };

  if (!isOpen) return null;

  return (
    <dialog className={`modal ${isOpen ? "modal-open" : ""}`}>
      <div className="modal-box max-w-lg">
        <h3 className="font-bold text-lg mb-4">Add Supplier</h3>
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

          {/* Contact Person */}
          <div>
            <label className="label">Contact Person</label>
            <input
              type="text"
              {...register("contactPerson")}
              className="input input-bordered w-full"
            />
          </div>

          {/* Email */}
          <div>
            <label className="label">Email</label>
            <input
              type="email"
              {...register("email")}
              className="input input-bordered w-full"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="label">Phone</label>
            <input
              type="text"
              {...register("phone")}
              className="input input-bordered w-full"
            />
          </div>

          {/* Address */}
          <div>
            <label className="label">Address</label>
            <textarea
              {...register("address")}
              className="textarea textarea-bordered w-full"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="label">Notes</label>
            <textarea
              {...register("notes")}
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
