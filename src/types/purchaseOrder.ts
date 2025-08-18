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

// Item DTOs used by create/update
export interface PurchaseOrderItemCreateDto {
  productId: number;
  unitId: number;
  quantityOrdered: number; // decimal
  unitCost: number; // decimal
  remarks?: string;
}

export interface PurchaseOrderItemUpdateDto {
  id?: number | null; // null or undefined -> new line
  productId: number;
  unitId: number;
  quantityOrdered: number;
  unitCost: number;
  remarks?: string;
}

// Read DTO for items (from backend)
export interface PurchaseOrderItemReadDto {
  id: number;
  productId: number;
  productName?: string;
  unitId: number;
  unitName?: string;
  quantityOrdered: number;
  quantityReceived: number;
  unitCost: number;
  remarks?: string;
  // convenience
  remainingOrdered?: number;
  isClosed?: boolean;
}

// Received stock record (read DTO)
export interface ReceivedStockReadDto {
  id: number;
  purchaseOrderId: number;
  purchaseOrderItemId: number;
  productId: number;
  productName?: string;
  quantityReceived: number;
  receivedDate: string; // ISO string
  referenceNumber?: string | null;
  notes?: string | null;
  receivedByUserId?: string | null;
  receivedByUserName?: string | null;
  processed?: boolean;
}

// Receive DTO used when posting a receive action
export interface ReceiveStockCreateDto {
  purchaseOrderId: number;
  purchaseOrderItemId: number;
  quantityReceived: number;      // decimal, can be fractional
  receivedDate?: string;         // ISO date string (optional)
  referenceNumber?: string;
  notes?: string;
}

// MAIN DTOs
export interface PurchaseOrderCreateDto {
  supplierId: number;
  // optional: backend can generate if omitted
  purchaseOrderNumber?: string;
  orderDate?: string; // optional (server defaults to UtcNow)
  expectedDeliveryDate?: string;
  remarks?: string;
  items?: PurchaseOrderItemCreateDto[];
}

export interface PurchaseOrderUpdateDto {
  id: number; // required for update (server checks id)
  supplierId: number;
  purchaseOrderNumber: string;
  expectedDeliveryDate?: string;
  remarks?: string;
  items: PurchaseOrderItemUpdateDto[]; // required by backend
}

export interface PurchaseOrderReadDto {
  id: number;
  supplierId: number;
  supplierName?: string;
  purchaseOrderNumber: string;
  orderDate: string;
  expectedDeliveryDate?: string | null;
  remarks?: string | null;
  totalCost: number;
  items: PurchaseOrderItemReadDto[];
  receivedStocks?: ReceivedStockReadDto[];
  status?: PurchaseOrderStatus;
  createdByUserId?: string | null;
  createdByUserName?: string | null;
  createdAt: string;
}
