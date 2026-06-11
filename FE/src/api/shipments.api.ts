import api from './axios';
import type { PaginatedResponse, PaginationParams } from '../types/common.types';
import type { Shipment, CreateShipmentDto } from '../types/shipment.types';

export const shipmentsApi = {
  getList: (params?: PaginationParams & { status?: string }) =>
    api.get<PaginatedResponse<Shipment>>('/shipments', { params }),

  getDetail: (id: string) =>
    api.get<Shipment>(`/shipments/${id}`),

  create: (data: CreateShipmentDto) =>
    api.post<Shipment>('/shipments', data),

  receive: (id: string, data?: any) =>
    api.patch<Shipment>(`/shipments/${id}/receive`, data),
};
