// src/services/stockReceiveService.ts
import axiosInstance from "./axiosInstance";
import type { StockReceiveReadDto } from "@/types/stockReceive";

const BASE = "/stockreceives";

export const stockReceiveService = {
  getAll: async (): Promise<StockReceiveReadDto[]> => {
    const res = await axiosInstance.get<StockReceiveReadDto[]>(BASE);
    return res.data;
  },

  getByPurchaseOrderId: async (poId: number): Promise<StockReceiveReadDto[]> => {
    const res = await axiosInstance.get<StockReceiveReadDto[]>(`${BASE}/by-po/${poId}`);
    return res.data;
  },

  // Create a StockReceive from ReceivedStock rows (server will handle OnHand / InventoryTransaction)
  createFromPo: async (
    poId: number,
    allowOverReceive = false
  ): Promise<StockReceiveReadDto> => {
    const res = await axiosInstance.post<StockReceiveReadDto>(
      `${BASE}/from-po/${poId}`,
      null,
      { params: { allowOverReceive } }
    );
    return res.data;
  },

  delete: async (id: number): Promise<void> => {
    await axiosInstance.delete(`${BASE}/${id}`);
  },
};
