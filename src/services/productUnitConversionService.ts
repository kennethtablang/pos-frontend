// src/services/productUnitConversionService.ts
import axiosInstance from "./axiosInstance";
import type {
  ProductUnitConversionReadDto,
  ProductUnitConversionCreateDto,
  ProductUnitConversionUpdateDto,
} from "@/types/productUnitConversion";

const BASE_URL = "/ProductUnitConversion";

export const productUnitConversionService = {
  getAll: async (): Promise<ProductUnitConversionReadDto[]> => {
    const res = await axiosInstance.get<ProductUnitConversionReadDto[]>(BASE_URL);
    return res.data;
  },

  getById: async (id: number): Promise<ProductUnitConversionReadDto> => {
    const res = await axiosInstance.get<ProductUnitConversionReadDto>(`${BASE_URL}/${id}`);
    return res.data;
  },

  getByProductId: async (productId: number): Promise<ProductUnitConversionReadDto[]> => {
    const res = await axiosInstance.get<ProductUnitConversionReadDto[]>(
      `${BASE_URL}/by-product/${productId}`
    );
    return res.data;
  },

  create: async (
    dto: ProductUnitConversionCreateDto
  ): Promise<ProductUnitConversionReadDto> => {
    const res = await axiosInstance.post<ProductUnitConversionReadDto>(BASE_URL, dto);
    return res.data;
  },

  update: async (id: number, dto: ProductUnitConversionUpdateDto): Promise<ProductUnitConversionReadDto> => {
    const res = await axiosInstance.put<ProductUnitConversionReadDto>(`${BASE_URL}/${id}`, dto);
    return res.data;
  },

  delete: async (id: number): Promise<void> => {
    await axiosInstance.delete(`${BASE_URL}/${id}`);
  },
};
