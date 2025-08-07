//src/types/unit.ts

export interface UnitReadDto {
  id: number;
  name: string;
  abbreviation?: string;
  unitType?: string;
  allowsDecimal: boolean;
  isActive: boolean;
}

export interface UnitCreateDto {
  name: string;
  abbreviation?: string;
  unitType?: string;
  allowsDecimal?: boolean;
}

export interface UnitUpdateDto {
  id: number;
  name: string;
  abbreviation?: string;
  unitType?: string;
  allowsDecimal?: boolean;
  isActive: boolean;
}