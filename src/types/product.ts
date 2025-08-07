// src/types/product.ts

import { TaxType } from "./vatSetting"; // Importing the shared enum

// Optional: Reverse mapping (if needed for displaying string from number)
export const TaxTypeMap = {
  [TaxType.Vatable]: "VATABLE",
  [TaxType.Exempt]: "EXEMPT",
  [TaxType.ZeroRated]: "ZERO_RATED",
} as const;

export type TaxTypeValue = TaxType; // Ensures values are 0 | 1 | 2

export interface ProductReadDto {
  id: number;
  name: string;
  barcode?: string;
  isBarcoded: boolean;
  categoryId: number;
  categoryName?: string;
  unitId: number;
  unitName?: string;
  description?: string;
  price: number;
  taxType: TaxTypeValue;
  isPerishable: boolean;
  reorderLevel?: number;
  isActive: boolean;
  imageBase64?: string;
}

export interface ProductCreateDto {
  name: string;
  barcode?: string;
  isBarcoded?: boolean;
  categoryId: number;
  unitId: number;
  description?: string;
  price: number;
  taxType: TaxTypeValue;
  isPerishable?: boolean;
  reorderLevel?: number;
  imageBase64?: string;
}

export interface ProductUpdateDto {
  id: number;
  isActive: boolean;
  name: string;
  barcode?: string;
  isBarcoded?: boolean;
  categoryId: number;
  unitId: number;
  description?: string;
  price: number;
  taxType: TaxTypeValue;
  isPerishable?: boolean;
  reorderLevel?: number;
  imageBase64?: string;
}
