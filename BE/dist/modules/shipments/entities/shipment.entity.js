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
exports.ShipmentEntity = void 0;
const typeorm_1 = require("typeorm");
const batch_entity_1 = require("../../batches/entities/batch.entity");
const node_entity_1 = require("../../nodes/entities/node.entity");
const user_entity_1 = require("../../users/entities/user.entity");
const shipment_status_enum_1 = require("../../../common/enums/shipment-status.enum");
const numeric_transformer_1 = require("../../../common/transformers/numeric.transformer");
let ShipmentEntity = class ShipmentEntity {
    id;
    trackingCode;
    batchId;
    sourceNodeId;
    destinationNodeId;
    quantityShipped;
    status;
    shippedAt;
    expectedDeliveryDate;
    actualDeliveryDate;
    notes;
    createdBy;
    createdAt;
    updatedAt;
    version;
    batch;
    sourceNode;
    destinationNode;
    creator;
};
exports.ShipmentEntity = ShipmentEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ShipmentEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'tracking_code', length: 100, unique: true }),
    __metadata("design:type", String)
], ShipmentEntity.prototype, "trackingCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'batch_id', type: 'uuid' }),
    __metadata("design:type", String)
], ShipmentEntity.prototype, "batchId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'source_node_id', type: 'uuid' }),
    __metadata("design:type", String)
], ShipmentEntity.prototype, "sourceNodeId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'destination_node_id', type: 'uuid' }),
    __metadata("design:type", String)
], ShipmentEntity.prototype, "destinationNodeId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'quantity_shipped',
        type: 'decimal',
        precision: 12,
        scale: 3,
        transformer: numeric_transformer_1.numericTransformer,
    }),
    __metadata("design:type", Number)
], ShipmentEntity.prototype, "quantityShipped", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'status',
        type: 'varchar',
        length: 20,
        default: shipment_status_enum_1.ShipmentStatus.IN_TRANSIT,
    }),
    __metadata("design:type", String)
], ShipmentEntity.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'shipped_at', type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], ShipmentEntity.prototype, "shippedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'expected_delivery_date', type: 'timestamptz', nullable: true }),
    __metadata("design:type", Object)
], ShipmentEntity.prototype, "expectedDeliveryDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'actual_delivery_date', type: 'timestamptz', nullable: true }),
    __metadata("design:type", Object)
], ShipmentEntity.prototype, "actualDeliveryDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'notes', type: 'text', nullable: true }),
    __metadata("design:type", Object)
], ShipmentEntity.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'created_by', type: 'uuid' }),
    __metadata("design:type", String)
], ShipmentEntity.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], ShipmentEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], ShipmentEntity.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.VersionColumn)({ name: 'version', default: 1 }),
    __metadata("design:type", Number)
], ShipmentEntity.prototype, "version", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => batch_entity_1.BatchEntity, { onDelete: 'RESTRICT' }),
    (0, typeorm_1.JoinColumn)({ name: 'batch_id' }),
    __metadata("design:type", batch_entity_1.BatchEntity)
], ShipmentEntity.prototype, "batch", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => node_entity_1.NodeEntity, { onDelete: 'RESTRICT' }),
    (0, typeorm_1.JoinColumn)({ name: 'source_node_id' }),
    __metadata("design:type", node_entity_1.NodeEntity)
], ShipmentEntity.prototype, "sourceNode", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => node_entity_1.NodeEntity, { onDelete: 'RESTRICT' }),
    (0, typeorm_1.JoinColumn)({ name: 'destination_node_id' }),
    __metadata("design:type", node_entity_1.NodeEntity)
], ShipmentEntity.prototype, "destinationNode", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.UserEntity, { onDelete: 'RESTRICT' }),
    (0, typeorm_1.JoinColumn)({ name: 'created_by' }),
    __metadata("design:type", user_entity_1.UserEntity)
], ShipmentEntity.prototype, "creator", void 0);
exports.ShipmentEntity = ShipmentEntity = __decorate([
    (0, typeorm_1.Entity)('shipments')
], ShipmentEntity);
//# sourceMappingURL=shipment.entity.js.map