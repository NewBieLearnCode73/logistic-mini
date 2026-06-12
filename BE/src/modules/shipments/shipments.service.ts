import {
  Injectable,
  BadRequestException,
  ConflictException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { randomUUID } from 'crypto';
import { ShipmentEntity } from './entities/shipment.entity';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { ReceiveShipmentDto } from './dto/receive-shipment.dto';
import { BatchEntity } from '../batches/entities/batch.entity';
import { InventoryEntity } from '../batches/entities/inventory.entity';
import { TimelineEventEntity } from '../batches/entities/timeline-event.entity';
import { NodeEntity } from '../nodes/entities/node.entity';
import { ShipmentStatus } from '../../common/enums/shipment-status.enum';
import { BatchStatus } from '../../common/enums/batch-status.enum';
import { TimelineEventType } from '../../common/enums/timeline-event-type.enum';
import { ShipmentIssueEntity } from '../incidents/entities/shipment-issue.entity';
import { IncidentReportEntity } from '../incidents/entities/incident-report.entity';
import { AuditLogEntity } from '../audit/entities/audit-log.entity';
import { RoleName } from '../../common/enums/role.enum';

@Injectable()
export class ShipmentsService {
  constructor(private readonly dataSource: DataSource) {}

  async findAll(
    query: any,
    currentUser: any,
  ): Promise<{ data: ShipmentEntity[]; total: number; page: number; limit: number; totalPages: number }> {
    const qb = this.dataSource.getRepository(ShipmentEntity).createQueryBuilder('shipment')
      .leftJoinAndSelect('shipment.batch', 'batch')
      .leftJoinAndSelect('batch.product', 'product')
      .leftJoinAndSelect('shipment.sourceNode', 'sourceNode')
      .leftJoinAndSelect('shipment.destinationNode', 'destinationNode');

    if (currentUser.role !== 'Admin') {
      if (!currentUser.nodeId) {
        qb.andWhere('1=0');
      } else {
        qb.andWhere(
          '(shipment.sourceNodeId = :nodeId OR shipment.destinationNodeId = :nodeId)',
          { nodeId: currentUser.nodeId },
        );
      }
    }

    if (query.status) {
      qb.andWhere('shipment.status = :status', { status: query.status });
    }

    const page = parseInt(query.page || '1', 10);
    const limit = parseInt(query.limit || '10', 10);
    const skip = (page - 1) * limit;

    const [data, total] = await qb
      .skip(skip)
      .take(limit)
      .orderBy('shipment.createdAt', 'DESC')
      .getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string, currentUser: any): Promise<any> {
    const shipment = await this.dataSource.getRepository(ShipmentEntity).findOne({
      where: { id },
      relations: {
        batch: { product: true },
        sourceNode: true,
        destinationNode: true,
        creator: true,
      },
    });

    if (!shipment) {
      throw new NotFoundException(`Vận đơn với ID ${id} không tồn tại`);
    }

    if (currentUser.role !== 'Admin') {
      if (!currentUser.nodeId || (shipment.sourceNodeId !== currentUser.nodeId && shipment.destinationNodeId !== currentUser.nodeId)) {
        throw new ForbiddenException('Bạn không có quyền truy cập vận đơn này');
      }
    }

    // Load receiving timeline event to find receiving actor (signer) and actual quantity received
    const receiveEvent = await this.dataSource.getRepository(TimelineEventEntity).findOne({
      where: {
        shipmentId: id,
        eventType: TimelineEventType.RECEIVED,
      },
      relations: { actor: true },
    });

    // Load associated issues
    const issues = await this.dataSource.getRepository(ShipmentIssueEntity).find({
      where: { shipmentId: id },
      relations: { reporter: true, incidentReport: true },
    });

    if (shipment.creator) {
      delete (shipment.creator as any).passwordHash;
    }

    const receiver = receiveEvent ? receiveEvent.actor : null;
    if (receiver) {
      delete (receiver as any).passwordHash;
    }

    if (issues) {
      for (const issue of issues) {
        if (issue.reporter) {
          delete (issue.reporter as any).passwordHash;
        }
      }
    }

    return {
      ...shipment,
      quantityReceived: receiveEvent ? receiveEvent.quantityDelta : null,
      receiver,
      issues: issues || [],
    };
  }

  async createTransfer(createShipmentDto: CreateShipmentDto, currentUser: any): Promise<ShipmentEntity> {
    let sourceNodeId = currentUser.nodeId;
    if (!currentUser.role || currentUser.role === 'Admin') {
      sourceNodeId = createShipmentDto.sourceNodeId;
      if (!sourceNodeId) {
        throw new BadRequestException('Admin cần cung cấp sourceNodeId');
      }
    } else {
      sourceNodeId = currentUser.nodeId;
      if (!sourceNodeId) {
        throw new BadRequestException('Tài khoản của bạn chưa được gán vào Node nào');
      }
    }

    if (sourceNodeId === createShipmentDto.destinationNodeId) {
      throw new BadRequestException('Kho xuất và kho nhận không được trùng nhau');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Check batch
      const batch = await queryRunner.manager.findOne(BatchEntity, {
        where: { id: createShipmentDto.batchId },
      });
      if (!batch) {
        throw new NotFoundException(`Lô hàng với ID ${createShipmentDto.batchId} không tồn tại`);
      }

      // N-04 FIX: Block transfer khi batch đang INVESTIGATING / DELAYED / LOST (đặc tả A5)
      const blockedStatuses = [BatchStatus.INVESTIGATING, BatchStatus.DELAYED, BatchStatus.LOST];
      if (blockedStatuses.includes(batch.status as BatchStatus)) {
        throw new BadRequestException(
          `Lô hàng đang trong trạng thái ${batch.status} và không thể xuất kho. Vui lòng liên hệ Admin để xử lý sự cố trước.`,
        );
      }

      // Check destination node
      const destNode = await queryRunner.manager.findOne(NodeEntity, {
        where: { id: createShipmentDto.destinationNodeId, isActive: true },
      });
      if (!destNode) {
        throw new NotFoundException(`Kho nhận với ID ${createShipmentDto.destinationNodeId} không tồn tại hoặc đã bị khóa`);
      }

      // Step 1: Pessimistic Write Lock on Inventory
      const inventory = await queryRunner.manager
        .createQueryBuilder(InventoryEntity, 'inventory')
        .setLock('pessimistic_write')
        .where('inventory.batchId = :batchId AND inventory.nodeId = :nodeId', {
          batchId: createShipmentDto.batchId,
          nodeId: sourceNodeId,
        })
        .getOne();

      if (!inventory) {
        throw new BadRequestException('Lô hàng không tồn tại hoặc không còn hàng tại kho nguồn');
      }

      // Step 2: Validate available inventory
      if (Number(inventory.quantityAvailable) < createShipmentDto.quantityShipped) {
        throw new BadRequestException(
          `Không đủ số lượng hàng tồn kho để xuất. Hiện có: ${inventory.quantityAvailable} ${batch.unit}`,
        );
      }

      // Step 3: Subtract inventory directly
      inventory.quantityAvailable = Number(inventory.quantityAvailable) - createShipmentDto.quantityShipped;
      await queryRunner.manager.save(InventoryEntity, inventory);

      // Step 4: Create Shipment record
      const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const randomPart = randomUUID().replace(/-/g, '').substring(0, 4).toUpperCase();
      const trackingCode = `SHP-${todayStr}-${randomPart}`;

      const shipment = new ShipmentEntity();
      shipment.trackingCode = trackingCode;
      shipment.batchId = batch.id;
      shipment.sourceNodeId = sourceNodeId;
      shipment.destinationNodeId = createShipmentDto.destinationNodeId;
      shipment.quantityShipped = createShipmentDto.quantityShipped;
      shipment.status = ShipmentStatus.IN_TRANSIT;
      shipment.createdBy = currentUser.userId;
      shipment.notes = createShipmentDto.notes || null;
      if (createShipmentDto.expectedDeliveryDate) {
        shipment.expectedDeliveryDate = new Date(createShipmentDto.expectedDeliveryDate);
      }

      const savedShipment = await queryRunner.manager.save(ShipmentEntity, shipment);

      // Step 5: Update batch status
      batch.status = BatchStatus.IN_TRANSIT;
      await queryRunner.manager.save(BatchEntity, batch);

      // Step 6: Write Timeline Event (SHIPPED, negative delta)
      const event = new TimelineEventEntity();
      event.batchId = batch.id;
      event.eventType = TimelineEventType.SHIPPED;
      event.nodeId = sourceNodeId;
      event.actorId = currentUser.userId;
      event.shipmentId = savedShipment.id;
      event.quantityDelta = -createShipmentDto.quantityShipped;
      event.notes = `Xuất kho tạo vận đơn: ${savedShipment.trackingCode}`;
      await queryRunner.manager.save(TimelineEventEntity, event);

      // N-09 FIX: Ghi audit_log SHIP
      const auditLog = new AuditLogEntity();
      auditLog.actorId = currentUser.userId;
      auditLog.action = 'SHIP';
      auditLog.entityType = 'shipments';
      auditLog.entityId = savedShipment.id;
      auditLog.oldValues = { batchStatus: batch.status, inventoryBefore: Number(inventory.quantityAvailable) + createShipmentDto.quantityShipped };
      auditLog.newValues = {
        trackingCode: trackingCode,
        quantityShipped: createShipmentDto.quantityShipped,
        sourceNodeId,
        destinationNodeId: createShipmentDto.destinationNodeId,
        batchStatus: BatchStatus.IN_TRANSIT,
      };
      auditLog.ipAddress = null;
      auditLog.userAgent = null;
      await queryRunner.manager.save(AuditLogEntity, auditLog);

      await queryRunner.commitTransaction();

      // Return shipment with relations loaded
      savedShipment.batch = batch;
      return savedShipment;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async receiveShipment(id: string, receiveShipmentDto: ReceiveShipmentDto, currentUser: any): Promise<ShipmentEntity> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const shipment = await queryRunner.manager
        .createQueryBuilder(ShipmentEntity, 'shipment')
        .setLock('pessimistic_write')
        .where('shipment.id = :id', { id })
        .getOne();

      if (!shipment) {
        throw new NotFoundException(`Vận đơn với ID ${id} không tồn tại`);
      }

      // N-05 FIX: Cho phép nhận cả shipment DELAYED (không chỉ IN_TRANSIT)
      const receivableStatuses = [ShipmentStatus.IN_TRANSIT, ShipmentStatus.DELAYED];
      if (!receivableStatuses.includes(shipment.status as ShipmentStatus)) {
        throw new BadRequestException(
          `Vận đơn không ở trạng thái có thể nhận hàng (IN_TRANSIT hoặc DELAYED). Trạng thái hiện tại: ${shipment.status}`,
        );
      }

      if (currentUser.role !== 'Admin' && currentUser.nodeId !== shipment.destinationNodeId) {
        throw new ForbiddenException('Bạn không thuộc Node nhận của vận đơn này');
      }

      // N-06 FIX: Hỗ trợ quantityReceived < quantityShipped (DAMAGED flow)
      const quantityReceived = receiveShipmentDto.quantityReceived !== undefined
        ? receiveShipmentDto.quantityReceived
        : shipment.quantityShipped;

      if (quantityReceived <= 0) {
        throw new BadRequestException('Số lượng nhận phải lớn hơn 0');
      }
      if (quantityReceived > shipment.quantityShipped) {
        throw new BadRequestException(
          `Số lượng nhận (${quantityReceived}) không được vượt quá số lượng gửi (${shipment.quantityShipped})`
        );
      }

      const wasDelayed = shipment.status === ShipmentStatus.DELAYED;
      shipment.status = ShipmentStatus.RECEIVED;
      shipment.actualDeliveryDate = new Date();
      const savedShipment = await queryRunner.manager.save(ShipmentEntity, shipment);

      // Cộng kho theo số lượng thực tế nhận
      await queryRunner.query(
        `INSERT INTO inventory (batch_id, node_id, quantity_available, last_updated_at, version)
         VALUES ($1, $2, $3, NOW(), 1)
         ON CONFLICT (batch_id, node_id)
         DO UPDATE SET 
           quantity_available = inventory.quantity_available + EXCLUDED.quantity_available,
           last_updated_at = NOW(),
           version = inventory.version + 1`,
        [shipment.batchId, shipment.destinationNodeId, quantityReceived],
      );

      const batch = await queryRunner.manager.findOne(BatchEntity, {
        where: { id: shipment.batchId },
      });
      if (batch) {
        batch.currentNodeId = shipment.destinationNodeId;
        batch.status = BatchStatus.RECEIVED;
        await queryRunner.manager.save(BatchEntity, batch);
      }

      const event = new TimelineEventEntity();
      event.batchId = shipment.batchId;
      event.eventType = TimelineEventType.RECEIVED;
      event.nodeId = shipment.destinationNodeId;
      event.actorId = currentUser.userId;
      event.shipmentId = shipment.id;
      event.quantityDelta = quantityReceived;
      event.notes = `Đã nhận hàng thành công tại kho nhận. Mã vận đơn: ${shipment.trackingCode}${quantityReceived < shipment.quantityShipped ? ` (Nhận thiếu: ${quantityReceived}/${shipment.quantityShipped})` : ''}`;
      await queryRunner.manager.save(TimelineEventEntity, event);

      // N-06: Tạo shipment_issues(DAMAGED) nếu nhận thiếu
      if (quantityReceived < shipment.quantityShipped) {
        const damagedQty = shipment.quantityShipped - quantityReceived;
        const issue = new ShipmentIssueEntity();
        issue.shipmentId = shipment.id;
        issue.issueType = 'DAMAGED';
        issue.severity = 'HIGH';
        issue.detectedBy = `USER:${currentUser.userId}`;
        issue.reportedBy = currentUser.userId;
        issue.notes = `Nhận thiếu ${damagedQty} sản phẩm so với số lượng gửi (${quantityReceived}/${shipment.quantityShipped}). Lý do: ${
          receiveShipmentDto.damageReason || 'Không ghi nhận'
        }`;
        issue.isResolved = false;
        await queryRunner.manager.save(ShipmentIssueEntity, issue);
      }

      // N-05: Nếu shipment đang DELAYED, tự động đóng incident liên quan
      if (wasDelayed) {
        const openIncident = await queryRunner.manager.findOne(IncidentReportEntity, {
          where: { shipmentId: shipment.id, status: 'OPEN' },
        });
        if (openIncident) {
          openIncident.status = 'CLOSED';
          openIncident.resolution = 'Hàng đã được tiếp nhận sau khi trễ hạn';
          openIncident.resolutionType = 'FOUND';
          openIncident.resolvedAt = new Date();
          openIncident.closedAt = new Date();
          await queryRunner.manager.save(IncidentReportEntity, openIncident);
        }
      }

      // N-10 FIX: Ghi audit_log RECEIVE
      const auditLog = new AuditLogEntity();
      auditLog.actorId = currentUser.userId;
      auditLog.action = 'RECEIVE';
      auditLog.entityType = 'shipments';
      auditLog.entityId = shipment.id;
      auditLog.oldValues = { status: wasDelayed ? 'DELAYED' : 'IN_TRANSIT' };
      auditLog.newValues = {
        status: 'RECEIVED',
        quantityReceived,
        quantityShipped: shipment.quantityShipped,
        destinationNodeId: shipment.destinationNodeId,
        incidentAutoClosed: wasDelayed,
      };
      auditLog.ipAddress = null;
      auditLog.userAgent = null;
      await queryRunner.manager.save(AuditLogEntity, auditLog);

      await queryRunner.commitTransaction();

      if (batch) {
        savedShipment.batch = batch;
      }
      return savedShipment;
    } catch (error: any) {
      await queryRunner.rollbackTransaction();
      if (error.name === 'OptimisticLockVersionMismatchError') {
        throw new ConflictException(
          'Dữ liệu vận đơn đã bị thay đổi bởi người dùng khác. Vui lòng tải lại trang.',
        );
      }
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
