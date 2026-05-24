"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BatchesModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const batch_entity_1 = require("./entities/batch.entity");
const batch_qr_code_entity_1 = require("./entities/batch-qr-code.entity");
const inventory_entity_1 = require("./entities/inventory.entity");
const timeline_event_entity_1 = require("./entities/timeline-event.entity");
const batches_service_1 = require("./batches.service");
const qr_service_1 = require("./qr.service");
const batches_controller_1 = require("./batches.controller");
let BatchesModule = class BatchesModule {
};
exports.BatchesModule = BatchesModule;
exports.BatchesModule = BatchesModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                batch_entity_1.BatchEntity,
                batch_qr_code_entity_1.BatchQrCodeEntity,
                inventory_entity_1.InventoryEntity,
                timeline_event_entity_1.TimelineEventEntity,
            ]),
        ],
        controllers: [batches_controller_1.BatchesController],
        providers: [batches_service_1.BatchesService, qr_service_1.QrService],
        exports: [batches_service_1.BatchesService, typeorm_1.TypeOrmModule],
    })
], BatchesModule);
//# sourceMappingURL=batches.module.js.map