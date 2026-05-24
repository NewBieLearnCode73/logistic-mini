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
exports.CreateShipmentDto = void 0;
const class_validator_1 = require("class-validator");
class CreateShipmentDto {
    batchId;
    sourceNodeId;
    destinationNodeId;
    quantityShipped;
    notes;
    expectedDeliveryDate;
}
exports.CreateShipmentDto = CreateShipmentDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Batch ID không được để trống' }),
    (0, class_validator_1.IsUUID)('4', { message: 'Batch ID không hợp lệ' }),
    __metadata("design:type", String)
], CreateShipmentDto.prototype, "batchId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)('4', { message: 'Source Node ID không hợp lệ' }),
    __metadata("design:type", String)
], CreateShipmentDto.prototype, "sourceNodeId", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Destination Node ID không hợp lệ' }),
    (0, class_validator_1.IsUUID)('4', { message: 'Destination Node ID không hợp lệ' }),
    __metadata("design:type", String)
], CreateShipmentDto.prototype, "destinationNodeId", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Số lượng chuyển không được để trống' }),
    (0, class_validator_1.IsNumber)({}, { message: 'Số lượng chuyển phải là số' }),
    (0, class_validator_1.Min)(0.001, { message: 'Số lượng chuyển phải lớn hơn 0' }),
    __metadata("design:type", Number)
], CreateShipmentDto.prototype, "quantityShipped", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Ghi chú phải là chuỗi ký tự' }),
    __metadata("design:type", String)
], CreateShipmentDto.prototype, "notes", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], CreateShipmentDto.prototype, "expectedDeliveryDate", void 0);
//# sourceMappingURL=create-shipment.dto.js.map