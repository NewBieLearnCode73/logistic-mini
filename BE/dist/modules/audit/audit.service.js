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
exports.AuditService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const batch_entity_1 = require("../batches/entities/batch.entity");
const timeline_event_entity_1 = require("../batches/entities/timeline-event.entity");
const scan_log_entity_1 = require("./entities/scan-log.entity");
const audit_log_entity_1 = require("./entities/audit-log.entity");
let AuditService = class AuditService {
    dataSource;
    constructor(dataSource) {
        this.dataSource = dataSource;
    }
    async findBatchByCode(batchCode) {
        return this.dataSource.getRepository(batch_entity_1.BatchEntity).findOne({
            where: { batchCode },
            relations: { product: true, originNode: true, currentNode: true },
        });
    }
    async getBatchTimeline(batchId) {
        return this.dataSource.getRepository(timeline_event_entity_1.TimelineEventEntity).find({
            where: { batchId },
            relations: { node: true, actor: true },
            order: { occurredAt: 'ASC' },
        });
    }
    async recordScanLogAsync(data) {
        const scanLog = new scan_log_entity_1.ScanLogEntity();
        scanLog.batchId = data.batchId;
        scanLog.scannedBy = data.scannedBy;
        scanLog.ipAddress = data.ipAddress;
        scanLog.userAgent = data.userAgent;
        scanLog.latitude = data.latitude;
        scanLog.longitude = data.longitude;
        await this.dataSource.getRepository(scan_log_entity_1.ScanLogEntity).save(scanLog);
    }
    async createAuditLog(data) {
        await this.dataSource.getRepository(audit_log_entity_1.AuditLogEntity).save(data);
    }
};
exports.AuditService = AuditService;
exports.AuditService = AuditService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeorm_1.DataSource])
], AuditService);
//# sourceMappingURL=audit.service.js.map