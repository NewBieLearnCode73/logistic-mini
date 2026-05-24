import { DataSource } from 'typeorm';
import { CreateIncidentDto } from './dto/create-incident.dto';
import { IncidentReportEntity } from './entities/incident-report.entity';
export declare class IncidentsService {
    private readonly dataSource;
    constructor(dataSource: DataSource);
    handleOverdueShipments(): Promise<void>;
    createIncident(dto: CreateIncidentDto, currentUser: any): Promise<IncidentReportEntity>;
    confirmLost(id: string, currentUser: any): Promise<IncidentReportEntity>;
    findAll(query: {
        page?: string;
        limit?: string;
    }): Promise<{
        data: IncidentReportEntity[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    confirmFound(id: string, currentUser: any): Promise<IncidentReportEntity>;
}
