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
exports.AuditLogInterceptor = void 0;
const common_1 = require("@nestjs/common");
const operators_1 = require("rxjs/operators");
const typeorm_1 = require("typeorm");
const audit_log_entity_1 = require("../../modules/audit/entities/audit-log.entity");
const product_entity_1 = require("../../modules/products/entities/product.entity");
const batch_entity_1 = require("../../modules/batches/entities/batch.entity");
const node_entity_1 = require("../../modules/nodes/entities/node.entity");
const shipment_entity_1 = require("../../modules/shipments/entities/shipment.entity");
const incident_report_entity_1 = require("../../modules/incidents/entities/incident-report.entity");
const user_entity_1 = require("../../modules/users/entities/user.entity");
let AuditLogInterceptor = class AuditLogInterceptor {
    dataSource;
    entityMap = {
        products: product_entity_1.ProductEntity,
        batches: batch_entity_1.BatchEntity,
        nodes: node_entity_1.NodeEntity,
        shipments: shipment_entity_1.ShipmentEntity,
        incidents: incident_report_entity_1.IncidentReportEntity,
        users: user_entity_1.UserEntity,
    };
    constructor(dataSource) {
        this.dataSource = dataSource;
    }
    async intercept(context, next) {
        const request = context.switchToHttp().getRequest();
        const { method, url, user } = request;
        const isMutation = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);
        if (!isMutation || !user) {
            return next.handle();
        }
        const parts = url.split('?')[0].split('/').filter(Boolean);
        const apiIndex = parts.indexOf('api');
        const v1Index = parts.indexOf('v1');
        let entityName = '';
        let entityId = '';
        if (v1Index !== -1 && v1Index + 1 < parts.length) {
            entityName = parts[v1Index + 1];
            entityId = parts[v1Index + 2] || '';
        }
        else if (apiIndex !== -1 && apiIndex + 1 < parts.length) {
            entityName = parts[apiIndex + 1];
            entityId = parts[apiIndex + 2] || '';
        }
        else {
            entityName = parts[0] || '';
            entityId = parts[1] || '';
        }
        if (entityId && (entityId === 'sell' || entityId === 'receive' || entityId === 'confirm-lost')) {
            entityId = parts[parts.indexOf(entityId) - 1] || '';
        }
        const entityClass = this.entityMap[entityName];
        let oldValues = null;
        if (entityClass && entityId && ['PUT', 'PATCH', 'DELETE'].includes(method)) {
            try {
                oldValues = await this.dataSource.getRepository(entityClass).findOne({
                    where: { id: entityId },
                });
            }
            catch (error) {
            }
        }
        return next.handle().pipe((0, operators_1.tap)({
            next: async (responseBody) => {
                try {
                    const ip = request.ip || request.headers['x-forwarded-for'] || null;
                    const userAgent = request.headers['user-agent'] || null;
                    const auditLog = new audit_log_entity_1.AuditLogEntity();
                    auditLog.actorId = user.userId;
                    auditLog.action = method;
                    auditLog.entityType = entityName || 'unknown';
                    auditLog.entityId = entityId || responseBody?.id || null;
                    auditLog.oldValues = oldValues ? JSON.parse(JSON.stringify(oldValues)) : null;
                    if (method === 'DELETE') {
                        auditLog.newValues = null;
                    }
                    else {
                        auditLog.newValues = responseBody ? JSON.parse(JSON.stringify(responseBody)) : null;
                    }
                    auditLog.ipAddress = Array.isArray(ip) ? ip[0] : ip;
                    auditLog.userAgent = userAgent;
                    await this.dataSource.getRepository(audit_log_entity_1.AuditLogEntity).save(auditLog);
                }
                catch (error) {
                }
            },
        }));
    }
};
exports.AuditLogInterceptor = AuditLogInterceptor;
exports.AuditLogInterceptor = AuditLogInterceptor = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeorm_1.DataSource])
], AuditLogInterceptor);
//# sourceMappingURL=audit-log.interceptor.js.map