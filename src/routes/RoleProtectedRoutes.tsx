// src/routes/RoleProtectedRoute.tsx
import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import type { UserRole } from "../types/roles";

interface RoleProtectedRouteProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
}

const RoleProtectedRoute = ({
  allowedRoles,
  children,
}: RoleProtectedRouteProps) => {
  const { user } = useAuthStore(); // assuming user has .role property

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role as UserRole)) {
    return <Navigate to="/unauthorized" replace />; // use your actual unauthorized route
  }

  return children;
};

export default RoleProtectedRoute;
