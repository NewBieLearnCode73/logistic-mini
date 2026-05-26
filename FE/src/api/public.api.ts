import api from './axios';
import type { PublicTraceResponse } from '../types/public.types';

export const publicApi = {
  getTrace: (batchCode: string, coords?: { lat?: number; lng?: number }) =>
    api.get<PublicTraceResponse>(`/public/trace/${batchCode}`, {
      params: coords,
    }),
};
