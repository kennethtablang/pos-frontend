// src/services/counterSettingService.ts
import axiosInstance from "./axiosInstance";
import type {
  CounterReadDto,
  CounterCreateDto,
  CounterUpdateDto,
} from "@/types/counterSetting";

const BASE_URL = "/settings/counters";

export const counterSettingService = {
  /** Fetch all counters */
  getAll: async (): Promise<CounterReadDto[]> => {
    const res = await axiosInstance.get<CounterReadDto[]>(BASE_URL);
    return res.data;
  },

  /** Fetch a single counter by ID */
  getById: async (id: number): Promise<CounterReadDto> => {
    const res = await axiosInstance.get<CounterReadDto>(`${BASE_URL}/${id}`);
    return res.data;
  },

  /** Create a new counter */
  create: async (
    dto: CounterCreateDto
  ): Promise<CounterReadDto> => {
    const res = await axiosInstance.post<CounterReadDto>(BASE_URL, dto);
    return res.data;
  },

  /** Update an existing counter */
  update: async (
    id: number,
    dto: CounterUpdateDto
  ): Promise<void> => {
    await axiosInstance.put(`${BASE_URL}/${id}`, dto);
  },

  /** Activate or deactivate a counter */
  setActive: async (id: number, isActive: boolean): Promise<void> => {
    await axiosInstance.patch(
      `${BASE_URL}/${id}/status`,
      null,
      { params: { isActive } }
    );
  },
};
