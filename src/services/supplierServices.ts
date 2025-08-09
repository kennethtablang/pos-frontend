// src/services/supplierService.ts

import axios from "./axiosInstance";
import type {
  SupplierReadDto,
  SupplierCreateDto,
  SupplierUpdateDto,
} from "@/types/supplier";

const baseUrl = "/suppliers";

export const supplierService = {
  getAll: async (): Promise<SupplierReadDto[]> => {
    const response = await axios.get<SupplierReadDto[]>(baseUrl);
    return response.data;
  },

  getById: async (id: number): Promise<SupplierReadDto> => {
    const response = await axios.get<SupplierReadDto>(`${baseUrl}/${id}`);
    return response.data;
  },

  create: async (dto: SupplierCreateDto): Promise<SupplierReadDto> => {
    const response = await axios.post<SupplierReadDto>(baseUrl, dto);
    return response.data;
  },

  update: async (id: number, dto: SupplierUpdateDto): Promise<void> => {
  await axios.put(`${baseUrl}/${id}`, dto);
},

  deactivate: async (id: number): Promise<void> => {
    await axios.patch(`${baseUrl}/${id}/deactivate`);
  },
};
