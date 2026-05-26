import api from './axios';
import type { PaginatedResponse, PaginationParams } from '../types/common.types';
import type { User, CreateUserDto, UpdateUserDto } from '../types/auth.types';

export interface GetUsersParams extends PaginationParams {
  role?: string;
  nodeId?: string;
  isActive?: boolean;
}

export interface UserMutationResponse {
  message: string;
  data: User;
  temporaryPassword?: string;
}

export const usersApi = {
  getList: (params?: GetUsersParams) =>
    api.get<PaginatedResponse<User>>('/users', { params }),

  create: (data: CreateUserDto) =>
    api.post<UserMutationResponse>('/users', data),

  update: (id: string, data: UpdateUserDto) =>
    api.put<UserMutationResponse>(`/users/${id}`, data),

  toggleActive: (id: string) =>
    api.patch<UserMutationResponse>(`/users/${id}/toggle-active`),

  resetPassword: (id: string) =>
    api.post<UserMutationResponse>(`/users/${id}/reset-password`),
};
