// src/services/businessProfileService.ts
import axiosInstance from "./axiosInstance";
import type {
  BusinessProfileReadDto,
  BusinessProfileCreateDto,
  BusinessProfileUpdateDto,
} from "@/types/businessProfile";

const BASE = "/settings/businessprofile";

export const businessProfileService = {
  /** Fetch the single business profile (or 404) */
  get: async (): Promise<BusinessProfileReadDto> => {
    const { data } = await axiosInstance.get<BusinessProfileReadDto>(BASE);
    return data;
  },

  /** Create a new profile */
  create: async (dto: BusinessProfileCreateDto): Promise<BusinessProfileReadDto> => {
    const { data } = await axiosInstance.post<BusinessProfileReadDto>(BASE, dto);
    return data;
  },

  /** Update existing profile */
  update: async (dto: BusinessProfileUpdateDto): Promise<void> => {
    await axiosInstance.put(`${BASE}/${dto.id}`, dto);
  },
};
