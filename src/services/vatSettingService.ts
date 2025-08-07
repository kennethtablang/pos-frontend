// src/services/vatSettingService.ts
import axiosInstance from "./axiosInstance";
import type {
  VatSettingReadDto,
  VatSettingCreateDto,
  VatSettingUpdateDto,
} from "@/types/vatSetting";

const BASE_URL = "/settings/vat";

export const vatSettingService = {
  /**
   * Fetch all VAT settings
   */
  getAll: async (): Promise<VatSettingReadDto[]> => {
    const res = await axiosInstance.get<VatSettingReadDto[]>(BASE_URL);
    return res.data;
  },

  /**
   * Fetch a single VAT setting by ID
   */
  getById: async (id: number): Promise<VatSettingReadDto> => {
    const res = await axiosInstance.get<VatSettingReadDto>(`${BASE_URL}/${id}`);
    return res.data;
  },

  /**
   * Create a new VAT setting
   */
  create: async (
    data: VatSettingCreateDto
  ): Promise<VatSettingReadDto> => {
    const res = await axiosInstance.post<VatSettingReadDto>(BASE_URL, data);
    return res.data;
  },

  /**
   * Update an existing VAT setting; data.id is required
   */
  update: async (
    data: VatSettingUpdateDto
  ): Promise<void> => {
    await axiosInstance.put(BASE_URL, data);
  },

  /**
   * Activate or deactivate a VAT setting
   */
  setActive: async (
    id: number,
    isActive: boolean
  ): Promise<void> => {
    await axiosInstance.patch(
      `${BASE_URL}/${id}/status`,
      null,
      { params: { isActive } }
    );
  },
};
