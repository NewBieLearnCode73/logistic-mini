import api from './axios';
import type { PaginatedResponse, PaginationParams } from '../types/common.types';
import type { AuditLog } from '../types/audit.types';

export const auditApi = {
  getList: (params?: PaginationParams) =>
    api.get<PaginatedResponse<AuditLog>>('/audit-logs', { params }),
};
