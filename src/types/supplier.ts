// src/types/supplier.ts

// Read DTO - Returned from API
export interface SupplierReadDto {
  id: number;
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
  isActive: boolean;
}

// Create DTO - Sent to API
export interface SupplierCreateDto {
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
}

// Update DTO - Sent to API
export interface SupplierUpdateDto {
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  address?: string;
  notes?: string;
  isActive: boolean;
}
