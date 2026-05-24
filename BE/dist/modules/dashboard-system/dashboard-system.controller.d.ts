import * as express from 'express';
import { DashboardSystemService } from './dashboard-system.service';
import { ExportReportDto } from './dto/export-report.dto';
export declare class DashboardSystemController {
    private readonly service;
    constructor(service: DashboardSystemService);
    getStats(req: any): Promise<any>;
    getAuditLogs(query: {
        page?: string;
        limit?: string;
    }): Promise<any>;
    exportReport(dto: ExportReportDto, req: any, res: express.Response): Promise<void>;
}
