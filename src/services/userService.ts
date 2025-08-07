import axiosInstance from "./axiosInstance";
import type {
  UserCreateDto,
  UserReadDto,
  UserUpdateDto,
} from "../types/user";

const BASE_URL = "/account/users";

/**
 * userService handles all HTTP requests related to user management.
 */
export const userService = {
  /**
   * Fetch all users from the backend.
   * @returns Promise<UserReadDto[]>
   */
  getAll: async (): Promise<UserReadDto[]> => {
    const response = await axiosInstance.get<UserReadDto[]>(BASE_URL);
    return response.data;
  },

  /**
   * Fetch a specific user by ID.
   * @param id - user ID
   * @returns Promise<UserReadDto>
   */
  getById: async (id: string): Promise<UserReadDto> => {
    const response = await axiosInstance.get<UserReadDto>(`${BASE_URL}/${id}`);
    return response.data;
  },

  /**
   * Create a new user.
   * @param data - user creation payload
   */
  create: async (data: UserCreateDto): Promise<void> => {
    await axiosInstance.post(BASE_URL, data);
  },

  /**
   * Update an existing user.
   * @param data - user update payload
   */
  update: async (data: UserUpdateDto): Promise<void> => {
    await axiosInstance.put(BASE_URL, data);
  },

  /**
   * Deactivate a user by ID.
   * @param id - user ID
   */
  deactivate: async (id: string): Promise<void> => {
    await axiosInstance.put(`${BASE_URL}/deactivate/${id}`);
  },
};
