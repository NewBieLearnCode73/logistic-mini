import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { BatchEntity } from '../batches/entities/batch.entity';
import { TimelineEventEntity } from '../batches/entities/timeline-event.entity';
import { ScanLogEntity } from './entities/scan-log.entity';
import { AuditLogEntity } from './entities/audit-log.entity';

@Injectable()
export class AuditService {
  constructor(private readonly dataSource: DataSource) {}

  async findBatchByCode(batchCode: string): Promise<BatchEntity | null> {
    return this.dataSource.getRepository(BatchEntity).findOne({
      where: { batchCode },
      relations: { product: true, originNode: true, currentNode: true },
    });
  }

  async getBatchTimeline(batchId: string): Promise<TimelineEventEntity[]> {
    return this.dataSource.getRepository(TimelineEventEntity).find({
      where: { batchId },
      relations: { node: true, actor: true },
      order: { occurredAt: 'ASC' },
    });
  }

  async recordScanLogAsync(data: {
    batchId: string;
    scannedBy: string | null;
    ipAddress: string | null;
    userAgent: string | null;
    latitude: number | null;
    longitude: number | null;
  }): Promise<void> {
    // Fire-and-forget: executing asynchronously
    const scanLog = new ScanLogEntity();
    scanLog.batchId = data.batchId;
    scanLog.scannedBy = data.scannedBy;
    scanLog.ipAddress = data.ipAddress;
    scanLog.userAgent = data.userAgent;
    scanLog.latitude = data.latitude;
    scanLog.longitude = data.longitude;

    await this.dataSource.getRepository(ScanLogEntity).save(scanLog);
  }

  async createAuditLog(data: Partial<AuditLogEntity>): Promise<void> {
    await this.dataSource.getRepository(AuditLogEntity).save(data);
  }
}
