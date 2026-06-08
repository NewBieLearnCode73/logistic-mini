"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
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
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const pdfkit_1 = __importDefault(require("pdfkit"));
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
    getDateRange(period) {
        const now = new Date();
        let start;
        let end = new Date(now);
        if (period === 'today') {
            start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
            end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
        }
        else if (period === 'month') {
            start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
            end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        }
        else if (period === 'quarter') {
            const currentQuarter = Math.floor(now.getMonth() / 3);
            start = new Date(now.getFullYear(), currentQuarter * 3, 1, 0, 0, 0, 0);
            end = new Date(now.getFullYear(), (currentQuarter + 1) * 3, 0, 23, 59, 59, 999);
        }
        else if (period === 'year') {
            start = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
            end = new Date(now.getFullYear(), 12, 0, 23, 59, 59, 999);
        }
        else {
            throw new common_1.BadRequestException('Khoảng thời gian báo cáo không hợp lệ');
        }
        return { start, end };
    }
    formatDate(date) {
        if (!date)
            return '-';
        try {
            const d = new Date(date);
            return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
        }
        catch {
            return String(date);
        }
    }
    formatCurrency(value) {
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2,
        }).format(value) + ' VND';
    }
    async exportReport(reportType, format, period, currentUser) {
        let data = [];
        const userNodeId = currentUser.nodeId;
        const { start, end } = this.getDateRange(period);
        if (reportType === 'inventory') {
            const qb = this.dataSource.getRepository(inventory_entity_1.InventoryEntity).createQueryBuilder('inv')
                .leftJoinAndSelect('inv.batch', 'batch')
                .leftJoinAndSelect('batch.product', 'product')
                .leftJoinAndSelect('inv.node', 'node')
                .where('inv.lastUpdatedAt >= :start', { start })
                .andWhere('inv.lastUpdatedAt <= :end', { end });
            if (currentUser.role !== role_enum_1.RoleName.ADMIN && userNodeId) {
                qb.andWhere('inv.nodeId = :nodeId', { nodeId: userNodeId });
            }
            data = await qb.getMany();
        }
        else if (reportType === 'shipments') {
            const qb = this.dataSource.getRepository(shipment_entity_1.ShipmentEntity).createQueryBuilder('s')
                .leftJoinAndSelect('s.batch', 'batch')
                .leftJoinAndSelect('batch.product', 'product')
                .leftJoinAndSelect('s.sourceNode', 'sourceNode')
                .leftJoinAndSelect('s.destinationNode', 'destinationNode')
                .where('s.shippedAt >= :start', { start })
                .andWhere('s.shippedAt <= :end', { end });
            if (currentUser.role !== role_enum_1.RoleName.ADMIN && userNodeId) {
                qb.andWhere('(s.sourceNodeId = :nodeId OR s.destinationNodeId = :nodeId)', { nodeId: userNodeId });
            }
            data = await qb.getMany();
        }
        else if (reportType === 'incidents') {
            const qb = this.dataSource.getRepository(incident_report_entity_1.IncidentReportEntity).createQueryBuilder('i')
                .leftJoinAndSelect('i.shipment', 's')
                .leftJoinAndSelect('i.batch', 'batch')
                .leftJoinAndSelect('batch.product', 'product')
                .where('i.openedAt >= :start', { start })
                .andWhere('i.openedAt <= :end', { end });
            if (currentUser.role !== role_enum_1.RoleName.ADMIN && userNodeId) {
                qb.andWhere('(s.sourceNodeId = :nodeId OR s.destinationNodeId = :nodeId)', { nodeId: userNodeId });
            }
            data = await qb.getMany();
        }
        data = data || [];
        const productIds = new Set();
        const batchIds = new Set();
        let totalBatchValue = 0;
        if (reportType === 'inventory') {
            for (const item of data) {
                if (item.batch?.productId)
                    productIds.add(item.batch.productId);
                if (item.batchId)
                    batchIds.add(item.batchId);
                totalBatchValue += Number(item.batch?.totalValue || 0);
            }
        }
        else if (reportType === 'shipments') {
            for (const item of data) {
                if (item.batch?.productId)
                    productIds.add(item.batch.productId);
                if (item.batchId)
                    batchIds.add(item.batchId);
                totalBatchValue += Number(item.batch?.totalValue || 0);
            }
        }
        else if (reportType === 'incidents') {
            for (const item of data) {
                if (item.batch?.productId)
                    productIds.add(item.batch.productId);
                if (item.batchId)
                    batchIds.add(item.batchId);
                totalBatchValue += Number(item.batch?.totalValue || 0);
            }
        }
        const totalProducts = productIds.size;
        const totalBatches = batchIds.size;
        if (format === 'csv') {
            let csvContent = '\ufeff';
            csvContent += 'BÁO CÁO CHUỖI CUNG ỨNG MINI\n';
            csvContent += `Loại báo cáo: ${reportType === 'inventory' ? 'Tồn kho' : reportType === 'shipments' ? 'Vận chuyển' : 'Sự cố'}\n`;
            csvContent += `Kỳ báo cáo: ${period === 'today' ? 'Hôm nay' : period === 'month' ? 'Tháng này' : period === 'quarter' ? 'Quý này' : 'Năm nay'}\n`;
            csvContent += `Ngày tạo: ${this.formatDate(new Date())}\n\n`;
            csvContent += `Tổng số sản phẩm: ${totalProducts}\n`;
            if (reportType !== 'incidents') {
                csvContent += `Tổng số lô hàng: ${totalBatches}\n`;
                csvContent += `Tổng giá trị: ${this.formatCurrency(totalBatchValue)}\n`;
            }
            csvContent += `\n`;
            if (reportType === 'inventory') {
                csvContent += 'Mã lô hàng,Mã định danh lô,Tên sản phẩm,Số lượng khả dụng,Đơn vị,Đơn giá,Tổng giá trị,Tên địa điểm,Cập nhật lần cuối\n';
                csvContent += data.map(item => `"${item.batchId}","${item.batch?.batchCode || ''}","${item.batch?.product?.name || ''}",${item.batch?.quantity || 0},"${item.batch?.unit || ''}",${item.batch?.product?.unitPrice || 0},${item.batch?.totalValue || 0},"${item.node?.name || ''}","${item.lastUpdatedAt?.toISOString() || ''}"`).join('\n');
            }
            else if (reportType === 'shipments') {
                csvContent += 'Mã vận đơn,Mã lô hàng,Tên sản phẩm,Số lượng vận chuyển,Đơn vị,Đơn giá,Tổng giá trị,Trạng thái,Điểm gửi,Điểm nhận,Ngày gửi\n';
                csvContent += data.map(item => `"${item.trackingCode}","${item.batch?.batchCode || ''}","${item.batch?.product?.name || ''}",${item.batch?.quantity || 0},"${item.batch?.unit || ''}",${item.batch?.product?.unitPrice || 0},${item.batch?.totalValue || 0},"${item.status}","${item.sourceNode?.name || ''}","${item.destinationNode?.name || ''}","${item.shippedAt?.toISOString() || ''}"`).join('\n');
            }
            else {
                csvContent += 'Mã sự cố,Loại sự cố,Trạng thái,Mức độ ưu tiên,Mô tả,Mã lô hàng,Ngày báo cáo\n';
                csvContent += data.map(item => `"${item.incidentCode}","${item.incidentType}","${item.status}","${item.priority}","${item.description.replace(/"/g, '""')}","${item.batch?.batchCode || ''}","${item.openedAt?.toISOString() || ''}"`).join('\n');
            }
            return { content: Buffer.from(csvContent, 'utf-8'), contentType: 'text/csv; charset=utf-8', filename: `report_${reportType}_${period}.csv` };
        }
        else {
            const doc = new pdfkit_1.default({ margin: 50, size: 'A4' });
            const chunks = [];
            doc.on('data', chunk => chunks.push(chunk));
            let fontPath = path.join(__dirname, '../../assets/fonts/DejaVuSans.ttf');
            let fontBoldPath = path.join(__dirname, '../../assets/fonts/DejaVuSans-Bold.ttf');
            if (!fs.existsSync(fontPath)) {
                fontPath = path.join(process.cwd(), 'src/assets/fonts/DejaVuSans.ttf');
                fontBoldPath = path.join(process.cwd(), 'src/assets/fonts/DejaVuSans-Bold.ttf');
            }
            doc.registerFont('DejaVuSans', fontPath);
            doc.registerFont('DejaVuSans-Bold', fontBoldPath);
            doc.font('DejaVuSans');
            doc.font('DejaVuSans-Bold').fontSize(18).fillColor('#18181b').text('BÁO CÁO CHUỖI CUNG ỨNG MINI', { align: 'center' });
            doc.moveDown(0.5);
            doc.strokeColor('#e4e4e7').lineWidth(1).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
            doc.moveDown(1);
            doc.font('DejaVuSans').fontSize(10).fillColor('#71717a');
            const periodLabel = period === 'today' ? 'Hôm nay' : period === 'month' ? 'Tháng này' : period === 'quarter' ? 'Quý này' : 'Năm nay';
            const typeLabel = reportType === 'inventory' ? 'Tồn kho' : reportType === 'shipments' ? 'Vận chuyển' : 'Sự cố';
            doc.text(`Loại báo cáo: ${typeLabel}`);
            doc.text(`Kỳ báo cáo: ${periodLabel}`);
            doc.text(`Ngày tạo: ${this.formatDate(new Date())}`);
            doc.moveDown(1.5);
            const statsY = doc.y;
            if (reportType === 'incidents') {
                doc.rect(50, statsY, 495, 55).fillAndStroke('#f4f4f5', '#e4e4e7');
                doc.fillColor('#18181b');
                doc.font('DejaVuSans-Bold').fontSize(11).text('TÓM TẮT THỐNG KÊ', 65, statsY + 12);
                doc.font('DejaVuSans').fontSize(10);
                doc.text(`Tổng số sản phẩm: ${totalProducts}`, 65, statsY + 32);
                doc.y = statsY + 70;
            }
            else {
                doc.rect(50, statsY, 495, 75).fillAndStroke('#f4f4f5', '#e4e4e7');
                doc.fillColor('#18181b');
                doc.font('DejaVuSans-Bold').fontSize(11).text('TÓM TẮT THỐNG KÊ', 65, statsY + 12);
                doc.font('DejaVuSans').fontSize(10);
                doc.text(`Tổng số sản phẩm: ${totalProducts}`, 65, statsY + 32);
                doc.text(`Tổng số lô hàng: ${totalBatches}`, 65, statsY + 48);
                doc.font('DejaVuSans-Bold').text(`Tổng giá trị: ${this.formatCurrency(totalBatchValue)}`, 280, statsY + 32);
                doc.y = statsY + 90;
            }
            doc.x = 50;
            let columns = [];
            if (reportType === 'inventory') {
                columns = [
                    { header: 'Mã lô', width: 80, getValue: (item) => item.batch?.batchCode || '-' },
                    { header: 'Tên sản phẩm', width: 140, getValue: (item) => item.batch?.product?.name || '-' },
                    { header: 'Số lượng', width: 70, align: 'right', getValue: (item) => `${item.batch?.quantity || 0} ${item.batch?.unit || ''}` },
                    { header: 'Đơn giá', width: 70, align: 'right', getValue: (item) => this.formatCurrency(item.batch?.product?.unitPrice || 0) },
                    { header: 'Tổng giá trị', width: 85, align: 'right', getValue: (item) => this.formatCurrency(item.batch?.totalValue || 0) },
                    { header: 'Địa điểm', width: 50, getValue: (item) => item.node?.name || '-' }
                ];
            }
            else if (reportType === 'shipments') {
                columns = [
                    { header: 'Mã vận đơn', width: 80, getValue: (item) => item.trackingCode || '-' },
                    { header: 'Mã lô', width: 60, getValue: (item) => item.batch?.batchCode || '-' },
                    { header: 'Tên sản phẩm', width: 100, getValue: (item) => item.batch?.product?.name || '-' },
                    { header: 'Số lượng', width: 60, align: 'right', getValue: (item) => `${item.batch?.quantity || 0} ${item.batch?.unit || ''}` },
                    { header: 'Tổng giá trị', width: 75, align: 'right', getValue: (item) => this.formatCurrency(item.batch?.totalValue || 0) },
                    { header: 'Trạng thái', width: 60, getValue: (item) => item.status || '-' },
                    { header: 'Nơi gửi/nhận', width: 60, getValue: (item) => `${item.sourceNode?.name || '-'}\n-> ${item.destinationNode?.name || '-'}` }
                ];
            }
            else {
                columns = [
                    { header: 'Mã sự cố', width: 75, getValue: (item) => item.incidentCode || '-' },
                    { header: 'Loại', width: 65, getValue: (item) => item.incidentType || '-' },
                    { header: 'Mức độ', width: 50, getValue: (item) => item.priority || '-' },
                    { header: 'Trạng thái', width: 60, getValue: (item) => item.status || '-' },
                    { header: 'Mô tả', width: 165, getValue: (item) => item.description || '-' },
                    { header: 'Mã lô', width: 80, getValue: (item) => item.batch?.batchCode || '-' }
                ];
            }
            const drawHeader = (yPos) => {
                doc.rect(50, yPos, 495, 20).fill('#27272a');
                doc.fillColor('#ffffff').font('DejaVuSans-Bold').fontSize(9);
                let currentX = 50;
                for (const col of columns) {
                    doc.text(col.header, currentX + 4, yPos + 6, {
                        width: col.width - 8,
                        align: col.align || 'left',
                        lineBreak: false
                    });
                    currentX += col.width;
                }
            };
            let tableY = doc.y + 10;
            if (tableY > 750) {
                doc.addPage();
                tableY = 50;
            }
            drawHeader(tableY);
            tableY += 20;
            let index = 0;
            for (const item of data) {
                let maxRowHeight = 16;
                let currentX = 50;
                doc.font('DejaVuSans').fontSize(8);
                for (const col of columns) {
                    const val = col.getValue(item);
                    const cellHeight = doc.heightOfString(val, { width: col.width - 8 });
                    if (cellHeight + 8 > maxRowHeight) {
                        maxRowHeight = cellHeight + 8;
                    }
                }
                if (tableY + maxRowHeight > 780) {
                    doc.addPage();
                    tableY = 50;
                    drawHeader(tableY);
                    tableY += 20;
                    doc.font('DejaVuSans').fontSize(8);
                }
                if (index % 2 === 0) {
                    doc.rect(50, tableY, 495, maxRowHeight).fill('#fafafa');
                }
                else {
                    doc.rect(50, tableY, 495, maxRowHeight).fill('#ffffff');
                }
                doc.strokeColor('#f4f4f5').lineWidth(1).moveTo(50, tableY + maxRowHeight).lineTo(545, tableY + maxRowHeight).stroke();
                doc.fillColor('#27272a');
                currentX = 50;
                for (const col of columns) {
                    const val = col.getValue(item);
                    doc.text(val, currentX + 4, tableY + 4, {
                        width: col.width - 8,
                        align: col.align || 'left'
                    });
                    currentX += col.width;
                }
                tableY += maxRowHeight;
                index++;
            }
            doc.end();
            const pdfBuffer = await new Promise((resolve, reject) => {
                doc.on('end', () => resolve(Buffer.concat(chunks)));
                doc.on('error', err => reject(err));
            });
            return { content: pdfBuffer, contentType: 'application/pdf', filename: `report_${reportType}_${period}.pdf` };
        }
    }
};
exports.DashboardSystemService = DashboardSystemService;
exports.DashboardSystemService = DashboardSystemService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeorm_1.DataSource])
], DashboardSystemService);
//# sourceMappingURL=dashboard-system.service.js.map