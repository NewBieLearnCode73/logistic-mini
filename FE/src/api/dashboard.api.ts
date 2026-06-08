import api from './axios';

export interface DashboardStats {
  totalInventory: number;
  activeShipments: number;
  incidents: number;
}

export const dashboardApi = {
  getStats: () => api.get<DashboardStats>('/dashboard/stats'),
  exportReport: (data: {
    reportType: 'inventory' | 'shipments' | 'incidents';
    format: 'csv' | 'pdf' | 'xlsx';
    period?: 'today' | 'month' | 'quarter' | 'year' | 'custom';
    startDate?: string;
    endDate?: string;
  }) =>
    api.post('/reports/export', data, { responseType: 'blob' }),
};
