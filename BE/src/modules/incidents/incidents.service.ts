import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { randomUUID } from 'crypto';
import { DataSource } from 'typeorm';
import { BatchStatus } from '../../common/enums/batch-status.enum';
import { ShipmentStatus } from '../../common/enums/shipment-status.enum';
import { TimelineEventType } from '../../common/enums/timeline-event-type.enum';
import { BatchEntity } from '../batches/entities/batch.entity';
import { InventoryEntity } from '../batches/entities/inventory.entity';
import { TimelineEventEntity } from '../batches/entities/timeline-event.entity';
import { ShipmentEntity } from '../shipments/entities/shipment.entity';
import { CreateIncidentDto } from './dto/create-incident.dto';
import { IncidentReportEntity } from './entities/incident-report.entity';
import { InventoryAdjustmentEntity } from './entities/inventory-adjustment.entity';
import { ShipmentIssueEntity } from './entities/shipment-issue.entity';
import { UserEntity } from '../users/entities/user.entity';
import { AuditLogEntity } from '../audit/entities/audit-log.entity';
import { BrevoEmailService } from './brevo-email.service';

@Injectable()
export class IncidentsService {
  private readonly logger = new Logger(IncidentsService.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly brevoEmailService: BrevoEmailService,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async handleOverdueShipments(): Promise<void> {
    const fortyEightHoursAgo = new Date();
    fortyEightHoursAgo.setHours(fortyEightHoursAgo.getHours() - 48);

    const overdueShipments = await this.dataSource.getRepository(ShipmentEntity)
      .createQueryBuilder('shipment')
      .leftJoinAndSelect('shipment.batch', 'batch')
      .leftJoinAndSelect('batch.product', 'product')
      .leftJoinAndSelect('shipment.sourceNode', 'sourceNode')
      .leftJoinAndSelect('shipment.destinationNode', 'destinationNode')
      .where('shipment.status = :status', { status: ShipmentStatus.IN_TRANSIT })
      .andWhere('shipment.shippedAt <= :fortyEightHoursAgo', { fortyEightHoursAgo })
      .getMany();

    for (const shipment of overdueShipments) {
      // 1. Check if a ShipmentIssue already exists for this shipment
      const existingIssue = await this.dataSource.getRepository(ShipmentIssueEntity).findOne({
        where: {
          shipmentId: shipment.id,
          issueType: 'OVERDUE',
        },
      });
      if (existingIssue) continue;

      // 2. Check if an IncidentReport already exists for this batch/shipment
      const existingIncident = await this.dataSource.getRepository(IncidentReportEntity).findOne({
        where: {
          shipmentId: shipment.id,
          incidentType: 'DELAYED_SHIPMENT',
        },
      });
      if (existingIncident) continue;

      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        // Find default admin user as reporter
        const systemUser = await queryRunner.manager.findOne(UserEntity, {
          where: { email: 'admin@logistic.com' },
        });
        const reporterId = systemUser ? systemUser.id : shipment.createdBy;

        // 1. Create ShipmentIssueEntity
        const issue = new ShipmentIssueEntity();
        issue.shipmentId = shipment.id;
        issue.issueType = 'OVERDUE';
        issue.severity = 'HIGH';
        issue.detectedBy = 'SYSTEM_CRON';
        issue.notes = `Vận đơn trễ hạn giao > 48 giờ. Ngày gửi: ${shipment.shippedAt.toISOString()}`;
        await queryRunner.manager.save(ShipmentIssueEntity, issue);

        // 2. Create IncidentReportEntity
        const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        const hexPart = randomUUID().replace(/-/g, '').substring(0, 4).toLowerCase();
        const incidentCode = `INC-${todayStr}-${hexPart}`;

        const incident = new IncidentReportEntity();
        incident.incidentCode = incidentCode;
        incident.shipmentId = shipment.id;
        incident.batchId = shipment.batchId;
        incident.incidentType = 'DELAYED_SHIPMENT';
        incident.status = 'OPEN';
        incident.priority = 'HIGH';
        incident.reportedBy = reporterId;
        incident.description = `Lô hàng ${shipment.batch?.batchCode || ''} đã ở trạng thái IN_TRANSIT hơn 48 giờ mà không có xác nhận từ cơ sở đích.`;
        await queryRunner.manager.save(IncidentReportEntity, incident);

        // 3. Update Batch Status
        const batch = await queryRunner.manager.findOne(BatchEntity, {
          where: { id: shipment.batchId },
        });
        if (batch) {
          batch.status = BatchStatus.DELAYED;
          await queryRunner.manager.save(BatchEntity, batch);
        }

        // 4. Update Shipment Status
        shipment.status = ShipmentStatus.DELAYED;
        await queryRunner.manager.save(ShipmentEntity, shipment);

        // 5. Create Timeline Event
        const event = new TimelineEventEntity();
        event.batchId = shipment.batchId;
        event.eventType = TimelineEventType.DELAYED;
        event.nodeId = shipment.sourceNodeId;
        event.actorId = null;
        event.shipmentId = shipment.id;
        event.quantityDelta = null;
        event.notes = `Hệ thống tự động phát hiện trễ hạn vận chuyển (> 48 giờ). Mã vận đơn: ${shipment.trackingCode}`;
        await queryRunner.manager.save(TimelineEventEntity, event);

        // 6. Create Audit Log
        const auditLog = new AuditLogEntity();
        auditLog.actorId = null;
        auditLog.action = 'AUTO_DELAY_DETECTION';
        auditLog.entityType = 'batches';
        auditLog.entityId = shipment.batchId;
        auditLog.oldValues = { status: 'IN_TRANSIT' };
        auditLog.newValues = { status: 'DELAYED', incidentCode };
        auditLog.ipAddress = '127.0.0.1';
        auditLog.userAgent = 'SYSTEM_CRON';
        await queryRunner.manager.save(AuditLogEntity, auditLog);

        await queryRunner.commitTransaction();

        // 7. Send Email Notification
        this.sendDelayNotification(shipment, incidentCode).catch((err) => {
          this.logger.error(`Failed to send delay notification for batch ${shipment.batch?.batchCode || ''}: ${err.message}`);
        });

      } catch (error) {
        await queryRunner.rollbackTransaction();
        this.logger.error(`Error processing overdue shipment ${shipment.trackingCode}: ${(error as any).message}`);
      } finally {
        await queryRunner.release();
      }
    }
  }

  private async sendDelayNotification(shipment: ShipmentEntity, incidentCode: string): Promise<void> {
    const recipients: { email: string; name?: string }[] = [];

    // Query active administrators
    try {
      const admins = await this.dataSource.getRepository(UserEntity)
        .createQueryBuilder('user')
        .innerJoinAndSelect('user.userRoles', 'userRole')
        .innerJoinAndSelect('userRole.role', 'role')
        .where('role.name = :roleName', { roleName: 'Admin' })
        .andWhere('user.isActive = true')
        .getMany();

      for (const admin of admins) {
        recipients.push({ email: admin.email, name: admin.fullName });
      }
    } catch (err) {
      this.logger.error(`Failed to retrieve admin users for email notifications: ${(err as any).message}`);
    }

    // Add configured email addresses from environment
    const extraEmailsEnv = process.env.ADMIN_NOTIFICATION_EMAILS;
    if (extraEmailsEnv) {
      const emails = extraEmailsEnv.split(',').map(e => e.trim()).filter(Boolean);
      for (const email of emails) {
        if (!recipients.some(r => r.email === email)) {
          recipients.push({ email });
        }
      }
    }

    if (recipients.length === 0) {
      this.logger.warn('No recipients found for delay notification.');
      return;
    }

    const delayDurationMs = Date.now() - new Date(shipment.shippedAt).getTime();
    const delayDurationHours = Math.max(0, Math.floor(delayDurationMs / (1000 * 60 * 60)));

    const formattedShipmentDate = new Date(shipment.shippedAt).toISOString().replace('T', ' ').substring(0, 16);

    const subject = `[Mini Supply Chain] Phát hiện vận đơn trễ hạn`;
    const htmlContent = `
Phát hiện vận đơn trễ hạn trong hệ thống.

Mã lô hàng: ${shipment.batch?.batchCode || ''}
Trạng thái: TRỄ HẠN (DELAYED)
Nguồn: ${shipment.sourceNode?.name || ''}
Đích: ${shipment.destinationNode?.name || ''}
Số lượng: ${shipment.quantityShipped}
Ngày gửi: ${formattedShipmentDate}
Thời gian trễ: ${delayDurationHours} giờ

Một báo cáo sự cố đã được tạo tự động. Vui lòng đăng nhập hệ thống để xử lý.
`;

    await this.brevoEmailService.sendEmail(recipients, subject, htmlContent);
  }


  async createIncident(dto: CreateIncidentDto, currentUser: any): Promise<IncidentReportEntity> {
    const { shipmentId, incidentType, description, priority } = dto;

    // BUG-3 FIX: Validate shipment exists and has eligible status
    const shipmentCheck = await this.dataSource.getRepository(ShipmentEntity).findOne({
      where: { id: shipmentId },
    });
    if (!shipmentCheck) {
      throw new NotFoundException(`Không tìm thấy vận đơn với ID ${shipmentId}`);
    }
    const eligibleStatuses: string[] = [ShipmentStatus.IN_TRANSIT, ShipmentStatus.DELAYED];
    if (!eligibleStatuses.includes(shipmentCheck.status)) {
      throw new BadRequestException(
        `Chỉ có thể mở sự cố cho vận đơn đang ở trạng thái IN_TRANSIT hoặc DELAYED. Trạng thái hiện tại: ${shipmentCheck.status}`,
      );
    }

    // BUG-4 FIX: Check for existing open incident on the same shipment
    const existingOpenIncident = await this.dataSource.getRepository(IncidentReportEntity).findOne({
      where: { shipmentId, status: 'OPEN' },
    });
    if (existingOpenIncident) {
      throw new BadRequestException(
        `Vận đơn này đã có sự cố đang mở (mã: ${existingOpenIncident.incidentCode}). Không thể tạo sự cố trùng lặp.`,
      );
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const shipment = await queryRunner.manager.findOne(ShipmentEntity, {
        where: { id: shipmentId },
      });
      if (!shipment) {
        throw new NotFoundException(`Không tìm thấy vận đơn với ID ${shipmentId}`);
      }

      const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const hexPart = randomUUID().replace(/-/g, '').substring(0, 4).toLowerCase();
      const incidentCode = `INC-${todayStr}-${hexPart}`;

      const incident = new IncidentReportEntity();
      incident.incidentCode = incidentCode;
      incident.shipmentId = shipmentId;
      incident.batchId = shipment.batchId;
      incident.incidentType = incidentType;
      incident.status = 'OPEN';
      incident.priority = priority || 'MEDIUM';
      incident.reportedBy = currentUser.userId;
      incident.description = description;

      const savedIncident = await queryRunner.manager.save(IncidentReportEntity, incident);

      const batch = await queryRunner.manager.findOne(BatchEntity, {
        where: { id: shipment.batchId },
      });
      if (batch) {
        batch.status = BatchStatus.INVESTIGATING;
        await queryRunner.manager.save(BatchEntity, batch);
      }

      const event = new TimelineEventEntity();
      event.batchId = shipment.batchId;
      event.eventType = TimelineEventType.INVESTIGATING;
      event.nodeId = shipment.sourceNodeId;
      event.actorId = currentUser.userId;
      event.shipmentId = shipment.id;
      event.quantityDelta = null;
      event.notes = `Bắt đầu mở cuộc điều tra sự cố ${incidentType}. Mã sự cố: ${incidentCode}`;
      await queryRunner.manager.save(TimelineEventEntity, event);

      const auditLog = new AuditLogEntity();
      auditLog.actorId = currentUser.userId;
      auditLog.action = 'OPEN_INVESTIGATION';
      auditLog.entityType = 'incident_reports';
      auditLog.entityId = savedIncident.id;
      auditLog.oldValues = { shipmentStatus: shipment.status };
      auditLog.newValues = { incidentCode, batchStatus: 'INVESTIGATING' };
      auditLog.ipAddress = null;
      auditLog.userAgent = null;
      await queryRunner.manager.save(AuditLogEntity, auditLog);

      await queryRunner.commitTransaction();
      return savedIncident;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async confirmLost(id: string, currentUser: any): Promise<IncidentReportEntity> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const incident = await queryRunner.manager.findOne(IncidentReportEntity, {
        where: { id },
      });
      if (!incident) {
        throw new NotFoundException(`Không tìm thấy hồ sơ sự cố với ID ${id}`);
      }

      if (incident.status !== 'OPEN') {
        throw new BadRequestException('Sự cố này đã được giải quyết hoặc đóng.');
      }

      const shipment = await queryRunner.manager.findOne(ShipmentEntity, {
        where: { id: incident.shipmentId },
      });
      if (!shipment) {
        throw new NotFoundException(`Không tìm thấy vận đơn liên quan đến sự cố`);
      }

      if (!incident.firstApprovedBy) {
        // --- FIRST CONFIRMATION (Admin 1) – chỉ ghi nhận yêu cầu, CHƯA thay đổi batch/shipment ---
        incident.firstApprovedBy = currentUser.userId;
        const savedIncident = await queryRunner.manager.save(IncidentReportEntity, incident);

        // BUG-2 FIX: Dùng PENDING_LOST_APPROVAL thay vì LOST
        const event = new TimelineEventEntity();
        event.batchId = shipment.batchId;
        event.eventType = TimelineEventType.PENDING_LOST_APPROVAL;
        event.nodeId = shipment.sourceNodeId;
        event.actorId = currentUser.userId;
        event.shipmentId = shipment.id;
        event.quantityDelta = null;
        event.notes = `Yêu cầu xác nhận thất lạc hàng hóa – bước 1/2 (Chờ phê duyệt kép). Người đề xuất: Admin ID ${currentUser.userId}.`;
        await queryRunner.manager.save(TimelineEventEntity, event);

        // BUG-9 FIX: Thêm audit log cho lần confirm đầu
        const auditLog = new AuditLogEntity();
        auditLog.actorId = currentUser.userId;
        auditLog.action = 'CONFIRM_LOST_STEP1';
        auditLog.entityType = 'incident_reports';
        auditLog.entityId = incident.id;
        auditLog.oldValues = { firstApprovedBy: null };
        auditLog.newValues = { firstApprovedBy: currentUser.userId, status: 'PENDING_SECOND_APPROVAL' };
        auditLog.ipAddress = null;
        auditLog.userAgent = null;
        await queryRunner.manager.save(AuditLogEntity, auditLog);

        await queryRunner.commitTransaction();
        return savedIncident;
      } else {
        // --- SECOND CONFIRMATION (Admin 2) – Two-Man Rule hoàn tất ---
        // Đặc tả chỉ yêu cầu: Admin2 ≠ Admin1 (người xác nhận bước 1)
        if (incident.firstApprovedBy === currentUser.userId) {
          throw new ForbiddenException(
            'Quy tắc phê duyệt kép: Người xác nhận thứ hai phải khác người đã xác nhận thứ nhất',
          );
        }

        incident.status = 'CLOSED';
        incident.resolution = 'Xác nhận mất hàng và hoàn trả tồn kho kho nguồn';
        incident.resolutionType = 'LOSS_CONFIRMED';
        incident.approvedBy = currentUser.userId;
        incident.resolvedAt = new Date();
        incident.closedAt = new Date();
        const savedIncident = await queryRunner.manager.save(IncidentReportEntity, incident);

        const sourceInventory = await queryRunner.manager.createQueryBuilder(InventoryEntity, 'inventory')
          .setLock('pessimistic_write')
          .where('inventory.batchId = :batchId AND inventory.nodeId = :nodeId', {
            batchId: shipment.batchId,
            nodeId: shipment.sourceNodeId,
          })
          .getOne();

        let qtyBefore = 0;
        if (sourceInventory) {
          qtyBefore = Number(sourceInventory.quantityAvailable);
          sourceInventory.quantityAvailable = Number((qtyBefore + Number(shipment.quantityShipped)).toFixed(3));
          await queryRunner.manager.save(InventoryEntity, sourceInventory);
        } else {
          const newInventory = new InventoryEntity();
          newInventory.batchId = shipment.batchId;
          newInventory.nodeId = shipment.sourceNodeId;
          newInventory.quantityAvailable = Number(shipment.quantityShipped);
          await queryRunner.manager.save(InventoryEntity, newInventory);
        }
        const qtyAfter = qtyBefore + Number(shipment.quantityShipped);

        const adjustment = new InventoryAdjustmentEntity();
        adjustment.batchId = shipment.batchId;
        adjustment.nodeId = shipment.sourceNodeId;
        adjustment.adjustmentType = 'LOSS_ROLLBACK';
        adjustment.qtyBefore = qtyBefore;
        adjustment.qtyDelta = Number(shipment.quantityShipped);
        adjustment.qtyAfter = qtyAfter;
        adjustment.reason = `Hoàn trả tồn kho do thất lạc vận đơn ${shipment.trackingCode}`;
        adjustment.approvedBy = incident.firstApprovedBy;
        adjustment.secondApprover = currentUser.userId;
        adjustment.referenceId = incident.id;
        adjustment.referenceType = 'incident_reports';
        await queryRunner.manager.save(InventoryAdjustmentEntity, adjustment);

        shipment.status = ShipmentStatus.LOST;
        await queryRunner.manager.save(ShipmentEntity, shipment);

        // BUG-1 FIX: Batch chỉ được set LOST sau khi Two-Man Rule hoàn tất (lần 2)
        const batch = await queryRunner.manager.findOne(BatchEntity, {
          where: { id: shipment.batchId },
        });
        if (batch) {
          batch.status = BatchStatus.LOST;
          batch.currentNodeId = shipment.sourceNodeId;
          await queryRunner.manager.save(BatchEntity, batch);
        }

        const event = new TimelineEventEntity();
        event.batchId = shipment.batchId;
        event.eventType = TimelineEventType.LOST;
        event.nodeId = shipment.sourceNodeId;
        event.actorId = currentUser.userId;
        event.shipmentId = shipment.id;
        event.quantityDelta = null;
        event.notes = `Xác nhận thất lạc hàng hóa hoàn tất (Phê duyệt kép bởi Admin1: ${incident.firstApprovedBy}, Admin2: ${currentUser.userId}). Vận đơn: ${shipment.trackingCode}. Đã hoàn trả ${shipment.quantityShipped} sản phẩm vào kho nguồn.`;
        await queryRunner.manager.save(TimelineEventEntity, event);

        const auditLog = new AuditLogEntity();
        auditLog.actorId = currentUser.userId;
        auditLog.action = 'CONFIRM_LOST_STEP2';
        auditLog.entityType = 'incident_reports';
        auditLog.entityId = incident.id;
        auditLog.oldValues = { batchStatus: 'INVESTIGATING', shipmentStatus: shipment.status };
        auditLog.newValues = {
          batchStatus: 'LOST',
          shipmentStatus: 'LOST',
          inventoryRollback: shipment.quantityShipped,
          firstApprover: incident.firstApprovedBy,
          secondApprover: currentUser.userId,
        };
        auditLog.ipAddress = null;
        auditLog.userAgent = null;
        await queryRunner.manager.save(AuditLogEntity, auditLog);

        await queryRunner.commitTransaction();
        return savedIncident;
      }
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(query: { page?: string; limit?: string }): Promise<{
    data: IncidentReportEntity[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const page = parseInt(query.page || '1', 10);
    const limit = parseInt(query.limit || '10', 10);
    const skip = (page - 1) * limit;

    const [data, total] = await this.dataSource.getRepository(IncidentReportEntity).findAndCount({
      relations: {
        shipment: true,
        batch: { product: true },
        reporter: true,
        approver: true,
      },
      order: { openedAt: 'DESC' },
      skip,
      take: limit,
    });

    // Sanitize sensitive user fields (like passwordHash)
    for (const incident of data) {
      if (incident.reporter) {
        delete (incident.reporter as any).passwordHash;
      }
      if (incident.approver) {
        delete (incident.approver as any).passwordHash;
      }
    }

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async confirmFound(id: string, currentUser: any): Promise<IncidentReportEntity> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const incident = await queryRunner.manager.findOne(IncidentReportEntity, {
        where: { id },
      });
      if (!incident) {
        throw new NotFoundException(`Không tìm thấy hồ sơ sự cố với ID ${id}`);
      }

      if (incident.status !== 'OPEN') {
        throw new BadRequestException('Sự cố này đã được giải quyết hoặc đóng.');
      }

      // BUG-5 FIX: Block confirmFound khi đang trong quy trình Two-Man Rule confirmLost
      if (incident.firstApprovedBy) {
        throw new BadRequestException(
          'Không thể xác nhận "Tìm thấy" vì sự cố này đang trong quy trình xác nhận thất lạc (đang chờ phê duyệt kép bước 2/2). Vui lòng hoàn tất hoặc liên hệ Admin để huỷ yêu cầu.',
        );
      }

      const shipment = await queryRunner.manager.findOne(ShipmentEntity, {
        where: { id: incident.shipmentId },
      });
      if (!shipment) {
        throw new NotFoundException(`Không tìm thấy vận đơn liên quan đến sự cố`);
      }

      // Close Incident
      incident.status = 'CLOSED';
      incident.resolution = 'Tìm thấy hàng hóa thất lạc và tiến hành nhập kho đích';
      incident.resolutionType = 'FOUND_CONFIRMED';
      incident.approvedBy = currentUser.userId;
      incident.resolvedAt = new Date();
      incident.closedAt = new Date();
      const savedIncident = await queryRunner.manager.save(IncidentReportEntity, incident);

      // Update shipment status to RECEIVED
      shipment.status = ShipmentStatus.RECEIVED;
      shipment.actualDeliveryDate = new Date();
      await queryRunner.manager.save(ShipmentEntity, shipment);

      // Standard receive inventory process (UPSERT destination node inventory)
      await queryRunner.query(
        `INSERT INTO inventory (batch_id, node_id, quantity_available, last_updated_at, version)
         VALUES ($1, $2, $3, NOW(), 1)
         ON CONFLICT (batch_id, node_id)
         DO UPDATE SET 
           quantity_available = inventory.quantity_available + EXCLUDED.quantity_available,
           last_updated_at = NOW(),
           version = inventory.version + 1`,
        [shipment.batchId, shipment.destinationNodeId, shipment.quantityShipped],
      );

      // Update Batch status and location
      const batch = await queryRunner.manager.findOne(BatchEntity, {
        where: { id: shipment.batchId },
      });
      if (batch) {
        batch.currentNodeId = shipment.destinationNodeId;
        batch.status = BatchStatus.RECEIVED;
        await queryRunner.manager.save(BatchEntity, batch);
      }

      // Write RECEIVED timeline event
      const event = new TimelineEventEntity();
      event.batchId = shipment.batchId;
      event.eventType = TimelineEventType.RECEIVED;
      event.nodeId = shipment.destinationNodeId;
      event.actorId = currentUser.userId;
      event.shipmentId = shipment.id;
      event.quantityDelta = shipment.quantityShipped;
      event.notes = `Đã tìm thấy hàng hóa thất lạc từ vận đơn ${shipment.trackingCode} và tiến hành nhập kho đích.`;
      await queryRunner.manager.save(TimelineEventEntity, event);

      await queryRunner.commitTransaction();
      return savedIncident;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
