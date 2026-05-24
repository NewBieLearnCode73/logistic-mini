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
exports.TimelineEventEntity = void 0;
const typeorm_1 = require("typeorm");
const batch_entity_1 = require("./batch.entity");
const node_entity_1 = require("../../nodes/entities/node.entity");
const user_entity_1 = require("../../users/entities/user.entity");
const timeline_event_type_enum_1 = require("../../../common/enums/timeline-event-type.enum");
const numeric_transformer_1 = require("../../../common/transformers/numeric.transformer");
let TimelineEventEntity = class TimelineEventEntity {
    id;
    batchId;
    eventType;
    nodeId;
    actorId;
    shipmentId;
    quantityDelta;
    notes;
    occurredAt;
    metadata;
    batch;
    node;
    actor;
};
exports.TimelineEventEntity = TimelineEventEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], TimelineEventEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'batch_id', type: 'uuid' }),
    __metadata("design:type", String)
], TimelineEventEntity.prototype, "batchId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'event_type',
        type: 'varchar',
        length: 30,
    }),
    __metadata("design:type", String)
], TimelineEventEntity.prototype, "eventType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'node_id', type: 'uuid', nullable: true }),
    __metadata("design:type", Object)
], TimelineEventEntity.prototype, "nodeId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'actor_id', type: 'uuid', nullable: true }),
    __metadata("design:type", Object)
], TimelineEventEntity.prototype, "actorId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'shipment_id', type: 'uuid', nullable: true }),
    __metadata("design:type", Object)
], TimelineEventEntity.prototype, "shipmentId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'quantity_delta',
        type: 'decimal',
        precision: 12,
        scale: 3,
        nullable: true,
        transformer: numeric_transformer_1.numericTransformer,
    }),
    __metadata("design:type", Object)
], TimelineEventEntity.prototype, "quantityDelta", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'notes', type: 'text', nullable: true }),
    __metadata("design:type", Object)
], TimelineEventEntity.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'occurred_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], TimelineEventEntity.prototype, "occurredAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'metadata', type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], TimelineEventEntity.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => batch_entity_1.BatchEntity, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'batch_id' }),
    __metadata("design:type", batch_entity_1.BatchEntity)
], TimelineEventEntity.prototype, "batch", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => node_entity_1.NodeEntity, { onDelete: 'SET NULL' }),
    (0, typeorm_1.JoinColumn)({ name: 'node_id' }),
    __metadata("design:type", Object)
], TimelineEventEntity.prototype, "node", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.UserEntity, { onDelete: 'SET NULL' }),
    (0, typeorm_1.JoinColumn)({ name: 'actor_id' }),
    __metadata("design:type", Object)
], TimelineEventEntity.prototype, "actor", void 0);
exports.TimelineEventEntity = TimelineEventEntity = __decorate([
    (0, typeorm_1.Entity)('timeline_events')
], TimelineEventEntity);
//# sourceMappingURL=timeline-event.entity.js.map