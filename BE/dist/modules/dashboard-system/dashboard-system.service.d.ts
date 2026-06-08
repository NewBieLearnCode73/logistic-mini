import { DataSource } from 'typeorm';
export declare class DashboardSystemService {
    private readonly dataSource;
    constructor(dataSource: DataSource);
    getStats(currentUser: any): Promise<any>;
    getAuditLogs(query: {
        page?: string;
        limit?: string;
    }): Promise<any>;
    getDateRange(period: string, startDate?: string, endDate?: string): {
        start: Date;
        end: Date;
    };
    formatDate(date: Date | string | null | undefined): string;
    formatDateTime(date: Date | string | null | undefined): string;
    formatCurrency(value: number): string;
    exportReport(reportType: string, format: string, period: string | undefined, currentUser: any, startDate?: string, endDate?: string): Promise<any>;
}
