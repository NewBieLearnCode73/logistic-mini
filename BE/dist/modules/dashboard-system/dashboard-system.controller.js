"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardSystemController = void 0;
const common_1 = require("@nestjs/common");
const express = __importStar(require("express"));
const dashboard_system_service_1 = require("./dashboard-system.service");
const export_report_dto_1 = require("./dto/export-report.dto");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const role_enum_1 = require("../../common/enums/role.enum");
let DashboardSystemController = class DashboardSystemController {
    service;
    constructor(service) {
        this.service = service;
    }
    async getStats(req) {
        return this.service.getStats(req.user);
    }
    async getAuditLogs(query) {
        return this.service.getAuditLogs(query);
    }
    async exportReport(dto, req, res) {
        const report = await this.service.exportReport(dto.reportType, dto.format, dto.period, req.user, dto.startDate, dto.endDate);
        res.setHeader('Content-Type', report.contentType);
        res.setHeader('Content-Disposition', `attachment; filename=${report.filename}`);
        res.send(report.content);
    }
};
exports.DashboardSystemController = DashboardSystemController;
__decorate([
    (0, common_1.Get)('dashboard/stats'),
    (0, roles_decorator_1.Roles)(role_enum_1.RoleName.ADMIN, role_enum_1.RoleName.MANUFACTURER, role_enum_1.RoleName.DISTRIBUTOR, role_enum_1.RoleName.RETAILER),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DashboardSystemController.prototype, "getStats", null);
__decorate([
    (0, common_1.Get)('audit-logs'),
    (0, roles_decorator_1.Roles)(role_enum_1.RoleName.ADMIN),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], DashboardSystemController.prototype, "getAuditLogs", null);
__decorate([
    (0, common_1.Post)('reports/export'),
    (0, roles_decorator_1.Roles)(role_enum_1.RoleName.ADMIN, role_enum_1.RoleName.MANUFACTURER),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [export_report_dto_1.ExportReportDto, Object, Object]),
    __metadata("design:returntype", Promise)
], DashboardSystemController.prototype, "exportReport", null);
exports.DashboardSystemController = DashboardSystemController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [dashboard_system_service_1.DashboardSystemService])
], DashboardSystemController);
//# sourceMappingURL=dashboard-system.controller.js.map