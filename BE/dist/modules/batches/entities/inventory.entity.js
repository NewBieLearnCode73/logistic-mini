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
exports.InventoryEntity = void 0;
const typeorm_1 = require("typeorm");
const batch_entity_1 = require("./batch.entity");
const node_entity_1 = require("../../nodes/entities/node.entity");
const numeric_transformer_1 = require("../../../common/transformers/numeric.transformer");
let InventoryEntity = class InventoryEntity {
    batchId;
    nodeId;
    quantityAvailable;
    lastUpdatedAt;
    version;
    batch;
    node;
};
exports.InventoryEntity = InventoryEntity;
__decorate([
    (0, typeorm_1.PrimaryColumn)({ name: 'batch_id', type: 'uuid' }),
    __metadata("design:type", String)
], InventoryEntity.prototype, "batchId", void 0);
__decorate([
    (0, typeorm_1.PrimaryColumn)({ name: 'node_id', type: 'uuid' }),
    __metadata("design:type", String)
], InventoryEntity.prototype, "nodeId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'quantity_available',
        type: 'decimal',
        precision: 12,
        scale: 3,
        default: 0,
        transformer: numeric_transformer_1.numericTransformer,
    }),
    __metadata("design:type", Number)
], InventoryEntity.prototype, "quantityAvailable", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'last_updated_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], InventoryEntity.prototype, "lastUpdatedAt", void 0);
__decorate([
    (0, typeorm_1.VersionColumn)({ name: 'version', default: 1 }),
    __metadata("design:type", Number)
], InventoryEntity.prototype, "version", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => batch_entity_1.BatchEntity, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'batch_id' }),
    __metadata("design:type", batch_entity_1.BatchEntity)
], InventoryEntity.prototype, "batch", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => node_entity_1.NodeEntity, { onDelete: 'RESTRICT' }),
    (0, typeorm_1.JoinColumn)({ name: 'node_id' }),
    __metadata("design:type", node_entity_1.NodeEntity)
], InventoryEntity.prototype, "node", void 0);
exports.InventoryEntity = InventoryEntity = __decorate([
    (0, typeorm_1.Entity)('inventory')
], InventoryEntity);
//# sourceMappingURL=inventory.entity.js.map