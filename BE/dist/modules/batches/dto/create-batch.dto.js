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
exports.CreateBatchDto = void 0;
const class_validator_1 = require("class-validator");
class CreateBatchDto {
    productId;
    quantity;
    unit;
    manufactureDate;
    expiryDate;
    originNodeId;
}
exports.CreateBatchDto = CreateBatchDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Product ID không được để trống' }),
    (0, class_validator_1.IsUUID)('4', { message: 'Product ID phải là UUID hợp lệ' }),
    __metadata("design:type", String)
], CreateBatchDto.prototype, "productId", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Số lượng không được để trống' }),
    (0, class_validator_1.IsNumber)({}, { message: 'Số lượng phải là một số' }),
    (0, class_validator_1.Min)(0.001, { message: 'Số lượng khởi tạo phải lớn hơn 0' }),
    __metadata("design:type", Number)
], CreateBatchDto.prototype, "quantity", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Đơn vị tính phải là chuỗi' }),
    __metadata("design:type", String)
], CreateBatchDto.prototype, "unit", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Ngày sản xuất không được để trống' }),
    (0, class_validator_1.IsString)({ message: 'Ngày sản xuất phải là chuỗi ngày hợp lệ' }),
    __metadata("design:type", String)
], CreateBatchDto.prototype, "manufactureDate", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Hạn sử dụng không được để trống' }),
    (0, class_validator_1.IsString)({ message: 'Hạn sử dụng phải là chuỗi ngày hợp lệ' }),
    __metadata("design:type", String)
], CreateBatchDto.prototype, "expiryDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)('4', { message: 'Origin Node ID phải là UUID hợp lệ' }),
    __metadata("design:type", String)
], CreateBatchDto.prototype, "originNodeId", void 0);
//# sourceMappingURL=create-batch.dto.js.map