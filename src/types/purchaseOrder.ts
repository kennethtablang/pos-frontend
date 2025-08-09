// src/types/purchaseOrder.ts
export enum PurchaseOrderStatus {
  Draft = 0,
  Ordered = 1,
  PartiallyReceived = 2,
  Cancelled = 3,
  Received = 4,
}

export const PurchaseOrderStatusLabels: Record<PurchaseOrderStatus, string> = {
  [PurchaseOrderStatus.Draft]: "Draft",
  [PurchaseOrderStatus.Ordered]: "Ordered",
  [PurchaseOrderStatus.PartiallyReceived]: "Partially Received",
  [PurchaseOrderStatus.Cancelled]: "Cancelled",
  [PurchaseOrderStatus.Received]: "Received",
};

export interface PurchaseItemReadDto {
  id: number;
  purchaseOrderId: number;
  productId: number;
  productName?: string;
  costPerUnit: number;
  quantity: number;
  receivedQuantity: number;
  notes?: string | null;
  totalCost?: number;
}

export interface PurchaseItemCreateDto {
  productId: number;
  costPerUnit: number;
  quantity: number;
  notes?: string;
}

export interface PurchaseItemUpdateDto {
  costPerUnit: number;
  quantity: number;
  notes?: string;
}

export interface ReceivedStockReadDto {
  id: number;
  purchaseOrderId: number;
  productId: number;
  productName?: string;
  quantityReceived: number;
  receivedDate: string;
  referenceNumber?: string | null;
  notes?: string | null;
  receivedByUserName?: string | null;
}

export interface ReceivedStockCreateDto {
  purchaseOrderId: number;
  productId: number;
  quantityReceived: number;
  receivedDate?: string; 
  referenceNumber?: string;
  notes?: string;
}

export interface PurchaseOrderReadDto {
  id: number;
  supplierId: number;
  supplierName?: string;
  purchaseOrderNumber: string;
  orderDate: string;
  isReceived: boolean;
  remarks?: string | null;
  status: PurchaseOrderStatus;
  expectedDeliveryDate?: string | null;
  totalCost: number;
  purchaseItems: PurchaseItemReadDto[];
  receivedStocks: ReceivedStockReadDto[];
  createdAt: string;
  createdByUserName?: string | null;
}

export interface PurchaseOrderCreateDto {
  supplierId: number;
  remarks?: string;
  expectedDeliveryDate?: string;
  purchaseItems?: PurchaseItemCreateDto[];
}

export interface PurchaseOrderUpdateDto {
  supplierId: number;
  remarks?: string;
  expectedDeliveryDate?: string;
  status: PurchaseOrderStatus;
}