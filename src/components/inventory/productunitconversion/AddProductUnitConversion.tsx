/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/inventory/AddProductUnitConversion.tsx
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

import { productUnitConversionService } from "@/services/productUnitConversionService";
import { unitService } from "@/services/unitService";

import type { ProductUnitConversionCreateDto } from "@/types/productUnitConversion";
import type { UnitReadDto } from "@/types/unit";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => Promise<void>;
  productId: number; // fixed — selected product context
  productName: string; // for display in modal title
  units?: UnitReadDto[]; // optional — can be passed from page
};

export default function AddProductUnitConversion({
  isOpen,
  onClose,
  onCreated,
  productId,
  productName,
  units: unitsProp,
}: Props) {
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<Omit<ProductUnitConversionCreateDto, "productId">>();

  const [saving, setSaving] = useState(false);
  const [units, setUnits] = useState<UnitReadDto[]>(unitsProp ?? []);
  const [loadingOptions, setLoadingOptions] = useState<boolean>(false);

  // Fetch units if not supplied by parent
  useEffect(() => {
    if (!isOpen) return;

    const fetchUnitsIfNeeded = async () => {
      if (unitsProp && unitsProp.length > 0) return;
      setLoadingOptions(true);
      try {
        const uRes = await unitService.getAll();
        setUnits(uRes);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load units for conversion form.");
      } finally {
        setLoadingOptions(false);
      }
    };

    fetchUnitsIfNeeded();
  }, [isOpen, unitsProp]);

  const onSubmit = async (
    data: Omit<ProductUnitConversionCreateDto, "productId">
  ) => {
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
      await productUnitConversionService.create({
        productId, // comes from context, no dropdown
        ...data,
      });
      toast.success("Conversion created");
      await onCreated();
      reset();
    } catch (err: any) {
      console.error(err);
      const serverMsg = err?.response?.data?.message;
      toast.error(serverMsg ?? "Failed to create conversion.");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <dialog className={`modal ${isOpen ? "modal-open" : ""}`}>
      <div className="modal-box w-full max-w-md">
        <h3 className="font-bold text-lg mb-2">
          Add Unit Conversion for{" "}
          <span className="text-primary">{productName}</span>
        </h3>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* From Unit */}
          <div>
            <label className="label">From Unit</label>
            <select
              {...register("fromUnitId", {
                required: "From unit is required",
                valueAsNumber: true,
              })}
              className="select select-bordered w-full"
              defaultValue=""
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
              defaultValue=""
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
              onClick={() => {
                reset();
                onClose();
              }}
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
