import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { DataSource } from 'typeorm';
import { BatchStatus } from '../../common/enums/batch-status.enum';
import { TimelineEventType } from '../../common/enums/timeline-event-type.enum';
import { RoleName } from '../../common/enums/role.enum';
import { NodeEntity } from '../nodes/entities/node.entity';
import { ProductEntity } from '../products/entities/product.entity';
import { ShipmentEntity } from '../shipments/entities/shipment.entity';
import { CreateBatchDto } from './dto/create-batch.dto';
import { SellBatchDto } from './dto/sell-batch.dto';
import { BatchQrCodeEntity } from './entities/batch-qr-code.entity';
import { BatchEntity } from './entities/batch.entity';
import { InventoryEntity } from './entities/inventory.entity';
import { TimelineEventEntity } from './entities/timeline-event.entity';
import { AuditLogEntity } from '../audit/entities/audit-log.entity';
import { QrService } from './qr.service';

@Injectable()
export class BatchesService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly qrService: QrService,
  ) {}

  async create(createBatchDto: CreateBatchDto, currentUser: any): Promise<BatchEntity> {
    const { productId, quantity, unit, manufactureDate, expiryDate, originNodeId } = createBatchDto;

    // 1. Validate Business Rules
    const mDate = new Date(manufactureDate);
    const eDate = new Date(expiryDate);

    if (isNaN(mDate.getTime())) {
      throw new BadRequestException('Ngày sản xuất không hợp lệ');
    }
    if (isNaN(eDate.getTime())) {
      throw new BadRequestException('Hạn sử dụng không hợp lệ');
    }
    if (eDate <= mDate) {
      throw new BadRequestException('Hạn sử dụng phải lớn hơn ngày sản xuất');
    }
    if (quantity <= 0) {
      throw new BadRequestException('Số lượng khởi tạo phải lớn hơn 0');
    }

    // Determine target node
    let targetNodeId = originNodeId;
    if (!currentUser.role || currentUser.role === 'Admin') {
      if (!targetNodeId) {
        throw new BadRequestException('Admin cần cung cấp originNodeId khi tạo lô hàng');
      }
    } else {
      // Manufacturer
      if (!currentUser.nodeId) {
        throw new BadRequestException('Tài khoản của bạn chưa được gán vào Node nào');
      }
      targetNodeId = currentUser.nodeId;
    }

    // 2. Perform DB Checks and Transactions
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Check product existence
      const product = await queryRunner.manager.findOne(ProductEntity, {
        where: { id: productId, isActive: true },
      });
      if (!product) {
        throw new NotFoundException(`Sản phẩm với ID ${productId} không tồn tại hoặc đã bị khóa`);
      }

      // Check node existence
      const node = await queryRunner.manager.findOne(NodeEntity, {
        where: { id: targetNodeId, isActive: true },
      });
      if (!node) {
        throw new NotFoundException(`Node với ID ${targetNodeId} không tồn tại hoặc đã bị khóa`);
      }

      // Generate batch code: BCH-YYYYMMDD-{8_characters_uuid}
      const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const uuidPart = randomUUID().replace(/-/g, '').substring(0, 8);
      const batchCode = `BCH-${todayStr}-${uuidPart}`;

      // Insert Batch
      const batch = new BatchEntity();
      batch.batchCode = batchCode;
      batch.productId = productId;
      batch.originNodeId = targetNodeId!;
      batch.currentNodeId = targetNodeId!;
      batch.quantity = quantity;
      batch.unit = unit || product.unit;
      batch.manufactureDate = mDate;
      batch.expiryDate = eDate;
      batch.status = BatchStatus.CREATED;
      batch.createdBy = currentUser.userId;
      batch.totalValue = Number((product.unitPrice * quantity).toFixed(2));

      const savedBatch = await queryRunner.manager.save(BatchEntity, batch);

      // Initialize inventory at manufacturer node
      const inventory = new InventoryEntity();
      inventory.batchId = savedBatch.id;
      inventory.nodeId = targetNodeId!;
      inventory.quantityAvailable = quantity;
      await queryRunner.manager.save(InventoryEntity, inventory);

      // Generate QR Code
      const frontendUrl = process.env.FRONTEND_URL || 'https://mini-logistic.com';
      const traceUrl = `${frontendUrl}/trace/${batchCode}`;
      const svgData = await this.qrService.generateSvg(traceUrl);
      const qrImageUrl = await this.qrService.generatePngDataUrl(traceUrl);

      // Save QR metadata
      const qrCode = new BatchQrCodeEntity();
      qrCode.batchId = savedBatch.id;
      qrCode.qrData = traceUrl;
      qrCode.svgData = svgData;
      qrCode.qrImageUrl = qrImageUrl;
      qrCode.generatedBy = currentUser.userId;
      await queryRunner.manager.save(BatchQrCodeEntity, qrCode);

      // Write Timeline Event
      const event = new TimelineEventEntity();
      event.batchId = savedBatch.id;
      event.eventType = TimelineEventType.CREATED;
      event.nodeId = targetNodeId!;
      event.actorId = currentUser.userId;
      event.quantityDelta = quantity;
      event.notes = 'Khởi tạo lô hàng mới và sinh mã QR';
      await queryRunner.manager.save(TimelineEventEntity, event);

      // N-08 FIX: Ghi audit_log CREATE_BATCH
      const auditLog = new AuditLogEntity();
      auditLog.actorId = currentUser.userId;
      auditLog.action = 'CREATE_BATCH';
      auditLog.entityType = 'batches';
      auditLog.entityId = savedBatch.id;
      auditLog.oldValues = null;
      auditLog.newValues = {
        batchCode,
        productId,
        quantity,
        unit: batch.unit,
        nodeId: targetNodeId,
        manufactureDate: mDate.toISOString(),
        expiryDate: eDate.toISOString(),
      };
      auditLog.ipAddress = null;
      auditLog.userAgent = null;
      await queryRunner.manager.save(AuditLogEntity, auditLog);

      await queryRunner.commitTransaction();

      // Load relations to return complete object
      savedBatch.product = product;
      savedBatch.originNode = node;
      savedBatch.currentNode = node;

      return savedBatch;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findById(id: string): Promise<BatchEntity> {
    const batch = await this.dataSource.getRepository(BatchEntity).findOne({
      where: { id },
      relations: { product: true, originNode: true, currentNode: true },
    });
    if (!batch) {
      throw new NotFoundException(`Lô hàng với ID ${id} không tồn tại`);
    }
    return batch;
  }

  async findAll(query: any, currentUser: any): Promise<any> {
    const qb = this.dataSource.getRepository(BatchEntity).createQueryBuilder('batch')
      .leftJoinAndSelect('batch.product', 'product')
      .leftJoinAndSelect('batch.originNode', 'originNode')
      .leftJoinAndSelect('batch.currentNode', 'currentNode');

    if (currentUser.role === 'Admin') {
      // Admin sees everything
    } else if (currentUser.role === 'Manufacturer') {
      qb.andWhere('batch.originNodeId = :nodeId', { nodeId: currentUser.nodeId });
    } else if (currentUser.role === 'Distributor' || currentUser.role === 'Retailer') {
      qb.innerJoin(InventoryEntity, 'inv', 'inv.batchId = batch.id')
        .andWhere('inv.nodeId = :nodeId', { nodeId: currentUser.nodeId });
    } else {
      qb.andWhere('1=0');
    }

    if (query.status) {
      qb.andWhere('batch.status = :status', { status: query.status });
    }

    if (query.productId) {
      qb.andWhere('batch.productId = :productId', { productId: query.productId });
    }

    if (query.search) {
      qb.andWhere(
        '(batch.batchCode ILIKE :search OR product.name ILIKE :search OR product.sku ILIKE :search)',
        { search: `%${query.search}%` },
      );
    }

    const page = parseInt(query.page || '1', 10);
    const limit = parseInt(query.limit || '10', 10);
    const skip = (page - 1) * limit;

    const [data, total] = await qb
      .skip(skip)
      .take(limit)
      .orderBy('batch.createdAt', 'DESC')
      .getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findDetails(id: string, currentUser: any): Promise<any> {
    const batch = await this.findById(id);

    if (currentUser.role !== 'Admin') {
      if (currentUser.role === 'Manufacturer') {
        if (batch.originNodeId !== currentUser.nodeId) {
          throw new BadRequestException('Bạn không có quyền truy cập lô hàng này');
        }
      } else if (currentUser.role === 'Distributor' || currentUser.role === 'Retailer') {
        const hasInventory = await this.dataSource.getRepository(InventoryEntity).findOne({
          where: { batchId: id, nodeId: currentUser.nodeId },
        });
        if (!hasInventory) {
          throw new BadRequestException('Lô hàng này chưa từng đi qua cơ sở của bạn');
        }
      } else {
        throw new BadRequestException('Vai trò của bạn không có quyền xem thông tin lô hàng');
      }
    }

    const qrCode = await this.dataSource.getRepository(BatchQrCodeEntity).findOne({
      where: { batchId: id },
    });

    if (currentUser.role !== RoleName.ADMIN && currentUser.role !== RoleName.RETAILER) {
      const filteredEvents = await this.getTimeline(id, currentUser);
      
      let simulatedStatus = BatchStatus.CREATED;
      let simulatedCurrentNode = batch.originNode;

      for (const event of filteredEvents) {
        if (event.node) {
          simulatedCurrentNode = event.node;
        }
        if (event.eventType === TimelineEventType.CREATED) {
          simulatedStatus = BatchStatus.CREATED;
        } else if (event.eventType === TimelineEventType.SHIPPED) {
          simulatedStatus = BatchStatus.IN_TRANSIT;
        } else if (event.eventType === TimelineEventType.RECEIVED) {
          simulatedStatus = BatchStatus.RECEIVED;
        } else if (event.eventType === TimelineEventType.SOLD) {
          simulatedStatus = BatchStatus.SOLD;
        } else if (event.eventType === TimelineEventType.LOST) {
          simulatedStatus = BatchStatus.LOST;
        } else if (event.eventType === TimelineEventType.DISCARDED) {
          simulatedStatus = BatchStatus.DISCARDED;
        } else if (event.eventType === TimelineEventType.DELAYED) {
          simulatedStatus = BatchStatus.DELAYED;
        } else if (event.eventType === TimelineEventType.INVESTIGATING) {
          simulatedStatus = BatchStatus.INVESTIGATING;
        }
      }

      batch.status = simulatedStatus;
      batch.currentNode = simulatedCurrentNode;
      if (simulatedCurrentNode) {
        batch.currentNodeId = simulatedCurrentNode.id;
      }
    }

    if (currentUser.role === RoleName.MANUFACTURER || currentUser.role === RoleName.DISTRIBUTOR) {
      delete (batch as any).totalValue;
      if (batch.product) {
        delete (batch.product as any).unitPrice;
      }
    }

    let localInventory = null;
    if (currentUser.nodeId) {
      localInventory = await this.dataSource.getRepository(InventoryEntity).findOne({
        where: { batchId: id, nodeId: currentUser.nodeId },
      });
    }

    let inventories = undefined;
    if (currentUser.role === RoleName.ADMIN) {
      inventories = await this.dataSource.getRepository(InventoryEntity).find({
        where: { batchId: id },
        relations: { node: true },
      });
    }

    return {
      ...batch,
      qrCode: qrCode || null,
      localInventory: localInventory || null,
      inventories: inventories || undefined,
    };
  }

  async getTimeline(id: string, currentUser: any): Promise<TimelineEventEntity[]> {
    // Validate accessibility first
    const batch = await this.findById(id);

    if (currentUser.role !== 'Admin') {
      if (currentUser.role === 'Manufacturer') {
        if (batch.originNodeId !== currentUser.nodeId) {
          throw new BadRequestException('Bạn không có quyền truy cập lô hàng này');
        }
      } else if (currentUser.role === 'Distributor' || currentUser.role === 'Retailer') {
        const hasInventory = await this.dataSource.getRepository(InventoryEntity).findOne({
          where: { batchId: id, nodeId: currentUser.nodeId },
        });
        if (!hasInventory) {
          throw new BadRequestException('Lô hàng này chưa từng đi qua cơ sở của bạn');
        }
      } else {
        throw new BadRequestException('Vai trò của bạn không có quyền xem thông tin lô hàng');
      }
    }

    const events = await this.dataSource.getRepository(TimelineEventEntity).find({
      where: { batchId: id },
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

    if (currentUser.role === RoleName.ADMIN || currentUser.role === RoleName.RETAILER) {
      return events;
    }

    if (currentUser.role === RoleName.MANUFACTURER || currentUser.role === RoleName.DISTRIBUTOR) {
      const restrictedEventTypes = [
        'PRICE_CONFIGURED',
        'SOLD',
        'REVENUE_RECORDED',
        'PROFIT_CALCULATED',
        'FINANCIAL_EVENT',
        'FINANCIAL_REPORT',
      ];
      const filteredEvents = events.filter(
        event => !restrictedEventTypes.includes(event.eventType)
      );

      for (const event of filteredEvents) {
        if (event.metadata) {
          const sensitiveKeys = [
            'cost_price',
            'sale_price',
            'revenue',
            'cost',
            'profit',
            'price',
            'unitPrice',
          ];
          for (const key of sensitiveKeys) {
            delete event.metadata[key];
          }
        }
      }
      return filteredEvents;
    }

    return events;
  }

  async regenerateQr(id: string, currentUser: any): Promise<BatchQrCodeEntity> {
    const batch = await this.findById(id);

    if (currentUser.role !== 'Admin') {
      if (currentUser.role === 'Manufacturer') {
        if (batch.originNodeId !== currentUser.nodeId) {
          throw new BadRequestException('Bạn không phải là cơ sở sản xuất khởi tạo lô hàng này');
        }
      } else {
        throw new BadRequestException('Chỉ có Admin hoặc Nhà sản xuất mới có quyền cấp lại mã QR');
      }
    }

    const frontendUrl = process.env.FRONTEND_URL || 'https://mini-logistic.com';
    const traceUrl = `${frontendUrl}/trace/${batch.batchCode}`;
    const svgData = await this.qrService.generateSvg(traceUrl);
    const qrImageUrl = await this.qrService.generatePngDataUrl(traceUrl);

    let qrCode = await this.dataSource.getRepository(BatchQrCodeEntity).findOne({
      where: { batchId: id },
    });

    if (!qrCode) {
      qrCode = new BatchQrCodeEntity();
      qrCode.batchId = id;
    }

    qrCode.qrData = traceUrl;
    qrCode.svgData = svgData;
    qrCode.qrImageUrl = qrImageUrl;
    qrCode.generatedBy = currentUser.userId;
    return this.dataSource.getRepository(BatchQrCodeEntity).save(qrCode);
  }

  async sell(id: string, sellBatchDto: SellBatchDto, currentUser: any): Promise<any> {
    const { quantity, saleDate, salePrice, costPrice } = sellBatchDto;

    if (!currentUser.nodeId) {
      throw new BadRequestException('Tài khoản của bạn chưa được gán vào Node nào để bán hàng');
    }

    if (currentUser.role === RoleName.RETAILER) {
      if (costPrice === undefined || costPrice === null) {
        throw new BadRequestException('Giá vốn (Cost Price) là bắt buộc khi bán lẻ');
      }
      if (salePrice === undefined || salePrice === null) {
        throw new BadRequestException('Giá bán (Sale Price) là bắt buộc khi bán lẻ');
      }
      if (costPrice <= 0) {
        throw new BadRequestException('Giá vốn phải lớn hơn 0');
      }
      if (salePrice <= 0) {
        throw new BadRequestException('Giá bán phải lớn hơn 0');
      }
      if (salePrice < costPrice) {
        throw new BadRequestException('Giá bán phải lớn hơn hoặc bằng giá vốn');
      }
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const batchForPrice = await queryRunner.manager.findOne(BatchEntity, {
        where: { id },
        relations: { product: true },
      });
      if (!batchForPrice) {
        throw new NotFoundException('Không tìm thấy lô hàng');
      }

      // N-03 FIX: Chỉ cho phép bán khi batch đang ở trạng thái RECEIVED tại node của Retailer
      const sellableStatuses = [BatchStatus.RECEIVED, BatchStatus.SOLD];
      if (!sellableStatuses.includes(batchForPrice.status as BatchStatus)) {
        throw new BadRequestException(
          `Lô hàng đang ở trạng thái "${batchForPrice.status}" và chưa được nhập kho để bán. Chỉ có thể bán hàng khi lô hàng ở trạng thái RECEIVED.`,
        );
      }

      const costPriceNum = costPrice !== undefined ? Number(costPrice) : Number(batchForPrice.product?.unitPrice || 0);
      const salePriceNum = salePrice !== undefined ? Number(salePrice) : costPriceNum;

      const revenue = Number((quantity * salePriceNum).toFixed(2));
      const cost = Number((quantity * costPriceNum).toFixed(2));
      const profit = Number((revenue - cost).toFixed(2));

      const inventory = await queryRunner.manager.createQueryBuilder(InventoryEntity, 'inventory')
        .setLock('pessimistic_write')
        .where('inventory.batchId = :batchId AND inventory.nodeId = :nodeId', {
          batchId: id,
          nodeId: currentUser.nodeId,
        })
        .getOne();

      if (!inventory) {
        throw new NotFoundException('Lô hàng không tồn tại hoặc không còn hàng tồn kho tại cửa hàng của bạn');
      }

      if (inventory.quantityAvailable < quantity) {
        throw new BadRequestException(
          `Không đủ số lượng hàng tồn kho khả dụng để bán. Hiện có: ${inventory.quantityAvailable} (yêu cầu: ${quantity})`
        );
      }

      inventory.quantityAvailable = Number((inventory.quantityAvailable - quantity).toFixed(3));
      await queryRunner.manager.save(InventoryEntity, inventory);

      if (currentUser.role === RoleName.RETAILER) {
        const priceEvent = new TimelineEventEntity();
        priceEvent.batchId = id;
        priceEvent.eventType = TimelineEventType.PRICE_CONFIGURED;
        priceEvent.nodeId = currentUser.nodeId;
        priceEvent.actorId = currentUser.userId;
        priceEvent.quantityDelta = null;
        priceEvent.notes = `Đã cấu hình giá mua và bán lẻ cho lô hàng.`;
        priceEvent.metadata = {
          cost_price: costPriceNum,
          sale_price: salePriceNum,
        };
        if (saleDate) {
          priceEvent.occurredAt = new Date(saleDate);
        }
        await queryRunner.manager.save(TimelineEventEntity, priceEvent);
      }

      const event = new TimelineEventEntity();
      event.batchId = id;
      event.eventType = TimelineEventType.SOLD;
      event.nodeId = currentUser.nodeId;
      event.actorId = currentUser.userId;
      event.quantityDelta = -quantity;
      event.notes = `Đã bán lẻ ${quantity} sản phẩm từ lô hàng.`;
      event.metadata = {
        qty_sold: Number(quantity),
        cost_price: costPriceNum,
        sale_price: salePriceNum,
        revenue: revenue,
        cost: cost,
        profit: profit,
      };
      if (saleDate) {
        event.occurredAt = new Date(saleDate);
      }
      await queryRunner.manager.save(TimelineEventEntity, event);

      const batch = await queryRunner.manager.findOne(BatchEntity, {
        where: { id },
        relations: { product: true, originNode: true, currentNode: true },
      });
      if (batch) {
        batch.quantity = Number((batch.quantity - quantity).toFixed(3));
        const unitPrice = batch.product?.unitPrice || 0;
        batch.totalValue = Number((unitPrice * batch.quantity).toFixed(2));
        if (batch.quantity <= 0) {
          batch.status = BatchStatus.SOLD;
        }
        await queryRunner.manager.save(BatchEntity, batch);
      }

      await queryRunner.commitTransaction();
      return batch;
    } catch (error: any) {
      await queryRunner.rollbackTransaction();
      if (error.name === 'OptimisticLockVersionMismatchError') {
        throw new ConflictException(
          'Dữ liệu lô hàng đã bị thay đổi bởi người dùng khác. Vui lòng tải lại trang.',
        );
      }
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
