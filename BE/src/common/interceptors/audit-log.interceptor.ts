import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { DataSource } from 'typeorm';
import { AuditLogEntity } from '../../modules/audit/entities/audit-log.entity';
import { ProductEntity } from '../../modules/products/entities/product.entity';
import { BatchEntity } from '../../modules/batches/entities/batch.entity';
import { NodeEntity } from '../../modules/nodes/entities/node.entity';
import { ShipmentEntity } from '../../modules/shipments/entities/shipment.entity';
import { IncidentReportEntity } from '../../modules/incidents/entities/incident-report.entity';
import { UserEntity } from '../../modules/users/entities/user.entity';

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  private readonly entityMap: Record<string, any> = {
    products: ProductEntity,
    batches: BatchEntity,
    nodes: NodeEntity,
    shipments: ShipmentEntity,
    incidents: IncidentReportEntity,
    users: UserEntity,
  };

  constructor(private readonly dataSource: DataSource) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest();
    const { method, url, user } = request;

    // Only log mutations (POST, PUT, PATCH, DELETE) by authenticated users
    const isMutation = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);
    if (!isMutation || !user) {
      return next.handle();
    }

    const parts = url.split('?')[0].split('/').filter(Boolean);
    // Parse entity name assuming path like /api/v1/products/:id
    // If global prefix is api/v1, parts[0] = 'api', parts[1] = 'v1', parts[2] = 'products'
    const apiIndex = parts.indexOf('api');
    const v1Index = parts.indexOf('v1');
    let entityName = '';
    let entityId = '';

    if (v1Index !== -1 && v1Index + 1 < parts.length) {
      entityName = parts[v1Index + 1];
      entityId = parts[v1Index + 2] || '';
    } else if (apiIndex !== -1 && apiIndex + 1 < parts.length) {
      entityName = parts[apiIndex + 1];
      entityId = parts[apiIndex + 2] || '';
    } else {
      entityName = parts[0] || '';
      entityId = parts[1] || '';
    }

    // Clean up entityId from subroutes like /batches/:id/sell
    if (entityId && (entityId === 'sell' || entityId === 'receive' || entityId === 'confirm-lost')) {
      entityId = parts[parts.indexOf(entityId) - 1] || '';
    }

    const entityClass = this.entityMap[entityName];
    let oldValues: any = null;

    if (entityClass && entityId && ['PUT', 'PATCH', 'DELETE'].includes(method)) {
      try {
        oldValues = await this.dataSource.getRepository(entityClass).findOne({
          where: { id: entityId },
        });
      } catch (error) {
        // Suppress errors to avoid blocking request flow
      }
    }

    return next.handle().pipe(
      tap({
        next: async (responseBody) => {
          try {
            const ip = request.ip || request.headers['x-forwarded-for'] || null;
            const userAgent = request.headers['user-agent'] || null;

            const auditLog = new AuditLogEntity();
            auditLog.actorId = user.userId;
            auditLog.action = method;
            auditLog.entityType = entityName || 'unknown';
            auditLog.entityId = entityId || responseBody?.id || responseBody?.data?.id || null;
            auditLog.oldValues = oldValues ? JSON.parse(JSON.stringify(oldValues)) : null;
            
            if (method === 'DELETE') {
              auditLog.newValues = null;
            } else {
              auditLog.newValues = responseBody ? JSON.parse(JSON.stringify(responseBody)) : null;
            }
            
            auditLog.ipAddress = Array.isArray(ip) ? ip[0] : ip;
            auditLog.userAgent = userAgent;

            await this.dataSource.getRepository(AuditLogEntity).save(auditLog);
          } catch (error) {
            // Suppress audit log write failures so they do not crash the response
          }
        },
      }),
    );
  }
}
