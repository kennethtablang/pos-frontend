// src/store/authStore.ts
import { create } from "zustand";

export interface AuthUser {
  token: string;
  role: string;
}

interface AuthState {
  user: AuthUser | null;
  setAuth: (user: AuthUser) => void;
  clearAuth: () => void;
}

// Load saved user (if any) from localStorage
const savedUser = localStorage.getItem("user");
const initialUser: AuthUser | null = savedUser ? JSON.parse(savedUser) : null;

export const useAuthStore = create<AuthState>((set) => ({
  user: initialUser,
  setAuth: (user) => {
    localStorage.setItem("user", JSON.stringify(user));
    set({ user });
  },
  clearAuth: () => {
    localStorage.removeItem("user");
    set({ user: null });
  },
}));
