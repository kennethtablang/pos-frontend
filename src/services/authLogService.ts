// src/services/authLogService.ts
import axiosInstance from "./axiosInstance";
import type {
  LoginAttemptLogDto,
  SystemLogDto,
  UserSessionDto,
} from "@/types/auth";

export const authLogService = {
  /** Fetch all login attempts */
  getLoginAttempts: async (): Promise<LoginAttemptLogDto[]> => {
    const resp = await axiosInstance.get<LoginAttemptLogDto[]>("/authlogs/login-attempts");
    return resp.data;
  },

  /** Fetch all system logs */
  getSystemLogs: async (): Promise<SystemLogDto[]> => {
    const resp = await axiosInstance.get<SystemLogDto[]>("/authlogs/system-logs");
    return resp.data;
  },

  /** Fetch all active user sessions */
  getActiveUserSessions: async (): Promise<UserSessionDto[]> => {
    const resp = await axiosInstance.get<UserSessionDto[]>("/authlogs/user-sessions");
    return resp.data;
  },
};
