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
exports.DashboardSystemService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const inventory_entity_1 = require("../batches/entities/inventory.entity");
const shipment_entity_1 = require("../shipments/entities/shipment.entity");
const incident_report_entity_1 = require("../incidents/entities/incident-report.entity");
const audit_log_entity_1 = require("../audit/entities/audit-log.entity");
const role_enum_1 = require("../../common/enums/role.enum");
const shipment_status_enum_1 = require("../../common/enums/shipment-status.enum");
let DashboardSystemService = class DashboardSystemService {
    dataSource;
    constructor(dataSource) {
        this.dataSource = dataSource;
    }
    async getStats(currentUser) {
        let totalInventory = 0;
        let activeShipments = 0;
        let incidents = 0;
        const inventoryRepo = this.dataSource.getRepository(inventory_entity_1.InventoryEntity);
        const shipmentRepo = this.dataSource.getRepository(shipment_entity_1.ShipmentEntity);
        const incidentRepo = this.dataSource.getRepository(incident_report_entity_1.IncidentReportEntity);
        if (currentUser.role === role_enum_1.RoleName.ADMIN) {
            const inventoryRes = await inventoryRepo.createQueryBuilder('inv')
                .select('SUM(inv.quantityAvailable)', 'sum')
                .getRawOne();
            totalInventory = Number(inventoryRes?.sum || 0);
            activeShipments = await shipmentRepo.createQueryBuilder('s')
                .where('s.status IN (:...statuses)', { statuses: [shipment_status_enum_1.ShipmentStatus.IN_TRANSIT, shipment_status_enum_1.ShipmentStatus.DELAYED] })
                .getCount();
            incidents = await incidentRepo.createQueryBuilder('i')
                .where('i.status IN (:...statuses)', { statuses: ['OPEN', 'IN_PROGRESS'] })
                .getCount();
        }
        else {
            const userNodeId = currentUser.nodeId;
            if (userNodeId) {
                const inventoryRes = await inventoryRepo.createQueryBuilder('inv')
                    .select('SUM(inv.quantityAvailable)', 'sum')
                    .where('inv.nodeId = :nodeId', { nodeId: userNodeId })
                    .getRawOne();
                totalInventory = Number(inventoryRes?.sum || 0);
                activeShipments = await shipmentRepo.createQueryBuilder('s')
                    .where('s.status IN (:...statuses)', { statuses: [shipment_status_enum_1.ShipmentStatus.IN_TRANSIT, shipment_status_enum_1.ShipmentStatus.DELAYED] })
                    .andWhere('(s.sourceNodeId = :nodeId OR s.destinationNodeId = :nodeId)', { nodeId: userNodeId })
                    .getCount();
                incidents = await incidentRepo.createQueryBuilder('i')
                    .innerJoin('i.shipment', 's')
                    .where('i.status IN (:...statuses)', { statuses: ['OPEN', 'IN_PROGRESS'] })
                    .andWhere('(s.sourceNodeId = :nodeId OR s.destinationNodeId = :nodeId)', { nodeId: userNodeId })
                    .getCount();
            }
        }
        return {
            totalInventory,
            activeShipments,
            incidents,
        };
    }
    async getAuditLogs(query) {
        const page = parseInt(query.page || '1', 10);
        const limit = parseInt(query.limit || '10', 10);
        const skip = (page - 1) * limit;
        const [data, total] = await this.dataSource.getRepository(audit_log_entity_1.AuditLogEntity).findAndCount({
            relations: { actor: true },
            order: { occurredAt: 'DESC' },
            skip,
            take: limit,
        });
        for (const log of data) {
            if (log.actor) {
                delete log.actor.passwordHash;
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
    async exportReport(reportType, format, currentUser) {
        let data = [];
        const userNodeId = currentUser.nodeId;
        if (reportType === 'inventory') {
            const qb = this.dataSource.getRepository(inventory_entity_1.InventoryEntity).createQueryBuilder('inv')
                .leftJoinAndSelect('inv.batch', 'batch')
                .leftJoinAndSelect('batch.product', 'product')
                .leftJoinAndSelect('inv.node', 'node');
            if (currentUser.role !== role_enum_1.RoleName.ADMIN && userNodeId) {
                qb.where('inv.nodeId = :nodeId', { nodeId: userNodeId });
            }
            data = await qb.getMany();
        }
        else if (reportType === 'shipments') {
            const qb = this.dataSource.getRepository(shipment_entity_1.ShipmentEntity).createQueryBuilder('s')
                .leftJoinAndSelect('s.batch', 'batch')
                .leftJoinAndSelect('batch.product', 'product')
                .leftJoinAndSelect('s.sourceNode', 'sourceNode')
                .leftJoinAndSelect('s.destinationNode', 'destinationNode');
            if (currentUser.role !== role_enum_1.RoleName.ADMIN && userNodeId) {
                qb.where('(s.sourceNodeId = :nodeId OR s.destinationNodeId = :nodeId)', { nodeId: userNodeId });
            }
            data = await qb.getMany();
        }
        else if (reportType === 'incidents') {
            const qb = this.dataSource.getRepository(incident_report_entity_1.IncidentReportEntity).createQueryBuilder('i')
                .leftJoinAndSelect('i.shipment', 's')
                .leftJoinAndSelect('i.batch', 'batch')
                .leftJoinAndSelect('batch.product', 'product');
            if (currentUser.role !== role_enum_1.RoleName.ADMIN && userNodeId) {
                qb.where('(s.sourceNodeId = :nodeId OR s.destinationNodeId = :nodeId)', { nodeId: userNodeId });
            }
            data = await qb.getMany();
        }
        if (format === 'csv') {
            let csvContent = '';
            if (reportType === 'inventory') {
                csvContent = 'Batch ID,Batch Code,Product Name,Quantity Available,Node Name,Last Updated\n';
                csvContent += data.map(item => `"${item.batchId}","${item.batch?.batchCode || ''}","${item.batch?.product?.name || ''}",${item.quantityAvailable},"${item.node?.name || ''}","${item.lastUpdatedAt?.toISOString() || ''}"`).join('\n');
            }
            else if (reportType === 'shipments') {
                csvContent = 'Tracking Code,Batch Code,Product Name,Quantity Shipped,Status,Source Node,Destination Node,Shipped At\n';
                csvContent += data.map(item => `"${item.trackingCode}","${item.batch?.batchCode || ''}","${item.batch?.product?.name || ''}",${item.quantityShipped},"${item.status}","${item.sourceNode?.name || ''}","${item.destinationNode?.name || ''}","${item.shippedAt?.toISOString() || ''}"`).join('\n');
            }
            else {
                csvContent = 'Incident Code,Incident Type,Status,Priority,Description,Reported By,Opened At\n';
                csvContent += data.map(item => `"${item.incidentCode}","${item.incidentType}","${item.status}","${item.priority}","${item.description}","${item.reportedBy}","${item.openedAt?.toISOString() || ''}"`).join('\n');
            }
            return { content: csvContent, contentType: 'text/csv', filename: `report_${reportType}.csv` };
        }
        else {
            const pdfString = `%PDF-1.4\n` +
                `1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n` +
                `2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n` +
                `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> >> >> >>\nendobj\n` +
                `4 0 obj\n<< /Length 200 >>\nstream\nBT\n/F1 14 Tf\n70 800 Td\n(MINI LOGISTIC SYSTEM REPORT) Tj\n0 -30 Td\n/F1 12 Tf\n(Report Type: ${reportType.toUpperCase()}) Tj\n0 -20 Td\n(Total Records: ${data.length}) Tj\n0 -20 Td\n(Exported At: ${new Date().toISOString()}) Tj\nET\nendstream\nendobj\n` +
                `xref\n0 5\n0000000000 65535 f\n0000000009 00000 n\n0000000058 00000 n\n0000000115 00000 n\n0000000282 00000 n\n` +
                `trailer\n<< /Size 5 /Root 1 0 R >>\n` +
                `startxref\n535\n%%EOF`;
            return { content: Buffer.from(pdfString), contentType: 'application/pdf', filename: `report_${reportType}.pdf` };
        }
    }
};
exports.DashboardSystemService = DashboardSystemService;
exports.DashboardSystemService = DashboardSystemService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeorm_1.DataSource])
], DashboardSystemService);
//# sourceMappingURL=dashboard-system.service.js.map