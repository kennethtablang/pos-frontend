// src/services/badOrderService.ts
import axiosInstance from "./axiosInstance";
import type {
  BadOrderReadDto,
  BadOrderCreateDto,
  BadOrderUpdateDto,
} from "@/types/badOrder";

const BASE_URL = "/BadOrders";

export const badOrderService = {
  getAll: async (): Promise<BadOrderReadDto[]> => {
    const res = await axiosInstance.get<BadOrderReadDto[]>(BASE_URL);
    return res.data;
  },

  getById: async (id: number): Promise<BadOrderReadDto> => {
    const res = await axiosInstance.get<BadOrderReadDto>(`${BASE_URL}/${id}`);
    return res.data;
  },

  create: async (dto: BadOrderCreateDto): Promise<BadOrderReadDto> => {
    const res = await axiosInstance.post<BadOrderReadDto>(BASE_URL, dto);
    return res.data;
  },

  update: async (id: number, dto: BadOrderUpdateDto): Promise<BadOrderReadDto> => {
    const res = await axiosInstance.put<BadOrderReadDto>(`${BASE_URL}/${id}`, dto);
    return res.data;
  },

  delete: async (id: number): Promise<void> => {
    await axiosInstance.delete(`${BASE_URL}/${id}`);
  },
};
