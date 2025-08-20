/* eslint-disable @typescript-eslint/no-explicit-any */
// src/services/inventoryTransactionService.ts
import axiosInstance from "./axiosInstance";
import type {
  InventoryTransactionReadDto,
  InventoryTransactionCreateDto,
  InventoryTransactionUpdateDto,
  ProductStockDto,
  InventoryActionType,
} from "@/types/inventoryTransaction";

const BASE_URL = "/InventoryTransaction";

export const inventoryTransactionService = {
  // Get list, optional filters
  getAll: async (
    productId?: number,
    actionType?: InventoryActionType,
    from?: string, // ISO date
    to?: string
  ): Promise<InventoryTransactionReadDto[]> => {
    const params: Record<string, any> = {};
    if (productId !== undefined) params.productId = productId;
    if (actionType !== undefined && actionType !== null) params.actionType = actionType;
    if (from) params.from = from;
    if (to) params.to = to;
    const res = await axiosInstance.get<InventoryTransactionReadDto[]>(BASE_URL, { params });
    return res.data;
  },

  getById: async (id: number): Promise<InventoryTransactionReadDto> => {
    const res = await axiosInstance.get<InventoryTransactionReadDto>(`${BASE_URL}/${id}`);
    return res.data;
  },

  create: async (dto: InventoryTransactionCreateDto): Promise<InventoryTransactionReadDto> => {
    const res = await axiosInstance.post<InventoryTransactionReadDto>(BASE_URL, dto);
    return res.data;
  },

  update: async (id: number, dto: InventoryTransactionUpdateDto): Promise<void> => {
    await axiosInstance.put(`${BASE_URL}/${id}`, dto);
  },

  delete: async (id: number): Promise<void> => {
    await axiosInstance.delete(`${BASE_URL}/${id}`);
  },

  getProductStock: async (productId: number): Promise<ProductStockDto> => {
    const res = await axiosInstance.get<ProductStockDto>(`${BASE_URL}/products/${productId}/stock`);
    return res.data;
  },
};
