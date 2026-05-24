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
exports.UpdateNodeDto = void 0;
const class_validator_1 = require("class-validator");
const node_type_enum_1 = require("../../../common/enums/node-type.enum");
class UpdateNodeDto {
    name;
    nodeType;
    address;
    latitude;
    longitude;
    version;
}
exports.UpdateNodeDto = UpdateNodeDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Tên Node phải là chuỗi' }),
    __metadata("design:type", String)
], UpdateNodeDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(node_type_enum_1.NodeType, { message: 'Loại Node không hợp lệ' }),
    __metadata("design:type", String)
], UpdateNodeDto.prototype, "nodeType", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Địa chỉ phải là chuỗi' }),
    __metadata("design:type", String)
], UpdateNodeDto.prototype, "address", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({}, { message: 'Vĩ độ phải là số' }),
    (0, class_validator_1.Min)(-90, { message: 'Vĩ độ phải từ -90' }),
    (0, class_validator_1.Max)(90, { message: 'Vĩ độ tối đa là 90' }),
    __metadata("design:type", Number)
], UpdateNodeDto.prototype, "latitude", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({}, { message: 'Kinh độ phải là số' }),
    (0, class_validator_1.Min)(-180, { message: 'Kinh độ phải từ -180' }),
    (0, class_validator_1.Max)(180, { message: 'Kinh độ tối đa là 180' }),
    __metadata("design:type", Number)
], UpdateNodeDto.prototype, "longitude", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)({}, { message: 'Version phải là số' }),
    __metadata("design:type", Number)
], UpdateNodeDto.prototype, "version", void 0);
//# sourceMappingURL=update-node.dto.js.map