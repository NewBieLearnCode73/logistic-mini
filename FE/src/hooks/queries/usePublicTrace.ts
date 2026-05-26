import { useQuery } from '@tanstack/react-query';
import { publicApi } from '../../api/public.api';

export function usePublicTrace(
  batchCode: string,
  coords?: { lat?: number; lng?: number },
  enabled = true
) {
  return useQuery({
    queryKey: ['public-trace', batchCode, coords],
    queryFn: () => publicApi.getTrace(batchCode, coords).then((r) => r.data),
    staleTime: 30_000, // 30 seconds stale time
    enabled: enabled && !!batchCode,
    retry: false, // Don't retry if the code is not found (avoids noise)
  });
}
