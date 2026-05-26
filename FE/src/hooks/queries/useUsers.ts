import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi, type GetUsersParams } from '../../api/users.api';
import type { CreateUserDto, UpdateUserDto } from '../../types/auth.types';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

export function useUsersList(params?: GetUsersParams) {
  return useQuery({
    queryKey: ['users', params],
    queryFn: () => usersApi.getList(params).then((r) => r.data),
    staleTime: 60_000, // 1 minute stale time is sufficient for users
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (data: CreateUserDto) => usersApi.create(data).then((r) => r.data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success(res.message || t('common.success'));
    },
    onError: (error: any) => {
      const serverMessage = error.response?.data?.message;
      const formattedMessage = Array.isArray(serverMessage) ? serverMessage.join(', ') : serverMessage;
      toast.error(formattedMessage || t('errors.serverError'));
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserDto }) =>
      usersApi.update(id, data).then((r) => r.data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success(res.message || t('common.success'));
    },
    onError: (error: any) => {
      const serverMessage = error.response?.data?.message;
      const formattedMessage = Array.isArray(serverMessage) ? serverMessage.join(', ') : serverMessage;
      toast.error(formattedMessage || t('errors.serverError'));
    },
  });
}

export function useToggleActiveUser() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (id: string) => usersApi.toggleActive(id).then((r) => r.data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success(res.message || t('common.success'));
    },
    onError: (error: any) => {
      const serverMessage = error.response?.data?.message;
      const formattedMessage = Array.isArray(serverMessage) ? serverMessage.join(', ') : serverMessage;
      toast.error(formattedMessage || t('errors.serverError'));
    },
  });
}

export function useResetPasswordUser() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (id: string) => usersApi.resetPassword(id).then((r) => r.data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success(res.message || t('common.success'));
    },
    onError: (error: any) => {
      const serverMessage = error.response?.data?.message;
      const formattedMessage = Array.isArray(serverMessage) ? serverMessage.join(', ') : serverMessage;
      toast.error(formattedMessage || t('errors.serverError'));
    },
  });
}
