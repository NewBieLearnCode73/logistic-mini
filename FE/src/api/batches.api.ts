import api from './axios';
import type { PaginatedResponse, PaginationParams } from '../types/common.types';
import type { Batch, BatchQrCode, TimelineEvent, CreateBatchDto } from '../types/batch.types';

export interface GetBatchesParams extends PaginationParams {
  productId?: string;
  status?: string;
  search?: string;
}

export const batchesApi = {
  getList: (params?: GetBatchesParams) =>
    api.get<PaginatedResponse<Batch>>('/batches', { params }),

  getDetail: (id: string) =>
    api.get<Batch & { qrCode: BatchQrCode | null }>(`/batches/${id}`),

  getTimeline: (id: string) =>
    api.get<TimelineEvent[]>(`/batches/${id}/timeline`),

  create: (data: CreateBatchDto) =>
    api.post<Batch>('/batches', data),

  sell: (id: string, data: { quantity: number }) =>
    api.post<void>(`/batches/${id}/sell`, data),

  regenerateQr: (id: string) =>
    api.post<BatchQrCode>(`/batches/${id}/regenerate-qr`),
};
