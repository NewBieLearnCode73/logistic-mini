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
exports.ShipmentIssueEntity = void 0;
const typeorm_1 = require("typeorm");
const shipment_entity_1 = require("../../shipments/entities/shipment.entity");
const user_entity_1 = require("../../users/entities/user.entity");
const incident_report_entity_1 = require("./incident-report.entity");
let ShipmentIssueEntity = class ShipmentIssueEntity {
    id;
    shipmentId;
    issueType;
    severity;
    detectedAt;
    detectedBy;
    reportedBy;
    notes;
    isResolved;
    resolvedAt;
    incidentReportId;
    shipment;
    reporter;
    incidentReport;
};
exports.ShipmentIssueEntity = ShipmentIssueEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ShipmentIssueEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'shipment_id', type: 'uuid' }),
    __metadata("design:type", String)
], ShipmentIssueEntity.prototype, "shipmentId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'issue_type', length: 20 }),
    __metadata("design:type", String)
], ShipmentIssueEntity.prototype, "issueType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'severity', length: 10, default: 'MEDIUM' }),
    __metadata("design:type", String)
], ShipmentIssueEntity.prototype, "severity", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'detected_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], ShipmentIssueEntity.prototype, "detectedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'detected_by', length: 50 }),
    __metadata("design:type", String)
], ShipmentIssueEntity.prototype, "detectedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'reported_by', type: 'uuid', nullable: true }),
    __metadata("design:type", Object)
], ShipmentIssueEntity.prototype, "reportedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'notes', type: 'text', nullable: true }),
    __metadata("design:type", Object)
], ShipmentIssueEntity.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_resolved', type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], ShipmentIssueEntity.prototype, "isResolved", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'resolved_at', type: 'timestamptz', nullable: true }),
    __metadata("design:type", Object)
], ShipmentIssueEntity.prototype, "resolvedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'incident_report_id', type: 'uuid', nullable: true }),
    __metadata("design:type", Object)
], ShipmentIssueEntity.prototype, "incidentReportId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => shipment_entity_1.ShipmentEntity, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'shipment_id' }),
    __metadata("design:type", shipment_entity_1.ShipmentEntity)
], ShipmentIssueEntity.prototype, "shipment", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.UserEntity, { onDelete: 'SET NULL' }),
    (0, typeorm_1.JoinColumn)({ name: 'reported_by' }),
    __metadata("design:type", Object)
], ShipmentIssueEntity.prototype, "reporter", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => incident_report_entity_1.IncidentReportEntity, { onDelete: 'SET NULL' }),
    (0, typeorm_1.JoinColumn)({ name: 'incident_report_id' }),
    __metadata("design:type", Object)
], ShipmentIssueEntity.prototype, "incidentReport", void 0);
exports.ShipmentIssueEntity = ShipmentIssueEntity = __decorate([
    (0, typeorm_1.Entity)('shipment_issues')
], ShipmentIssueEntity);
//# sourceMappingURL=shipment-issue.entity.js.map