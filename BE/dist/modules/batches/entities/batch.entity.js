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
exports.BatchEntity = void 0;
const typeorm_1 = require("typeorm");
const product_entity_1 = require("../../products/entities/product.entity");
const node_entity_1 = require("../../nodes/entities/node.entity");
const user_entity_1 = require("../../users/entities/user.entity");
const batch_status_enum_1 = require("../../../common/enums/batch-status.enum");
const numeric_transformer_1 = require("../../../common/transformers/numeric.transformer");
let BatchEntity = class BatchEntity {
    id;
    batchCode;
    productId;
    originNodeId;
    currentNodeId;
    quantity;
    unit;
    manufactureDate;
    expiryDate;
    status;
    createdBy;
    createdAt;
    updatedAt;
    version;
    product;
    originNode;
    currentNode;
    creator;
};
exports.BatchEntity = BatchEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], BatchEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'batch_code', length: 100, unique: true }),
    __metadata("design:type", String)
], BatchEntity.prototype, "batchCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'product_id', type: 'uuid' }),
    __metadata("design:type", String)
], BatchEntity.prototype, "productId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'origin_node_id', type: 'uuid' }),
    __metadata("design:type", String)
], BatchEntity.prototype, "originNodeId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'current_node_id', type: 'uuid' }),
    __metadata("design:type", String)
], BatchEntity.prototype, "currentNodeId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'quantity',
        type: 'decimal',
        precision: 12,
        scale: 3,
        transformer: numeric_transformer_1.numericTransformer,
    }),
    __metadata("design:type", Number)
], BatchEntity.prototype, "quantity", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'unit', length: 50 }),
    __metadata("design:type", String)
], BatchEntity.prototype, "unit", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'manufacture_date', type: 'date' }),
    __metadata("design:type", Object)
], BatchEntity.prototype, "manufactureDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'expiry_date', type: 'date' }),
    __metadata("design:type", Object)
], BatchEntity.prototype, "expiryDate", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'status',
        type: 'varchar',
        length: 20,
        default: batch_status_enum_1.BatchStatus.CREATED,
    }),
    __metadata("design:type", String)
], BatchEntity.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'created_by', type: 'uuid' }),
    __metadata("design:type", String)
], BatchEntity.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], BatchEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], BatchEntity.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.VersionColumn)({ name: 'version', default: 1 }),
    __metadata("design:type", Number)
], BatchEntity.prototype, "version", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => product_entity_1.ProductEntity, { onDelete: 'RESTRICT' }),
    (0, typeorm_1.JoinColumn)({ name: 'product_id' }),
    __metadata("design:type", product_entity_1.ProductEntity)
], BatchEntity.prototype, "product", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => node_entity_1.NodeEntity, { onDelete: 'RESTRICT' }),
    (0, typeorm_1.JoinColumn)({ name: 'origin_node_id' }),
    __metadata("design:type", node_entity_1.NodeEntity)
], BatchEntity.prototype, "originNode", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => node_entity_1.NodeEntity, { onDelete: 'RESTRICT' }),
    (0, typeorm_1.JoinColumn)({ name: 'current_node_id' }),
    __metadata("design:type", node_entity_1.NodeEntity)
], BatchEntity.prototype, "currentNode", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.UserEntity, { onDelete: 'RESTRICT' }),
    (0, typeorm_1.JoinColumn)({ name: 'created_by' }),
    __metadata("design:type", user_entity_1.UserEntity)
], BatchEntity.prototype, "creator", void 0);
exports.BatchEntity = BatchEntity = __decorate([
    (0, typeorm_1.Entity)('batches')
], BatchEntity);
//# sourceMappingURL=batch.entity.js.map