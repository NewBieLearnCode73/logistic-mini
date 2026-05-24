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
exports.BatchQrCodeEntity = void 0;
const typeorm_1 = require("typeorm");
const batch_entity_1 = require("./batch.entity");
const user_entity_1 = require("../../users/entities/user.entity");
let BatchQrCodeEntity = class BatchQrCodeEntity {
    id;
    batchId;
    qrData;
    svgData;
    qrImageUrl;
    generatedAt;
    generatedBy;
    batch;
    generator;
};
exports.BatchQrCodeEntity = BatchQrCodeEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], BatchQrCodeEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'batch_id', type: 'uuid', unique: true }),
    __metadata("design:type", String)
], BatchQrCodeEntity.prototype, "batchId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'qr_data', type: 'text' }),
    __metadata("design:type", String)
], BatchQrCodeEntity.prototype, "qrData", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'svg_data', type: 'text', nullable: true }),
    __metadata("design:type", Object)
], BatchQrCodeEntity.prototype, "svgData", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'qr_image_url', type: 'text', nullable: true }),
    __metadata("design:type", Object)
], BatchQrCodeEntity.prototype, "qrImageUrl", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'generated_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], BatchQrCodeEntity.prototype, "generatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'generated_by', type: 'uuid' }),
    __metadata("design:type", String)
], BatchQrCodeEntity.prototype, "generatedBy", void 0);
__decorate([
    (0, typeorm_1.OneToOne)(() => batch_entity_1.BatchEntity, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'batch_id' }),
    __metadata("design:type", batch_entity_1.BatchEntity)
], BatchQrCodeEntity.prototype, "batch", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.UserEntity, { onDelete: 'RESTRICT' }),
    (0, typeorm_1.JoinColumn)({ name: 'generated_by' }),
    __metadata("design:type", user_entity_1.UserEntity)
], BatchQrCodeEntity.prototype, "generator", void 0);
exports.BatchQrCodeEntity = BatchQrCodeEntity = __decorate([
    (0, typeorm_1.Entity)('batch_qr_codes')
], BatchQrCodeEntity);
//# sourceMappingURL=batch-qr-code.entity.js.map