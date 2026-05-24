import { DataSource } from 'typeorm';
export declare class DashboardSystemService {
    private readonly dataSource;
    constructor(dataSource: DataSource);
    getStats(currentUser: any): Promise<any>;
    getAuditLogs(query: {
        page?: string;
        limit?: string;
    }): Promise<any>;
    exportReport(reportType: string, format: string, currentUser: any): Promise<any>;
}
