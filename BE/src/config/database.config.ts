import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { UserEntity } from '../modules/users/entities/user.entity';
import { RoleEntity } from '../modules/roles/entities/role.entity';
import { UserRoleEntity } from '../modules/users/entities/user-role.entity';
import { NodeEntity } from '../modules/nodes/entities/node.entity';
import { ProductEntity } from '../modules/products/entities/product.entity';
import { BatchEntity } from '../modules/batches/entities/batch.entity';
import { BatchQrCodeEntity } from '../modules/batches/entities/batch-qr-code.entity';
import { InventoryEntity } from '../modules/batches/entities/inventory.entity';
import { TimelineEventEntity } from '../modules/batches/entities/timeline-event.entity';
import { ShipmentEntity } from '../modules/shipments/entities/shipment.entity';
import { IncidentReportEntity } from '../modules/incidents/entities/incident-report.entity';
import { ShipmentIssueEntity } from '../modules/incidents/entities/shipment-issue.entity';
import { InventoryAdjustmentEntity } from '../modules/incidents/entities/inventory-adjustment.entity';
import { AuditLogEntity } from '../modules/audit/entities/audit-log.entity';
import { ScanLogEntity } from '../modules/audit/entities/scan-log.entity';

export const getDatabaseConfig = (): TypeOrmModuleOptions => ({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'mini_logistic',
  entities: [
    UserEntity,
    RoleEntity,
    UserRoleEntity,
    NodeEntity,
    ProductEntity,
    BatchEntity,
    BatchQrCodeEntity,
    InventoryEntity,
    TimelineEventEntity,
    ShipmentEntity,
    IncidentReportEntity,
    ShipmentIssueEntity,
    InventoryAdjustmentEntity,
    AuditLogEntity,
    ScanLogEntity,
  ],
  synchronize: process.env.DB_SYNCHRONIZE === 'false' ? false : true,
  logging: process.env.DB_LOGGING === 'true',
});
