"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDatabaseConfig = void 0;
const user_entity_1 = require("../modules/users/entities/user.entity");
const role_entity_1 = require("../modules/roles/entities/role.entity");
const user_role_entity_1 = require("../modules/users/entities/user-role.entity");
const node_entity_1 = require("../modules/nodes/entities/node.entity");
const product_entity_1 = require("../modules/products/entities/product.entity");
const batch_entity_1 = require("../modules/batches/entities/batch.entity");
const batch_qr_code_entity_1 = require("../modules/batches/entities/batch-qr-code.entity");
const inventory_entity_1 = require("../modules/batches/entities/inventory.entity");
const timeline_event_entity_1 = require("../modules/batches/entities/timeline-event.entity");
const shipment_entity_1 = require("../modules/shipments/entities/shipment.entity");
const incident_report_entity_1 = require("../modules/incidents/entities/incident-report.entity");
const shipment_issue_entity_1 = require("../modules/incidents/entities/shipment-issue.entity");
const inventory_adjustment_entity_1 = require("../modules/incidents/entities/inventory-adjustment.entity");
const audit_log_entity_1 = require("../modules/audit/entities/audit-log.entity");
const scan_log_entity_1 = require("../modules/audit/entities/scan-log.entity");
const getDatabaseConfig = () => ({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'mini_logistic',
    entities: [
        user_entity_1.UserEntity,
        role_entity_1.RoleEntity,
        user_role_entity_1.UserRoleEntity,
        node_entity_1.NodeEntity,
        product_entity_1.ProductEntity,
        batch_entity_1.BatchEntity,
        batch_qr_code_entity_1.BatchQrCodeEntity,
        inventory_entity_1.InventoryEntity,
        timeline_event_entity_1.TimelineEventEntity,
        shipment_entity_1.ShipmentEntity,
        incident_report_entity_1.IncidentReportEntity,
        shipment_issue_entity_1.ShipmentIssueEntity,
        inventory_adjustment_entity_1.InventoryAdjustmentEntity,
        audit_log_entity_1.AuditLogEntity,
        scan_log_entity_1.ScanLogEntity,
    ],
    synchronize: process.env.DB_SYNCHRONIZE === 'false' ? false : true,
    logging: process.env.DB_LOGGING === 'true',
});
exports.getDatabaseConfig = getDatabaseConfig;
//# sourceMappingURL=database.config.js.map