// src/components/EditProductModal.tsx

import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { productService } from "@/services/productService";
import { categoryService } from "@/services/categoryService";
import { unitService } from "@/services/unitService";
import type { ProductUpdateDto, ProductReadDto } from "@/types/product";
import { TaxType, TaxTypeLabels } from "@/types/vatSetting";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";

export type EditProductModalProps = {
  isOpen: boolean;
  onClose: () => void;
  product: ProductReadDto | null;
  onProductUpdated: () => Promise<void>;
};

const convertToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.replace(/^data:image\/[a-zA-Z]+;base64,/, "");
      resolve(base64);
    };
    reader.onerror = (error) => reject(error);
  });

export const EditProductModal = ({
  isOpen,
  onClose,
  product,
  onProductUpdated,
}: EditProductModalProps) => {
  const queryClient = useQueryClient();
  const [preview, setPreview] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ProductUpdateDto>();

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: categoryService.getAll,
  });

  const { data: units = [] } = useQuery({
    queryKey: ["units"],
    queryFn: unitService.getAll,
  });

  const mutation = useMutation({
    mutationFn: (data: ProductUpdateDto) => productService.update(data),
    onSuccess: async () => {
      toast.success("Product updated successfully");
      await queryClient.invalidateQueries({ queryKey: ["products"] });
      await onProductUpdated();
      reset();
      setPreview(null);
      onClose();
    },
    onError: () => {
      toast.error("Failed to update product");
    },
  });

  useEffect(() => {
    if (product && isOpen) {
      reset({
        ...product,
      });

      if (product.imageBase64) {
        setPreview(`data:image/png;base64,${product.imageBase64}`);
      } else {
        setPreview(null);
      }
    }
  }, [product, isOpen, reset]);

  const onSubmit = (data: ProductUpdateDto) => {
    const payload = { ...data };

    if (!payload.imageBase64) {
      delete payload.imageBase64;
    }

    mutation.mutate(payload);
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const base64 = await convertToBase64(file);
      setValue("imageBase64", base64);
      setPreview(`data:image/png;base64,${base64}`);
    } catch (error) {
      toast.error("Failed to read image file");
      console.error(error);
    }
  };

  const removeImage = () => {
    setValue("imageBase64", undefined);
    setPreview(null);
  };

  if (!isOpen || !product) return null;

  return (
    <dialog className={`modal ${isOpen ? "modal-open" : ""}`}>
      <div className="modal-box max-w-3xl w-full">
        <h3 className="font-bold text-lg mb-4">Edit Product</h3>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Hidden ID Field */}
          <input type="hidden" {...register("id", { valueAsNumber: true })} />

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

          {/* Barcode & IsBarcoded */}
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="label">Barcode (Optional)</label>
              <input
                type="text"
                {...register("barcode")}
                className="input input-bordered w-full"
              />
            </div>
            <div className="flex items-end">
              <label className="label cursor-pointer">
                <input
                  type="checkbox"
                  {...register("isBarcoded")}
                  className="checkbox mr-2"
                />
                Barcoded
              </label>
            </div>
          </div>

          {/* Category & Unit Select */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="label">Category</label>
              <select
                {...register("categoryId", {
                  valueAsNumber: true,
                  required: true,
                })}
                className="select select-bordered w-full"
              >
                <option value="">Select category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Unit</label>
              <select
                {...register("unitId", {
                  valueAsNumber: true,
                  required: true,
                })}
                className="select select-bordered w-full"
              >
                <option value="">Select unit</option>
                {units.map((unit) => (
                  <option key={unit.id} value={unit.id}>
                    {unit.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="label">Description (Optional)</label>
            <textarea
              {...register("description")}
              className="textarea textarea-bordered w-full"
            />
          </div>

          {/* Price & Tax Type */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="label">Price</label>
              <input
                type="number"
                step="0.01"
                {...register("price", {
                  required: "Price is required",
                  valueAsNumber: true,
                })}
                className="input input-bordered w-full"
              />
            </div>
            <div>
              <label className="label">Tax Type</label>
              <select
                {...register("taxType", {
                  required: true,
                  valueAsNumber: true,
                })}
                className="select select-bordered w-full"
              >
                <option value="">Select tax type</option>
                {Object.values(TaxType)
                  .filter((v) => typeof v === "number")
                  .map((value) => (
                    <option key={value} value={value}>
                      {TaxTypeLabels[value as TaxType]}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          {/* Perishable, Active, and Reorder Level */}
          <div className="flex items-center justify-between gap-4">
            {/* Checkboxes: Perishable + Active */}
            <div className="flex items-center gap-6">
              {/* Perishable */}
              <label className="flex items-center gap-1 cursor-pointer">
                <input
                  type="checkbox"
                  {...register("isPerishable")}
                  className="checkbox"
                />
                <span className="text-sm">Perishable</span>
              </label>

              {/* Active */}
              <label className="flex items-center gap-1 cursor-pointer">
                <input
                  type="checkbox"
                  {...register("isActive")}
                  className="checkbox"
                />
                <span className="text-sm">Active</span>
              </label>
            </div>

            {/* Reorder Level */}
            <div className="w-1/2">
              <label className="label">
                <span className="text-sm">Reorder Level (Optional)</span>
              </label>
              <input
                type="number"
                {...register("reorderLevel", { valueAsNumber: true })}
                className="input input-bordered w-full"
              />
            </div>
          </div>

          {/* Image Upload */}
          <div>
            <label className="label">Image (Optional)</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="file-input file-input-bordered w-full"
            />
            {preview && (
              <div className="mt-2 space-y-2">
                <img
                  src={preview}
                  alt="Preview"
                  className="max-h-32 rounded border"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="btn btn-sm btn-error"
                >
                  Remove Image
                </button>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="modal-action">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={mutation.status === "pending"}
            >
              {mutation.status === "pending" ? "Saving..." : "Save Changes"}
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
