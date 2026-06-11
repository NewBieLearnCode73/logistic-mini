import { Injectable, BadRequestException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { InventoryEntity } from '../batches/entities/inventory.entity';
import { BatchEntity } from '../batches/entities/batch.entity';
import { TimelineEventEntity } from '../batches/entities/timeline-event.entity';
import { ScanLogEntity } from './entities/scan-log.entity';
import { AuditLogEntity } from './entities/audit-log.entity';
import { ShipmentEntity } from '../shipments/entities/shipment.entity';
import { TimelineEventType } from '../../common/enums/timeline-event-type.enum';
import { RoleName } from '../../common/enums/role.enum';

@Injectable()
export class AuditService {
  constructor(private readonly dataSource: DataSource) {}

  async findBatchByCode(batchCode: string): Promise<BatchEntity | null> {
    return this.dataSource.getRepository(BatchEntity).findOne({
      where: { batchCode },
      relations: { product: true, originNode: true, currentNode: true },
    });
  }

  async validateBatchAccess(batch: BatchEntity, currentUser: any): Promise<void> {
    if (!currentUser) {
      return;
    }

    if (currentUser.role === RoleName.ADMIN) {
      return;
    }

    if (currentUser.role === RoleName.MANUFACTURER) {
      if (batch.originNodeId !== currentUser.nodeId) {
        throw new BadRequestException('Bạn không có quyền truy cập lô hàng này');
      }
      return;
    }

    if (currentUser.role === RoleName.DISTRIBUTOR || currentUser.role === RoleName.RETAILER) {
      const hasInventory = await this.dataSource.getRepository(InventoryEntity).findOne({
        where: { batchId: batch.id, nodeId: currentUser.nodeId },
      });
      if (!hasInventory) {
        throw new BadRequestException('Lô hàng này chưa từng đi qua cơ sở của bạn');
      }
      return;
    }

    throw new BadRequestException('Vai trò của bạn không có quyền xem thông tin lô hàng');
  }

  async getBatchTimeline(batchId: string, currentUser?: any): Promise<TimelineEventEntity[]> {
    const events = await this.dataSource.getRepository(TimelineEventEntity).find({
      where: { batchId },
      relations: { node: true, actor: true },
      order: { occurredAt: 'ASC' },
    });

    const eventTypePriority: Record<string, number> = {
      CREATED: 1,
      PRICE_CONFIGURED: 2,
      SHIPPED: 3,
      RECEIVED: 4,
      INVENTORY_ADJUSTED: 5,
      DELAYED: 6,
      INVESTIGATING: 7,
      LOST: 8,
      DAMAGED: 9,
      CANCELLED: 10,
      INCIDENT_CLOSED: 11,
      SOLD: 12,
      DISCARDED: 13,
    };

    events.sort((a, b) => {
      const timeA = new Date(a.occurredAt).getTime();
      const timeB = new Date(b.occurredAt).getTime();
      if (timeA !== timeB) {
        return timeA - timeB;
      }
      const priorityA = eventTypePriority[a.eventType] ?? 99;
      const priorityB = eventTypePriority[b.eventType] ?? 99;
      return priorityA - priorityB;
    });

    for (const event of events) {
      if (event.actor) {
        delete (event.actor as any).passwordHash;
      }
    }

    // If currentUser is present and is RETAILER, return all events
    if (currentUser && currentUser.role === RoleName.RETAILER) {
      return events;
    }

    // For anonymous users AND all other logged-in roles (Admin, Manufacturer, Distributor)
    // they can only see up to the final receiving event of the supply chain.
    const restrictedEventTypes = [
      'PRICE_CONFIGURED',
      'SOLD',
      'PROFIT_CALCULATED',
      'REVENUE_RECORDED',
      'FINANCIAL_REPORT',
    ];
    
    const allowedEvents = events.filter(
      event => !restrictedEventTypes.includes(event.eventType)
    );

    let lastReceiveIndex = -1;
    for (let i = allowedEvents.length - 1; i >= 0; i--) {
      if (allowedEvents[i].eventType === TimelineEventType.RECEIVED) {
        lastReceiveIndex = i;
        break;
      }
    }

    if (lastReceiveIndex !== -1) {
      return allowedEvents.slice(0, lastReceiveIndex + 1);
    }

    return allowedEvents;
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
