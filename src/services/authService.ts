import axiosInstance from "./axiosInstance";
import { useAuthStore } from "../store/authStore";

interface LoginDto {
  email: string;
  password: string;
}

interface LoginResponse {
  token: string;
  expires: string;
  role: string;
  email: string;
  userId: string;
}

export const login = async (credentials: LoginDto): Promise<LoginResponse> => {
  const response = await axiosInstance.post<LoginResponse>(
    "/account/login",
    credentials
  );
  const data = response.data;

  // Persist token & user metadata
  localStorage.setItem("token", data.token);
  localStorage.setItem(
    "user",
    JSON.stringify({
      email: data.email,
      role: data.role,
      userId: data.userId,
      expires: data.expires,
    })
  );

  // Update Zustand store with user object
  useAuthStore.getState().setAuth({
    token: data.token,
    role: data.role,
  });

  return data;
};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");

  // Clear auth state in store
  useAuthStore.getState().clearAuth();
};
