// src/types/inventory/category.ts

export interface CategoryReadDto {
  id: number;
  name: string;
  description?: string;
  isActive: boolean;
}

export interface CategoryCreateDto {
  name: string;
  description?: string;
}

export interface CategoryUpdateDto {
  id: number;
  name: string;
  description?: string;
  isActive: boolean;
}