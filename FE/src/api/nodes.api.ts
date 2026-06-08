import api from './axios';
import type { PaginatedResponse, PaginationParams } from '../types/common.types';
import type { Node, CreateNodeDto, UpdateNodeDto } from '../types/node.types';

export interface GetNodesParams extends PaginationParams {
  includeInventory?: boolean;
  isActive?: boolean | 'all';
}

export const nodesApi = {
  getList: (params?: GetNodesParams) =>
    api.get<PaginatedResponse<Node>>('/nodes', { params }),

  create: (data: CreateNodeDto) =>
    api.post<Node>('/nodes', data),

  update: (id: string, data: UpdateNodeDto) =>
    api.put<Node>(`/nodes/${id}`, data),

  delete: (id: string) =>
    api.delete<void>(`/nodes/${id}`),

  getDetail: (id: string) =>
    api.get<any>(`/nodes/${id}`),
};
