// src/types/businessProfile.ts

/** Data returned by GET /api/settings/businessprofile */
export interface BusinessProfileReadDto {
  id: number;
  storeName: string;
  vatRegisteredTIN: string;
  birPermitNumber?: string;
  serialNumber?: string;
  min?: string;
  address?: string;
  contactEmail?: string;
  contactPhone?: string;
  createdAt: string;  // ISO date
  updatedAt: string;  // ISO date
}

/** Payload for creating a new profile */
export interface BusinessProfileCreateDto {
  storeName: string;
  vatRegisteredTIN: string;
  birPermitNumber?: string;
  serialNumber?: string;
  min?: string;
  address?: string;
  contactEmail?: string;
  contactPhone?: string;
}

/** Payload for updating an existing profile */
export interface BusinessProfileUpdateDto extends BusinessProfileCreateDto {
  id: number;
}
