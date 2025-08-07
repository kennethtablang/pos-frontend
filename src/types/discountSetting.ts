// src/types/discountSetting.ts

export interface DiscountSettingReadDto {
  id: number;
  name: string;
  discountPercent: number;
  requiresApproval: boolean;
  description?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DiscountSettingCreateDto {
  name: string;
  discountPercent: number;
  requiresApproval: boolean;
  description?: string;
}

export interface DiscountSettingUpdateDto {
  name: string;
  discountPercent: number;
  requiresApproval: boolean;
  description?: string;
}
