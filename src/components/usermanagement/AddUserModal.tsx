/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/usermanagement/AddUserModal.tsx
import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { UserRoles, UserRoleLabels, type UserRole } from "@/types/user";
import type { UserCreateDto } from "@/types/user";
import { userService } from "@/services/userService";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onUserAdded?: () => void;
};

export default function AddUserModal({ isOpen, onClose, onUserAdded }: Props) {
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>(UserRoles.Cashier);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFirstName("");
      setMiddleName("");
      setLastName("");
      setEmail("");
      setPassword("");
      setRole(UserRoles.Cashier);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const validate = (): string | null => {
    if (!firstName.trim()) return "First name is required.";
    if (!lastName.trim()) return "Last name is required.";
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email))
      return "Valid email is required.";
    if (!password || password.length < 6)
      return "Password must be at least 6 characters.";
    if (
      typeof role !== "number" ||
      Number.isNaN(role) ||
      !(role in UserRoleLabels)
    ) {
      return "Please select a valid role.";
    }
    return null;
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const err = validate();
    if (err) {
      toast.error(err);
      return;
    }

    const payload: UserCreateDto = {
      firstName: firstName.trim(),
      middleName: middleName.trim() || undefined,
      lastName: lastName.trim(),
      email: email.trim(),
      password,
      role: role as UserRole,
    };

    try {
      setIsSubmitting(true);
      await userService.create(payload);
      toast.success("User added successfully.");
      onUserAdded?.();
      onClose();
    } catch (error: any) {
      console.error("Failed to create user", error);
      const serverMsg = error?.response?.data?.message || error?.message;
      toast.error(serverMsg ?? "Failed to add user.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="modal modal-open"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-user-title"
    >
      <div className="modal-box w-full max-w-lg">
        <h3 id="add-user-title" className="font-bold text-lg">
          Add New User
        </h3>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 mt-4"
          aria-describedby="add-user-desc"
        >
          <p id="add-user-desc" className="sr-only">
            Use this form to create a new user. All fields with an asterisk are
            required.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* First Name */}
            <div>
              <label htmlFor="firstName" className="label">
                <span className="label-text">First name *</span>
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                className="input input-sm input-bordered w-full"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="e.g. Juan"
                aria-required="true"
              />
            </div>

            {/* Middle Name */}
            <div>
              <label htmlFor="middleName" className="label">
                <span className="label-text">Middle name</span>
              </label>
              <input
                id="middleName"
                name="middleName"
                type="text"
                className="input input-sm input-bordered w-full"
                value={middleName}
                onChange={(e) => setMiddleName(e.target.value)}
                placeholder="Optional"
                aria-required="false"
              />
            </div>

            {/* Last Name */}
            <div>
              <label htmlFor="lastName" className="label">
                <span className="label-text">Last name *</span>
              </label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                className="input input-sm input-bordered w-full"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="e.g. Dela Cruz"
                aria-required="true"
              />
            </div>

            {/* Role */}
            <div>
              <label htmlFor="roleSelect" className="label">
                <span className="label-text">Role *</span>
              </label>
              <select
                id="roleSelect"
                name="role"
                className="select select-sm select-bordered w-full"
                value={String(role)}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  if (!Number.isNaN(val)) setRole(val as UserRole);
                }}
                aria-required="true"
                aria-label="Select user role"
                title="User role"
              >
                <option value={String(UserRoles.Admin)}>
                  {UserRoleLabels[UserRoles.Admin]}
                </option>
                <option value={String(UserRoles.Manager)}>
                  {UserRoleLabels[UserRoles.Manager]}
                </option>
                <option value={String(UserRoles.Cashier)}>
                  {UserRoleLabels[UserRoles.Cashier]}
                </option>
                <option value={String(UserRoles.Warehouse)}>
                  {UserRoleLabels[UserRoles.Warehouse]}
                </option>
              </select>
            </div>
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="label">
              <span className="label-text">Email *</span>
            </label>
            <input
              id="email"
              name="email"
              type="email"
              className="input input-sm input-bordered w-full"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              aria-required="true"
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="label">
              <span className="label-text">Password *</span>
            </label>
            <input
              id="password"
              name="password"
              type="password"
              className="input input-sm input-bordered w-full"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              aria-required="true"
            />
            <p id="passwordHelp" className="text-xs text-gray-500 mt-1">
              Password must be at least 6 characters.
            </p>
          </div>

          <div className="modal-action">
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => {
                if (!isSubmitting) onClose();
              }}
              disabled={isSubmitting}
              aria-label="Cancel adding user"
              title="Cancel"
            >
              Cancel
            </button>

            <button
              type="submit"
              className={`btn btn-primary ${isSubmitting ? "loading" : ""}`}
              disabled={isSubmitting}
              aria-label="Add user"
              title="Add user"
            >
              Add User
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
