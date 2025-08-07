// src/components/inventory/category/AddCategoryModal.tsx
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { categoryService } from "@/services/categoryService";
import type { CategoryCreateDto } from "@/types/category";
import toast from "react-hot-toast";

export type AddCategoryModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onCategoryAdded: () => Promise<void>;
};

export const AddCategoryModal = ({
  isOpen,
  onClose,
  onCategoryAdded,
}: AddCategoryModalProps) => {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CategoryCreateDto>();

  const mutation = useMutation({
    mutationFn: (data: CategoryCreateDto) => categoryService.create(data),
    onSuccess: async () => {
      toast.success("Category created successfully");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      await onCategoryAdded();
      reset();
      onClose();
    },
    onError: () => {
      toast.error("Failed to create category");
    },
  });

  const onSubmit = (data: CategoryCreateDto) => {
    mutation.mutate(data);
  };

  if (!isOpen) return null;

  return (
    <dialog className={`modal ${isOpen ? "modal-open" : ""}`}>
      <div className="modal-box">
        <h3 className="font-bold text-lg mb-4">Add Category</h3>
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
