import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { InventoryEntity } from '../batches/entities/inventory.entity';
import { ShipmentEntity } from '../shipments/entities/shipment.entity';
import { IncidentReportEntity } from '../incidents/entities/incident-report.entity';
import { AuditLogEntity } from '../audit/entities/audit-log.entity';
import { RoleName } from '../../common/enums/role.enum';
import { ShipmentStatus } from '../../common/enums/shipment-status.enum';

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

  async exportReport(reportType: string, format: string, currentUser: any): Promise<any> {
    let data: any[] = [];
    const userNodeId = currentUser.nodeId;

    if (reportType === 'inventory') {
      const qb = this.dataSource.getRepository(InventoryEntity).createQueryBuilder('inv')
        .leftJoinAndSelect('inv.batch', 'batch')
        .leftJoinAndSelect('batch.product', 'product')
        .leftJoinAndSelect('inv.node', 'node');
      if (currentUser.role !== RoleName.ADMIN && userNodeId) {
        qb.where('inv.nodeId = :nodeId', { nodeId: userNodeId });
      }
      data = await qb.getMany();
    } else if (reportType === 'shipments') {
      const qb = this.dataSource.getRepository(ShipmentEntity).createQueryBuilder('s')
        .leftJoinAndSelect('s.batch', 'batch')
        .leftJoinAndSelect('batch.product', 'product')
        .leftJoinAndSelect('s.sourceNode', 'sourceNode')
        .leftJoinAndSelect('s.destinationNode', 'destinationNode');
      if (currentUser.role !== RoleName.ADMIN && userNodeId) {
        qb.where('(s.sourceNodeId = :nodeId OR s.destinationNodeId = :nodeId)', { nodeId: userNodeId });
      }
      data = await qb.getMany();
    } else if (reportType === 'incidents') {
      const qb = this.dataSource.getRepository(IncidentReportEntity).createQueryBuilder('i')
        .leftJoinAndSelect('i.shipment', 's')
        .leftJoinAndSelect('i.batch', 'batch')
        .leftJoinAndSelect('batch.product', 'product');
      if (currentUser.role !== RoleName.ADMIN && userNodeId) {
        qb.where('(s.sourceNodeId = :nodeId OR s.destinationNodeId = :nodeId)', { nodeId: userNodeId });
      }
      data = await qb.getMany();
    }

    if (format === 'csv') {
      let csvContent = '';
      if (reportType === 'inventory') {
        csvContent = 'Batch ID,Batch Code,Product Name,Quantity Available,Node Name,Last Updated\n';
        csvContent += data.map(item => 
          `"${item.batchId}","${item.batch?.batchCode || ''}","${item.batch?.product?.name || ''}",${item.quantityAvailable},"${item.node?.name || ''}","${item.lastUpdatedAt?.toISOString() || ''}"`
        ).join('\n');
      } else if (reportType === 'shipments') {
        csvContent = 'Tracking Code,Batch Code,Product Name,Quantity Shipped,Status,Source Node,Destination Node,Shipped At\n';
        csvContent += data.map(item => 
          `"${item.trackingCode}","${item.batch?.batchCode || ''}","${item.batch?.product?.name || ''}",${item.quantityShipped},"${item.status}","${item.sourceNode?.name || ''}","${item.destinationNode?.name || ''}","${item.shippedAt?.toISOString() || ''}"`
        ).join('\n');
      } else {
        csvContent = 'Incident Code,Incident Type,Status,Priority,Description,Reported By,Opened At\n';
        csvContent += data.map(item => 
          `"${item.incidentCode}","${item.incidentType}","${item.status}","${item.priority}","${item.description}","${item.reportedBy}","${item.openedAt?.toISOString() || ''}"`
        ).join('\n');
      }
      return { content: csvContent, contentType: 'text/csv', filename: `report_${reportType}.csv` };
    } else {
      const pdfString = 
        `%PDF-1.4\n` +
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
}
