// src/types/auth.ts

/** Login attempt entry */
export interface LoginAttemptLogDto {
  id: number;
  usernameOrEmail: string;
  attemptedAt: string;    // ISO date string
  wasSuccessful: boolean;
  failureReason?: string;
  ipAddress?: string;
  terminalName?: string;
}

/** System log entry */
export interface SystemLogDto {
  id: number;
  timestamp: string;      // ISO date string
  module: string;
  actionType: string;
  description: string;
  dataBefore?: string;
  dataAfter?: string;
  ipAddress?: string;
  userId?: string;
  performedBy?: string;
}

/** User session entry */
export interface UserSessionDto {
  id: number;
  userId: string;
  userFullName: string;
  loginTime: string;      // ISO date string
  logoutTime?: string;    // ISO date or undefined
  terminalName?: string;
  ipAddress?: string;
}
