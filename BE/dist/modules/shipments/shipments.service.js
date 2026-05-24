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
exports.ShipmentsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const crypto_1 = require("crypto");
const shipment_entity_1 = require("./entities/shipment.entity");
const batch_entity_1 = require("../batches/entities/batch.entity");
const inventory_entity_1 = require("../batches/entities/inventory.entity");
const timeline_event_entity_1 = require("../batches/entities/timeline-event.entity");
const node_entity_1 = require("../nodes/entities/node.entity");
const shipment_status_enum_1 = require("../../common/enums/shipment-status.enum");
const batch_status_enum_1 = require("../../common/enums/batch-status.enum");
const timeline_event_type_enum_1 = require("../../common/enums/timeline-event-type.enum");
const shipment_issue_entity_1 = require("../incidents/entities/shipment-issue.entity");
let ShipmentsService = class ShipmentsService {
    dataSource;
    constructor(dataSource) {
        this.dataSource = dataSource;
    }
    async findAll(query, currentUser) {
        const qb = this.dataSource.getRepository(shipment_entity_1.ShipmentEntity).createQueryBuilder('shipment')
            .leftJoinAndSelect('shipment.batch', 'batch')
            .leftJoinAndSelect('batch.product', 'product')
            .leftJoinAndSelect('shipment.sourceNode', 'sourceNode')
            .leftJoinAndSelect('shipment.destinationNode', 'destinationNode');
        if (currentUser.role !== 'Admin') {
            if (!currentUser.nodeId) {
                qb.andWhere('1=0');
            }
            else {
                qb.andWhere('(shipment.sourceNodeId = :nodeId OR shipment.destinationNodeId = :nodeId)', { nodeId: currentUser.nodeId });
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
    async findOne(id, currentUser) {
        const shipment = await this.dataSource.getRepository(shipment_entity_1.ShipmentEntity).findOne({
            where: { id },
            relations: {
                batch: { product: true },
                sourceNode: true,
                destinationNode: true,
                creator: true,
            },
        });
        if (!shipment) {
            throw new common_1.NotFoundException(`Vận đơn với ID ${id} không tồn tại`);
        }
        if (currentUser.role !== 'Admin') {
            if (!currentUser.nodeId || (shipment.sourceNodeId !== currentUser.nodeId && shipment.destinationNodeId !== currentUser.nodeId)) {
                throw new common_1.ForbiddenException('Bạn không có quyền truy cập vận đơn này');
            }
        }
        const receiveEvent = await this.dataSource.getRepository(timeline_event_entity_1.TimelineEventEntity).findOne({
            where: {
                shipmentId: id,
                eventType: timeline_event_type_enum_1.TimelineEventType.RECEIVED,
            },
            relations: { actor: true },
        });
        const issues = await this.dataSource.getRepository(shipment_issue_entity_1.ShipmentIssueEntity).find({
            where: { shipmentId: id },
            relations: { reporter: true, incidentReport: true },
        });
        if (shipment.creator) {
            delete shipment.creator.passwordHash;
        }
        const receiver = receiveEvent ? receiveEvent.actor : null;
        if (receiver) {
            delete receiver.passwordHash;
        }
        if (issues) {
            for (const issue of issues) {
                if (issue.reporter) {
                    delete issue.reporter.passwordHash;
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
    async createTransfer(createShipmentDto, currentUser) {
        let sourceNodeId = currentUser.nodeId;
        if (!currentUser.role || currentUser.role === 'Admin') {
            sourceNodeId = createShipmentDto.sourceNodeId;
            if (!sourceNodeId) {
                throw new common_1.BadRequestException('Admin cần cung cấp sourceNodeId');
            }
        }
        else {
            sourceNodeId = currentUser.nodeId;
            if (!sourceNodeId) {
                throw new common_1.BadRequestException('Tài khoản của bạn chưa được gán vào Node nào');
            }
        }
        if (sourceNodeId === createShipmentDto.destinationNodeId) {
            throw new common_1.BadRequestException('Kho xuất và kho nhận không được trùng nhau');
        }
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const batch = await queryRunner.manager.findOne(batch_entity_1.BatchEntity, {
                where: { id: createShipmentDto.batchId },
            });
            if (!batch) {
                throw new common_1.NotFoundException(`Lô hàng với ID ${createShipmentDto.batchId} không tồn tại`);
            }
            const destNode = await queryRunner.manager.findOne(node_entity_1.NodeEntity, {
                where: { id: createShipmentDto.destinationNodeId, isActive: true },
            });
            if (!destNode) {
                throw new common_1.NotFoundException(`Kho nhận với ID ${createShipmentDto.destinationNodeId} không tồn tại hoặc đã bị khóa`);
            }
            const inventory = await queryRunner.manager
                .createQueryBuilder(inventory_entity_1.InventoryEntity, 'inventory')
                .setLock('pessimistic_write')
                .where('inventory.batchId = :batchId AND inventory.nodeId = :nodeId', {
                batchId: createShipmentDto.batchId,
                nodeId: sourceNodeId,
            })
                .getOne();
            if (!inventory) {
                throw new common_1.BadRequestException('Lô hàng không tồn tại hoặc không còn hàng tại kho nguồn');
            }
            if (Number(inventory.quantityAvailable) < createShipmentDto.quantityShipped) {
                throw new common_1.BadRequestException(`Không đủ số lượng hàng tồn kho để xuất. Hiện có: ${inventory.quantityAvailable} ${batch.unit}`);
            }
            inventory.quantityAvailable = Number(inventory.quantityAvailable) - createShipmentDto.quantityShipped;
            await queryRunner.manager.save(inventory_entity_1.InventoryEntity, inventory);
            const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
            const randomPart = (0, crypto_1.randomUUID)().replace(/-/g, '').substring(0, 4).toUpperCase();
            const trackingCode = `SHP-${todayStr}-${randomPart}`;
            const shipment = new shipment_entity_1.ShipmentEntity();
            shipment.trackingCode = trackingCode;
            shipment.batchId = batch.id;
            shipment.sourceNodeId = sourceNodeId;
            shipment.destinationNodeId = createShipmentDto.destinationNodeId;
            shipment.quantityShipped = createShipmentDto.quantityShipped;
            shipment.status = shipment_status_enum_1.ShipmentStatus.IN_TRANSIT;
            shipment.createdBy = currentUser.userId;
            shipment.notes = createShipmentDto.notes || null;
            if (createShipmentDto.expectedDeliveryDate) {
                shipment.expectedDeliveryDate = new Date(createShipmentDto.expectedDeliveryDate);
            }
            const savedShipment = await queryRunner.manager.save(shipment_entity_1.ShipmentEntity, shipment);
            batch.status = batch_status_enum_1.BatchStatus.IN_TRANSIT;
            await queryRunner.manager.save(batch_entity_1.BatchEntity, batch);
            const event = new timeline_event_entity_1.TimelineEventEntity();
            event.batchId = batch.id;
            event.eventType = timeline_event_type_enum_1.TimelineEventType.SHIPPED;
            event.nodeId = sourceNodeId;
            event.actorId = currentUser.userId;
            event.shipmentId = savedShipment.id;
            event.quantityDelta = -createShipmentDto.quantityShipped;
            event.notes = `Xuất kho tạo vận đơn: ${savedShipment.trackingCode}`;
            await queryRunner.manager.save(timeline_event_entity_1.TimelineEventEntity, event);
            await queryRunner.commitTransaction();
            savedShipment.batch = batch;
            return savedShipment;
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    async receiveShipment(id, currentUser) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const shipment = await queryRunner.manager
                .createQueryBuilder(shipment_entity_1.ShipmentEntity, 'shipment')
                .setLock('pessimistic_write')
                .where('shipment.id = :id', { id })
                .getOne();
            if (!shipment) {
                throw new common_1.NotFoundException(`Vận đơn với ID ${id} không tồn tại`);
            }
            if (shipment.status !== shipment_status_enum_1.ShipmentStatus.IN_TRANSIT) {
                throw new common_1.BadRequestException(`Vận đơn không ở trạng thái đang vận chuyển (IN_TRANSIT). Trạng thái hiện tại: ${shipment.status}`);
            }
            if (currentUser.role !== 'Admin' && currentUser.nodeId !== shipment.destinationNodeId) {
                throw new common_1.ForbiddenException('Bạn không thuộc Node nhận của vận đơn này');
            }
            shipment.status = shipment_status_enum_1.ShipmentStatus.RECEIVED;
            shipment.actualDeliveryDate = new Date();
            const savedShipment = await queryRunner.manager.save(shipment_entity_1.ShipmentEntity, shipment);
            await queryRunner.query(`INSERT INTO inventory (batch_id, node_id, quantity_available, last_updated_at, version)
         VALUES ($1, $2, $3, NOW(), 1)
         ON CONFLICT (batch_id, node_id)
         DO UPDATE SET 
           quantity_available = inventory.quantity_available + EXCLUDED.quantity_available,
           last_updated_at = NOW(),
           version = inventory.version + 1`, [shipment.batchId, shipment.destinationNodeId, shipment.quantityShipped]);
            const batch = await queryRunner.manager.findOne(batch_entity_1.BatchEntity, {
                where: { id: shipment.batchId },
            });
            if (batch) {
                batch.currentNodeId = shipment.destinationNodeId;
                batch.status = batch_status_enum_1.BatchStatus.RECEIVED;
                await queryRunner.manager.save(batch_entity_1.BatchEntity, batch);
            }
            const event = new timeline_event_entity_1.TimelineEventEntity();
            event.batchId = shipment.batchId;
            event.eventType = timeline_event_type_enum_1.TimelineEventType.RECEIVED;
            event.nodeId = shipment.destinationNodeId;
            event.actorId = currentUser.userId;
            event.shipmentId = shipment.id;
            event.quantityDelta = shipment.quantityShipped;
            event.notes = `Đã nhận hàng thành công tại kho nhận. Mã vận đơn: ${shipment.trackingCode}`;
            await queryRunner.manager.save(timeline_event_entity_1.TimelineEventEntity, event);
            await queryRunner.commitTransaction();
            if (batch) {
                savedShipment.batch = batch;
            }
            return savedShipment;
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
exports.ShipmentsService = ShipmentsService;
exports.ShipmentsService = ShipmentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeorm_1.DataSource])
], ShipmentsService);
//# sourceMappingURL=shipments.service.js.map