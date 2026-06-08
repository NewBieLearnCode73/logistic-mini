import api from './axios';

export interface DashboardStats {
  totalInventory: number;
  activeShipments: number;
  incidents: number;
}

export const dashboardApi = {
  getStats: () => api.get<DashboardStats>('/dashboard/stats'),
  exportReport: (data: { reportType: 'inventory' | 'shipments' | 'incidents'; format: 'csv' | 'pdf'; period: 'today' | 'month' | 'quarter' | 'year' }) =>
    api.post('/reports/export', data, { responseType: 'blob' }),
};
