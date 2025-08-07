// src/types/vatSetting.ts

// Define numeric enum matching backend
export enum TaxType {
  Vatable = 0,
  Exempt = 1,
  ZeroRated = 2,
}

// Human-readable labels for each TaxType
export const TaxTypeLabels: Record<TaxType, string> = {
  [TaxType.Vatable]: "VATable",
  [TaxType.Exempt]: "VAT-Exempt",
  [TaxType.ZeroRated]: "Zero-Rated",
};

// DTO received from GET endpoints
export interface VatSettingReadDto {
  id: number;
  name: string;
  rate: number;
  taxType: TaxType;
  isVatInclusive: boolean;
  description?: string;
  isActive: boolean;
}

// DTO used to CREATE a new record (id omitted)
export interface VatSettingCreateDto {
  name: string;
  rate: number;
  taxType: TaxType;
  isVatInclusive: boolean;
  description?: string;
}

// DTO used to UPDATE an existing record (id required)
export interface VatSettingUpdateDto {
  id: number;
  name: string;
  rate: number;
  taxType: TaxType;
  isVatInclusive: boolean;
  description?: string;
  isActive: boolean;
}
