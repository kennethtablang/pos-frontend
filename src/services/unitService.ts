//src/services/unitService.ts

import axios from './axiosInstance';
import type {
  UnitReadDto,
  UnitCreateDto,
  UnitUpdateDto,
} from '../types/unit';

const baseUrl = '/units';

export const unitService = {
  getAll: async (): Promise<UnitReadDto[]> => {
    const response = await axios.get<UnitReadDto[]>(baseUrl);
    return response.data;
  },

  getById: async (id: number): Promise<UnitReadDto> => {
    const response = await axios.get<UnitReadDto>(`${baseUrl}/${id}`);
    return response.data;
  },

  create: async (dto: UnitCreateDto): Promise<UnitReadDto> => {
    const response = await axios.post<UnitReadDto>(baseUrl, dto);
    return response.data;
  },

  update: async (dto: UnitUpdateDto): Promise<void> => {
    await axios.put(`${baseUrl}/${dto.id}`, dto);
  },

  deactivate: async (id: number): Promise<void> => {
    await axios.patch(`${baseUrl}/${id}/deactivate`);
  },
};