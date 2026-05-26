import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productsApi, type GetProductsParams } from '../../api/products.api';
import type { CreateProductDto, UpdateProductDto } from '../../types/product.types';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

export function useProductsList(params?: GetProductsParams) {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => productsApi.getList(params).then((r) => r.data),
    staleTime: 5 * 60_000, // 5 minutes stale time
  });
}

export function useProductDetail(id: string) {
  return useQuery({
    queryKey: ['products', id],
    queryFn: () => productsApi.getDetail(id).then((r) => r.data),
    enabled: !!id,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (data: CreateProductDto) => productsApi.create(data).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success(t('common.success'));
    },
    onError: (error: any) => {
      const serverMessage = error.response?.data?.message;
      const formattedMessage = Array.isArray(serverMessage) ? serverMessage.join(', ') : serverMessage;
      toast.error(formattedMessage || t('errors.serverError'));
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProductDto }) =>
      productsApi.update(id, data).then((r) => r.data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['products', id] });
      toast.success(t('common.success'));
    },
    onError: (error: any) => {
      const serverMessage = error.response?.data?.message;
      const formattedMessage = Array.isArray(serverMessage) ? serverMessage.join(', ') : serverMessage;
      toast.error(formattedMessage || t('errors.serverError'));
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (id: string) => productsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast.success(t('common.success'));
    },
    onError: (error: any) => {
      const serverMessage = error.response?.data?.message;
      const formattedMessage = Array.isArray(serverMessage) ? serverMessage.join(', ') : serverMessage;
      toast.error(formattedMessage || t('errors.serverError'));
    },
  });
}
