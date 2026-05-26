import { useQuery } from '@tanstack/react-query';
import { auditApi } from '../../api/audit.api';

export function useAuditLogsList(params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: ['audit-logs', params],
    queryFn: () => auditApi.getList(params).then((r) => r.data),
    staleTime: 30_000,
  });
}
