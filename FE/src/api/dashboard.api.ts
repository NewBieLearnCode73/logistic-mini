import api from './axios';

export interface DashboardStats {
  totalInventory: number;
  activeShipments: number;
  incidents: number;
}

export interface FinancialReportData {
  kpi: {
    totalRevenue: number;
    totalCost: number;
    totalProfit: number;
    totalUnitsSold: number;
  };
  transactions: Array<{
    id: string;
    saleDate: string;
    batchCode: string;
    productName: string;
    quantitySold: number;
    costPrice: number;
    salePrice: number;
    revenue: number;
    cost: number;
    profit: number;
  }>;
}

export const dashboardApi = {
  getStats: () => api.get<DashboardStats>('/dashboard/stats'),
  getFinancialReport: (params: {
    period: 'today' | 'month' | 'quarter' | 'year' | 'custom';
    startDate?: string;
    endDate?: string;
  }) =>
    api.get<FinancialReportData>('/reports/financial', { params }),
  exportReport: (data: {
    reportType: 'inventory' | 'shipments' | 'incidents' | 'financial';
    format: 'csv' | 'pdf' | 'xlsx';
    period?: 'today' | 'month' | 'quarter' | 'year' | 'custom';
    startDate?: string;
    endDate?: string;
  }) =>
    api.post('/reports/export', data, { responseType: 'blob' }),
};
