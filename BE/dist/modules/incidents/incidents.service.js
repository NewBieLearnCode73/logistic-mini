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
exports.IncidentsService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const crypto_1 = require("crypto");
const typeorm_1 = require("typeorm");
const batch_status_enum_1 = require("../../common/enums/batch-status.enum");
const shipment_status_enum_1 = require("../../common/enums/shipment-status.enum");
const timeline_event_type_enum_1 = require("../../common/enums/timeline-event-type.enum");
const batch_entity_1 = require("../batches/entities/batch.entity");
const inventory_entity_1 = require("../batches/entities/inventory.entity");
const timeline_event_entity_1 = require("../batches/entities/timeline-event.entity");
const shipment_entity_1 = require("../shipments/entities/shipment.entity");
const incident_report_entity_1 = require("./entities/incident-report.entity");
const inventory_adjustment_entity_1 = require("./entities/inventory-adjustment.entity");
const shipment_issue_entity_1 = require("./entities/shipment-issue.entity");
let IncidentsService = class IncidentsService {
    dataSource;
    constructor(dataSource) {
        this.dataSource = dataSource;
    }
    async handleOverdueShipments() {
        const fortyEightHoursAgo = new Date();
        fortyEightHoursAgo.setHours(fortyEightHoursAgo.getHours() - 48);
        const overdueShipments = await this.dataSource.getRepository(shipment_entity_1.ShipmentEntity)
            .createQueryBuilder('shipment')
            .where('shipment.status = :status', { status: shipment_status_enum_1.ShipmentStatus.IN_TRANSIT })
            .andWhere('shipment.shippedAt <= :fortyEightHoursAgo', { fortyEightHoursAgo })
            .getMany();
        for (const shipment of overdueShipments) {
            const existingIssue = await this.dataSource.getRepository(shipment_issue_entity_1.ShipmentIssueEntity).findOne({
                where: {
                    shipmentId: shipment.id,
                    issueType: 'OVERDUE',
                },
            });
            if (existingIssue)
                continue;
            const queryRunner = this.dataSource.createQueryRunner();
            await queryRunner.connect();
            await queryRunner.startTransaction();
            try {
                const issue = new shipment_issue_entity_1.ShipmentIssueEntity();
                issue.shipmentId = shipment.id;
                issue.issueType = 'OVERDUE';
                issue.severity = 'HIGH';
                issue.detectedBy = 'SYSTEM_CRON';
                issue.notes = `Vận đơn trễ hạn giao > 48 giờ. Ngày gửi: ${shipment.shippedAt.toISOString()}`;
                await queryRunner.manager.save(shipment_issue_entity_1.ShipmentIssueEntity, issue);
                const batch = await queryRunner.manager.findOne(batch_entity_1.BatchEntity, {
                    where: { id: shipment.batchId },
                });
                if (batch) {
                    batch.status = batch_status_enum_1.BatchStatus.DELAYED;
                    await queryRunner.manager.save(batch_entity_1.BatchEntity, batch);
                }
                const event = new timeline_event_entity_1.TimelineEventEntity();
                event.batchId = shipment.batchId;
                event.eventType = timeline_event_type_enum_1.TimelineEventType.DELAYED;
                event.nodeId = shipment.sourceNodeId;
                event.actorId = null;
                event.shipmentId = shipment.id;
                event.quantityDelta = null;
                event.notes = `Hệ thống tự động phát hiện trễ hạn vận chuyển (> 48 giờ). Mã vận đơn: ${shipment.trackingCode}`;
                await queryRunner.manager.save(timeline_event_entity_1.TimelineEventEntity, event);
                await queryRunner.commitTransaction();
            }
            catch (error) {
                await queryRunner.rollbackTransaction();
            }
            finally {
                await queryRunner.release();
            }
        }
    }
    async createIncident(dto, currentUser) {
        const { shipmentId, incidentType, description, priority } = dto;
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const shipment = await queryRunner.manager.findOne(shipment_entity_1.ShipmentEntity, {
                where: { id: shipmentId },
            });
            if (!shipment) {
                throw new common_1.NotFoundException(`Không tìm thấy vận đơn với ID ${shipmentId}`);
            }
            const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
            const hexPart = (0, crypto_1.randomUUID)().replace(/-/g, '').substring(0, 4).toLowerCase();
            const incidentCode = `INC-${todayStr}-${hexPart}`;
            const incident = new incident_report_entity_1.IncidentReportEntity();
            incident.incidentCode = incidentCode;
            incident.shipmentId = shipmentId;
            incident.batchId = shipment.batchId;
            incident.incidentType = incidentType;
            incident.status = 'OPEN';
            incident.priority = priority || 'MEDIUM';
            incident.reportedBy = currentUser.userId;
            incident.description = description;
            const savedIncident = await queryRunner.manager.save(incident_report_entity_1.IncidentReportEntity, incident);
            const batch = await queryRunner.manager.findOne(batch_entity_1.BatchEntity, {
                where: { id: shipment.batchId },
            });
            if (batch) {
                batch.status = batch_status_enum_1.BatchStatus.INVESTIGATING;
                await queryRunner.manager.save(batch_entity_1.BatchEntity, batch);
            }
            const event = new timeline_event_entity_1.TimelineEventEntity();
            event.batchId = shipment.batchId;
            event.eventType = timeline_event_type_enum_1.TimelineEventType.INVESTIGATING;
            event.nodeId = shipment.sourceNodeId;
            event.actorId = currentUser.userId;
            event.shipmentId = shipment.id;
            event.quantityDelta = null;
            event.notes = `Bắt đầu mở cuộc điều tra sự cố ${incidentType}. Mã sự cố: ${incidentCode}`;
            await queryRunner.manager.save(timeline_event_entity_1.TimelineEventEntity, event);
            await queryRunner.commitTransaction();
            return savedIncident;
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    async confirmLost(id, currentUser) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const incident = await queryRunner.manager.findOne(incident_report_entity_1.IncidentReportEntity, {
                where: { id },
            });
            if (!incident) {
                throw new common_1.NotFoundException(`Không tìm thấy hồ sơ sự cố với ID ${id}`);
            }
            if (incident.status !== 'OPEN') {
                throw new common_1.BadRequestException('Sự cố này đã được giải quyết hoặc đóng.');
            }
            if (incident.reportedBy === currentUser.userId) {
                throw new common_1.ForbiddenException('Quy tắc phê duyệt kép: Người phê duyệt lần 2 không được trùng với người báo cáo sự cố lần 1');
            }
            const shipment = await queryRunner.manager.findOne(shipment_entity_1.ShipmentEntity, {
                where: { id: incident.shipmentId },
            });
            if (!shipment) {
                throw new common_1.NotFoundException(`Không tìm thấy vận đơn liên quan đến sự cố`);
            }
            incident.status = 'CLOSED';
            incident.resolution = 'Xác nhận mất hàng và hoàn trả tồn kho kho nguồn';
            incident.resolutionType = 'LOSS_CONFIRMED';
            incident.approvedBy = currentUser.userId;
            incident.resolvedAt = new Date();
            incident.closedAt = new Date();
            const savedIncident = await queryRunner.manager.save(incident_report_entity_1.IncidentReportEntity, incident);
            const sourceInventory = await queryRunner.manager.createQueryBuilder(inventory_entity_1.InventoryEntity, 'inventory')
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
                await queryRunner.manager.save(inventory_entity_1.InventoryEntity, sourceInventory);
            }
            else {
                const newInventory = new inventory_entity_1.InventoryEntity();
                newInventory.batchId = shipment.batchId;
                newInventory.nodeId = shipment.sourceNodeId;
                newInventory.quantityAvailable = Number(shipment.quantityShipped);
                await queryRunner.manager.save(inventory_entity_1.InventoryEntity, newInventory);
            }
            const qtyAfter = qtyBefore + Number(shipment.quantityShipped);
            const adjustment = new inventory_adjustment_entity_1.InventoryAdjustmentEntity();
            adjustment.batchId = shipment.batchId;
            adjustment.nodeId = shipment.sourceNodeId;
            adjustment.adjustmentType = 'LOSS_ROLLBACK';
            adjustment.qtyBefore = qtyBefore;
            adjustment.qtyDelta = Number(shipment.quantityShipped);
            adjustment.qtyAfter = qtyAfter;
            adjustment.reason = `Hoàn trả tồn kho do thất lạc vận đơn ${shipment.trackingCode}`;
            adjustment.approvedBy = incident.reportedBy;
            adjustment.secondApprover = currentUser.userId;
            adjustment.referenceId = incident.id;
            adjustment.referenceType = 'incident_reports';
            await queryRunner.manager.save(inventory_adjustment_entity_1.InventoryAdjustmentEntity, adjustment);
            shipment.status = shipment_status_enum_1.ShipmentStatus.LOST;
            await queryRunner.manager.save(shipment_entity_1.ShipmentEntity, shipment);
            const batch = await queryRunner.manager.findOne(batch_entity_1.BatchEntity, {
                where: { id: shipment.batchId },
            });
            if (batch) {
                batch.status = batch_status_enum_1.BatchStatus.LOST;
                await queryRunner.manager.save(batch_entity_1.BatchEntity, batch);
            }
            const event = new timeline_event_entity_1.TimelineEventEntity();
            event.batchId = shipment.batchId;
            event.eventType = timeline_event_type_enum_1.TimelineEventType.LOST;
            event.nodeId = shipment.sourceNodeId;
            event.actorId = currentUser.userId;
            event.shipmentId = shipment.id;
            event.quantityDelta = null;
            event.notes = `Xác nhận thất lạc hàng hóa. Vận đơn: ${shipment.trackingCode}. Đã hoàn trả ${shipment.quantityShipped} sản phẩm vào kho nguồn.`;
            await queryRunner.manager.save(timeline_event_entity_1.TimelineEventEntity, event);
            await queryRunner.commitTransaction();
            return savedIncident;
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    async findAll(query) {
        const page = parseInt(query.page || '1', 10);
        const limit = parseInt(query.limit || '10', 10);
        const skip = (page - 1) * limit;
        const [data, total] = await this.dataSource.getRepository(incident_report_entity_1.IncidentReportEntity).findAndCount({
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
        for (const incident of data) {
            if (incident.reporter) {
                delete incident.reporter.passwordHash;
            }
            if (incident.approver) {
                delete incident.approver.passwordHash;
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
    async confirmFound(id, currentUser) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const incident = await queryRunner.manager.findOne(incident_report_entity_1.IncidentReportEntity, {
                where: { id },
            });
            if (!incident) {
                throw new common_1.NotFoundException(`Không tìm thấy hồ sơ sự cố với ID ${id}`);
            }
            if (incident.status !== 'OPEN') {
                throw new common_1.BadRequestException('Sự cố này đã được giải quyết hoặc đóng.');
            }
            const shipment = await queryRunner.manager.findOne(shipment_entity_1.ShipmentEntity, {
                where: { id: incident.shipmentId },
            });
            if (!shipment) {
                throw new common_1.NotFoundException(`Không tìm thấy vận đơn liên quan đến sự cố`);
            }
            incident.status = 'CLOSED';
            incident.resolution = 'Tìm thấy hàng hóa thất lạc và tiến hành nhập kho đích';
            incident.resolutionType = 'FOUND_CONFIRMED';
            incident.approvedBy = currentUser.userId;
            incident.resolvedAt = new Date();
            incident.closedAt = new Date();
            const savedIncident = await queryRunner.manager.save(incident_report_entity_1.IncidentReportEntity, incident);
            shipment.status = shipment_status_enum_1.ShipmentStatus.RECEIVED;
            shipment.actualDeliveryDate = new Date();
            await queryRunner.manager.save(shipment_entity_1.ShipmentEntity, shipment);
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
            event.notes = `Đã tìm thấy hàng hóa thất lạc từ vận đơn ${shipment.trackingCode} và tiến hành nhập kho đích.`;
            await queryRunner.manager.save(timeline_event_entity_1.TimelineEventEntity, event);
            await queryRunner.commitTransaction();
            return savedIncident;
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
exports.IncidentsService = IncidentsService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_HOUR),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], IncidentsService.prototype, "handleOverdueShipments", null);
exports.IncidentsService = IncidentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeorm_1.DataSource])
], IncidentsService);
//# sourceMappingURL=incidents.service.js.map