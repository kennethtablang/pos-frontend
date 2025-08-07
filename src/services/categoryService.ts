//src/services/categoryService.ts

import axios from '../services/axiosInstance';
import type{
  CategoryReadDto,
  CategoryCreateDto,
  CategoryUpdateDto,
} from '@/types/category';

const baseUrl = '/category';

export const categoryService = {
  getAll: async (): Promise<CategoryReadDto[]> => {
    const response = await axios.get<CategoryReadDto[]>(baseUrl);
    return response.data;
  },

  getById: async (id: number): Promise<CategoryReadDto> => {
    const response = await axios.get<CategoryReadDto>(`${baseUrl}/${id}`);
    return response.data;
  },

  create: async (dto: CategoryCreateDto): Promise<CategoryReadDto> => {
    const response = await axios.post<CategoryReadDto>(baseUrl, dto);
    return response.data;
  },

  update: async (dto: CategoryUpdateDto): Promise<void> => {
    await axios.put(`${baseUrl}/${dto.id}`, dto);
  },

  deactivate: async (id: number): Promise<void> => {
    await axios.patch(`${baseUrl}/${id}/deactivate`);
  },
};
