import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { shipmentsApi } from '../../api/shipments.api';
import type { CreateShipmentDto } from '../../types/shipment.types';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

export function useShipmentsList(params?: { page?: number; limit?: number; status?: string }) {
  return useQuery({
    queryKey: ['shipments', params],
    queryFn: () => shipmentsApi.getList(params).then((r) => r.data),
    staleTime: 30_000,
  });
}

export function useShipmentDetail(id: string) {
  return useQuery({
    queryKey: ['shipments', id],
    queryFn: () => shipmentsApi.getDetail(id).then((r) => r.data),
    enabled: !!id,
  });
}

export function useCreateShipment() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (data: CreateShipmentDto) => shipmentsApi.create(data).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shipments'] });
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

export function useReceiveShipment() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (id: string) => shipmentsApi.receive(id).then((r) => r.data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['shipments'] });
      queryClient.invalidateQueries({ queryKey: ['shipments', data.id] });
      queryClient.invalidateQueries({ queryKey: ['batches'] });
      queryClient.invalidateQueries({ queryKey: ['batches', data.batchId] });
      queryClient.invalidateQueries({ queryKey: ['batches', data.batchId, 'timeline'] });
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
