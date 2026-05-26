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
exports.PublicTraceController = void 0;
const common_1 = require("@nestjs/common");
const audit_service_1 = require("./audit.service");
const public_decorator_1 = require("../../common/decorators/public.decorator");
let PublicTraceController = class PublicTraceController {
    auditService;
    constructor(auditService) {
        this.auditService = auditService;
    }
    async getTrace(batchCode, req, latStr, lngStr) {
        const batch = await this.auditService.findBatchByCode(batchCode);
        if (!batch) {
            throw new common_1.NotFoundException(`Không tìm thấy lô hàng với mã ${batchCode}`);
        }
        const timelineEvents = await this.auditService.getBatchTimeline(batch.id);
        const ip = req.ip || req.headers['x-forwarded-for'] || null;
        const userAgent = req.headers['user-agent'] || null;
        const scannedBy = req.user?.userId || null;
        const latitude = latStr ? parseFloat(latStr) : null;
        const longitude = lngStr ? parseFloat(lngStr) : null;
        this.auditService.recordScanLogAsync({
            batchId: batch.id,
            scannedBy,
            ipAddress: Array.isArray(ip) ? ip[0] : ip,
            userAgent,
            latitude,
            longitude,
        }).catch(() => {
        });
        return {
            batch: {
                batchCode: batch.batchCode,
                manufactureDate: batch.manufactureDate,
                expiryDate: batch.expiryDate,
                status: batch.status,
                product: batch.product ? {
                    name: batch.product.name,
                    sku: batch.product.sku,
                    unit: batch.product.unit,
                    description: batch.product.description,
                    category: batch.product.category,
                } : null,
                originNode: batch.originNode ? {
                    name: batch.originNode.name,
                    nodeType: batch.originNode.nodeType,
                    address: batch.originNode.address,
                    latitude: batch.originNode.latitude,
                    longitude: batch.originNode.longitude,
                } : null,
                currentNode: batch.currentNode ? {
                    name: batch.currentNode.name,
                    nodeType: batch.currentNode.nodeType,
                    address: batch.currentNode.address,
                    latitude: batch.currentNode.latitude,
                    longitude: batch.currentNode.longitude,
                } : null,
            },
            timelineEvents: timelineEvents.map(event => ({
                eventType: event.eventType,
                notes: event.notes,
                occurredAt: event.occurredAt,
                node: event.node ? {
                    name: event.node.name,
                    nodeType: event.node.nodeType,
                    address: event.node.address,
                    latitude: event.node.latitude,
                    longitude: event.node.longitude,
                } : null,
                actor: event.actor ? {
                    fullName: event.actor.fullName,
                } : null,
            })),
        };
    }
};
exports.PublicTraceController = PublicTraceController;
__decorate([
    (0, common_1.Get)(':batchCode'),
    (0, public_decorator_1.Public)(),
    __param(0, (0, common_1.Param)('batchCode')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Query)('lat')),
    __param(3, (0, common_1.Query)('lng')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String, String]),
    __metadata("design:returntype", Promise)
], PublicTraceController.prototype, "getTrace", null);
exports.PublicTraceController = PublicTraceController = __decorate([
    (0, common_1.Controller)('public/trace'),
    __metadata("design:paramtypes", [audit_service_1.AuditService])
], PublicTraceController);
//# sourceMappingURL=public-trace.controller.js.map