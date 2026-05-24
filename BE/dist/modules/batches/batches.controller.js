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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BatchesController = void 0;
const common_1 = require("@nestjs/common");
const batches_service_1 = require("./batches.service");
const create_batch_dto_1 = require("./dto/create-batch.dto");
const sell_batch_dto_1 = require("./dto/sell-batch.dto");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const role_enum_1 = require("../../common/enums/role.enum");
let BatchesController = class BatchesController {
    batchesService;
    constructor(batchesService) {
        this.batchesService = batchesService;
    }
    async create(createBatchDto, req) {
        return this.batchesService.create(createBatchDto, req.user);
    }
    async findAll(query, req) {
        return this.batchesService.findAll(query, req.user);
    }
    async findDetails(id, req) {
        return this.batchesService.findDetails(id, req.user);
    }
    async getTimeline(id, req) {
        return this.batchesService.getTimeline(id, req.user);
    }
    async sell(id, sellBatchDto, req) {
        return this.batchesService.sell(id, sellBatchDto, req.user);
    }
    async regenerateQr(id, req) {
        return this.batchesService.regenerateQr(id, req.user);
    }
};
exports.BatchesController = BatchesController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)(role_enum_1.RoleName.MANUFACTURER, role_enum_1.RoleName.ADMIN),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_batch_dto_1.CreateBatchDto, Object]),
    __metadata("design:returntype", Promise)
], BatchesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(role_enum_1.RoleName.ADMIN, role_enum_1.RoleName.MANUFACTURER, role_enum_1.RoleName.DISTRIBUTOR, role_enum_1.RoleName.RETAILER),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], BatchesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)(role_enum_1.RoleName.ADMIN, role_enum_1.RoleName.MANUFACTURER, role_enum_1.RoleName.DISTRIBUTOR, role_enum_1.RoleName.RETAILER),
    __param(0, (0, common_1.Param)('id', new common_1.ParseUUIDPipe({ version: '4', errorHttpStatusCode: common_1.HttpStatus.BAD_REQUEST }))),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], BatchesController.prototype, "findDetails", null);
__decorate([
    (0, common_1.Get)(':id/timeline'),
    (0, roles_decorator_1.Roles)(role_enum_1.RoleName.ADMIN, role_enum_1.RoleName.MANUFACTURER, role_enum_1.RoleName.DISTRIBUTOR, role_enum_1.RoleName.RETAILER),
    __param(0, (0, common_1.Param)('id', new common_1.ParseUUIDPipe({ version: '4', errorHttpStatusCode: common_1.HttpStatus.BAD_REQUEST }))),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], BatchesController.prototype, "getTimeline", null);
__decorate([
    (0, common_1.Post)(':id/sell'),
    (0, roles_decorator_1.Roles)(role_enum_1.RoleName.RETAILER, role_enum_1.RoleName.ADMIN),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id', new common_1.ParseUUIDPipe({ version: '4', errorHttpStatusCode: common_1.HttpStatus.BAD_REQUEST }))),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, sell_batch_dto_1.SellBatchDto, Object]),
    __metadata("design:returntype", Promise)
], BatchesController.prototype, "sell", null);
__decorate([
    (0, common_1.Post)(':id/regenerate-qr'),
    (0, roles_decorator_1.Roles)(role_enum_1.RoleName.MANUFACTURER, role_enum_1.RoleName.ADMIN),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id', new common_1.ParseUUIDPipe({ version: '4', errorHttpStatusCode: common_1.HttpStatus.BAD_REQUEST }))),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], BatchesController.prototype, "regenerateQr", null);
exports.BatchesController = BatchesController = __decorate([
    (0, common_1.Controller)('batches'),
    __metadata("design:paramtypes", [batches_service_1.BatchesService])
], BatchesController);
//# sourceMappingURL=batches.controller.js.map