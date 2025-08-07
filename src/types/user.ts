// Role mapping as const object for consistent frontend usage
export const UserRoles = {
  Admin: 0,
  Manager: 1,
  Cashier: 2,
  Warehouse: 3,
} as const;

// Type that represents the numeric role values
export type UserRole = (typeof UserRoles)[keyof typeof UserRoles];

// Optional reverse map for displaying role names (e.g., in tables or dropdowns)
export const UserRoleLabels: Record<UserRole, string> = {
  0: "Admin",
  1: "Manager",
  2: "Cashier",
  3: "Warehouse",
};

// DTO for creating a new user
export interface UserCreateDto {
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRole;
}

// DTO for reading user data from the server
export interface UserReadDto {
  id: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  fullName: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  dateCreated: string; // ISO string
}

// DTO for updating existing user data
export interface UserUpdateDto {
  id: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  email?: string;
  role?: UserRole;
  isActive?: boolean;
  password?: string;
}

// DTO for user session (currently logged-in user)
export interface UserSessionDto {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
}
