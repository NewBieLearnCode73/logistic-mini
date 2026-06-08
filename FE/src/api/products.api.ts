import api from './axios';
import type { PaginatedResponse, PaginationParams } from '../types/common.types';
import type { Product, CreateProductDto, UpdateProductDto } from '../types/product.types';

export interface GetProductsParams extends PaginationParams {
  search?: string;
  category?: string;
  isActive?: boolean | 'all';
}

export const productsApi = {
  getList: (params?: GetProductsParams) =>
    api.get<PaginatedResponse<Product>>('/products', { params }),

  getDetail: (id: string) =>
    api.get<Product>(`/products/${id}`),

  create: (data: CreateProductDto) =>
    api.post<Product>('/products', data),

  update: (id: string, data: UpdateProductDto) =>
    api.put<Product>(`/products/${id}`, data),

  delete: (id: string) =>
    api.delete<void>(`/products/${id}`),
};
