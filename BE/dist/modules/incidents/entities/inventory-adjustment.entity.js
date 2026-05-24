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
exports.InventoryAdjustmentEntity = void 0;
const typeorm_1 = require("typeorm");
const batch_entity_1 = require("../../batches/entities/batch.entity");
const node_entity_1 = require("../../nodes/entities/node.entity");
const user_entity_1 = require("../../users/entities/user.entity");
const numeric_transformer_1 = require("../../../common/transformers/numeric.transformer");
let InventoryAdjustmentEntity = class InventoryAdjustmentEntity {
    id;
    batchId;
    nodeId;
    adjustmentType;
    qtyBefore;
    qtyDelta;
    qtyAfter;
    reason;
    approvedBy;
    secondApprover;
    referenceId;
    referenceType;
    createdAt;
    batch;
    node;
    approver;
    secondApproverUser;
};
exports.InventoryAdjustmentEntity = InventoryAdjustmentEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], InventoryAdjustmentEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'batch_id', type: 'uuid' }),
    __metadata("design:type", String)
], InventoryAdjustmentEntity.prototype, "batchId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'node_id', type: 'uuid' }),
    __metadata("design:type", String)
], InventoryAdjustmentEntity.prototype, "nodeId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'adjustment_type', length: 20 }),
    __metadata("design:type", String)
], InventoryAdjustmentEntity.prototype, "adjustmentType", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'qty_before',
        type: 'decimal',
        precision: 12,
        scale: 3,
        transformer: numeric_transformer_1.numericTransformer,
    }),
    __metadata("design:type", Number)
], InventoryAdjustmentEntity.prototype, "qtyBefore", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'qty_delta',
        type: 'decimal',
        precision: 12,
        scale: 3,
        transformer: numeric_transformer_1.numericTransformer,
    }),
    __metadata("design:type", Number)
], InventoryAdjustmentEntity.prototype, "qtyDelta", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'qty_after',
        type: 'decimal',
        precision: 12,
        scale: 3,
        transformer: numeric_transformer_1.numericTransformer,
    }),
    __metadata("design:type", Number)
], InventoryAdjustmentEntity.prototype, "qtyAfter", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'reason', type: 'text' }),
    __metadata("design:type", String)
], InventoryAdjustmentEntity.prototype, "reason", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'approved_by', type: 'uuid' }),
    __metadata("design:type", String)
], InventoryAdjustmentEntity.prototype, "approvedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'second_approver', type: 'uuid', nullable: true }),
    __metadata("design:type", Object)
], InventoryAdjustmentEntity.prototype, "secondApprover", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'reference_id', type: 'uuid', nullable: true }),
    __metadata("design:type", Object)
], InventoryAdjustmentEntity.prototype, "referenceId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'reference_type', type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", Object)
], InventoryAdjustmentEntity.prototype, "referenceType", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], InventoryAdjustmentEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => batch_entity_1.BatchEntity, { onDelete: 'RESTRICT' }),
    (0, typeorm_1.JoinColumn)({ name: 'batch_id' }),
    __metadata("design:type", batch_entity_1.BatchEntity)
], InventoryAdjustmentEntity.prototype, "batch", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => node_entity_1.NodeEntity, { onDelete: 'RESTRICT' }),
    (0, typeorm_1.JoinColumn)({ name: 'node_id' }),
    __metadata("design:type", node_entity_1.NodeEntity)
], InventoryAdjustmentEntity.prototype, "node", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.UserEntity, { onDelete: 'RESTRICT' }),
    (0, typeorm_1.JoinColumn)({ name: 'approved_by' }),
    __metadata("design:type", user_entity_1.UserEntity)
], InventoryAdjustmentEntity.prototype, "approver", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.UserEntity, { onDelete: 'SET NULL' }),
    (0, typeorm_1.JoinColumn)({ name: 'second_approver' }),
    __metadata("design:type", Object)
], InventoryAdjustmentEntity.prototype, "secondApproverUser", void 0);
exports.InventoryAdjustmentEntity = InventoryAdjustmentEntity = __decorate([
    (0, typeorm_1.Entity)('inventory_adjustments')
], InventoryAdjustmentEntity);
//# sourceMappingURL=inventory-adjustment.entity.js.map