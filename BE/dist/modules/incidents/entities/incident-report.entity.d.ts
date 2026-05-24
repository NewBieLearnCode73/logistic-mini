import { ShipmentEntity } from '../../shipments/entities/shipment.entity';
import { BatchEntity } from '../../batches/entities/batch.entity';
import { UserEntity } from '../../users/entities/user.entity';
export declare class IncidentReportEntity {
    id: string;
    incidentCode: string;
    shipmentId: string;
    batchId: string;
    incidentType: string;
    status: string;
    priority: string;
    reportedBy: string;
    assignedTo: string | null;
    description: string;
    resolution: string | null;
    resolutionType: string | null;
    approvedBy: string | null;
    evidenceJsonb: any;
    openedAt: Date;
    resolvedAt: Date | null;
    closedAt: Date | null;
    version: number;
    shipment: ShipmentEntity;
    batch: BatchEntity;
    reporter: UserEntity;
    assignee: UserEntity | null;
    approver: UserEntity | null;
}
