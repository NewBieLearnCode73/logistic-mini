import { DataSource } from 'typeorm';
import { BatchEntity } from '../batches/entities/batch.entity';
import { TimelineEventEntity } from '../batches/entities/timeline-event.entity';
import { AuditLogEntity } from './entities/audit-log.entity';
export declare class AuditService {
    private readonly dataSource;
    constructor(dataSource: DataSource);
    findBatchByCode(batchCode: string): Promise<BatchEntity | null>;
    getBatchTimeline(batchId: string): Promise<TimelineEventEntity[]>;
    recordScanLogAsync(data: {
        batchId: string;
        scannedBy: string | null;
        ipAddress: string | null;
        userAgent: string | null;
        latitude: number | null;
        longitude: number | null;
    }): Promise<void>;
    createAuditLog(data: Partial<AuditLogEntity>): Promise<void>;
}
