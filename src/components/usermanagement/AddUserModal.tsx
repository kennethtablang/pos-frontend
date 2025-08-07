import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import toast from "react-hot-toast";
import { userService } from "@/services/userService";
import { UserRoles, UserRoleLabels } from "@/types/user";
import type { UserCreateDto } from "@/types/user";

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserAdded: () => void;
}

const schema = yup
  .object({
    firstName: yup.string().required("First name is required"),
    middleName: yup.string().notRequired(),
    lastName: yup.string().required("Last name is required"),
    email: yup.string().email().required("Email is required"),
    password: yup
      .string()
      .min(6, "Minimum 6 characters")
      .required("Password is required"),
    role: yup
      .number()
      .oneOf(Object.values(UserRoles))
      .required("Role is required"),
  })
  .required();

export default function AddUserModal({
  isOpen,
  onClose,
  onUserAdded,
}: AddUserModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UserCreateDto>({
    resolver: yupResolver(
      schema
    ) as import("react-hook-form").Resolver<UserCreateDto>,
  });

  const onSubmit = async (data: UserCreateDto) => {
    try {
      await userService.create(data);
      toast.success("User added successfully!");
      onUserAdded();
      reset();
      onClose();
    } catch (error) {
      toast.error("Failed to add user.");
      console.error("Error adding user:", error);
    }
  };

  return (
    <dialog className={`modal ${isOpen ? "modal-open" : ""}`}>
      <form onSubmit={handleSubmit(onSubmit)} className="modal-box space-y-4">
        <h3 className="text-xl font-semibold">Add New User</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* First Name */}
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

          {/* Middle Name */}
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

          {/* Last Name */}
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

          {/* Email */}
          <div>
            <label className="label">
              <span className="label-text">Email</span>
            </label>
            <input
              {...register("email")}
              className="input input-bordered w-full"
              placeholder="Email"
              type="email"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="label">
              <span className="label-text">Password</span>
            </label>
            <input
              {...register("password")}
              className="input input-bordered w-full"
              placeholder="Password"
              type="password"
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Role */}
          <div>
            <label className="label">
              <span className="label-text">Role</span>
            </label>
            <select
              {...register("role", { valueAsNumber: true })}
              className="select select-bordered w-full"
              defaultValue=""
            >
              <option value="" disabled>
                Select Role
              </option>
              {Object.entries(UserRoleLabels).map(([key, label]) => (
                <option
                  key={key}
                  value={UserRoles[key as keyof typeof UserRoles]}
                >
                  {label}
                </option>
              ))}
            </select>
            {errors.role && (
              <p className="text-red-500 text-sm mt-1">{errors.role.message}</p>
            )}
          </div>
        </div>

        <div className="modal-action">
          <button
            type="button"
            onClick={onClose}
            className="btn"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Adding..." : "Add User"}
          </button>
        </div>
      </form>
    </dialog>
  );
}
