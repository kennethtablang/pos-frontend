// src/types/stockAdjustment.ts
export interface StockAdjustmentCreateDto {
  productId: number;
  quantity: number; // decimal-capable (JS number)
  unitId?: number | null;
  reason?: string | null;
  isSystemGenerated?: boolean;
}

export interface StockAdjustmentUpdateDto {
  id: number;
  quantity: number;
  unitId?: number | null;
  reason?: string | null;
  isSystemGenerated?: boolean;
}

export interface StockAdjustmentReadDto {
  id: number;
  productId: number;
  productName?: string | null;
  quantity: number;
  unitId?: number | null;
  unitName?: string | null;
  reason?: string | null;
  adjustmentDate: string; 
  adjustedByUserId?: string | null;
  adjustedByUserName?: string | null;
  isSystemGenerated?: boolean;
  inventoryTransactionId?: number | null;
}

export interface StockAdjustmentListDto {
  id: number;
  productName: string;
  quantity: number;
  unitName?: string | null;
  reason?: string | null;
  adjustmentDate: string;
  adjustedByUserName?: string | null;
}
