// src/services/receiptSettingService.ts
import axiosInstance from "./axiosInstance";
import type {
  ReceiptSettingReadDto,
  ReceiptSettingCreateDto,
  ReceiptSettingUpdateDto,
} from "@/types/receiptSetting";

const BASE_URL = "/settings/receipt";

export const receiptSettingService = {
  /** Fetch all receipt settings */
  getAll: async (): Promise<ReceiptSettingReadDto[]> => {
    const res = await axiosInstance.get<ReceiptSettingReadDto[]>(BASE_URL);
    return res.data;
  },

  /** Fetch single receipt setting by ID */
  getById: async (id: number): Promise<ReceiptSettingReadDto> => {
    const res = await axiosInstance.get<ReceiptSettingReadDto>(`${BASE_URL}/${id}`);
    return res.data;
  },

  /** Create a new receipt setting */
  create: async (
    dto: ReceiptSettingCreateDto
  ): Promise<ReceiptSettingReadDto> => {
    const res = await axiosInstance.post<ReceiptSettingReadDto>(BASE_URL, dto);
    return res.data;
  },

  /** Update an existing receipt setting */
  update: async (
    id: number,
    dto: ReceiptSettingUpdateDto
  ): Promise<void> => {
    await axiosInstance.put(`${BASE_URL}/${id}`, dto);
  },

  /** Activate/deactivate a receipt setting */
  setActive: async (id: number, isActive: boolean): Promise<void> => {
    await axiosInstance.patch(
      `${BASE_URL}/${id}/status`,
      null,
      { params: { isActive } }
    );
  },
};
