import { Injectable, BadRequestException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { InventoryEntity } from '../batches/entities/inventory.entity';
import { ShipmentEntity } from '../shipments/entities/shipment.entity';
import { IncidentReportEntity } from '../incidents/entities/incident-report.entity';
import { AuditLogEntity } from '../audit/entities/audit-log.entity';
import { RoleName } from '../../common/enums/role.enum';
import { ShipmentStatus } from '../../common/enums/shipment-status.enum';
import { TimelineEventEntity } from '../batches/entities/timeline-event.entity';
import { TimelineEventType } from '../../common/enums/timeline-event-type.enum';
import * as path from 'path';
import * as fs from 'fs';
import PDFDocument from 'pdfkit';
import * as ExcelJS from 'exceljs';

@Injectable()
export class DashboardSystemService {
  constructor(private readonly dataSource: DataSource) {}

  async getStats(currentUser: any): Promise<any> {
    let totalInventory = 0;
    let activeShipments = 0;
    let incidents = 0;

    const inventoryRepo = this.dataSource.getRepository(InventoryEntity);
    const shipmentRepo = this.dataSource.getRepository(ShipmentEntity);
    const incidentRepo = this.dataSource.getRepository(IncidentReportEntity);

    if (currentUser.role === RoleName.ADMIN) {
      const inventoryRes = await inventoryRepo.createQueryBuilder('inv')
        .select('SUM(inv.quantityAvailable)', 'sum')
        .getRawOne();
      totalInventory = Number(inventoryRes?.sum || 0);

      activeShipments = await shipmentRepo.createQueryBuilder('s')
        .where('s.status IN (:...statuses)', { statuses: [ShipmentStatus.IN_TRANSIT, ShipmentStatus.DELAYED] })
        .getCount();

      incidents = await incidentRepo.createQueryBuilder('i')
        .where('i.status IN (:...statuses)', { statuses: ['OPEN', 'IN_PROGRESS'] })
        .getCount();
    } else {
      const userNodeId = currentUser.nodeId;
      if (userNodeId) {
        const inventoryRes = await inventoryRepo.createQueryBuilder('inv')
          .select('SUM(inv.quantityAvailable)', 'sum')
          .where('inv.nodeId = :nodeId', { nodeId: userNodeId })
          .getRawOne();
        totalInventory = Number(inventoryRes?.sum || 0);

        activeShipments = await shipmentRepo.createQueryBuilder('s')
          .where('s.status IN (:...statuses)', { statuses: [ShipmentStatus.IN_TRANSIT, ShipmentStatus.DELAYED] })
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

  async getAuditLogs(query: { page?: string; limit?: string }): Promise<any> {
    const page = parseInt(query.page || '1', 10);
    const limit = parseInt(query.limit || '10', 10);
    const skip = (page - 1) * limit;

    const [data, total] = await this.dataSource.getRepository(AuditLogEntity).findAndCount({
      relations: { actor: true },
      order: { occurredAt: 'DESC' },
      skip,
      take: limit,
    });

    // Sanitize actor passwordHash
    for (const log of data) {
      if (log.actor) {
        delete (log.actor as any).passwordHash;
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

  getDateRange(period: string, startDate?: string, endDate?: string): { start: Date; end: Date } {
    const now = new Date();
    let start: Date;
    let end = new Date(now);

    if (period === 'today') {
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
      end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    } else if (period === 'month') {
      start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    } else if (period === 'quarter') {
      const currentQuarter = Math.floor(now.getMonth() / 3);
      start = new Date(now.getFullYear(), currentQuarter * 3, 1, 0, 0, 0, 0);
      end = new Date(now.getFullYear(), (currentQuarter + 1) * 3, 0, 23, 59, 59, 999);
    } else if (period === 'year') {
      start = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
      end = new Date(now.getFullYear(), 12, 0, 23, 59, 59, 999);
    } else if (period === 'custom') {
      if (!startDate || !endDate) {
        throw new BadRequestException('Vui lòng cung cấp ngày bắt đầu và ngày kết thúc');
      }
      start = new Date(startDate);
      start.setHours(0, 0, 0, 0);

      const parsedEnd = new Date(endDate);
      end = new Date(parsedEnd.getFullYear(), parsedEnd.getMonth(), parsedEnd.getDate(), 23, 59, 59, 999);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        throw new BadRequestException('Định dạng ngày bắt đầu hoặc ngày kết thúc không hợp lệ');
      }
      if (start > end) {
        throw new BadRequestException('Ngày bắt đầu không được sau ngày kết thúc');
      }
    } else {
      throw new BadRequestException('Khoảng thời gian báo cáo không hợp lệ');
    }

    return { start, end };
  }

  formatDate(date: Date | string | null | undefined): string {
    if (!date) return '-';
    try {
      const d = new Date(date);
      return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
    } catch {
      return String(date);
    }
  }

  formatDateTime(date: Date | string | null | undefined): string {
    if (!date) return '-';
    try {
      const d = new Date(date);
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      const seconds = String(d.getSeconds()).padStart(2, '0');
      return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
    } catch {
      return String(date);
    }
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value) + ' VND';
  }

  async exportReport(
    reportType: string,
    format: string,
    period: string | undefined,
    currentUser: any,
    startDate?: string,
    endDate?: string,
  ): Promise<any> {
    if (currentUser.role === RoleName.MANUFACTURER && reportType !== 'inventory' && reportType !== 'shipments') {
      throw new BadRequestException('Vai trò Manufacturer chỉ được phép xuất báo cáo inventory và shipments');
    }

    let data: any[] = [];
    const userNodeId = currentUser.nodeId;
    const reportPeriod = period || 'custom';
    const { start, end } = this.getDateRange(reportPeriod, startDate, endDate);

    if (reportType === 'inventory') {
      const qb = this.dataSource.getRepository(InventoryEntity).createQueryBuilder('inv')
        .leftJoinAndSelect('inv.batch', 'batch')
        .leftJoinAndSelect('batch.product', 'product')
        .leftJoinAndSelect('inv.node', 'node')
        .where('inv.lastUpdatedAt >= :start', { start })
        .andWhere('inv.lastUpdatedAt <= :end', { end });
      if (currentUser.role !== RoleName.ADMIN && userNodeId) {
        qb.andWhere('inv.nodeId = :nodeId', { nodeId: userNodeId });
      }
      data = await qb.getMany();
    } else if (reportType === 'shipments') {
      const qb = this.dataSource.getRepository(ShipmentEntity).createQueryBuilder('s')
        .leftJoinAndSelect('s.batch', 'batch')
        .leftJoinAndSelect('batch.product', 'product')
        .leftJoinAndSelect('s.sourceNode', 'sourceNode')
        .leftJoinAndSelect('s.destinationNode', 'destinationNode')
        .where('s.shippedAt >= :start', { start })
        .andWhere('s.shippedAt <= :end', { end });
      if (currentUser.role !== RoleName.ADMIN && userNodeId) {
        qb.andWhere('(s.sourceNodeId = :nodeId OR s.destinationNodeId = :nodeId)', { nodeId: userNodeId });
      }
      data = await qb.getMany();
    } else if (reportType === 'incidents') {
      const qb = this.dataSource.getRepository(IncidentReportEntity).createQueryBuilder('i')
        .leftJoinAndSelect('i.shipment', 's')
        .leftJoinAndSelect('i.batch', 'batch')
        .leftJoinAndSelect('batch.product', 'product')
        .where('i.openedAt >= :start', { start })
        .andWhere('i.openedAt <= :end', { end });
      if (currentUser.role !== RoleName.ADMIN && userNodeId) {
        qb.andWhere('(s.sourceNodeId = :nodeId OR s.destinationNodeId = :nodeId)', { nodeId: userNodeId });
      }
      data = await qb.getMany();
    } else if (reportType === 'financial') {
      if (currentUser.role !== RoleName.RETAILER) {
        throw new BadRequestException('Chỉ Retailer mới có quyền truy cập báo cáo tài chính');
      }
      const qb = this.dataSource.getRepository(TimelineEventEntity).createQueryBuilder('event')
        .leftJoinAndSelect('event.batch', 'batch')
        .leftJoinAndSelect('batch.product', 'product')
        .where('event.eventType = :eventType', { eventType: TimelineEventType.SOLD })
        .andWhere('event.occurredAt >= :start', { start })
        .andWhere('event.occurredAt <= :end', { end });
      if (userNodeId) {
        qb.andWhere('event.nodeId = :nodeId', { nodeId: userNodeId });
      }
      qb.orderBy('event.occurredAt', 'DESC');
      data = await qb.getMany();
    }

    data = data || [];

    // Calculate summary statistics
    const productIds = new Set<string>();
    const batchIds = new Set<string>();
    let totalBatchValue = 0;
    const financialKpi = {
      totalRevenue: 0,
      totalCost: 0,
      totalProfit: 0,
      totalUnitsSold: 0,
    };

    if (reportType === 'inventory') {
      for (const item of data) {
        if (item.batch?.productId) productIds.add(item.batch.productId);
        if (item.batchId) batchIds.add(item.batchId);
        const itemVal = Number(item.quantityAvailable || 0) * Number(item.batch?.product?.unitPrice || 0);
        totalBatchValue += itemVal;
      }
    } else if (reportType === 'shipments') {
      for (const item of data) {
        if (item.batch?.productId) productIds.add(item.batch.productId);
        if (item.batchId) batchIds.add(item.batchId);
        const itemVal = Number(item.quantityShipped || 0) * Number(item.batch?.product?.unitPrice || 0);
        totalBatchValue += itemVal;
      }
    } else if (reportType === 'incidents') {
      for (const item of data) {
        if (item.batch?.productId) productIds.add(item.batch.productId);
        if (item.batchId) batchIds.add(item.batchId);
        totalBatchValue += Number(item.batch?.totalValue || 0);
      }
    } else if (reportType === 'financial') {
      for (const event of data) {
        const metadata = event.metadata || {};
        financialKpi.totalRevenue += Number(metadata.revenue || 0);
        financialKpi.totalCost += Number(metadata.cost || 0);
        financialKpi.totalProfit += Number(metadata.profit || 0);
        financialKpi.totalUnitsSold += Number(metadata.qty_sold || 0);
        if (event.batch?.productId) productIds.add(event.batch.productId);
        if (event.batchId) batchIds.add(event.batchId);
        totalBatchValue += Number(metadata.revenue || 0);
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
      let csvContent = '\ufeff'; // UTF-8 BOM
      csvContent += `"BÁO CÁO HỆ THỐNG LOGISTICS MINI",,,,,,,,\n`;
      csvContent += `"Loại báo cáo:","${reportType === 'inventory' ? 'Tồn kho hàng hóa' : reportType === 'shipments' ? 'Vận chuyển / Điều phối' : reportType === 'incidents' ? 'Sự cố phát sinh' : reportType === 'financial' ? 'Báo cáo tài chính' : 'Sự cố phát sinh'}",,,,,,,,\n`;
      csvContent += `"Kỳ báo cáo:","${periodLabel}",,,,,,,,\n`;
      csvContent += `"Ngày xuất bản:","${this.formatDateTime(new Date())}",,,,,,,,\n`;
      if (reportType !== 'financial') {
        csvContent += `"Tài khoản xuất:","${currentUser.fullName} (${currentUser.role})",,,,,,,,\n`;
      }
      csvContent += `,,,,,,,,\n`;
      csvContent += `"TÓM TẮT THỐNG KÊ",,,,,,,,\n`;
      if (reportType === 'financial') {
        csvContent += `"Tổng doanh thu:","${this.formatCurrency(financialKpi.totalRevenue)}",,,,,,,,\n`;
        csvContent += `"Tổng chi phí mua hàng:","${this.formatCurrency(financialKpi.totalCost)}",,,,,,,,\n`;
        csvContent += `"Tổng lợi nhuận:","${this.formatCurrency(financialKpi.totalProfit)}",,,,,,,,\n`;
        csvContent += `"Tổng số lượng đã bán:","${financialKpi.totalUnitsSold}",,,,,,,,\n`;
      } else {
        csvContent += `"Tổng số mặt hàng khác nhau:","${totalProducts}",,,,,,,,\n`;
        if (reportType !== 'incidents') {
          csvContent += `"Tổng số lô hàng liên quan:","${totalBatches}",,,,,,,,\n`;
        } else {
          csvContent += `"Tổng số vụ sự cố liên quan:","${data.length}",,,,,,,,\n`;
        }
        csvContent += `"Tổng giá trị ghi nhận:","${this.formatCurrency(totalBatchValue)}",,,,,,,,\n`;
      }
      csvContent += `,,,,,,,,\n`;

      if (reportType === 'inventory') {
        csvContent += '"Mã lô hàng","Mã định danh lô","Tên sản phẩm","Số lượng khả dụng","Đơn vị","Đơn giá (VND)","Tổng giá trị (VND)","Tên địa điểm","Cập nhật lần cuối"\n';
        csvContent += data.map(item => {
          const itemVal = Number(item.quantityAvailable || 0) * Number(item.batch?.product?.unitPrice || 0);
          return `"${item.batchId || ''}","${item.batch?.batchCode || ''}","${(item.batch?.product?.name || '').replace(/"/g, '""')}",${item.quantityAvailable || 0},"${item.batch?.unit || ''}",${item.batch?.product?.unitPrice || 0},${itemVal.toFixed(2)},"${(item.node?.name || '').replace(/"/g, '""')}","${this.formatDateTime(item.lastUpdatedAt)}"`;
        }).join('\n');
        csvContent += `\n"Tổng cộng",,,,,,"${totalBatchValue.toFixed(2)}",,`;
      } else if (reportType === 'shipments') {
        csvContent += '"Mã vận đơn","Mã lô hàng","Tên sản phẩm","Số lượng vận chuyển","Đơn vị","Đơn giá (VND)","Tổng giá trị (VND)","Trạng thái","Điểm gửi","Điểm nhận","Ngày gửi"\n';
        csvContent += data.map(item => {
          const itemVal = Number(item.quantityShipped || 0) * Number(item.batch?.product?.unitPrice || 0);
          return `"${item.trackingCode || ''}","${item.batch?.batchCode || ''}","${(item.batch?.product?.name || '').replace(/"/g, '""')}",${item.quantityShipped || 0},"${item.batch?.unit || ''}",${item.batch?.product?.unitPrice || 0},${itemVal.toFixed(2)},"${item.status || ''}","${(item.sourceNode?.name || '').replace(/"/g, '""')}","${(item.destinationNode?.name || '').replace(/"/g, '""')}","${this.formatDateTime(item.shippedAt)}"`;
        }).join('\n');
        csvContent += `\n"Tổng cộng",,,,,,"${totalBatchValue.toFixed(2)}",,,,`;
      } else if (reportType === 'incidents') {
        csvContent += '"Mã sự cố","Loại sự cố","Trạng thái","Mức độ ưu tiên","Mô tả","Mã lô hàng","Tổng giá trị (VND)","Ngày báo cáo"\n';
        csvContent += data.map(item => 
          `"${item.incidentCode || ''}","${item.incidentType || ''}","${item.status || ''}","${item.priority || ''}","${(item.description || '').replace(/"/g, '""')}","${item.batch?.batchCode || ''}",${item.batch?.totalValue || 0},"${this.formatDateTime(item.openedAt)}"`
        ).join('\n');
        csvContent += `\n"Tổng cộng",,,,,,"${totalBatchValue.toFixed(2)}",`;
      } else if (reportType === 'financial') {
        csvContent += '"Ngày bán","Mã lô hàng","Tên sản phẩm","Số lượng bán","Giá mua (VND)","Giá bán (VND)","Doanh thu (VND)","Lợi nhuận (VND)"\n';
        csvContent += data.map(event => {
          const metadata = event.metadata || {};
          return `"${this.formatDateTime(event.occurredAt)}","${event.batch?.batchCode || ''}","${(event.batch?.product?.name || '').replace(/"/g, '""')}",${metadata.qty_sold || 0},${metadata.cost_price || 0},${metadata.sale_price || 0},${metadata.revenue || 0},${metadata.profit || 0}`;
        }).join('\n');
        csvContent += `\n"Tổng cộng",,,${financialKpi.totalUnitsSold},,,${financialKpi.totalRevenue.toFixed(2)},${financialKpi.totalProfit.toFixed(2)}`;
      }

      return { content: Buffer.from(csvContent, 'utf-8'), contentType: 'text/csv; charset=utf-8', filename: `report_${reportType}_${filenamePeriod}.csv` };
    } else if (format === 'xlsx') {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Báo cáo');

      // Styles & Fonts
      const titleFont = { name: 'Arial', size: 14, bold: true, color: { argb: 'FF0F172A' } }; // Slate 900
      const sectionFont = { name: 'Arial', size: 10, bold: true, color: { argb: 'FF1E293B' } }; // Slate 800
      const labelFont = { name: 'Arial', size: 9, bold: true, color: { argb: 'FF475569' } }; // Slate 600
      const valueFont = { name: 'Arial', size: 9, color: { argb: 'FF0F172A' } }; // Slate 900
      const tableHeaderFont = { name: 'Arial', size: 9, bold: true, color: { argb: 'FFFFFFFF' } };
      const tableDataFont = { name: 'Arial', size: 9, color: { argb: 'FF334155' } };
      const totalFont = { name: 'Arial', size: 9, bold: true, color: { argb: 'FF0F172A' } };
      const totalValFont = { name: 'Arial', size: 9, bold: true, color: { argb: 'FF4F46E5' } }; // Indigo bold

      // Title Row
      worksheet.mergeCells('A1:I1');
      const titleCell = worksheet.getCell('A1');
      titleCell.value = 'BÁO CÁO HỆ THỐNG LOGISTICS MINI';
      titleCell.font = titleFont;
      titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
      worksheet.getRow(1).height = 35;

      titleCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFF8FAFC' } // Slate 50
      };

      // Metadata Block
      const metadata = [
        ['Loại báo cáo:', reportType === 'inventory' 
          ? 'Tồn kho hàng hóa' 
          : reportType === 'shipments' 
          ? 'Vận chuyển / Điều phối' 
          : reportType === 'financial'
          ? 'Báo cáo tài chính'
          : 'Sự cố phát sinh'],
        ['Kỳ báo cáo:', periodLabel],
        ['Ngày xuất bản:', this.formatDateTime(new Date())]
      ];
      if (reportType !== 'financial') {
        metadata.push(['Tài khoản xuất:', `${currentUser.fullName} (${currentUser.role})`]);
      }

      // Clear the metadata cells in case it's financial so we don't have leftover values
      for (let r = 3; r <= 6; r++) {
        worksheet.getCell(`A${r}`).value = null;
        worksheet.getCell(`B${r}`).value = null;
      }

      metadata.forEach((row, i) => {
        const rowNum = 3 + i;
        worksheet.getCell(`A${rowNum}`).value = row[0];
        worksheet.getCell(`A${rowNum}`).font = labelFont;
        worksheet.getCell(`B${rowNum}`).value = row[1];
        worksheet.getCell(`B${rowNum}`).font = valueFont;
        worksheet.getRow(rowNum).height = 18;
      });

      // Statistics Box
      worksheet.getCell('A8').value = 'TÓM TẮT THỐNG KÊ';
      worksheet.getCell('A8').font = sectionFont;
      worksheet.getRow(8).height = 22;

      // Clear the statistics cells first
      for (let r = 9; r <= 13; r++) {
        worksheet.getCell(`A${r}`).value = null;
        worksheet.getCell(`B${r}`).value = null;
      }

      const stats: [string, any][] = [];
      if (reportType === 'financial') {
        stats.push(['Tổng doanh thu:', financialKpi.totalRevenue]);
        stats.push(['Tổng chi phí mua hàng:', financialKpi.totalCost]);
        stats.push(['Tổng lợi nhuận:', financialKpi.totalProfit]);
        stats.push(['Tổng số lượng đã bán:', financialKpi.totalUnitsSold]);
      } else {
        stats.push(['Tổng số mặt hàng khác nhau:', totalProducts]);
        stats.push([reportType !== 'incidents' ? 'Tổng số lô hàng liên quan:' : 'Tổng số vụ sự cố liên quan:', reportType !== 'incidents' ? totalBatches : data.length]);
        stats.push(['Tổng giá trị ghi nhận:', totalBatchValue]);
      }

      stats.forEach((row, i) => {
        const rowNum = 9 + i;
        worksheet.getCell(`A${rowNum}`).value = row[0];
        worksheet.getCell(`A${rowNum}`).font = labelFont;
        
        const valCell = worksheet.getCell(`B${rowNum}`);
        valCell.value = row[1];
        valCell.font = valueFont;
        if (row[0] === 'Tổng giá trị ghi nhận:' || row[0] === 'Tổng doanh thu:' || row[0] === 'Tổng chi phí mua hàng:' || row[0] === 'Tổng lợi nhuận:') {
          if (row[0] === 'Tổng lợi nhuận:') {
            valCell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FF10B981' } }; // green text
          } else {
            valCell.font = totalValFont;
          }
          valCell.numFmt = '#,##0" VND"';
        }
        worksheet.getRow(rowNum).height = 18;
      });

      // Space before table
      const startTableRows = 14;

      // Table Header and Columns definitions
      let colsMeta: { header: string; key: string; width: number; align: string; type?: string }[] = [];
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
      } else if (reportType === 'shipments') {
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
      } else if (reportType === 'financial') {
        colsMeta = [
          { header: 'Ngày bán', key: 'saleDate', width: 20, align: 'center' },
          { header: 'Mã lô hàng', key: 'batchCode', width: 18, align: 'left' },
          { header: 'Tên sản phẩm', key: 'productName', width: 25, align: 'left' },
          { header: 'Số lượng bán', key: 'quantitySold', width: 15, align: 'right', type: 'numeric' },
          { header: 'Giá mua', key: 'costPrice', width: 16, align: 'right', type: 'currency' },
          { header: 'Giá bán', key: 'salePrice', width: 16, align: 'right', type: 'currency' },
          { header: 'Doanh thu', key: 'revenue', width: 18, align: 'right', type: 'currency' },
          { header: 'Lợi nhuận', key: 'profit', width: 18, align: 'right', type: 'currency' },
        ];
      } else {
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

      // Draw table headers
      const headerRow = worksheet.getRow(startTableRows);
      headerRow.height = 26;
      colsMeta.forEach((col, colIdx) => {
        const cell = headerRow.getCell(colIdx + 1);
        cell.value = col.header;
        cell.font = tableHeaderFont;
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF1E293B' } // Slate 800
        };
        cell.alignment = { horizontal: col.align === 'center' ? 'center' : (col.align === 'right' ? 'right' : 'left'), vertical: 'middle' };
        cell.border = {
          top: { style: 'thin', color: { argb: 'FF475569' } },
          bottom: { style: 'medium', color: { argb: 'FF0F172A' } },
          left: { style: 'thin', color: { argb: 'FF475569' } },
          right: { style: 'thin', color: { argb: 'FF475569' } }
        };
      });

      // Draw table rows
      let currentTableY = startTableRows + 1;
      data.forEach((item, dataIdx) => {
        const row = worksheet.getRow(currentTableY);
        row.height = 22;

        let rowValues: any[] = [];
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
        } else if (reportType === 'shipments') {
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
        } else if (reportType === 'financial') {
          const metadata = item.metadata || {};
          rowValues = [
            this.formatDateTime(item.occurredAt),
            item.batch?.batchCode || '',
            item.batch?.product?.name || '',
            Number(metadata.qty_sold || 0),
            Number(metadata.cost_price || 0),
            Number(metadata.sale_price || 0),
            Number(metadata.revenue || 0),
            Number(metadata.profit || 0),
          ];
        } else {
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

          // Number formats
          if (colMeta.type === 'currency') {
            cell.numFmt = '#,##0" VND"';
          } else if (colMeta.type === 'numeric') {
            cell.numFmt = '#,##0';
          }

          // Zebra striping
          if (dataIdx % 2 === 0) {
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFF8FAFC' } // Slate 50
            };
          } else {
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFFFFFFF' }
            };
          }

          // Cell borders
          cell.border = {
            bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
            left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
            right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
          };
        });

        currentTableY++;
      });

      // Total Row
      const totalRow = worksheet.getRow(currentTableY);
      totalRow.height = 24;

      // Fill total row columns with background and borders
      colsMeta.forEach((col, colIdx) => {
        const cell = totalRow.getCell(colIdx + 1);
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF1F5F9' } // Slate 100
        };
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFCBD5E1' } },
          bottom: { style: 'double', color: { argb: 'FF0F172A' } },
          left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
          right: { style: 'thin', color: { argb: 'FFE2E8F0' } }
        };
      });

      // Add "Tổng cộng" label in first cell
      const totalLabelCell = totalRow.getCell(1);
      totalLabelCell.value = 'Tổng cộng';
      totalLabelCell.font = totalFont;
      totalLabelCell.alignment = { horizontal: 'left', vertical: 'middle' };

      if (reportType === 'financial') {
        const colLetterQty = String.fromCharCode(64 + 4);
        const colLetterRev = String.fromCharCode(64 + 7);
        const colLetterProf = String.fromCharCode(64 + 8);
        const formulaStartRow = startTableRows + 1;
        const formulaEndRow = currentTableY - 1;

        if (data.length > 0) {
          totalRow.getCell(4).value = { formula: `=SUM(${colLetterQty}${formulaStartRow}:${colLetterQty}${formulaEndRow})`, result: financialKpi.totalUnitsSold };
          totalRow.getCell(7).value = { formula: `=SUM(${colLetterRev}${formulaStartRow}:${colLetterRev}${formulaEndRow})`, result: financialKpi.totalRevenue };
          totalRow.getCell(8).value = { formula: `=SUM(${colLetterProf}${formulaStartRow}:${colLetterProf}${formulaEndRow})`, result: financialKpi.totalProfit };
        } else {
          totalRow.getCell(4).value = 0;
          totalRow.getCell(7).value = 0;
          totalRow.getCell(8).value = 0;
        }

        totalRow.getCell(4).font = totalFont;
        totalRow.getCell(4).alignment = { horizontal: 'right', vertical: 'middle' };

        totalRow.getCell(7).font = totalValFont;
        totalRow.getCell(7).numFmt = '#,##0" VND"';
        totalRow.getCell(7).alignment = { horizontal: 'right', vertical: 'middle' };

        totalRow.getCell(8).font = totalValFont;
        totalRow.getCell(8).numFmt = '#,##0" VND"';
        totalRow.getCell(8).alignment = { horizontal: 'right', vertical: 'middle' };
      } else {
        const totalValColIdx = colsMeta.findIndex(c => c.header === 'Tổng giá trị') + 1;
        if (totalValColIdx > 0) {
          const totalValCell = totalRow.getCell(totalValColIdx);
          const formulaStartRow = startTableRows + 1;
          const formulaEndRow = currentTableY - 1;
          // If there is data, use SUM formula, otherwise default to 0
          if (data.length > 0) {
            const colLetter = String.fromCharCode(64 + totalValColIdx);
            totalValCell.value = {
              formula: `=SUM(${colLetter}${formulaStartRow}:${colLetter}${formulaEndRow})`,
              result: totalBatchValue
            };
          } else {
            totalValCell.value = 0;
          }
          totalValCell.font = totalValFont;
          totalValCell.numFmt = '#,##0" VND"';
          totalValCell.alignment = { horizontal: 'right', vertical: 'middle' };
        }
      }

      // Auto-fit column widths (minimum width or auto-fitted based on meta)
      colsMeta.forEach((col, colIdx) => {
        worksheet.getColumn(colIdx + 1).width = col.width;
      });

      const buffer = await workbook.xlsx.writeBuffer();
      return { 
        content: Buffer.from(buffer), 
        contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 
        filename: `report_${reportType}_${filenamePeriod}.xlsx` 
      };
    } else {
      const doc = new PDFDocument({ margin: 50, size: 'A4', bufferPages: true });
      const chunks: Buffer[] = [];
      doc.on('data', chunk => chunks.push(chunk));

      // Font registration
      let fontPath = path.join(__dirname, '../../assets/fonts/DejaVuSans.ttf');
      let fontBoldPath = path.join(__dirname, '../../assets/fonts/DejaVuSans-Bold.ttf');
      if (!fs.existsSync(fontPath)) {
        fontPath = path.join(process.cwd(), 'src/assets/fonts/DejaVuSans.ttf');
        fontBoldPath = path.join(process.cwd(), 'src/assets/fonts/DejaVuSans-Bold.ttf');
      }

      doc.registerFont('DejaVuSans', fontPath);
      doc.registerFont('DejaVuSans-Bold', fontBoldPath);
      doc.font('DejaVuSans');

      // Decorative Indigo brand stripe on left of title
      doc.rect(50, 45, 5, 25).fill('#4f46e5');

      // Title
      doc.font('DejaVuSans-Bold').fontSize(18).fillColor('#0f172a').text('BÁO CÁO CHUỖI CUNG ỨNG MINI', 65, 48);
      doc.moveDown(1.5);

      // Metadata Block (Clean key-value layout with light background)
      const typeLabel = reportType === 'inventory'
        ? 'Tồn kho hàng hóa'
        : reportType === 'shipments'
        ? 'Vận chuyển / Điều phối'
        : reportType === 'financial'
        ? 'Báo cáo tài chính'
        : 'Sự cố phát sinh';
      doc.roundedRect(50, 80, 495, 55, 4).fill('#f8fafc');
      doc.strokeColor('#e2e8f0').lineWidth(1).roundedRect(50, 80, 495, 55, 4).stroke();

      doc.font('DejaVuSans-Bold').fontSize(8.5).fillColor('#475569');
      doc.text('Loại báo cáo:', 65, 90);
      doc.text('Kỳ báo cáo:', 65, 110);
      doc.text('Ngày xuất bản:', 290, 90);
      if (reportType !== 'financial') {
        doc.text('Tài khoản:', 290, 110);
      }

      doc.font('DejaVuSans').fontSize(8.5).fillColor('#0f172a');
      doc.text(typeLabel, 135, 90);
      doc.text(periodLabel, 135, 110);
      doc.text(this.formatDateTime(new Date()), 365, 90);
      if (reportType !== 'financial') {
        doc.text(`${currentUser.fullName} (${currentUser.role})`, 365, 110);
      }

      // Summary Stats Box (Operational cockpit dashboard style)
      const statsY = 150;
      doc.roundedRect(50, statsY, 495, 60, 6).fill('#fafafa');
      doc.strokeColor('#e2e8f0').lineWidth(1).roundedRect(50, statsY, 495, 60, 6).stroke();

      // Vertical separators
      doc.strokeColor('#e2e8f0').lineWidth(1)
        .moveTo(200, statsY + 10).lineTo(200, statsY + 50).stroke();
      doc.strokeColor('#e2e8f0').lineWidth(1)
        .moveTo(350, statsY + 10).lineTo(350, statsY + 50).stroke();

      if (reportType === 'financial') {
        // Column 1: Units Sold
        doc.fillColor('#64748b').font('DejaVuSans-Bold').fontSize(7.5).text('TỔNG ĐÃ BÁN', 65, statsY + 14);
        doc.fillColor('#0f172a').font('DejaVuSans-Bold').fontSize(14).text(String(financialKpi.totalUnitsSold), 65, statsY + 28);

        // Column 2: Revenue
        doc.fillColor('#64748b').font('DejaVuSans-Bold').fontSize(7.5).text('TỔNG DOANH THU', 215, statsY + 14);
        doc.fillColor('#0f172a').font('DejaVuSans-Bold').fontSize(11).text(this.formatCurrency(financialKpi.totalRevenue), 215, statsY + 28);

        // Column 3: Profit
        doc.fillColor('#64748b').font('DejaVuSans-Bold').fontSize(7.5).text('TỔNG LỢI NHUẬN', 365, statsY + 14);
        doc.fillColor('#10b981').font('DejaVuSans-Bold').fontSize(11).text(this.formatCurrency(financialKpi.totalProfit), 365, statsY + 28);
      } else {
        // Column 1: Products
        doc.fillColor('#64748b').font('DejaVuSans-Bold').fontSize(7.5).text('TỔNG MẶT HÀNG', 65, statsY + 14);
        doc.fillColor('#0f172a').font('DejaVuSans-Bold').fontSize(14).text(String(totalProducts), 65, statsY + 28);

        if (reportType !== 'incidents') {
          // Column 2: Batches
          doc.fillColor('#64748b').font('DejaVuSans-Bold').fontSize(7.5).text('TỔNG SỐ LÔ HÀNG', 215, statsY + 14);
          doc.fillColor('#0f172a').font('DejaVuSans-Bold').fontSize(14).text(String(totalBatches), 215, statsY + 28);

          // Column 3: Total Value (Indigo accent)
          doc.fillColor('#64748b').font('DejaVuSans-Bold').fontSize(7.5).text('TỔNG GIÁ TRỊ BÁO CÁO', 365, statsY + 14);
          doc.fillColor('#4f46e5').font('DejaVuSans-Bold').fontSize(12).text(this.formatCurrency(totalBatchValue), 365, statsY + 28);
        } else {
          // Column 2: Incidents
          doc.fillColor('#64748b').font('DejaVuSans-Bold').fontSize(7.5).text('TỔNG SỐ SỰ CỐ', 215, statsY + 14);
          doc.fillColor('#0f172a').font('DejaVuSans-Bold').fontSize(14).text(String(data.length), 215, statsY + 28);

          // Column 3: Total Affected Value (Red warning color)
          doc.fillColor('#64748b').font('DejaVuSans-Bold').fontSize(7.5).text('TỔNG GIÁ TRỊ SỰ CỐ', 365, statsY + 14);
          doc.fillColor('#dc2626').font('DejaVuSans-Bold').fontSize(12).text(this.formatCurrency(totalBatchValue), 365, statsY + 28);
        }
      }

      doc.x = 50;

      // Table Header and Columns definition with beautiful column layouts
      let columns: { header: string; width: number; align?: string; getValue: (item: any) => string }[] = [];
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
      } else if (reportType === 'shipments') {
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
      } else if (reportType === 'financial') {
        columns = [
          { header: 'Ngày bán', width: 85, getValue: (item) => this.formatDateTime(item.occurredAt) },
          { header: 'Mã lô', width: 50, getValue: (item) => item.batch?.batchCode || '-' },
          { header: 'Tên sản phẩm', width: 100, getValue: (item) => item.batch?.product?.name || '-' },
          { header: 'Số lượng', width: 45, align: 'right', getValue: (item) => String(item.metadata?.qty_sold || 0) },
          { header: 'Giá mua', width: 50, align: 'right', getValue: (item) => this.formatCurrency(item.metadata?.cost_price || 0) },
          { header: 'Giá bán', width: 50, align: 'right', getValue: (item) => this.formatCurrency(item.metadata?.sale_price || 0) },
          { header: 'Doanh thu', width: 60, align: 'right', getValue: (item) => this.formatCurrency(item.metadata?.revenue || 0) },
          { header: 'Lợi nhuận', width: 55, align: 'right', getValue: (item) => this.formatCurrency(item.metadata?.profit || 0) }
        ];
      } else {
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

      // Draw table headers
      const drawHeader = (yPos: number) => {
        doc.rect(50, yPos, 495, 24).fill('#1e293b');
        doc.fillColor('#ffffff').font('DejaVuSans-Bold').fontSize(8.5);
        let currentX = 50;
        for (const col of columns) {
          doc.text(col.header, currentX + 4, yPos + 8, {
            width: col.width - 8,
            align: (col.align as any) || 'left',
            lineBreak: false
          });
          currentX += col.width;
        }
      };

      let tableY = statsY + 75;
      
      // Check for page overflow before headers
      if (tableY > 730) {
        doc.addPage();
        tableY = 50;
      }
      
      drawHeader(tableY);
      tableY += 24;

      // Draw rows
      let index = 0;
      for (const item of data) {
        // Calculate row height by finding maximum height of cells
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

        // Check page overflow
        if (tableY + maxRowHeight > 750) {
          doc.addPage();
          tableY = 50;
          drawHeader(tableY);
          tableY += 24;
          doc.font('DejaVuSans').fontSize(8);
        }

        // Zebra striping
        if (index % 2 === 0) {
          doc.rect(50, tableY, 495, maxRowHeight).fill('#f8fafc');
        } else {
          doc.rect(50, tableY, 495, maxRowHeight).fill('#ffffff');
        }

        // Draw bottom border line
        doc.strokeColor('#e2e8f0').lineWidth(0.5).moveTo(50, tableY + maxRowHeight).lineTo(545, tableY + maxRowHeight).stroke();

        // Print cell texts
        doc.fillColor('#334155');
        currentX = 50;
        for (const col of columns) {
          const val = col.getValue(item);
          const cellHeight = doc.heightOfString(val, { width: col.width - 8 });
          const yOffset = Math.max(5, Math.floor((maxRowHeight - cellHeight) / 2));
          doc.text(val, currentX + 4, tableY + yOffset, {
            width: col.width - 8,
            align: (col.align as any) || 'left'
          });
          currentX += col.width;
        }

        tableY += maxRowHeight;
        index++;
      }

      // Draw Total Footer Row
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
        } else if (reportType === 'financial' && col.header === 'Doanh thu') {
          doc.fillColor('#4f46e5').text(this.formatCurrency(financialKpi.totalRevenue), currentX + 4, tableY + 8, {
            width: col.width - 8,
            align: 'right'
          });
        } else if (reportType === 'financial' && col.header === 'Lợi nhuận') {
          doc.fillColor('#10b981').text(this.formatCurrency(financialKpi.totalProfit), currentX + 4, tableY + 8, {
            width: col.width - 8,
            align: 'right'
          });
        }
        currentX += col.width;
      }

      // Add dynamic page numbers at the very end using bufferedPageRange
      const range = doc.bufferedPageRange();
      for (let i = range.start; i < range.start + range.count; i++) {
        doc.switchToPage(i);
        doc.font('DejaVuSans').fontSize(8).fillColor('#64748b');
        
        // Draw footer border line
        doc.strokeColor('#e2e8f0').lineWidth(0.5).moveTo(50, 770).lineTo(545, 770).stroke();
        
        doc.text(
          `Trang ${i + 1} / ${range.count}`,
          50,
          775,
          { align: 'right', width: 495 }
        );
        doc.text(
          'Báo cáo tự động từ Hệ thống Logistics Mini - Tuyệt mật',
          50,
          775,
          { align: 'left', width: 495 }
        );
      }

      doc.end();

      const pdfBuffer = await new Promise<Buffer>((resolve, reject) => {
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', err => reject(err));
      });

      return { content: pdfBuffer, contentType: 'application/pdf', filename: `report_${reportType}_${filenamePeriod}.${format}` };
    }
  }

  async getFinancialReport(
    period: string,
    currentUser: any,
    startDate?: string,
    endDate?: string,
  ): Promise<any> {
    if (currentUser.role !== RoleName.RETAILER) {
      throw new BadRequestException('Chỉ Retailer mới có quyền truy cập báo cáo tài chính');
    }

    const { start, end } = this.getDateRange(period, startDate, endDate);

    const qb = this.dataSource.getRepository(TimelineEventEntity).createQueryBuilder('event')
      .leftJoinAndSelect('event.batch', 'batch')
      .leftJoinAndSelect('batch.product', 'product')
      .where('event.eventType = :eventType', { eventType: TimelineEventType.SOLD })
      .andWhere('event.occurredAt >= :start', { start })
      .andWhere('event.occurredAt <= :end', { end });

    if (!currentUser.nodeId) {
      qb.andWhere('1=0');
    } else {
      qb.andWhere('event.nodeId = :nodeId', { nodeId: currentUser.nodeId });
    }

    qb.orderBy('event.occurredAt', 'DESC');
    const events = await qb.getMany();

    let totalRevenue = 0;
    let totalCost = 0;
    let totalProfit = 0;
    let totalUnitsSold = 0;

    const transactions = events.map(event => {
      const metadata = event.metadata || {};
      const qtySold = Number(metadata.qty_sold || 0);
      const costPrice = Number(metadata.cost_price || 0);
      const salePrice = Number(metadata.sale_price || 0);
      const revenue = Number(metadata.revenue || 0);
      const cost = Number(metadata.cost || 0);
      const profit = Number(metadata.profit || 0);

      totalRevenue += revenue;
      totalCost += cost;
      totalProfit += profit;
      totalUnitsSold += qtySold;

      return {
        id: event.id,
        saleDate: event.occurredAt,
        batchCode: event.batch?.batchCode || '-',
        productName: event.batch?.product?.name || '-',
        quantitySold: qtySold,
        costPrice: costPrice,
        salePrice: salePrice,
        revenue: revenue,
        cost: cost,
        profit: profit,
      };
    });

    return {
      kpi: {
        totalRevenue: Number(totalRevenue.toFixed(2)),
        totalCost: Number(totalCost.toFixed(2)),
        totalProfit: Number(totalProfit.toFixed(2)),
        totalUnitsSold: Number(totalUnitsSold.toFixed(3)),
      },
      transactions,
    };
  }
}
