/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/inventory/EditProductUnitConversion.tsx
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

import { productUnitConversionService } from "@/services/productUnitConversionService";
import { productService } from "@/services/productService";
import { unitService } from "@/services/unitService";

import type {
  ProductUnitConversionUpdateDto,
  ProductUnitConversionReadDto,
} from "@/types/productUnitConversion";
import type { ProductReadDto } from "@/types/product";
import type { UnitReadDto } from "@/types/unit";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  conversion: ProductUnitConversionReadDto;
  onUpdated: () => Promise<void>;
  products?: ProductReadDto[]; // optional: if parent already fetched products
  units?: UnitReadDto[]; // optional: if parent already fetched units
};

/**
 * EditProductUnitConversion
 *
 * - Pre-fills fields from `conversion`
 * - Validates fields with react-hook-form (no Yup)
 * - Performs cross-field validation (fromUnit !== toUnit)
 * - Calls productUnitConversionService.update and triggers onUpdated()
 */
export default function EditProductUnitConversion({
  isOpen,
  onClose,
  conversion,
  onUpdated,
  products: productsProp,
  units: unitsProp,
}: Props) {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    setValue,
    formState: { errors },
  } = useForm<ProductUnitConversionUpdateDto>();

  const [saving, setSaving] = useState(false);
  const [products, setProducts] = useState<ProductReadDto[]>(
    productsProp ?? []
  );
  const [units, setUnits] = useState<UnitReadDto[]>(unitsProp ?? []);
  const [loadingOptions, setLoadingOptions] = useState(false);

  // When modal opens, fetch products/units if parent didn't supply them
  useEffect(() => {
    if (!isOpen) return;

    const fetchOptionsIfNeeded = async () => {
      if (
        productsProp &&
        productsProp.length > 0 &&
        unitsProp &&
        unitsProp.length > 0
      ) {
        // Parent provided options; keep them
        return;
      }

      setLoadingOptions(true);
      try {
        const [pRes, uRes] = await Promise.all([
          productService.getAll(),
          unitService.getAll(),
        ]);
        setProducts(pRes);
        setUnits(uRes);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load products or units for edit form.");
      } finally {
        setLoadingOptions(false);
      }
    };

    fetchOptionsIfNeeded();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Populate form values whenever the modal opens or conversion changes
  useEffect(() => {
    if (!isOpen || !conversion) return;

    setValue("id", conversion.id);
    setValue("productId", conversion.productId);
    setValue("fromUnitId", conversion.fromUnitId);
    setValue("toUnitId", conversion.toUnitId);
    setValue("conversionRate", conversion.conversionRate);
    setValue("notes", conversion.notes ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, conversion]);

  // Submit handler
  const onSubmit = async (data: ProductUnitConversionUpdateDto) => {
    // Cross-field validation: From and To must differ
    if (data.fromUnitId === data.toUnitId) {
      setError("fromUnitId", {
        type: "manual",
        message: "From and To units must be different.",
      });
      setError("toUnitId", {
        type: "manual",
        message: "From and To units must be different.",
      });
      return;
    }

    setSaving(true);
    try {
      // Call update endpoint; service returns updated read DTO (but we don't strictly need it here)
      await productUnitConversionService.update(data.id, data);
      toast.success("Conversion updated");
      reset();
      await onUpdated();
    } catch (err: any) {
      console.error(err);
      const serverMsg = err?.response?.data?.message;
      toast.error(serverMsg ?? "Failed to update conversion.");
    } finally {
      setSaving(false);
    }
  };

  // Close handler resets form to avoid stale values
  const handleClose = () => {
    reset();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <dialog className={`modal ${isOpen ? "modal-open" : ""}`}>
      <div className="modal-box w-full max-w-md">
        <h3 className="font-bold text-lg mb-2">Edit Unit Conversion</h3>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Hidden Id */}
          <input type="hidden" {...register("id", { valueAsNumber: true })} />

          {/* Product */}
          <div>
            <label className="label">Product</label>
            <select
              {...register("productId", {
                required: "Product is required",
                valueAsNumber: true,
              })}
              className="select select-bordered w-full"
              disabled={loadingOptions}
            >
              <option value="" disabled>
                Select product
              </option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            {errors.productId && (
              <p className="text-red-500 text-sm">{errors.productId.message}</p>
            )}
          </div>

          {/* From Unit */}
          <div>
            <label className="label">From Unit</label>
            <select
              {...register("fromUnitId", {
                required: "From unit is required",
                valueAsNumber: true,
              })}
              className="select select-bordered w-full"
              disabled={loadingOptions}
            >
              <option value="" disabled>
                Select from unit
              </option>
              {units.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
            {errors.fromUnitId && (
              <p className="text-red-500 text-sm">
                {errors.fromUnitId.message}
              </p>
            )}
          </div>

          {/* To Unit */}
          <div>
            <label className="label">To Unit</label>
            <select
              {...register("toUnitId", {
                required: "To unit is required",
                valueAsNumber: true,
              })}
              className="select select-bordered w-full"
              disabled={loadingOptions}
            >
              <option value="" disabled>
                Select to unit
              </option>
              {units.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
            {errors.toUnitId && (
              <p className="text-red-500 text-sm">{errors.toUnitId.message}</p>
            )}
          </div>

          {/* Conversion Rate */}
          <div>
            <label className="label">Conversion Rate</label>
            <input
              type="number"
              step="0.0001"
              {...register("conversionRate", {
                required: "Conversion rate is required",
                valueAsNumber: true,
                min: {
                  value: 0.0000001,
                  message: "Conversion rate must be greater than 0",
                },
              })}
              className="input input-bordered w-full"
            />
            {errors.conversionRate && (
              <p className="text-red-500 text-sm">
                {errors.conversionRate.message}
              </p>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="label">Notes (optional)</label>
            <textarea
              {...register("notes")}
              className="textarea textarea-bordered w-full"
            />
          </div>

          {/* Actions */}
          <div className="modal-action">
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </button>

            <button
              type="button"
              className="btn"
              onClick={handleClose}
              disabled={saving}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
}
