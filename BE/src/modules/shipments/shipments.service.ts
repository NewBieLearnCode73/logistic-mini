import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { randomUUID } from 'crypto';
import { ShipmentEntity } from './entities/shipment.entity';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { BatchEntity } from '../batches/entities/batch.entity';
import { InventoryEntity } from '../batches/entities/inventory.entity';
import { TimelineEventEntity } from '../batches/entities/timeline-event.entity';
import { NodeEntity } from '../nodes/entities/node.entity';
import { ShipmentStatus } from '../../common/enums/shipment-status.enum';
import { BatchStatus } from '../../common/enums/batch-status.enum';
import { TimelineEventType } from '../../common/enums/timeline-event-type.enum';
import { ShipmentIssueEntity } from '../incidents/entities/shipment-issue.entity';

@Injectable()
export class ShipmentsService {
  constructor(private readonly dataSource: DataSource) {}

  async findAll(
    query: { page?: string; limit?: string },
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

  async receiveShipment(id: string, currentUser: any): Promise<ShipmentEntity> {
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

      if (shipment.status !== ShipmentStatus.IN_TRANSIT) {
        throw new BadRequestException(
          `Vận đơn không ở trạng thái đang vận chuyển (IN_TRANSIT). Trạng thái hiện tại: ${shipment.status}`,
        );
      }

      if (currentUser.role !== 'Admin' && currentUser.nodeId !== shipment.destinationNodeId) {
        throw new ForbiddenException('Bạn không thuộc Node nhận của vận đơn này');
      }

      shipment.status = ShipmentStatus.RECEIVED;
      shipment.actualDeliveryDate = new Date();
      const savedShipment = await queryRunner.manager.save(ShipmentEntity, shipment);

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
      event.quantityDelta = shipment.quantityShipped;
      event.notes = `Đã nhận hàng thành công tại kho nhận. Mã vận đơn: ${shipment.trackingCode}`;
      await queryRunner.manager.save(TimelineEventEntity, event);

      await queryRunner.commitTransaction();

      if (batch) {
        savedShipment.batch = batch;
      }
      return savedShipment;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
