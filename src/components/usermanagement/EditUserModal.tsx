// src/components/usermanagement/EditUserModal.tsx
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import toast from "react-hot-toast";
import { userService } from "@/services/userService";
import { UserRoles, UserRoleLabels } from "@/types/user";
import type { UserUpdateDto, UserReadDto } from "@/types/user";

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserReadDto | null;
  onUserUpdated: () => void;
}

const schema = yup
  .object({
    id: yup.string().required(),
    firstName: yup.string().required("First name is required"),
    middleName: yup.string().notRequired(),
    lastName: yup.string().required("Last name is required"),
    email: yup.string().email().required("Email is required"),
    password: yup.string().min(6, "Minimum 6 characters").notRequired(),
    role: yup
      .number()
      .oneOf(Object.values(UserRoles))
      .required("Role is required"),
    isActive: yup.boolean().required(),
  })
  .required();

export default function EditUserModal({
  isOpen,
  onClose,
  user,
  onUserUpdated,
}: EditUserModalProps) {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<UserUpdateDto>({
    resolver: yupResolver(
      schema
    ) as import("react-hook-form").Resolver<UserUpdateDto>,
  });

  useEffect(() => {
    if (user) {
      setValue("id", user.id);
      setValue("firstName", user.firstName);
      setValue("middleName", user.middleName || "");
      setValue("lastName", user.lastName);
      setValue("email", user.email);
      setValue("role", user.role);
      setValue("isActive", user.isActive);
      setValue("password", "");
    }
  }, [user, setValue]);

  const onSubmit = async (data: UserUpdateDto) => {
    try {
      await userService.update(data);
      toast.success("User updated successfully!");
      onUserUpdated();
      onClose();
    } catch (error) {
      toast.error("Failed to update user.");
      console.error("Error updating user:", error);
    }
  };

  if (!user) return null;

  return (
    <dialog className={`modal ${isOpen ? "modal-open" : ""}`}>
      <form onSubmit={handleSubmit(onSubmit)} className="modal-box">
        <h3 className="text-lg font-bold mb-4">Edit User</h3>
        <input type="hidden" {...register("id")} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">
              <span className="label-text">First Name</span>
            </label>
            <input
              {...register("firstName")}
              className="input input-bordered w-full"
              placeholder="First Name"
            />
            {errors.firstName && (
              <p className="text-red-500 text-sm mt-1">
                {errors.firstName.message}
              </p>
            )}
          </div>

          <div>
            <label className="label">
              <span className="label-text">Middle Name</span>
            </label>
            <input
              {...register("middleName")}
              className="input input-bordered w-full"
              placeholder="Middle Name (optional)"
            />
          </div>

          <div>
            <label className="label">
              <span className="label-text">Last Name</span>
            </label>
            <input
              {...register("lastName")}
              className="input input-bordered w-full"
              placeholder="Last Name"
            />
            {errors.lastName && (
              <p className="text-red-500 text-sm mt-1">
                {errors.lastName.message}
              </p>
            )}
          </div>

          <div>
            <label className="label">
              <span className="label-text">Email</span>
            </label>
            <input
              {...register("email")}
              className="input input-bordered w-full"
              type="email"
              placeholder="Email"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="label">
              <span className="label-text">New Password</span>
            </label>
            <input
              {...register("password")}
              className="input input-bordered w-full"
              type="password"
              placeholder="Enter new Password"
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="md:col-span-2">
            <label className="label">
              <span className="label-text">Role</span>
            </label>
            <select
              {...register("role")}
              className="select select-bordered w-full"
            >
              <option value="">Select Role</option>
              {Object.entries(UserRoleLabels).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
            {errors.role && (
              <p className="text-red-500 text-sm mt-1">{errors.role.message}</p>
            )}
          </div>

          <div className="form-control md:col-span-2">
            <label className="label cursor-pointer">
              <span className="label-text">Active</span>
              <input
                type="checkbox"
                {...register("isActive")}
                className="checkbox"
              />
            </label>
          </div>
        </div>

        <div className="modal-action mt-6">
          <button type="button" className="btn" onClick={onClose}>
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </dialog>
  );
}
