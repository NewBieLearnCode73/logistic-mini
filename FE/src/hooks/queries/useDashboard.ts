import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '../../api/dashboard.api';
import { shipmentsApi } from '../../api/shipments.api';
import { batchesApi } from '../../api/batches.api';

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: () => dashboardApi.getStats().then((r) => r.data),
    staleTime: 30_000,
    refetchInterval: 30_000,
  });
}

export function useRecentShipments() {
  return useQuery({
    queryKey: ['shipments', 'recent'],
    queryFn: () => shipmentsApi.getList({ page: 1, limit: 5 }).then((r) => r.data),
    staleTime: 30_000,
  });
}

export function useRecentBatches() {
  return useQuery({
    queryKey: ['batches', 'recent'],
    queryFn: () => batchesApi.getList({ page: 1, limit: 5 }).then((r) => r.data),
    staleTime: 60_000,
  });
}

export function useFinancialReport(params: {
  period: 'today' | 'month' | 'quarter' | 'year' | 'custom';
  startDate?: string;
  endDate?: string;
}) {
  return useQuery({
    queryKey: ['reports', 'financial', params],
    queryFn: () => dashboardApi.getFinancialReport(params).then((r) => r.data),
    staleTime: 10_000,
    enabled: params.period !== 'custom' || (!!params.startDate && !!params.endDate),
  });
}
