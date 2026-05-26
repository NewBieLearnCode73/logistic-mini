import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { incidentsApi } from '../../api/incidents.api';
import type { CreateIncidentDto } from '../../types/incident.types';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

export function useIncidentsList(params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: ['incidents', params],
    queryFn: () => incidentsApi.getList(params).then((r) => r.data),
    staleTime: 30_000,
  });
}

export function useCreateIncident() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (data: CreateIncidentDto) => incidentsApi.create(data).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
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

export function useConfirmLostIncident() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (id: string) => incidentsApi.confirmLost(id).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
      queryClient.invalidateQueries({ queryKey: ['shipments'] });
      queryClient.invalidateQueries({ queryKey: ['batches'] });
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

export function useConfirmFoundIncident() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (id: string) => incidentsApi.confirmFound(id).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['incidents'] });
      queryClient.invalidateQueries({ queryKey: ['shipments'] });
      queryClient.invalidateQueries({ queryKey: ['batches'] });
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
