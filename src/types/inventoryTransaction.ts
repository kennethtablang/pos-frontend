// src/types/inventoryTransaction.ts

export enum InventoryActionType {
  StockIn = 0,
  Sale = 1,
  Return = 2,
  Transfer = 3,
  Adjustment = 4,
  BadOrder = 5,
  VoidedSale = 6,
  // keep in sync with backend enum
}

export interface InventoryTransactionReadDto {
  id: number;
  productId: number;
  productName?: string | null;
  actionType: InventoryActionType;
  quantity: number; // signed quantity as stored by server
  unitCost?: number | null;
  referenceNumber?: string | null;
  remarks?: string | null;
  transactionDate: string; // ISO string
  performedByUserId?: string | null;
  performedByUserName?: string | null;
}

export interface InventoryTransactionCreateDto {
  productId: number;
  actionType: InventoryActionType;
  quantity: number; // positive absolute amount; server will sign/normalize
  unitCost?: number | null;
  referenceNumber?: string | null;
  remarks?: string | null;
  transactionDate?: string; // ISO optional
}

export interface InventoryTransactionUpdateDto {
  quantity?: number;
  unitCost?: number | null;
  referenceNumber?: string | null;
  remarks?: string | null;
  transactionDate?: string;
}

export interface ProductStockDto {
  productId: number;
  onHand: number;
  reserved: number;
}
