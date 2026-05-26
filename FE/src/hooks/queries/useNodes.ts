import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { nodesApi, type GetNodesParams } from '../../api/nodes.api';
import type { CreateNodeDto, UpdateNodeDto } from '../../types/node.types';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

export function useNodesList(params?: GetNodesParams) {
  return useQuery({
    queryKey: ['nodes', params],
    queryFn: () => nodesApi.getList(params).then((r) => r.data),
    staleTime: 5 * 60_000, // 5 minutes stale time as specified in architecture
  });
}

export function useCreateNode() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (data: CreateNodeDto) => nodesApi.create(data).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nodes'] });
      toast.success(t('common.success'));
    },
    onError: (error: any) => {
      const serverMessage = error.response?.data?.message;
      const formattedMessage = Array.isArray(serverMessage) ? serverMessage.join(', ') : serverMessage;
      toast.error(formattedMessage || t('errors.serverError'));
    },
  });
}

export function useUpdateNode() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateNodeDto }) =>
      nodesApi.update(id, data).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nodes'] });
      toast.success(t('common.success'));
    },
    onError: (error: any) => {
      if (error.response?.status === 409) {
        toast.error(t('errors.conflict'));
      } else {
        const serverMessage = error.response?.data?.message;
        const formattedMessage = Array.isArray(serverMessage) ? serverMessage.join(', ') : serverMessage;
        toast.error(formattedMessage || t('errors.serverError'));
      }
    },
  });
}

export function useDeleteNode() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (id: string) => nodesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nodes'] });
      toast.success(t('common.success'));
    },
    onError: (error: any) => {
      const serverMessage = error.response?.data?.message;
      const formattedMessage = Array.isArray(serverMessage) ? serverMessage.join(', ') : serverMessage;
      toast.error(formattedMessage || t('errors.serverError'));
    },
  });
}
