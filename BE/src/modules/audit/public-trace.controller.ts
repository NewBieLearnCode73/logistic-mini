import {
  Controller,
  Get,
  Param,
  Query,
  Req,
  NotFoundException,
} from '@nestjs/common';
import { AuditService } from './audit.service';
import { Public } from '../../common/decorators/public.decorator';

@Controller('public/trace')
export class PublicTraceController {
  constructor(private readonly auditService: AuditService) {}

  @Get(':batchCode')
  @Public()
  async getTrace(
    @Param('batchCode') batchCode: string,
    @Req() req: any,
    @Query('lat') latStr?: string,
    @Query('lng') lngStr?: string,
  ) {
    const batch = await this.auditService.findBatchByCode(batchCode);
    if (!batch) {
      throw new NotFoundException(`Không tìm thấy lô hàng với mã ${batchCode}`);
    }

    const timelineEvents = await this.auditService.getBatchTimeline(batch.id);

    const ip = req.ip || req.headers['x-forwarded-for'] || null;
    const userAgent = req.headers['user-agent'] || null;
    const scannedBy = req.user?.userId || null;
    const latitude = latStr ? parseFloat(latStr) : null;
    const longitude = lngStr ? parseFloat(lngStr) : null;

    // Fire-and-forget async log recording
    this.auditService.recordScanLogAsync({
      batchId: batch.id,
      scannedBy,
      ipAddress: Array.isArray(ip) ? ip[0] : ip,
      userAgent,
      latitude,
      longitude,
    }).catch(() => {
      // Intentionally empty to avoid interrupting responses
    });

    // Sanitize and minimize the response payload
    return {
      batch: {
        batchCode: batch.batchCode,
        manufactureDate: batch.manufactureDate,
        expiryDate: batch.expiryDate,
        status: batch.status,
        product: batch.product ? {
          name: batch.product.name,
          sku: batch.product.sku,
          unit: batch.product.unit,
          description: batch.product.description,
          category: batch.product.category,
        } : null,
        originNode: batch.originNode ? {
          name: batch.originNode.name,
          nodeType: batch.originNode.nodeType,
          address: batch.originNode.address,
          latitude: batch.originNode.latitude,
          longitude: batch.originNode.longitude,
        } : null,
        currentNode: batch.currentNode ? {
          name: batch.currentNode.name,
          nodeType: batch.currentNode.nodeType,
          address: batch.currentNode.address,
          latitude: batch.currentNode.latitude,
          longitude: batch.currentNode.longitude,
        } : null,
      },
      timelineEvents: timelineEvents.map(event => ({
        eventType: event.eventType,
        notes: event.notes,
        occurredAt: event.occurredAt,
        node: event.node ? {
          name: event.node.name,
          nodeType: event.node.nodeType,
          address: event.node.address,
        } : null,
        actor: event.actor ? {
          fullName: event.actor.fullName,
        } : null,
      })),
    };
  }
}
