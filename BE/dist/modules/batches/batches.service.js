"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BatchesService = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const typeorm_1 = require("typeorm");
const batch_status_enum_1 = require("../../common/enums/batch-status.enum");
const timeline_event_type_enum_1 = require("../../common/enums/timeline-event-type.enum");
const node_entity_1 = require("../nodes/entities/node.entity");
const product_entity_1 = require("../products/entities/product.entity");
const batch_qr_code_entity_1 = require("./entities/batch-qr-code.entity");
const batch_entity_1 = require("./entities/batch.entity");
const inventory_entity_1 = require("./entities/inventory.entity");
const timeline_event_entity_1 = require("./entities/timeline-event.entity");
const qr_service_1 = require("./qr.service");
let BatchesService = class BatchesService {
    dataSource;
    qrService;
    constructor(dataSource, qrService) {
        this.dataSource = dataSource;
        this.qrService = qrService;
    }
    async create(createBatchDto, currentUser) {
        const { productId, quantity, unit, manufactureDate, expiryDate, originNodeId } = createBatchDto;
        const mDate = new Date(manufactureDate);
        const eDate = new Date(expiryDate);
        if (isNaN(mDate.getTime())) {
            throw new common_1.BadRequestException('Ngày sản xuất không hợp lệ');
        }
        if (isNaN(eDate.getTime())) {
            throw new common_1.BadRequestException('Hạn sử dụng không hợp lệ');
        }
        if (eDate <= mDate) {
            throw new common_1.BadRequestException('Hạn sử dụng phải lớn hơn ngày sản xuất');
        }
        if (quantity <= 0) {
            throw new common_1.BadRequestException('Số lượng khởi tạo phải lớn hơn 0');
        }
        let targetNodeId = originNodeId;
        if (!currentUser.role || currentUser.role === 'Admin') {
            if (!targetNodeId) {
                throw new common_1.BadRequestException('Admin cần cung cấp originNodeId khi tạo lô hàng');
            }
        }
        else {
            if (!currentUser.nodeId) {
                throw new common_1.BadRequestException('Tài khoản của bạn chưa được gán vào Node nào');
            }
            targetNodeId = currentUser.nodeId;
        }
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const product = await queryRunner.manager.findOne(product_entity_1.ProductEntity, {
                where: { id: productId, isActive: true },
            });
            if (!product) {
                throw new common_1.NotFoundException(`Sản phẩm với ID ${productId} không tồn tại hoặc đã bị khóa`);
            }
            const node = await queryRunner.manager.findOne(node_entity_1.NodeEntity, {
                where: { id: targetNodeId, isActive: true },
            });
            if (!node) {
                throw new common_1.NotFoundException(`Node với ID ${targetNodeId} không tồn tại hoặc đã bị khóa`);
            }
            const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
            const uuidPart = (0, crypto_1.randomUUID)().replace(/-/g, '').substring(0, 8);
            const batchCode = `BCH-${todayStr}-${uuidPart}`;
            const batch = new batch_entity_1.BatchEntity();
            batch.batchCode = batchCode;
            batch.productId = productId;
            batch.originNodeId = targetNodeId;
            batch.currentNodeId = targetNodeId;
            batch.quantity = quantity;
            batch.unit = unit || product.unit;
            batch.manufactureDate = mDate;
            batch.expiryDate = eDate;
            batch.status = batch_status_enum_1.BatchStatus.CREATED;
            batch.createdBy = currentUser.userId;
            batch.totalValue = Number((product.unitPrice * quantity).toFixed(2));
            const savedBatch = await queryRunner.manager.save(batch_entity_1.BatchEntity, batch);
            const inventory = new inventory_entity_1.InventoryEntity();
            inventory.batchId = savedBatch.id;
            inventory.nodeId = targetNodeId;
            inventory.quantityAvailable = quantity;
            await queryRunner.manager.save(inventory_entity_1.InventoryEntity, inventory);
            const domain = process.env.APP_DOMAIN || 'mini-logistic.com';
            const traceUrl = `https://${domain}/public/trace/${batchCode}`;
            const svgData = await this.qrService.generateSvg(traceUrl);
            const qrImageUrl = await this.qrService.generatePngDataUrl(traceUrl);
            const qrCode = new batch_qr_code_entity_1.BatchQrCodeEntity();
            qrCode.batchId = savedBatch.id;
            qrCode.qrData = traceUrl;
            qrCode.svgData = svgData;
            qrCode.qrImageUrl = qrImageUrl;
            qrCode.generatedBy = currentUser.userId;
            await queryRunner.manager.save(batch_qr_code_entity_1.BatchQrCodeEntity, qrCode);
            const event = new timeline_event_entity_1.TimelineEventEntity();
            event.batchId = savedBatch.id;
            event.eventType = timeline_event_type_enum_1.TimelineEventType.CREATED;
            event.nodeId = targetNodeId;
            event.actorId = currentUser.userId;
            event.quantityDelta = quantity;
            event.notes = 'Khởi tạo lô hàng mới và sinh mã QR';
            await queryRunner.manager.save(timeline_event_entity_1.TimelineEventEntity, event);
            await queryRunner.commitTransaction();
            savedBatch.product = product;
            savedBatch.originNode = node;
            savedBatch.currentNode = node;
            return savedBatch;
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    async findById(id) {
        const batch = await this.dataSource.getRepository(batch_entity_1.BatchEntity).findOne({
            where: { id },
            relations: { product: true, originNode: true, currentNode: true },
        });
        if (!batch) {
            throw new common_1.NotFoundException(`Lô hàng với ID ${id} không tồn tại`);
        }
        return batch;
    }
    async findAll(query, currentUser) {
        const qb = this.dataSource.getRepository(batch_entity_1.BatchEntity).createQueryBuilder('batch')
            .leftJoinAndSelect('batch.product', 'product')
            .leftJoinAndSelect('batch.originNode', 'originNode')
            .leftJoinAndSelect('batch.currentNode', 'currentNode');
        if (currentUser.role === 'Admin') {
        }
        else if (currentUser.role === 'Manufacturer') {
            qb.andWhere('batch.originNodeId = :nodeId', { nodeId: currentUser.nodeId });
        }
        else if (currentUser.role === 'Distributor' || currentUser.role === 'Retailer') {
            qb.innerJoin(inventory_entity_1.InventoryEntity, 'inv', 'inv.batchId = batch.id')
                .andWhere('inv.nodeId = :nodeId', { nodeId: currentUser.nodeId });
        }
        else {
            qb.andWhere('1=0');
        }
        if (query.status) {
            qb.andWhere('batch.status = :status', { status: query.status });
        }
        if (query.productId) {
            qb.andWhere('batch.productId = :productId', { productId: query.productId });
        }
        if (query.search) {
            qb.andWhere('(batch.batchCode ILIKE :search OR product.name ILIKE :search OR product.sku ILIKE :search)', { search: `%${query.search}%` });
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
    async findDetails(id, currentUser) {
        const batch = await this.findById(id);
        if (currentUser.role !== 'Admin') {
            if (currentUser.role === 'Manufacturer') {
                if (batch.originNodeId !== currentUser.nodeId) {
                    throw new common_1.BadRequestException('Bạn không có quyền truy cập lô hàng này');
                }
            }
            else if (currentUser.role === 'Distributor' || currentUser.role === 'Retailer') {
                const hasInventory = await this.dataSource.getRepository(inventory_entity_1.InventoryEntity).findOne({
                    where: { batchId: id, nodeId: currentUser.nodeId },
                });
                if (!hasInventory) {
                    throw new common_1.BadRequestException('Lô hàng này chưa từng đi qua cơ sở của bạn');
                }
            }
            else {
                throw new common_1.BadRequestException('Vai trò của bạn không có quyền xem thông tin lô hàng');
            }
        }
        const qrCode = await this.dataSource.getRepository(batch_qr_code_entity_1.BatchQrCodeEntity).findOne({
            where: { batchId: id },
        });
        return {
            ...batch,
            qrCode: qrCode || null,
        };
    }
    async getTimeline(id, currentUser) {
        await this.findDetails(id, currentUser);
        const events = await this.dataSource.getRepository(timeline_event_entity_1.TimelineEventEntity).find({
            where: { batchId: id },
            relations: { node: true, actor: true },
            order: { occurredAt: 'ASC' },
        });
        for (const event of events) {
            if (event.actor) {
                delete event.actor.passwordHash;
            }
        }
        return events;
    }
    async regenerateQr(id, currentUser) {
        const batch = await this.findById(id);
        if (currentUser.role !== 'Admin') {
            if (currentUser.role === 'Manufacturer') {
                if (batch.originNodeId !== currentUser.nodeId) {
                    throw new common_1.BadRequestException('Bạn không phải là cơ sở sản xuất khởi tạo lô hàng này');
                }
            }
            else {
                throw new common_1.BadRequestException('Chỉ có Admin hoặc Nhà sản xuất mới có quyền cấp lại mã QR');
            }
        }
        const domain = process.env.APP_DOMAIN || 'mini-logistic.com';
        const traceUrl = `https://${domain}/public/trace/${batch.batchCode}`;
        const svgData = await this.qrService.generateSvg(traceUrl);
        const qrImageUrl = await this.qrService.generatePngDataUrl(traceUrl);
        let qrCode = await this.dataSource.getRepository(batch_qr_code_entity_1.BatchQrCodeEntity).findOne({
            where: { batchId: id },
        });
        if (!qrCode) {
            qrCode = new batch_qr_code_entity_1.BatchQrCodeEntity();
            qrCode.batchId = id;
        }
        qrCode.qrData = traceUrl;
        qrCode.svgData = svgData;
        qrCode.qrImageUrl = qrImageUrl;
        qrCode.generatedBy = currentUser.userId;
        return this.dataSource.getRepository(batch_qr_code_entity_1.BatchQrCodeEntity).save(qrCode);
    }
    async sell(id, sellBatchDto, currentUser) {
        const { quantity } = sellBatchDto;
        if (!currentUser.nodeId) {
            throw new common_1.BadRequestException('Tài khoản của bạn chưa được gán vào Node nào để bán hàng');
        }
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const inventory = await queryRunner.manager.createQueryBuilder(inventory_entity_1.InventoryEntity, 'inventory')
                .setLock('pessimistic_write')
                .where('inventory.batchId = :batchId AND inventory.nodeId = :nodeId', {
                batchId: id,
                nodeId: currentUser.nodeId,
            })
                .getOne();
            if (!inventory) {
                throw new common_1.NotFoundException('Lô hàng không tồn tại hoặc không còn hàng tồn kho tại cửa hàng của bạn');
            }
            if (inventory.quantityAvailable < quantity) {
                throw new common_1.BadRequestException(`Không đủ số lượng hàng tồn kho khả dụng để bán. Hiện có: ${inventory.quantityAvailable} (yêu cầu: ${quantity})`);
            }
            inventory.quantityAvailable = Number((inventory.quantityAvailable - quantity).toFixed(3));
            await queryRunner.manager.save(inventory_entity_1.InventoryEntity, inventory);
            const event = new timeline_event_entity_1.TimelineEventEntity();
            event.batchId = id;
            event.eventType = timeline_event_type_enum_1.TimelineEventType.SOLD;
            event.nodeId = currentUser.nodeId;
            event.actorId = currentUser.userId;
            event.quantityDelta = -quantity;
            event.notes = `Đã bán lẻ ${quantity} sản phẩm từ lô hàng.`;
            await queryRunner.manager.save(timeline_event_entity_1.TimelineEventEntity, event);
            const batch = await queryRunner.manager.findOne(batch_entity_1.BatchEntity, {
                where: { id },
                relations: { product: true, originNode: true, currentNode: true },
            });
            if (batch) {
                batch.quantity = Number((batch.quantity - quantity).toFixed(3));
                const unitPrice = batch.product?.unitPrice || 0;
                batch.totalValue = Number((unitPrice * batch.quantity).toFixed(2));
                if (inventory.quantityAvailable === 0) {
                    batch.status = batch_status_enum_1.BatchStatus.SOLD;
                }
                await queryRunner.manager.save(batch_entity_1.BatchEntity, batch);
            }
            await queryRunner.commitTransaction();
            return batch;
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
};
exports.BatchesService = BatchesService;
exports.BatchesService = BatchesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeorm_1.DataSource,
        qr_service_1.QrService])
], BatchesService);
//# sourceMappingURL=batches.service.js.map