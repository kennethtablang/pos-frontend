// src/components/suppliers/EditSupplierModal.tsx
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supplierService } from "@/services/supplierServices";
import type { SupplierUpdateDto, SupplierReadDto } from "@/types/supplier";
import toast from "react-hot-toast";

export type EditSupplierModalProps = {
  isOpen: boolean;
  onClose: () => void;
  supplier: SupplierReadDto | null;
  onSupplierUpdated: () => Promise<void>;
};

export const EditSupplierModal = ({
  isOpen,
  onClose,
  supplier,
  onSupplierUpdated,
}: EditSupplierModalProps) => {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SupplierUpdateDto>();

  // Populate form when supplier changes
  useEffect(() => {
    if (supplier) {
      reset({
        name: supplier.name,
        contactPerson: supplier.contactPerson || "",
        email: supplier.email || "",
        phone: supplier.phone || "",
        address: supplier.address || "",
        notes: supplier.notes || "",
        isActive: supplier.isActive, // editing allows changing status
      });
    }
  }, [supplier, reset]);

  // Update mutation
  const mutation = useMutation({
    mutationFn: (data: SupplierUpdateDto) =>
      supplierService.update(supplier!.id, data),
    onSuccess: async () => {
      toast.success("Supplier updated successfully");
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      await onSupplierUpdated();
      reset();
      onClose();
    },
    onError: () => {
      toast.error("Failed to update supplier");
    },
  });

  const onSubmit = (data: SupplierUpdateDto) => {
    mutation.mutate(data);
  };

  if (!isOpen || !supplier) return null;

  return (
    <dialog className={`modal ${isOpen ? "modal-open" : ""}`}>
      <div className="modal-box max-w-lg">
        <h3 className="font-bold text-lg mb-4">Edit Supplier</h3>
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

          {/* IsActive */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              {...register("isActive")}
              className="checkbox"
            />
            <label className="label cursor-pointer">Active</label>
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
