// src/services/discountSettingService.ts
import axiosInstance from "./axiosInstance";
import type {
  DiscountSettingCreateDto,
  DiscountSettingReadDto,
  DiscountSettingUpdateDto,
} from "@/types/discountSetting";

const BASE_URL = "/settings/discounts";

export const discountSettingService = {
  getAll: async (): Promise<DiscountSettingReadDto[]> => {
    const res = await axiosInstance.get(BASE_URL);
    return res.data;
  },

  getById: async (id: number): Promise<DiscountSettingReadDto> => {
    const res = await axiosInstance.get(`${BASE_URL}/${id}`);
    return res.data;
  },

  create: async (dto: DiscountSettingCreateDto): Promise<DiscountSettingReadDto> => {
    const res = await axiosInstance.post(BASE_URL, dto);
    return res.data;
  },

  update: async (id: number, dto: DiscountSettingUpdateDto): Promise<void> => {
    await axiosInstance.put(`${BASE_URL}/${id}`, dto);
  },

  deactivate: async (id: number): Promise<void> => {
    await axiosInstance.patch(`${BASE_URL}/${id}/deactivate`);
  },
};
