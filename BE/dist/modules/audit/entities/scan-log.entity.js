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
exports.ScanLogEntity = void 0;
const typeorm_1 = require("typeorm");
const batch_entity_1 = require("../../batches/entities/batch.entity");
const batch_qr_code_entity_1 = require("../../batches/entities/batch-qr-code.entity");
const user_entity_1 = require("../../users/entities/user.entity");
const numeric_transformer_1 = require("../../../common/transformers/numeric.transformer");
let ScanLogEntity = class ScanLogEntity {
    id;
    batchId;
    qrCodeId;
    scannedBy;
    ipAddress;
    userAgent;
    latitude;
    longitude;
    scannedAt;
    batch;
    qrCode;
    scanner;
};
exports.ScanLogEntity = ScanLogEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ScanLogEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'batch_id', type: 'uuid' }),
    __metadata("design:type", String)
], ScanLogEntity.prototype, "batchId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'qr_code_id', type: 'uuid', nullable: true }),
    __metadata("design:type", Object)
], ScanLogEntity.prototype, "qrCodeId", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'scanned_by', type: 'uuid', nullable: true }),
    __metadata("design:type", Object)
], ScanLogEntity.prototype, "scannedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'ip_address', type: 'varchar', length: 45, nullable: true }),
    __metadata("design:type", Object)
], ScanLogEntity.prototype, "ipAddress", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_agent', type: 'text', nullable: true }),
    __metadata("design:type", Object)
], ScanLogEntity.prototype, "userAgent", void 0);
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
], ScanLogEntity.prototype, "latitude", void 0);
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
], ScanLogEntity.prototype, "longitude", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'scanned_at', type: 'timestamptz' }),
    __metadata("design:type", Date)
], ScanLogEntity.prototype, "scannedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => batch_entity_1.BatchEntity, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'batch_id' }),
    __metadata("design:type", batch_entity_1.BatchEntity)
], ScanLogEntity.prototype, "batch", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => batch_qr_code_entity_1.BatchQrCodeEntity, { onDelete: 'SET NULL' }),
    (0, typeorm_1.JoinColumn)({ name: 'qr_code_id' }),
    __metadata("design:type", Object)
], ScanLogEntity.prototype, "qrCode", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.UserEntity, { onDelete: 'SET NULL' }),
    (0, typeorm_1.JoinColumn)({ name: 'scanned_by' }),
    __metadata("design:type", Object)
], ScanLogEntity.prototype, "scanner", void 0);
exports.ScanLogEntity = ScanLogEntity = __decorate([
    (0, typeorm_1.Entity)('scan_logs')
], ScanLogEntity);
//# sourceMappingURL=scan-log.entity.js.map