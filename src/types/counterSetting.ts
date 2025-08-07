// src/types/counterSetting.ts

export interface CounterReadDto {
  id: number;
  name: string;
  description?: string | null;
  terminalIdentifier?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CounterCreateDto {
  name: string;
  description?: string;
  terminalIdentifier?: string;
}

export interface CounterUpdateDto {
  name: string;
  description?: string;
  terminalIdentifier?: string;
  isActive: boolean;
}
