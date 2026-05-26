import api from './axios';
import type { PaginatedResponse, PaginationParams } from '../types/common.types';
import type { IncidentReport, CreateIncidentDto } from '../types/incident.types';

export const incidentsApi = {
  getList: (params?: PaginationParams) =>
    api.get<PaginatedResponse<IncidentReport>>('/incidents', { params }),

  create: (data: CreateIncidentDto) =>
    api.post<IncidentReport>('/incidents', data),

  confirmLost: (id: string) =>
    api.post<IncidentReport>(`/incidents/${id}/confirm-lost`),

  confirmFound: (id: string) =>
    api.post<IncidentReport>(`/incidents/${id}/confirm-found`),
};
