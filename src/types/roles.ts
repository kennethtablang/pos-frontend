// src/types/roles.ts

export const UserRoles = {
  Admin: "Admin",
  Manager: "Manager",
  Cashier: "Cashier",
  Warehouse: "Warehouse",
} as const;

// Union type of the values: "Admin" | "Manager" | "Cashier" | "Warehouse"
export type UserRole = (typeof UserRoles)[keyof typeof UserRoles];
