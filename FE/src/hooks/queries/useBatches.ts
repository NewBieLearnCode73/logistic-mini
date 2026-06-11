import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { batchesApi, type GetBatchesParams } from '../../api/batches.api';
import type { CreateBatchDto } from '../../types/batch.types';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

export function useBatchesList(params?: GetBatchesParams) {
  return useQuery({
    queryKey: ['batches', params],
    queryFn: () => batchesApi.getList(params).then((r) => r.data),
    staleTime: 30_000, // 30 seconds stale time
  });
}

export function useBatchDetail(id: string) {
  return useQuery({
    queryKey: ['batches', id],
    queryFn: () => batchesApi.getDetail(id).then((r) => r.data),
    enabled: !!id,
  });
}

export function useBatchTimeline(id: string) {
  return useQuery({
    queryKey: ['batches', id, 'timeline'],
    queryFn: () => batchesApi.getTimeline(id).then((r) => r.data),
    enabled: !!id,
  });
}

export function useCreateBatch() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (data: CreateBatchDto) => batchesApi.create(data).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['batches'] });
      toast.success(t('common.success'));
    },
    onError: (error: any) => {
      const serverMessage = error.response?.data?.message;
      const formattedMessage = Array.isArray(serverMessage) ? serverMessage.join(', ') : serverMessage;
      toast.error(formattedMessage || t('errors.serverError'));
    },
  });
}

export function useSellBatch() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: ({ id, quantity, saleDate, salePrice, costPrice }: { id: string; quantity: number; saleDate?: string; salePrice?: number; costPrice?: number }) =>
      batchesApi.sell(id, { quantity, saleDate, salePrice, costPrice }),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['batches'] });
      queryClient.invalidateQueries({ queryKey: ['batches', id] });
      queryClient.invalidateQueries({ queryKey: ['batches', id, 'timeline'] });
      // Invalidate dashboard stats since sold batches reduce active inventory
      queryClient.invalidateQueries({ queryKey: ['dashboard', 'stats'] });
      toast.success(t('common.success'));
    },
    onError: (error: any) => {
      const serverMessage = error.response?.data?.message;
      const formattedMessage = Array.isArray(serverMessage) ? serverMessage.join(', ') : serverMessage;
      toast.error(formattedMessage || t('errors.serverError'));
    },
  });
}

export function useRegenerateQR() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (id: string) => batchesApi.regenerateQr(id).then((r) => r.data),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['batches', id] });
      toast.success(t('qr.regenerateSuccess'));
    },
    onError: (error: any) => {
      const serverMessage = error.response?.data?.message;
      const formattedMessage = Array.isArray(serverMessage) ? serverMessage.join(', ') : serverMessage;
      toast.error(formattedMessage || t('errors.serverError'));
    },
  });
}
