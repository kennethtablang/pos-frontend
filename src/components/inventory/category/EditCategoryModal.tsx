// src/components/inventory/category/EditCategoryModal.tsx
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { categoryService } from "@/services/categoryService";
import type { CategoryUpdateDto, CategoryReadDto } from "@/types/category";
import toast from "react-hot-toast";

export type EditCategoryModalProps = {
  isOpen: boolean;
  onClose: () => void;
  category: CategoryReadDto | null;
  onCategoryUpdated: () => Promise<void>;
};

export const EditCategoryModal = ({
  isOpen,
  onClose,
  category,
  onCategoryUpdated,
}: EditCategoryModalProps) => {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CategoryUpdateDto>();

  useEffect(() => {
    if (category) {
      reset({
        id: category.id,
        name: category.name,
        description: category.description || "",
        isActive: category.isActive,
      });
    }
  }, [category, reset]);

  const mutation = useMutation({
    mutationFn: (data: CategoryUpdateDto) => categoryService.update(data),
    onSuccess: async () => {
      toast.success("Category updated successfully");
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      await onCategoryUpdated();
      reset();
      onClose();
    },
    onError: () => {
      toast.error("Failed to update category");
    },
  });

  const onSubmit = (data: CategoryUpdateDto) => {
    mutation.mutate(data);
  };

  if (!isOpen || !category) return null;

  return (
    <dialog className={`modal ${isOpen ? "modal-open" : ""}`}>
      <div className="modal-box">
        <h3 className="font-bold text-lg mb-4">Edit Category</h3>
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

          {/* Active Checkbox */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              {...register("isActive")}
              className="checkbox"
            />
            <label className="label cursor-pointer">Active</label>
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
