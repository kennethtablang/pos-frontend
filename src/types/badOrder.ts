// src/types/badOrder.ts

export interface BadOrderCreateDto {
  productId: number;
  quantity: number; // integer
  reason: string;
  remarks?: string | null;
  badOrderDate?: string; // ISO date optional; server defaults to UtcNow
  // reportedByUserId will be set by the server (we send empty or leave out)
  reportedByUserId?: string;
}

export interface BadOrderUpdateDto {
  quantity: number;
  reason: string;
  remarks?: string | null;
  badOrderDate?: string;
}

export interface BadOrderReadDto {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  reason: string;
  remarks?: string | null;
  badOrderDate: string; // ISO string
  reportedByUserId: string;
  reportedByUserName: string;
  inventoryTransactionId?: number | null;
  isSystemGenerated: boolean;
}
