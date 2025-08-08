// src/types/productUnitConversion.ts

export interface ProductUnitConversionReadDto {
  id: number;
  productId: number;
  productName?: string | null;
  fromUnitId: number;
  fromUnitName?: string | null;
  toUnitId: number;
  toUnitName?: string | null;
  conversionRate: number;
  notes?: string | null;
}

export interface ProductUnitConversionCreateDto {
  productId: number;
  fromUnitId: number;
  toUnitId: number;
  conversionRate: number;
  notes?: string;
}

export interface ProductUnitConversionUpdateDto {
  id: number;
  productId: number;
  fromUnitId: number;
  toUnitId: number;
  conversionRate: number;
  notes?: string;
}
