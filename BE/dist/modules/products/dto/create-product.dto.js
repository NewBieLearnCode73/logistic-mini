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
exports.CreateProductDto = void 0;
const class_validator_1 = require("class-validator");
class CreateProductDto {
    name;
    sku;
    unit;
    description;
    category;
}
exports.CreateProductDto = CreateProductDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Tên sản phẩm không được để trống' }),
    (0, class_validator_1.IsString)({ message: 'Tên sản phẩm phải là chuỗi' }),
    (0, class_validator_1.MaxLength)(200, { message: 'Tên sản phẩm tối đa 200 ký tự' }),
    __metadata("design:type", String)
], CreateProductDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Mã SKU không được để trống' }),
    (0, class_validator_1.IsString)({ message: 'Mã SKU phải là chuỗi' }),
    (0, class_validator_1.MaxLength)(100, { message: 'Mã SKU tối đa 100 ký tự' }),
    __metadata("design:type", String)
], CreateProductDto.prototype, "sku", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Đơn vị tính không được để trống' }),
    (0, class_validator_1.IsString)({ message: 'Đơn vị tính phải là chuỗi' }),
    (0, class_validator_1.MaxLength)(50, { message: 'Đơn vị tính tối đa 50 ký tự' }),
    __metadata("design:type", String)
], CreateProductDto.prototype, "unit", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Mô tả phải là chuỗi' }),
    __metadata("design:type", String)
], CreateProductDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Danh mục phải là chuỗi' }),
    (0, class_validator_1.MaxLength)(100, { message: 'Danh mục tối đa 100 ký tự' }),
    __metadata("design:type", String)
], CreateProductDto.prototype, "category", void 0);
//# sourceMappingURL=create-product.dto.js.map