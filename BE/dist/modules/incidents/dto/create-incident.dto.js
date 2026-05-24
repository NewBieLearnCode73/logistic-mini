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
exports.CreateIncidentDto = void 0;
const class_validator_1 = require("class-validator");
class CreateIncidentDto {
    shipmentId;
    incidentType;
    description;
    priority;
}
exports.CreateIncidentDto = CreateIncidentDto;
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Shipment ID không được để trống' }),
    (0, class_validator_1.IsUUID)('4', { message: 'Shipment ID phải là UUID hợp lệ' }),
    __metadata("design:type", String)
], CreateIncidentDto.prototype, "shipmentId", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Loại sự cố không được để trống' }),
    (0, class_validator_1.IsString)({ message: 'Loại sự cố phải là chuỗi' }),
    __metadata("design:type", String)
], CreateIncidentDto.prototype, "incidentType", void 0);
__decorate([
    (0, class_validator_1.IsNotEmpty)({ message: 'Mô tả không được để trống' }),
    (0, class_validator_1.IsString)({ message: 'Mô tả phải là chuỗi' }),
    (0, class_validator_1.MinLength)(20, { message: 'Mô tả sự cố phải tối thiểu 20 ký tự' }),
    __metadata("design:type", String)
], CreateIncidentDto.prototype, "description", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ message: 'Mức độ ưu tiên phải là chuỗi' }),
    __metadata("design:type", String)
], CreateIncidentDto.prototype, "priority", void 0);
//# sourceMappingURL=create-incident.dto.js.map