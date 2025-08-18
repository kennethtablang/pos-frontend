// src/services/purchaseOrderService.ts
import axiosInstance from "./axiosInstance";
import type {
  PurchaseOrderReadDto,
  PurchaseOrderCreateDto,
  PurchaseOrderUpdateDto,
  ReceiveStockCreateDto,
} from "@/types/purchaseOrder";

const BASE_URL = "/PurchaseOrders";

export const purchaseOrderService = {
  getAll: async (): Promise<PurchaseOrderReadDto[]> => {
    const res = await axiosInstance.get<PurchaseOrderReadDto[]>(BASE_URL);
    return res.data;
  },

  getById: async (id: number): Promise<PurchaseOrderReadDto> => {
    const res = await axiosInstance.get<PurchaseOrderReadDto>(`${BASE_URL}/${id}`);
    return res.data;
  },

  create: async (dto: PurchaseOrderCreateDto): Promise<PurchaseOrderReadDto> => {
    const res = await axiosInstance.post<PurchaseOrderReadDto>(BASE_URL, dto);
    return res.data;
  },

  update: async (id: number, dto: PurchaseOrderUpdateDto): Promise<PurchaseOrderReadDto> => {
    const res = await axiosInstance.put<PurchaseOrderReadDto>(`${BASE_URL}/${id}`, dto);
    return res.data;
  },

  delete: async (id: number): Promise<void> => {
    await axiosInstance.delete(`${BASE_URL}/${id}`);
  },

  // Convenience filtering (if server supports query params)
  getBySupplier: async (supplierId: number): Promise<PurchaseOrderReadDto[]> => {
    const res = await axiosInstance.get<PurchaseOrderReadDto[]>(BASE_URL, { params: { supplierId } });
    return res.data;
  },

  getByStatus: async (status: number): Promise<PurchaseOrderReadDto[]> => {
    const res = await axiosInstance.get<PurchaseOrderReadDto[]>(BASE_URL, { params: { status } });
    return res.data;
  },

  // POST /api/PurchaseOrders/receive
  receiveStock: async (dto: ReceiveStockCreateDto): Promise<void> => {
    await axiosInstance.post(`${BASE_URL}/receive`, dto);
  },

  // ---- New helpers for pending receivings / posting to inventory (match PurchaseOrdersController) ----
  // GET /api/PurchaseOrders/pending
  getPendingReceivings: async (): Promise<PurchaseOrderReadDto[]> => {
    const res = await axiosInstance.get<PurchaseOrderReadDto[]>(`${BASE_URL}/pending`);
    return res.data;
  },

  // POST /api/PurchaseOrders/{poId}/post
  postReceivedToInventory: async (purchaseOrderId: number): Promise<void> => {
    await axiosInstance.post(`${BASE_URL}/${purchaseOrderId}/post`);
  },

  // ---- Existing helpers used by details page ----
  removeItem: async (itemId: number): Promise<void> => {
    await axiosInstance.delete(`${BASE_URL}/items/${itemId}`);
  },

  deleteReceivedStock: async (receivedId: number): Promise<void> => {
    await axiosInstance.delete(`${BASE_URL}/received/${receivedId}`);
  },
};
