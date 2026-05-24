import { ShipmentEntity } from '../../shipments/entities/shipment.entity';
import { UserEntity } from '../../users/entities/user.entity';
import { IncidentReportEntity } from './incident-report.entity';
export declare class ShipmentIssueEntity {
    id: string;
    shipmentId: string;
    issueType: string;
    severity: string;
    detectedAt: Date;
    detectedBy: string;
    reportedBy: string | null;
    notes: string | null;
    isResolved: boolean;
    resolvedAt: Date | null;
    incidentReportId: string | null;
    shipment: ShipmentEntity;
    reporter: UserEntity | null;
    incidentReport: IncidentReportEntity | null;
}
