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
import { JwtService } from '@nestjs/jwt';

@Controller('public/trace')
export class PublicTraceController {
  constructor(
    private readonly auditService: AuditService,
    private readonly jwtService: JwtService,
  ) {}

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

    const authHeader = req.headers['authorization'];
    let currentUser: any = null;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        const decoded = this.jwtService.verify(token);
        currentUser = {
          userId: decoded.sub,
          role: decoded.role,
          nodeId: decoded.nodeId,
        };
      } catch (err) {
        // Ignore invalid/expired token and treat as public guest
      }
    }

    await this.auditService.validateBatchAccess(batch, currentUser);

    const timelineEvents = await this.auditService.getBatchTimeline(batch.id, currentUser);

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

    let simulatedStatus: any = batch.status;
    let simulatedCurrentNode = batch.currentNode;

    if (!currentUser || (currentUser.role !== 'Admin' && currentUser.role !== 'Retailer')) {
      simulatedStatus = 'CREATED';
      simulatedCurrentNode = batch.originNode;

      for (const event of timelineEvents) {
        if (event.node) {
          simulatedCurrentNode = event.node;
        }
        if (event.eventType === 'CREATED') {
          simulatedStatus = 'CREATED';
        } else if (event.eventType === 'SHIPPED') {
          simulatedStatus = 'IN_TRANSIT';
        } else if (event.eventType === 'RECEIVED') {
          simulatedStatus = 'RECEIVED';
        } else if (event.eventType === 'SOLD') {
          simulatedStatus = 'SOLD';
        } else if (event.eventType === 'LOST') {
          simulatedStatus = 'LOST';
        } else if (event.eventType === 'DISCARDED') {
          simulatedStatus = 'DISCARDED';
        } else if (event.eventType === 'DELAYED') {
          simulatedStatus = 'DELAYED';
        } else if (event.eventType === 'INVESTIGATING') {
          simulatedStatus = 'INVESTIGATING';
        }
      }
    }

    // Sanitize and minimize the response payload
    return {
      batch: {
        batchCode: batch.batchCode,
        manufactureDate: batch.manufactureDate,
        expiryDate: batch.expiryDate,
        status: simulatedStatus,
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
        currentNode: simulatedCurrentNode ? {
          name: simulatedCurrentNode.name,
          nodeType: simulatedCurrentNode.nodeType,
          address: simulatedCurrentNode.address,
          latitude: simulatedCurrentNode.latitude,
          longitude: simulatedCurrentNode.longitude,
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
          latitude: event.node.latitude,
          longitude: event.node.longitude,
        } : null,
        actor: event.actor ? {
          fullName: event.actor.fullName,
        } : null,
      })),
    };
  }
}
