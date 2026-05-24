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
exports.NodeEntity = void 0;
const typeorm_1 = require("typeorm");
const node_type_enum_1 = require("../../../common/enums/node-type.enum");
const numeric_transformer_1 = require("../../../common/transformers/numeric.transformer");
let NodeEntity = class NodeEntity {
    id;
    name;
    nodeType;
    address;
    latitude;
    longitude;
    isActive;
    createdAt;
    updatedAt;
    deletedAt;
    version;
};
exports.NodeEntity = NodeEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], NodeEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'name', length: 200 }),
    __metadata("design:type", String)
], NodeEntity.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'node_type',
        type: 'varchar',
        length: 20,
    }),
    __metadata("design:type", String)
], NodeEntity.prototype, "nodeType", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'address', type: 'text', nullable: true }),
    __metadata("design:type", Object)
], NodeEntity.prototype, "address", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'latitude',
        type: 'decimal',
        precision: 10,
        scale: 7,
        nullable: true,
        transformer: numeric_transformer_1.numericTransformer,
    }),
    __metadata("design:type", Object)
], NodeEntity.prototype, "latitude", void 0);
__decorate([
    (0, typeorm_1.Column)({
        name: 'longitude',
        type: 'decimal',
        precision: 10,
        scale: 7,
        nullable: true,
        transformer: numeric_transformer_1.numericTransformer,
    }),
    __metadata("design:type", Object)
], NodeEntity.prototype, "longitude", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_active', type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], NodeEntity.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], NodeEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], NodeEntity.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.DeleteDateColumn)({ name: 'deleted_at', type: 'timestamptz', nullable: true }),
    __metadata("design:type", Object)
], NodeEntity.prototype, "deletedAt", void 0);
__decorate([
    (0, typeorm_1.VersionColumn)({ name: 'version', default: 1 }),
    __metadata("design:type", Number)
], NodeEntity.prototype, "version", void 0);
exports.NodeEntity = NodeEntity = __decorate([
    (0, typeorm_1.Entity)('nodes')
], NodeEntity);
//# sourceMappingURL=node.entity.js.map