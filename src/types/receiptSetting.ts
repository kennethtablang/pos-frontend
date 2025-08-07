// src/types/receiptSetting.ts

export interface ReceiptSettingReadDto {
  id: number;
  headerMessage?: string | null;
  footerMessage?: string | null;
  logoUrl?: string | null;
  receiptSize?: string | null;
  showVatBreakdown: boolean;
  showSerialAndPermitNumber: boolean;
  showItemCode: boolean;
  isActive: boolean;
}

export interface ReceiptSettingCreateDto {
  headerMessage?: string;
  footerMessage?: string;
  logoUrl?: string;
  receiptSize?: string;
  showVatBreakdown: boolean;
  showSerialAndPermitNumber: boolean;
  showItemCode: boolean;
}

export interface ReceiptSettingUpdateDto {
  headerMessage?: string;
  footerMessage?: string;
  logoUrl?: string;
  receiptSize?: string;
  showVatBreakdown: boolean;
  showSerialAndPermitNumber: boolean;
  showItemCode: boolean;
  isActive: boolean;
}
