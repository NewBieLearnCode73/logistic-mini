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
const ExcelJS = __importStar(require("exceljs"));
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
    getDateRange(period, startDate, endDate) {
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
        else if (period === 'custom') {
            if (!startDate || !endDate) {
                throw new common_1.BadRequestException('Vui lòng cung cấp ngày bắt đầu và ngày kết thúc');
            }
            start = new Date(startDate);
            start.setHours(0, 0, 0, 0);
            const parsedEnd = new Date(endDate);
            end = new Date(parsedEnd.getFullYear(), parsedEnd.getMonth(), parsedEnd.getDate(), 23, 59, 59, 999);
            if (isNaN(start.getTime()) || isNaN(end.getTime())) {
                throw new common_1.BadRequestException('Định dạng ngày bắt đầu hoặc ngày kết thúc không hợp lệ');
            }
            if (start > end) {
                throw new common_1.BadRequestException('Ngày bắt đầu không được sau ngày kết thúc');
            }
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
    formatDateTime(date) {
        if (!date)
            return '-';
        try {
            const d = new Date(date);
            const day = String(d.getDate()).padStart(2, '0');
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const year = d.getFullYear();
            const hours = String(d.getHours()).padStart(2, '0');
            const minutes = String(d.getMinutes()).padStart(2, '0');
            const seconds = String(d.getSeconds()).padStart(2, '0');
            return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
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
    async exportReport(reportType, format, period, currentUser, startDate, endDate) {
        let data = [];
        const userNodeId = currentUser.nodeId;
        const reportPeriod = period || 'custom';
        const { start, end } = this.getDateRange(reportPeriod, startDate, endDate);
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
                const itemVal = Number(item.quantityAvailable || 0) * Number(item.batch?.product?.unitPrice || 0);
                totalBatchValue += itemVal;
            }
        }
        else if (reportType === 'shipments') {
            for (const item of data) {
                if (item.batch?.productId)
                    productIds.add(item.batch.productId);
                if (item.batchId)
                    batchIds.add(item.batchId);
                const itemVal = Number(item.quantityShipped || 0) * Number(item.batch?.product?.unitPrice || 0);
                totalBatchValue += itemVal;
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
        const resolvedRangeStr = `${this.formatDate(start)} - ${this.formatDate(end)}`;
        const periodLabel = reportPeriod === 'today' ? `Hôm nay (${resolvedRangeStr})` :
            reportPeriod === 'month' ? `Tháng này (${resolvedRangeStr})` :
                reportPeriod === 'quarter' ? `Quý này (${resolvedRangeStr})` :
                    reportPeriod === 'year' ? `Năm nay (${resolvedRangeStr})` :
                        `Khoảng tự chọn (${resolvedRangeStr})`;
        const filenamePeriod = reportPeriod === 'custom' ? `${startDate}_to_${endDate}` : reportPeriod;
        if (format === 'csv') {
            let csvContent = '\ufeff';
            csvContent += `"BÁO CÁO HỆ THỐNG LOGISTICS MINI",,,,,,,,\n`;
            csvContent += `"Loại báo cáo:","${reportType === 'inventory' ? 'Tồn kho hàng hóa' : reportType === 'shipments' ? 'Vận chuyển / Điều phối' : 'Sự cố phát sinh'}",,,,,,,,\n`;
            csvContent += `"Kỳ báo cáo:","${periodLabel}",,,,,,,,\n`;
            csvContent += `"Ngày xuất bản:","${this.formatDateTime(new Date())}",,,,,,,,\n`;
            csvContent += `"Tài khoản xuất:","${currentUser.fullName} (${currentUser.role})",,,,,,,,\n`;
            csvContent += `,,,,,,,,\n`;
            csvContent += `"TÓM TẮT THỐNG KÊ",,,,,,,,\n`;
            csvContent += `"Tổng số mặt hàng khác nhau:","${totalProducts}",,,,,,,,\n`;
            if (reportType !== 'incidents') {
                csvContent += `"Tổng số lô hàng liên quan:","${totalBatches}",,,,,,,,\n`;
            }
            else {
                csvContent += `"Tổng số vụ sự cố liên quan:","${data.length}",,,,,,,,\n`;
            }
            csvContent += `"Tổng giá trị ghi nhận:","${this.formatCurrency(totalBatchValue)}",,,,,,,,\n`;
            csvContent += `,,,,,,,,\n`;
            if (reportType === 'inventory') {
                csvContent += '"Mã lô hàng","Mã định danh lô","Tên sản phẩm","Số lượng khả dụng","Đơn vị","Đơn giá (VND)","Tổng giá trị (VND)","Tên địa điểm","Cập nhật lần cuối"\n';
                csvContent += data.map(item => {
                    const itemVal = Number(item.quantityAvailable || 0) * Number(item.batch?.product?.unitPrice || 0);
                    return `"${item.batchId || ''}","${item.batch?.batchCode || ''}","${(item.batch?.product?.name || '').replace(/"/g, '""')}",${item.quantityAvailable || 0},"${item.batch?.unit || ''}",${item.batch?.product?.unitPrice || 0},${itemVal.toFixed(2)},"${(item.node?.name || '').replace(/"/g, '""')}","${this.formatDateTime(item.lastUpdatedAt)}"`;
                }).join('\n');
                csvContent += `\n"Tổng cộng",,,,,,"${totalBatchValue.toFixed(2)}",,`;
            }
            else if (reportType === 'shipments') {
                csvContent += '"Mã vận đơn","Mã lô hàng","Tên sản phẩm","Số lượng vận chuyển","Đơn vị","Đơn giá (VND)","Tổng giá trị (VND)","Trạng thái","Điểm gửi","Điểm nhận","Ngày gửi"\n';
                csvContent += data.map(item => {
                    const itemVal = Number(item.quantityShipped || 0) * Number(item.batch?.product?.unitPrice || 0);
                    return `"${item.trackingCode || ''}","${item.batch?.batchCode || ''}","${(item.batch?.product?.name || '').replace(/"/g, '""')}",${item.quantityShipped || 0},"${item.batch?.unit || ''}",${item.batch?.product?.unitPrice || 0},${itemVal.toFixed(2)},"${item.status || ''}","${(item.sourceNode?.name || '').replace(/"/g, '""')}","${(item.destinationNode?.name || '').replace(/"/g, '""')}","${this.formatDateTime(item.shippedAt)}"`;
                }).join('\n');
                csvContent += `\n"Tổng cộng",,,,,,"${totalBatchValue.toFixed(2)}",,,,`;
            }
            else {
                csvContent += '"Mã sự cố","Loại sự cố","Trạng thái","Mức độ ưu tiên","Mô tả","Mã lô hàng","Tổng giá trị (VND)","Ngày báo cáo"\n';
                csvContent += data.map(item => `"${item.incidentCode || ''}","${item.incidentType || ''}","${item.status || ''}","${item.priority || ''}","${(item.description || '').replace(/"/g, '""')}","${item.batch?.batchCode || ''}",${item.batch?.totalValue || 0},"${this.formatDateTime(item.openedAt)}"`).join('\n');
                csvContent += `\n"Tổng cộng",,,,,,"${totalBatchValue.toFixed(2)}",`;
            }
            return { content: Buffer.from(csvContent, 'utf-8'), contentType: 'text/csv; charset=utf-8', filename: `report_${reportType}_${filenamePeriod}.csv` };
        }
        else if (format === 'xlsx') {
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Báo cáo');
            const titleFont = { name: 'Arial', size: 14, bold: true, color: { argb: 'FF0F172A' } };
            const sectionFont = { name: 'Arial', size: 10, bold: true, color: { argb: 'FF1E293B' } };
            const labelFont = { name: 'Arial', size: 9, bold: true, color: { argb: 'FF475569' } };
            const valueFont = { name: 'Arial', size: 9, color: { argb: 'FF0F172A' } };
            const tableHeaderFont = { name: 'Arial', size: 9, bold: true, color: { argb: 'FFFFFFFF' } };
            const tableDataFont = { name: 'Arial', size: 9, color: { argb: 'FF334155' } };
            const totalFont = { name: 'Arial', size: 9, bold: true, color: { argb: 'FF0F172A' } };
            const totalValFont = { name: 'Arial', size: 9, bold: true, color: { argb: 'FF4F46E5' } };
            worksheet.mergeCells('A1:I1');
            const titleCell = worksheet.getCell('A1');
            titleCell.value = 'BÁO CÁO HỆ THỐNG LOGISTICS MINI';
            titleCell.font = titleFont;
            titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
            worksheet.getRow(1).height = 35;
            titleCell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFF8FAFC' }
            };
            const metadata = [
                ['Loại báo cáo:', reportType === 'inventory' ? 'Tồn kho hàng hóa' : reportType === 'shipments' ? 'Vận chuyển / Điều phối' : 'Sự cố phát sinh'],
                ['Kỳ báo cáo:', periodLabel],
                ['Ngày xuất bản:', this.formatDateTime(new Date())],
                ['Tài khoản xuất:', `${currentUser.fullName} (${currentUser.role})`]
            ];
            metadata.forEach((row, i) => {
                const rowNum = 3 + i;
                worksheet.getCell(`A${rowNum}`).value = row[0];
                worksheet.getCell(`A${rowNum}`).font = labelFont;
                worksheet.getCell(`B${rowNum}`).value = row[1];
                worksheet.getCell(`B${rowNum}`).font = valueFont;
                worksheet.getRow(rowNum).height = 18;
            });
            worksheet.getCell('A8').value = 'TÓM TẮT THỐNG KÊ';
            worksheet.getCell('A8').font = sectionFont;
            worksheet.getRow(8).height = 22;
            const stats = [
                ['Tổng số mặt hàng khác nhau:', totalProducts],
                [reportType !== 'incidents' ? 'Tổng số lô hàng liên quan:' : 'Tổng số vụ sự cố liên quan:', reportType !== 'incidents' ? totalBatches : data.length],
                ['Tổng giá trị ghi nhận:', totalBatchValue]
            ];
            stats.forEach((row, i) => {
                const rowNum = 9 + i;
                worksheet.getCell(`A${rowNum}`).value = row[0];
                worksheet.getCell(`A${rowNum}`).font = labelFont;
                const valCell = worksheet.getCell(`B${rowNum}`);
                valCell.value = row[1];
                valCell.font = valueFont;
                if (row[0] === 'Tổng giá trị ghi nhận:') {
                    valCell.font = totalValFont;
                    valCell.numFmt = '#,##0" VND"';
                }
                worksheet.getRow(rowNum).height = 18;
            });
            const startTableRows = 14;
            let colsMeta = [];
            if (reportType === 'inventory') {
                colsMeta = [
                    { header: 'Mã lô hàng', key: 'batchId', width: 25, align: 'left' },
                    { header: 'Mã định danh lô', key: 'batchCode', width: 18, align: 'left' },
                    { header: 'Tên sản phẩm', key: 'productName', width: 25, align: 'left' },
                    { header: 'Số lượng khả dụng', key: 'quantityAvailable', width: 18, align: 'right', type: 'numeric' },
                    { header: 'Đơn vị', key: 'unit', width: 10, align: 'center' },
                    { header: 'Đơn giá', key: 'unitPrice', width: 16, align: 'right', type: 'currency' },
                    { header: 'Tổng giá trị', key: 'totalValue', width: 18, align: 'right', type: 'currency' },
                    { header: 'Tên địa điểm', key: 'nodeName', width: 25, align: 'left' },
                    { header: 'Cập nhật lần cuối', key: 'updatedAt', width: 20, align: 'center' }
                ];
            }
            else if (reportType === 'shipments') {
                colsMeta = [
                    { header: 'Mã vận đơn', key: 'trackingCode', width: 18, align: 'left' },
                    { header: 'Mã lô hàng', key: 'batchCode', width: 18, align: 'left' },
                    { header: 'Tên sản phẩm', key: 'productName', width: 25, align: 'left' },
                    { header: 'Số lượng vận chuyển', key: 'quantityShipped', width: 20, align: 'right', type: 'numeric' },
                    { header: 'Đơn vị', key: 'unit', width: 10, align: 'center' },
                    { header: 'Đơn giá', key: 'unitPrice', width: 16, align: 'right', type: 'currency' },
                    { header: 'Tổng giá trị', key: 'totalValue', width: 18, align: 'right', type: 'currency' },
                    { header: 'Trạng thái', key: 'status', width: 15, align: 'center' },
                    { header: 'Điểm gửi', key: 'sourceNode', width: 25, align: 'left' },
                    { header: 'Điểm nhận', key: 'destNode', width: 25, align: 'left' },
                    { header: 'Ngày gửi', key: 'shippedAt', width: 20, align: 'center' }
                ];
            }
            else {
                colsMeta = [
                    { header: 'Mã sự cố', key: 'incidentCode', width: 18, align: 'left' },
                    { header: 'Loại sự cố', key: 'incidentType', width: 18, align: 'left' },
                    { header: 'Trạng thái', key: 'status', width: 15, align: 'center' },
                    { header: 'Mức độ ưu tiên', key: 'priority', width: 15, align: 'center' },
                    { header: 'Mô tả', key: 'description', width: 35, align: 'left' },
                    { header: 'Mã lô hàng', key: 'batchCode', width: 18, align: 'left' },
                    { header: 'Tổng giá trị', key: 'totalValue', width: 18, align: 'right', type: 'currency' },
                    { header: 'Ngày báo cáo', key: 'openedAt', width: 20, align: 'center' }
                ];
            }
            const headerRow = worksheet.getRow(startTableRows);
            headerRow.height = 26;
            colsMeta.forEach((col, colIdx) => {
                const cell = headerRow.getCell(colIdx + 1);
                cell.value = col.header;
                cell.font = tableHeaderFont;
                cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FF1E293B' }
                };
                cell.alignment = { horizontal: col.align === 'center' ? 'center' : (col.align === 'right' ? 'right' : 'left'), vertical: 'middle' };
                cell.border = {
                    top: { style: 'thin', color: { argb: 'FF475569' } },
                    bottom: { style: 'medium', color: { argb: 'FF0F172A' } },
                    left: { style: 'thin', color: { argb: 'FF475569' } },
                    right: { style: 'thin', color: { argb: 'FF475569' } }
                };
            });
            let currentTableY = startTableRows + 1;
            data.forEach((item, dataIdx) => {
                const row = worksheet.getRow(currentTableY);
                row.height = 22;
                let rowValues = [];
                if (reportType === 'inventory') {
                    const itemVal = Number(item.quantityAvailable || 0) * Number(item.batch?.product?.unitPrice || 0);
                    rowValues = [
                        item.batchId || '',
                        item.batch?.batchCode || '',
                        item.batch?.product?.name || '',
                        Number(item.quantityAvailable || 0),
                        item.batch?.unit || '',
                        Number(item.batch?.product?.unitPrice || 0),
                        itemVal,
                        item.node?.name || '',
                        this.formatDateTime(item.lastUpdatedAt)
                    ];
                }
                else if (reportType === 'shipments') {
                    const itemVal = Number(item.quantityShipped || 0) * Number(item.batch?.product?.unitPrice || 0);
                    rowValues = [
                        item.trackingCode || '',
                        item.batch?.batchCode || '',
                        item.batch?.product?.name || '',
                        Number(item.quantityShipped || 0),
                        item.batch?.unit || '',
                        Number(item.batch?.product?.unitPrice || 0),
                        itemVal,
                        item.status || '',
                        item.sourceNode?.name || '',
                        item.destinationNode?.name || '',
                        this.formatDateTime(item.shippedAt)
                    ];
                }
                else {
                    rowValues = [
                        item.incidentCode || '',
                        item.incidentType || '',
                        item.status || '',
                        item.priority || '',
                        item.description || '',
                        item.batch?.batchCode || '',
                        Number(item.batch?.totalValue || 0),
                        this.formatDateTime(item.openedAt)
                    ];
                }
                rowValues.forEach((val, colIdx) => {
                    const cell = row.getCell(colIdx + 1);
                    const colMeta = colsMeta[colIdx];
                    cell.value = val;
                    cell.font = tableDataFont;
                    cell.alignment = {
                        horizontal: colMeta.align === 'center' ? 'center' : (colMeta.align === 'right' ? 'right' : 'left'),
                        vertical: 'middle',
                        wrapText: true
                    };
                    if (colMeta.type === 'currency') {
                        cell.numFmt = '#,##0" VND"';
                    }
                    else if (colMeta.type === 'numeric') {
                        cell.numFmt = '#,##0';
                    }
                    if (dataIdx % 2 === 0) {
                        cell.fill = {
                            type: 'pattern',
                            pattern: 'solid',
                            fgColor: { argb: 'FFF8FAFC' }
                        };
                    }
                    else {
                        cell.fill = {
                            type: 'pattern',
                            pattern: 'solid',
                            fgColor: { argb: 'FFFFFFFF' }
                        };
                    }
                    cell.border = {
                        bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
                        left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
                        right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
                    };
                });
                currentTableY++;
            });
            const totalRow = worksheet.getRow(currentTableY);
            totalRow.height = 24;
            colsMeta.forEach((col, colIdx) => {
                const cell = totalRow.getCell(colIdx + 1);
                cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FFF1F5F9' }
                };
                cell.border = {
                    top: { style: 'thin', color: { argb: 'FFCBD5E1' } },
                    bottom: { style: 'double', color: { argb: 'FF0F172A' } },
                    left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
                    right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
                };
            });
            const totalLabelCell = totalRow.getCell(1);
            totalLabelCell.value = 'Tổng cộng';
            totalLabelCell.font = totalFont;
            totalLabelCell.alignment = { horizontal: 'left', vertical: 'middle' };
            const totalValColIdx = colsMeta.findIndex(c => c.header === 'Tổng giá trị') + 1;
            if (totalValColIdx > 0) {
                const totalValCell = totalRow.getCell(totalValColIdx);
                const formulaStartRow = startTableRows + 1;
                const formulaEndRow = currentTableY - 1;
                if (data.length > 0) {
                    const colLetter = String.fromCharCode(64 + totalValColIdx);
                    totalValCell.value = {
                        formula: `=SUM(${colLetter}${formulaStartRow}:${colLetter}${formulaEndRow})`,
                        result: totalBatchValue
                    };
                }
                else {
                    totalValCell.value = 0;
                }
                totalValCell.font = totalValFont;
                totalValCell.numFmt = '#,##0" VND"';
                totalValCell.alignment = { horizontal: 'right', vertical: 'middle' };
            }
            colsMeta.forEach((col, colIdx) => {
                worksheet.getColumn(colIdx + 1).width = col.width;
            });
            const buffer = await workbook.xlsx.writeBuffer();
            return {
                content: Buffer.from(buffer),
                contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                filename: `report_${reportType}_${filenamePeriod}.xlsx`
            };
        }
        else {
            const doc = new pdfkit_1.default({ margin: 50, size: 'A4', bufferPages: true });
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
            doc.rect(50, 45, 5, 25).fill('#4f46e5');
            doc.font('DejaVuSans-Bold').fontSize(18).fillColor('#0f172a').text('BÁO CÁO CHUỖI CUNG ỨNG MINI', 65, 48);
            doc.moveDown(1.5);
            const typeLabel = reportType === 'inventory' ? 'Tồn kho hàng hóa' : reportType === 'shipments' ? 'Vận chuyển / Điều phối' : 'Sự cố phát sinh';
            doc.roundedRect(50, 80, 495, 55, 4).fill('#f8fafc');
            doc.strokeColor('#e2e8f0').lineWidth(1).roundedRect(50, 80, 495, 55, 4).stroke();
            doc.font('DejaVuSans-Bold').fontSize(8.5).fillColor('#475569');
            doc.text('Loại báo cáo:', 65, 90);
            doc.text('Kỳ báo cáo:', 65, 110);
            doc.text('Ngày xuất bản:', 290, 90);
            doc.text('Tài khoản:', 290, 110);
            doc.font('DejaVuSans').fontSize(8.5).fillColor('#0f172a');
            doc.text(typeLabel, 135, 90);
            doc.text(periodLabel, 135, 110);
            doc.text(this.formatDateTime(new Date()), 365, 90);
            doc.text(`${currentUser.fullName} (${currentUser.role})`, 365, 110);
            const statsY = 150;
            doc.roundedRect(50, statsY, 495, 60, 6).fill('#fafafa');
            doc.strokeColor('#e2e8f0').lineWidth(1).roundedRect(50, statsY, 495, 60, 6).stroke();
            doc.strokeColor('#e2e8f0').lineWidth(1)
                .moveTo(200, statsY + 10).lineTo(200, statsY + 50).stroke();
            doc.strokeColor('#e2e8f0').lineWidth(1)
                .moveTo(350, statsY + 10).lineTo(350, statsY + 50).stroke();
            doc.fillColor('#64748b').font('DejaVuSans-Bold').fontSize(7.5).text('TỔNG MẶT HÀNG', 65, statsY + 14);
            doc.fillColor('#0f172a').font('DejaVuSans-Bold').fontSize(14).text(String(totalProducts), 65, statsY + 28);
            if (reportType !== 'incidents') {
                doc.fillColor('#64748b').font('DejaVuSans-Bold').fontSize(7.5).text('TỔNG SỐ LÔ HÀNG', 215, statsY + 14);
                doc.fillColor('#0f172a').font('DejaVuSans-Bold').fontSize(14).text(String(totalBatches), 215, statsY + 28);
                doc.fillColor('#64748b').font('DejaVuSans-Bold').fontSize(7.5).text('TỔNG GIÁ TRỊ BÁO CÁO', 365, statsY + 14);
                doc.fillColor('#4f46e5').font('DejaVuSans-Bold').fontSize(12).text(this.formatCurrency(totalBatchValue), 365, statsY + 28);
            }
            else {
                doc.fillColor('#64748b').font('DejaVuSans-Bold').fontSize(7.5).text('TỔNG SỐ SỰ CỐ', 215, statsY + 14);
                doc.fillColor('#0f172a').font('DejaVuSans-Bold').fontSize(14).text(String(data.length), 215, statsY + 28);
                doc.fillColor('#64748b').font('DejaVuSans-Bold').fontSize(7.5).text('TỔNG GIÁ TRỊ SỰ CỐ', 365, statsY + 14);
                doc.fillColor('#dc2626').font('DejaVuSans-Bold').fontSize(12).text(this.formatCurrency(totalBatchValue), 365, statsY + 28);
            }
            doc.x = 50;
            let columns = [];
            if (reportType === 'inventory') {
                columns = [
                    { header: 'Mã lô', width: 50, getValue: (item) => item.batch?.batchCode || '-' },
                    { header: 'Tên sản phẩm', width: 115, getValue: (item) => item.batch?.product?.name || '-' },
                    { header: 'Số lượng', width: 50, align: 'right', getValue: (item) => `${item.quantityAvailable || 0} ${item.batch?.unit || ''}` },
                    { header: 'Đơn giá', width: 65, align: 'right', getValue: (item) => this.formatCurrency(item.batch?.product?.unitPrice || 0) },
                    { header: 'Tổng giá trị', width: 80, align: 'right', getValue: (item) => this.formatCurrency(Number(item.quantityAvailable || 0) * Number(item.batch?.product?.unitPrice || 0)) },
                    { header: 'Địa điểm', width: 75, getValue: (item) => item.node?.name || '-' },
                    { header: 'Cập nhật', width: 60, getValue: (item) => this.formatDate(item.lastUpdatedAt) }
                ];
            }
            else if (reportType === 'shipments') {
                columns = [
                    { header: 'Mã vận đơn', width: 55, getValue: (item) => item.trackingCode || '-' },
                    { header: 'Mã lô', width: 45, getValue: (item) => item.batch?.batchCode || '-' },
                    { header: 'Tên sản phẩm', width: 100, getValue: (item) => item.batch?.product?.name || '-' },
                    { header: 'Số lượng', width: 45, align: 'right', getValue: (item) => `${item.quantityShipped || 0} ${item.batch?.unit || ''}` },
                    { header: 'Tổng giá trị', width: 80, align: 'right', getValue: (item) => this.formatCurrency(Number(item.quantityShipped || 0) * Number(item.batch?.product?.unitPrice || 0)) },
                    { header: 'Trạng thái', width: 50, getValue: (item) => item.status || '-' },
                    { header: 'Nơi gửi/nhận', width: 65, getValue: (item) => `${item.sourceNode?.name || '-'}\n-> ${item.destinationNode?.name || '-'}` },
                    { header: 'Ngày gửi', width: 55, getValue: (item) => this.formatDate(item.shippedAt) }
                ];
            }
            else {
                columns = [
                    { header: 'Mã sự cố', width: 60, getValue: (item) => item.incidentCode || '-' },
                    { header: 'Loại', width: 50, getValue: (item) => item.incidentType || '-' },
                    { header: 'Mức độ', width: 40, getValue: (item) => item.priority || '-' },
                    { header: 'Trạng thái', width: 50, getValue: (item) => item.status || '-' },
                    { header: 'Mô tả', width: 115, getValue: (item) => item.description || '-' },
                    { header: 'Mã lô', width: 50, getValue: (item) => item.batch?.batchCode || '-' },
                    { header: 'Tổng giá trị', width: 75, align: 'right', getValue: (item) => this.formatCurrency(item.batch?.totalValue || 0) },
                    { header: 'Ngày báo', width: 55, getValue: (item) => this.formatDate(item.openedAt) }
                ];
            }
            const drawHeader = (yPos) => {
                doc.rect(50, yPos, 495, 24).fill('#1e293b');
                doc.fillColor('#ffffff').font('DejaVuSans-Bold').fontSize(8.5);
                let currentX = 50;
                for (const col of columns) {
                    doc.text(col.header, currentX + 4, yPos + 8, {
                        width: col.width - 8,
                        align: col.align || 'left',
                        lineBreak: false
                    });
                    currentX += col.width;
                }
            };
            let tableY = statsY + 75;
            if (tableY > 730) {
                doc.addPage();
                tableY = 50;
            }
            drawHeader(tableY);
            tableY += 24;
            let index = 0;
            for (const item of data) {
                let maxRowHeight = 24;
                let currentX = 50;
                doc.font('DejaVuSans').fontSize(8);
                for (const col of columns) {
                    const val = col.getValue(item);
                    const cellHeight = doc.heightOfString(val, { width: col.width - 8 });
                    if (cellHeight + 10 > maxRowHeight) {
                        maxRowHeight = Math.ceil(cellHeight + 10);
                    }
                }
                if (tableY + maxRowHeight > 750) {
                    doc.addPage();
                    tableY = 50;
                    drawHeader(tableY);
                    tableY += 24;
                    doc.font('DejaVuSans').fontSize(8);
                }
                if (index % 2 === 0) {
                    doc.rect(50, tableY, 495, maxRowHeight).fill('#f8fafc');
                }
                else {
                    doc.rect(50, tableY, 495, maxRowHeight).fill('#ffffff');
                }
                doc.strokeColor('#e2e8f0').lineWidth(0.5).moveTo(50, tableY + maxRowHeight).lineTo(545, tableY + maxRowHeight).stroke();
                doc.fillColor('#334155');
                currentX = 50;
                for (const col of columns) {
                    const val = col.getValue(item);
                    const cellHeight = doc.heightOfString(val, { width: col.width - 8 });
                    const yOffset = Math.max(5, Math.floor((maxRowHeight - cellHeight) / 2));
                    doc.text(val, currentX + 4, tableY + yOffset, {
                        width: col.width - 8,
                        align: col.align || 'left'
                    });
                    currentX += col.width;
                }
                tableY += maxRowHeight;
                index++;
            }
            const totalRowHeight = 24;
            if (tableY + totalRowHeight > 750) {
                doc.addPage();
                tableY = 50;
                drawHeader(tableY);
                tableY += 24;
            }
            doc.rect(50, tableY, 495, totalRowHeight).fill('#f1f5f9');
            doc.strokeColor('#cbd5e1').lineWidth(1).moveTo(50, tableY).lineTo(545, tableY).stroke();
            doc.strokeColor('#1e293b').lineWidth(1.5).moveTo(50, tableY + totalRowHeight).lineTo(545, tableY + totalRowHeight).stroke();
            doc.fillColor('#0f172a').font('DejaVuSans-Bold').fontSize(8.5);
            doc.text('Tổng cộng', 55, tableY + 8);
            let currentX = 50;
            for (const col of columns) {
                if (col.header === 'Tổng giá trị') {
                    doc.fillColor('#4f46e5').text(this.formatCurrency(totalBatchValue), currentX + 4, tableY + 8, {
                        width: col.width - 8,
                        align: 'right'
                    });
                }
                currentX += col.width;
            }
            const range = doc.bufferedPageRange();
            for (let i = range.start; i < range.start + range.count; i++) {
                doc.switchToPage(i);
                doc.font('DejaVuSans').fontSize(8).fillColor('#64748b');
                doc.strokeColor('#e2e8f0').lineWidth(0.5).moveTo(50, 770).lineTo(545, 770).stroke();
                doc.text(`Trang ${i + 1} / ${range.count}`, 50, 775, { align: 'right', width: 495 });
                doc.text('Báo cáo tự động từ Hệ thống Logistics Mini - Tuyệt mật', 50, 775, { align: 'left', width: 495 });
            }
            doc.end();
            const pdfBuffer = await new Promise((resolve, reject) => {
                doc.on('end', () => resolve(Buffer.concat(chunks)));
                doc.on('error', err => reject(err));
            });
            return { content: pdfBuffer, contentType: 'application/pdf', filename: `report_${reportType}_${filenamePeriod}.${format}` };
        }
    }
};
exports.DashboardSystemService = DashboardSystemService;
exports.DashboardSystemService = DashboardSystemService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeorm_1.DataSource])
], DashboardSystemService);
//# sourceMappingURL=dashboard-system.service.js.map