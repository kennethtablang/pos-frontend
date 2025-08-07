// File: src/services/productService.ts
import axios from '@/services/axiosInstance';
import type{
  ProductReadDto,
  ProductCreateDto,
  ProductUpdateDto,
} from '@/types/product';

const baseUrl = '/product';

export const productService = {
  getAll: async (): Promise<ProductReadDto[]> => {
    const response = await axios.get<ProductReadDto[]>(baseUrl);
    return response.data;
  },

  getById: async (id: number): Promise<ProductReadDto> => {
    const response = await axios.get<ProductReadDto>(`${baseUrl}/${id}`);
    return response.data;
  },

  create: async (dto: ProductCreateDto): Promise<ProductReadDto> => {
    const response = await axios.post<ProductReadDto>(baseUrl, dto);
    return response.data;
  },

  update: async (dto: ProductUpdateDto): Promise<void> => {
    await axios.put(`${baseUrl}/${dto.id}`, dto);
  },

  deactivate: async (id: number): Promise<void> => {
    await axios.patch(`${baseUrl}/${id}/deactivate`);
  },
};
