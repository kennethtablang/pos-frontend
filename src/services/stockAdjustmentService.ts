// src/services/stockAdjustmentService.ts
import axiosInstance from "./axiosInstance";
import type {
  StockAdjustmentCreateDto,
  StockAdjustmentUpdateDto,
  StockAdjustmentReadDto,
  StockAdjustmentListDto,
} from "@/types/stockAdjustment";

const BASE = "/StockAdjustments";

export const stockAdjustmentService = {
  getAll: async (): Promise<StockAdjustmentListDto[]> => {
    const res = await axiosInstance.get<StockAdjustmentListDto[]>(BASE);
    return res.data;
  },

  getById: async (id: number): Promise<StockAdjustmentReadDto> => {
    const res = await axiosInstance.get<StockAdjustmentReadDto>(`${BASE}/${id}`);
    return res.data;
  },

  create: async (dto: StockAdjustmentCreateDto): Promise<StockAdjustmentReadDto> => {
    const res = await axiosInstance.post<StockAdjustmentReadDto>(BASE, dto);
    return res.data;
  },

  update: async (id: number, dto: StockAdjustmentUpdateDto): Promise<StockAdjustmentReadDto> => {
    const res = await axiosInstance.put<StockAdjustmentReadDto>(`${BASE}/${id}`, dto);
    return res.data;
  },

  delete: async (id: number): Promise<void> => {
    await axiosInstance.delete(`${BASE}/${id}`);
  },
};
