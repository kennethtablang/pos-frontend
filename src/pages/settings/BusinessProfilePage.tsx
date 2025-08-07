/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/settings/BusinessProfilePage.tsx
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import type {
  BusinessProfileReadDto,
  BusinessProfileCreateDto,
  BusinessProfileUpdateDto,
} from "@/types/businessProfile";
import { businessProfileService } from "@/services/businessProfileService";

export default function BusinessProfilePage() {
  const [profile, setProfile] = useState<BusinessProfileReadDto | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // react-hook-form setup
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors },
  } = useForm<BusinessProfileCreateDto & { id?: number }>({
    defaultValues: {},
  });

  // Load existing profile
  useEffect(() => {
    const load = async () => {
      try {
        const data = await businessProfileService.get();
        setProfile(data);
        // populate form
        reset({
          id: data.id,
          storeName: data.storeName,
          vatRegisteredTIN: data.vatRegisteredTIN,
          birPermitNumber: data.birPermitNumber,
          serialNumber: data.serialNumber,
          min: data.min,
          address: data.address,
          contactEmail: data.contactEmail,
          contactPhone: data.contactPhone,
        });
      } catch (err: any) {
        // If not found, it's the first time—no toast needed
        if (err.response?.status !== 404) {
          console.error("Failed to load business profile", err);
          toast.error("Failed to load business profile.");
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [reset]);

  // On form submit: create or update
  const onSubmit = async (
    values: BusinessProfileCreateDto & { id?: number }
  ) => {
    try {
      if (values.id) {
        const dto: BusinessProfileUpdateDto = { id: values.id, ...values };
        await businessProfileService.update(dto);
        toast.success("Business profile updated!");
      } else {
        const dto: BusinessProfileCreateDto = values;
        const created = await businessProfileService.create(dto);
        setProfile(created);
        toast.success("Business profile created!");
      }
    } catch {
      toast.error("Failed to save business profile.");
    }
  };

  if (loading) {
    return <div className="p-6 text-gray-500">Loading business profile…</div>;
  }

  return (
    <section className="p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-primary">Business Profile</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <input type="hidden" {...register("id")} />

        <div>
          <label className="label">
            <span className="label-text">Store Name</span>
          </label>
          <input
            {...register("storeName", { required: true, maxLength: 150 })}
            className="input input-bordered w-full"
          />
          {errors.storeName && (
            <p className="text-red-500 text-sm">Store Name is required</p>
          )}
        </div>

        <div>
          <label className="label">
            <span className="label-text">VAT Registered TIN</span>
          </label>
          <input
            {...register("vatRegisteredTIN", { required: true, maxLength: 20 })}
            className="input input-bordered w-full"
          />
          {errors.vatRegisteredTIN && (
            <p className="text-red-500 text-sm">TIN is required</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">
              <span className="label-text">BIR Permit No.</span>
            </label>
            <input
              {...register("birPermitNumber", { maxLength: 100 })}
              className="input input-bordered w-full"
            />
          </div>
          <div>
            <label className="label">
              <span className="label-text">Serial Number</span>
            </label>
            <input
              {...register("serialNumber", { maxLength: 50 })}
              className="input input-bordered w-full"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">
              <span className="label-text">MIN</span>
            </label>
            <input
              {...register("min", { maxLength: 50 })}
              className="input input-bordered w-full"
            />
          </div>
          <div>
            <label className="label">
              <span className="label-text">Contact Phone</span>
            </label>
            <input
              {...register("contactPhone", { maxLength: 20 })}
              className="input input-bordered w-full"
            />
          </div>
        </div>

        <div>
          <label className="label">
            <span className="label-text">Address</span>
          </label>
          <textarea
            {...register("address", { maxLength: 200 })}
            className="textarea textarea-bordered w-full"
          />
        </div>

        <div>
          <label className="label">
            <span className="label-text">Contact Email</span>
          </label>
          <input
            type="email"
            {...register("contactEmail", { maxLength: 100 })}
            className="input input-bordered w-full"
          />
        </div>

        <div className="modal-action flex justify-end">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? profile
                ? "Updating..."
                : "Creating..."
              : profile
                ? "Update Profile"
                : "Create Profile"}
          </button>
        </div>
      </form>
    </section>
  );
}
