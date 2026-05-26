import {
  BadRequestException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { DataSource } from 'typeorm';
import { BatchStatus } from '../../common/enums/batch-status.enum';
import { TimelineEventType } from '../../common/enums/timeline-event-type.enum';
import { NodeEntity } from '../nodes/entities/node.entity';
import { ProductEntity } from '../products/entities/product.entity';
import { CreateBatchDto } from './dto/create-batch.dto';
import { SellBatchDto } from './dto/sell-batch.dto';
import { BatchQrCodeEntity } from './entities/batch-qr-code.entity';
import { BatchEntity } from './entities/batch.entity';
import { InventoryEntity } from './entities/inventory.entity';
import { TimelineEventEntity } from './entities/timeline-event.entity';
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

      const savedBatch = await queryRunner.manager.save(BatchEntity, batch);

      // Initialize inventory at manufacturer node
      const inventory = new InventoryEntity();
      inventory.batchId = savedBatch.id;
      inventory.nodeId = targetNodeId!;
      inventory.quantityAvailable = quantity;
      await queryRunner.manager.save(InventoryEntity, inventory);

      // Generate QR Code
      const domain = process.env.APP_DOMAIN || 'mini-logistic.com';
      const traceUrl = `https://${domain}/public/trace/${batchCode}`;
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

    return {
      ...batch,
      qrCode: qrCode || null,
    };
  }

  async getTimeline(id: string, currentUser: any): Promise<TimelineEventEntity[]> {
    // Validate accessibility first
    await this.findDetails(id, currentUser);

    const events = await this.dataSource.getRepository(TimelineEventEntity).find({
      where: { batchId: id },
      relations: { node: true, actor: true },
      order: { occurredAt: 'ASC' },
    });

    for (const event of events) {
      if (event.actor) {
        delete (event.actor as any).passwordHash;
      }
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

    const domain = process.env.APP_DOMAIN || 'mini-logistic.com';
    const traceUrl = `https://${domain}/public/trace/${batch.batchCode}`;
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

  async sell(id: string, sellBatchDto: SellBatchDto, currentUser: any): Promise<void> {
    const { quantity } = sellBatchDto;

    if (!currentUser.nodeId) {
      throw new BadRequestException('Tài khoản của bạn chưa được gán vào Node nào để bán hàng');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
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

      const event = new TimelineEventEntity();
      event.batchId = id;
      event.eventType = TimelineEventType.SOLD;
      event.nodeId = currentUser.nodeId;
      event.actorId = currentUser.userId;
      event.quantityDelta = -quantity;
      event.notes = `Đã bán lẻ ${quantity} sản phẩm từ lô hàng.`;
      await queryRunner.manager.save(TimelineEventEntity, event);

      if (inventory.quantityAvailable === 0) {
        const batch = await queryRunner.manager.findOne(BatchEntity, {
          where: { id },
        });
        if (batch) {
          batch.status = BatchStatus.SOLD;
          await queryRunner.manager.save(BatchEntity, batch);
        }
      }

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
