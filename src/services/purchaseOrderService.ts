// src/services/purchaseOrderService.ts
import axiosInstance from "./axiosInstance";
import type {
  PurchaseOrderReadDto,
  PurchaseOrderCreateDto,
  PurchaseOrderUpdateDto,
  PurchaseItemCreateDto,
  PurchaseItemReadDto,
  PurchaseItemUpdateDto,
  ReceivedStockCreateDto,
  ReceivedStockReadDto,
} from "@/types/purchaseOrder";

/**
 * Base URL — adjust if your backend controller route differs.
 * axiosInstance typically prefixes '/api' so this resolves to '/api/purchase-orders'
 */
const BASE_URL = "/PurchaseOrder";

export const purchaseOrderService = {
  // Purchase Orders
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

  update: async (id: number, dto: PurchaseOrderUpdateDto): Promise<void> => {
    await axiosInstance.put(`${BASE_URL}/${id}`, dto);
  },

  delete: async (id: number): Promise<void> => {
    await axiosInstance.delete(`${BASE_URL}/${id}`);
  },

  // Purchase Items (subresource)
  addItem: async (purchaseOrderId: number, dto: PurchaseItemCreateDto): Promise<PurchaseItemReadDto> => {
    const res = await axiosInstance.post<PurchaseItemReadDto>(`${BASE_URL}/${purchaseOrderId}/items`, dto);
    return res.data;
  },

  updateItem: async (id: number, dto: PurchaseItemUpdateDto): Promise<void> => {
    await axiosInstance.put(`${BASE_URL}/items/${id}`, dto);
  },

  removeItem: async (id: number): Promise<void> => {
    await axiosInstance.delete(`${BASE_URL}/items/${id}`);
  },

  // Received Stocks (subresource)
  addReceivedStock: async (dto: ReceivedStockCreateDto): Promise<ReceivedStockReadDto> => {
    const res = await axiosInstance.post<ReceivedStockReadDto>(`${BASE_URL}/received`, dto);
    return res.data;
  },

  deleteReceivedStock: async (id: number): Promise<void> => {
    await axiosInstance.delete(`${BASE_URL}/received/${id}`);
  },

  // Optional helpers: fetch POs by supplier or status (implement server-side if needed)
  getBySupplier: async (supplierId: number): Promise<PurchaseOrderReadDto[]> => {
    const res = await axiosInstance.get<PurchaseOrderReadDto[]>(`${BASE_URL}`, { params: { supplierId } });
    return res.data;
  },

  getByStatus: async (status: number): Promise<PurchaseOrderReadDto[]> => {
    const res = await axiosInstance.get<PurchaseOrderReadDto[]>(`${BASE_URL}`, { params: { status } });
    return res.data;
  },
};
