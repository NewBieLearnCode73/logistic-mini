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
exports.ShipmentsController = void 0;
const common_1 = require("@nestjs/common");
const shipments_service_1 = require("./shipments.service");
const create_shipment_dto_1 = require("./dto/create-shipment.dto");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const role_enum_1 = require("../../common/enums/role.enum");
let ShipmentsController = class ShipmentsController {
    shipmentsService;
    constructor(shipmentsService) {
        this.shipmentsService = shipmentsService;
    }
    async create(createShipmentDto, req) {
        return this.shipmentsService.createTransfer(createShipmentDto, req.user);
    }
    async findAll(query, req) {
        return this.shipmentsService.findAll(query, req.user);
    }
    async findOne(id, req) {
        return this.shipmentsService.findOne(id, req.user);
    }
    async receive(id, req) {
        return this.shipmentsService.receiveShipment(id, req.user);
    }
};
exports.ShipmentsController = ShipmentsController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_shipment_dto_1.CreateShipmentDto, Object]),
    __metadata("design:returntype", Promise)
], ShipmentsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(role_enum_1.RoleName.ADMIN, role_enum_1.RoleName.MANUFACTURER, role_enum_1.RoleName.DISTRIBUTOR, role_enum_1.RoleName.RETAILER),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Query)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ShipmentsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.Roles)(role_enum_1.RoleName.ADMIN, role_enum_1.RoleName.MANUFACTURER, role_enum_1.RoleName.DISTRIBUTOR, role_enum_1.RoleName.RETAILER),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id', new common_1.ParseUUIDPipe({ version: '4', errorHttpStatusCode: common_1.HttpStatus.BAD_REQUEST }))),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ShipmentsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id/receive'),
    (0, roles_decorator_1.Roles)(role_enum_1.RoleName.ADMIN, role_enum_1.RoleName.DISTRIBUTOR, role_enum_1.RoleName.RETAILER),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('id', new common_1.ParseUUIDPipe({ version: '4', errorHttpStatusCode: common_1.HttpStatus.BAD_REQUEST }))),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ShipmentsController.prototype, "receive", null);
exports.ShipmentsController = ShipmentsController = __decorate([
    (0, common_1.Controller)('shipments'),
    (0, roles_decorator_1.Roles)(role_enum_1.RoleName.ADMIN, role_enum_1.RoleName.MANUFACTURER, role_enum_1.RoleName.DISTRIBUTOR),
    __metadata("design:paramtypes", [shipments_service_1.ShipmentsService])
], ShipmentsController);
//# sourceMappingURL=shipments.controller.js.map