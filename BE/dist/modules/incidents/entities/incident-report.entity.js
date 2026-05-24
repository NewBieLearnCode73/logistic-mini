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
exports.IncidentReportEntity = void 0;
const typeorm_1 = require("typeorm");
const shipment_entity_1 = require("../../shipments/entities/shipment.entity");
const batch_entity_1 = require("../../batches/entities/batch.entity");
const user_entity_1 = require("../../users/entities/user.entity");
let IncidentReportEntity = class IncidentReportEntity {
    id;
    incidentCode;
    shipmentId;
    batchId;
    incidentType;
    status;
    priority;
    reportedBy;
    assignedTo;
    description;
    resolution;
    resolutionType;
    approvedBy;
    evidenceJsonb;
    openedAt;
    resolvedAt;
    closedAt;
    version;
    shipment;
    batch;
    reporter;
    assignee;
    approver;
};
exports.IncidentReportEntity = IncidentReportEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], IncidentReportEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'incident_code', length: 50, unique: true }),
    __metadata("design:type", String)
], IncidentReportEntity.prototype, "incidentCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'shipment_id', type: 'uuid' }),
    __metadata("design:type", String)
], IncidentReportEntity.prototype, "shipmentId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'batch_id', type: 'uuid' }),
    __metadata("design:type", String)
], IncidentReportEntity.prototype, "batchId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'incident_type', length: 20 }),
    __metadata("design:type", String)
], IncidentReportEntity.prototype, "incidentType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'status', length: 20, default: 'OPEN' }),
    __metadata("design:type", String)
], IncidentReportEntity.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'priority', length: 10, default: 'MEDIUM' }),
    __metadata("design:type", String)
], IncidentReportEntity.prototype, "priority", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'reported_by', type: 'uuid' }),
    __metadata("design:type", String)
], IncidentReportEntity.prototype, "reportedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'assigned_to', type: 'uuid', nullable: true }),
    __metadata("design:type", Object)
], IncidentReportEntity.prototype, "assignedTo", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'description', type: 'text' }),
    __metadata("design:type", String)
], IncidentReportEntity.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'resolution', type: 'text', nullable: true }),
    __metadata("design:type", Object)
], IncidentReportEntity.prototype, "resolution", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'resolution_type', type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", Object)
], IncidentReportEntity.prototype, "resolutionType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'approved_by', type: 'uuid', nullable: true }),
    __metadata("design:type", Object)
], IncidentReportEntity.prototype, "approvedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'evidence_jsonb', type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], IncidentReportEntity.prototype, "evidenceJsonb", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'opened_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], IncidentReportEntity.prototype, "openedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'resolved_at', type: 'timestamptz', nullable: true }),
    __metadata("design:type", Object)
], IncidentReportEntity.prototype, "resolvedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'closed_at', type: 'timestamptz', nullable: true }),
    __metadata("design:type", Object)
], IncidentReportEntity.prototype, "closedAt", void 0);
__decorate([
    (0, typeorm_1.VersionColumn)({ name: 'version', default: 1 }),
    __metadata("design:type", Number)
], IncidentReportEntity.prototype, "version", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => shipment_entity_1.ShipmentEntity, { onDelete: 'RESTRICT' }),
    (0, typeorm_1.JoinColumn)({ name: 'shipment_id' }),
    __metadata("design:type", shipment_entity_1.ShipmentEntity)
], IncidentReportEntity.prototype, "shipment", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => batch_entity_1.BatchEntity, { onDelete: 'RESTRICT' }),
    (0, typeorm_1.JoinColumn)({ name: 'batch_id' }),
    __metadata("design:type", batch_entity_1.BatchEntity)
], IncidentReportEntity.prototype, "batch", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.UserEntity, { onDelete: 'RESTRICT' }),
    (0, typeorm_1.JoinColumn)({ name: 'reported_by' }),
    __metadata("design:type", user_entity_1.UserEntity)
], IncidentReportEntity.prototype, "reporter", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.UserEntity, { onDelete: 'SET NULL' }),
    (0, typeorm_1.JoinColumn)({ name: 'assigned_to' }),
    __metadata("design:type", Object)
], IncidentReportEntity.prototype, "assignee", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.UserEntity, { onDelete: 'RESTRICT' }),
    (0, typeorm_1.JoinColumn)({ name: 'approved_by' }),
    __metadata("design:type", Object)
], IncidentReportEntity.prototype, "approver", void 0);
exports.IncidentReportEntity = IncidentReportEntity = __decorate([
    (0, typeorm_1.Entity)('incident_reports')
], IncidentReportEntity);
//# sourceMappingURL=incident-report.entity.js.map