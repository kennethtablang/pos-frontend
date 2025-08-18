// src/types/stockReceive.ts

export interface StockReceiveItemReadDto {
  id: number;
  stockReceiveId: number;
  purchaseOrderId: number;

  productId: number;
  productName?: string;

  fromUnitId?: number | null;
  fromUnitName?: string | null;

  quantityInFromUnit: number;
  quantity: number;

  unitCost?: number | null;
  batchNumber?: string | null;
  expiryDate?: string | null;

  remarks?: string | null;

  inventoryTransactionId?: number | null;
  receivedDate: string; // ISO
  receivedByUserId: string;
  receivedByUserName?: string | null;
}

export interface StockReceiveReadDto {
  id: number;
  purchaseOrderId: number;
  purchaseOrderNumber?: string;
  receivedDate: string; // ISO
  receivedByUserId: string;
  receivedByUserName?: string | null;
  referenceNumber?: string | null;
  remarks?: string | null;
  items: StockReceiveItemReadDto[];
}
