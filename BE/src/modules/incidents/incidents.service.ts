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
      // Kiểm tra xem đã có ShipmentIssue OVERDUE cho shipment này chưa (tránh tạo trùng)
      const existingIssue = await this.dataSource.getRepository(ShipmentIssueEntity).findOne({
        where: {
          shipmentId: shipment.id,
          issueType: 'OVERDUE',
        },
      });
      if (existingIssue) continue;

      const queryRunner = this.dataSource.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        // Bước 1 (UC-16 Luồng 1): Tạo ShipmentIssue OVERDUE
        const issue = new ShipmentIssueEntity();
        issue.shipmentId = shipment.id;
        issue.issueType = 'OVERDUE';
        issue.severity = 'HIGH';
        issue.detectedBy = 'SYSTEM_CRON';
        issue.notes = `Vận đơn trễ hạn giao > 48 giờ. Ngày gửi: ${shipment.shippedAt.toISOString()}`;
        await queryRunner.manager.save(ShipmentIssueEntity, issue);

        // Bước 2: Cập nhật batch status → DELAYED
        const batch = await queryRunner.manager.findOne(BatchEntity, {
          where: { id: shipment.batchId },
        });
        if (batch) {
          batch.status = BatchStatus.DELAYED;
          await queryRunner.manager.save(BatchEntity, batch);
        }

        // Bước 3: Cập nhật shipment status → DELAYED
        shipment.status = ShipmentStatus.DELAYED;
        await queryRunner.manager.save(ShipmentEntity, shipment);

        // Bước 4: Ghi timeline event DELAYED (immutable)
        const event = new TimelineEventEntity();
        event.batchId = shipment.batchId;
        event.eventType = TimelineEventType.DELAYED;
        event.nodeId = shipment.sourceNodeId;
        event.actorId = null;
        event.shipmentId = shipment.id;
        event.quantityDelta = null;
        event.notes = `Hệ thống tự động phát hiện trễ hạn vận chuyển (> 48 giờ). Mã vận đơn: ${shipment.trackingCode}`;
        await queryRunner.manager.save(TimelineEventEntity, event);

        // Bước 5: Ghi audit log AUTO_DELAY
        const auditLog = new AuditLogEntity();
        auditLog.actorId = null;
        auditLog.action = 'AUTO_DELAY';
        auditLog.entityType = 'shipments';
        auditLog.entityId = shipment.id;
        auditLog.oldValues = { status: 'IN_TRANSIT' };
        auditLog.newValues = { status: 'DELAYED', trackingCode: shipment.trackingCode };
        auditLog.ipAddress = '127.0.0.1';
        auditLog.userAgent = 'SYSTEM_CRON';
        await queryRunner.manager.save(AuditLogEntity, auditLog);

        await queryRunner.commitTransaction();

        // Bước 6 (async, không block): Gửi email thông báo cho Admin
        // Admin sẽ chủ động mở investigation (Luồng 2) sau khi nhận được email
        this.sendDelayNotification(shipment).catch((err) => {
          this.logger.error(`Không thể gửi email thông báo trễ hạn cho batch ${shipment.batch?.batchCode || ''}: ${err.message}`);
        });

      } catch (error) {
        await queryRunner.rollbackTransaction();
        this.logger.error(`Lỗi khi xử lý vận đơn trễ hạn ${shipment.trackingCode}: ${(error as any).message}`);
      } finally {
        await queryRunner.release();
      }
    }
  }

  private async sendDelayNotification(shipment: ShipmentEntity): Promise<void> {
    const recipients: { email: string; name?: string }[] = [];

    // Lấy danh sách tất cả Admin đang hoạt động
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
      this.logger.error(`Không thể lấy danh sách Admin để gửi thông báo: ${(err as any).message}`);
    }

    // Thêm các địa chỉ email bổ sung từ biến môi trường
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
      this.logger.warn('Không tìm thấy người nhận thông báo trễ hạn.');
      return;
    }

    const delayDurationMs = Date.now() - new Date(shipment.shippedAt).getTime();
    const delayDurationHours = Math.max(0, Math.floor(delayDurationMs / (1000 * 60 * 60)));
    const formattedShipmentDate = new Date(shipment.shippedAt).toISOString().replace('T', ' ').substring(0, 16);

    const subject = `[Mini Supply Chain] Cảnh báo: Vận đơn trễ hạn cần xử lý`;
    const htmlContent = `
<h3>⚠️ Phát hiện vận đơn trễ hạn</h3>
<p>Hệ thống đã phát hiện vận đơn chưa được xác nhận sau hơn 48 giờ vận chuyển.</p>

<table style="border-collapse: collapse; width: 100%;">
  <tr><td style="padding: 4px 8px; font-weight:bold;">Mã vận đơn:</td><td>${shipment.trackingCode}</td></tr>
  <tr><td style="padding: 4px 8px; font-weight:bold;">Mã lô hàng:</td><td>${shipment.batch?.batchCode || 'N/A'}</td></tr>
  <tr><td style="padding: 4px 8px; font-weight:bold;">Sản phẩm:</td><td>${shipment.batch?.product?.name || 'N/A'}</td></tr>
  <tr><td style="padding: 4px 8px; font-weight:bold;">Kho xuất:</td><td>${shipment.sourceNode?.name || 'N/A'}</td></tr>
  <tr><td style="padding: 4px 8px; font-weight:bold;">Kho nhận:</td><td>${shipment.destinationNode?.name || 'N/A'}</td></tr>
  <tr><td style="padding: 4px 8px; font-weight:bold;">Số lượng:</td><td>${shipment.quantityShipped} ${shipment.batch?.unit || ''}</td></tr>
  <tr><td style="padding: 4px 8px; font-weight:bold;">Ngày gửi:</td><td>${formattedShipmentDate}</td></tr>
  <tr><td style="padding: 4px 8px; font-weight:bold;">Thời gian trễ:</td><td><strong style="color:red;">${delayDurationHours} giờ</strong></td></tr>
</table>

<p>Vui lòng đăng nhập hệ thống, kiểm tra vận đơn và <strong>mở cuộc điều tra (Open Investigation)</strong> nếu cần thiết.</p>
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
        // Two-Man Rule: người tạo báo cáo (reporter) không được tự phê duyệt bước 1
        if (incident.reportedBy === currentUser.userId) {
          throw new ForbiddenException(
            'Quy tắc phê duyệt kép: Người tạo báo cáo sự cố không được là người phê duyệt bước 1',
          );
        }

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
        // Người phê duyệt bước 2 phải khác Admin1 (bước 1) và khác người tạo báo cáo
        if (incident.firstApprovedBy === currentUser.userId) {
          throw new ForbiddenException(
            'Quy tắc phê duyệt kép: Người xác nhận thứ hai phải khác người đã xác nhận thứ nhất',
          );
        }

        if (incident.reportedBy === currentUser.userId) {
          throw new ForbiddenException(
            'Quy tắc phê duyệt kép: Người phê duyệt không được trùng với người đã tạo báo cáo sự cố',
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

      // Block confirmFound khi đang trong quy trình Two-Man Rule confirmLost
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

      // ─── Đóng incident ────────────────────────────────────────────────────
      incident.status = 'CLOSED';
      incident.resolution = 'Đã tìm thấy hàng hóa. Hàng vẫn đang trên đường vận chuyển từ kho nguồn.';
      incident.resolutionType = 'FOUND';
      incident.approvedBy = currentUser.userId;
      incident.resolvedAt = new Date();
      incident.closedAt = new Date();
      const savedIncident = await queryRunner.manager.save(IncidentReportEntity, incident);

      // ─── Cập nhật Shipment về IN_TRANSIT (hàng vẫn đang di chuyển) ────────
      // Shipment giữ nguyên tuyến A→B, chỉ reset trạng thái về IN_TRANSIT
      shipment.status = ShipmentStatus.IN_TRANSIT;
      await queryRunner.manager.save(ShipmentEntity, shipment);

      // ─── Cập nhật Batch: currentNode = sourceNode, status = IN_TRANSIT ────
      // Lý do: hàng được tìm thấy tại / khu vực của kho nguồn (Node A),
      // chưa đến kho đích nên KHÔNG cộng inventory cho destinationNode
      const batch = await queryRunner.manager.findOne(BatchEntity, {
        where: { id: shipment.batchId },
      });
      if (batch) {
        batch.currentNodeId = shipment.sourceNodeId;
        batch.status = BatchStatus.IN_TRANSIT;
        await queryRunner.manager.save(BatchEntity, batch);
      }

      // ─── Ghi timeline event INCIDENT_CLOSED ─────────────────────────────
      const closeEvent = new TimelineEventEntity();
      closeEvent.batchId = shipment.batchId;
      closeEvent.eventType = TimelineEventType.INCIDENT_CLOSED;
      closeEvent.nodeId = shipment.sourceNodeId;   // vị trí tại kho nguồn (Node A)
      closeEvent.actorId = currentUser.userId;
      closeEvent.shipmentId = shipment.id;
      closeEvent.quantityDelta = null;
      closeEvent.notes = `Sự cố đã được giải quyết: hàng hóa được tìm thấy. Vận đơn ${shipment.trackingCode} tiếp tục vận chuyển từ kho nguồn về kho đích.`;
      await queryRunner.manager.save(TimelineEventEntity, closeEvent);

      // ─── Ghi audit log ───────────────────────────────────────────────────
      const auditLog = new AuditLogEntity();
      auditLog.actorId = currentUser.userId;
      auditLog.action = 'CONFIRM_FOUND';
      auditLog.entityType = 'incident_reports';
      auditLog.entityId = incident.id;
      auditLog.oldValues = { incidentStatus: 'OPEN', shipmentStatus: shipment.status, batchStatus: batch?.status };
      auditLog.newValues = {
        incidentStatus: 'CLOSED',
        resolutionType: 'FOUND',
        shipmentStatus: 'IN_TRANSIT',
        batchStatus: 'IN_TRANSIT',
        batchCurrentNode: shipment.sourceNodeId,
      };
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
}
