import { IncidentsService } from './incidents.service';
import { CreateIncidentDto } from './dto/create-incident.dto';
import { IncidentReportEntity } from './entities/incident-report.entity';
export declare class IncidentsController {
    private readonly incidentsService;
    constructor(incidentsService: IncidentsService);
    getIncidents(query: {
        page?: string;
        limit?: string;
    }): Promise<{
        data: IncidentReportEntity[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    createIncident(createIncidentDto: CreateIncidentDto, req: any): Promise<IncidentReportEntity>;
    confirmLost(id: string, req: any): Promise<IncidentReportEntity>;
    confirmFound(id: string, req: any): Promise<IncidentReportEntity>;
}
