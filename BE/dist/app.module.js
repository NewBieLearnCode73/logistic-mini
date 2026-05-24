"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const schedule_1 = require("@nestjs/schedule");
const typeorm_1 = require("@nestjs/typeorm");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const jwt_auth_guard_1 = require("./common/guards/jwt-auth.guard");
const roles_guard_1 = require("./common/guards/roles.guard");
const audit_log_interceptor_1 = require("./common/interceptors/audit-log.interceptor");
const database_config_1 = require("./config/database.config");
const audit_module_1 = require("./modules/audit/audit.module");
const auth_module_1 = require("./modules/auth/auth.module");
const batches_module_1 = require("./modules/batches/batches.module");
const incidents_module_1 = require("./modules/incidents/incidents.module");
const nodes_module_1 = require("./modules/nodes/nodes.module");
const products_module_1 = require("./modules/products/products.module");
const roles_module_1 = require("./modules/roles/roles.module");
const shipments_module_1 = require("./modules/shipments/shipments.module");
const users_module_1 = require("./modules/users/users.module");
const dashboard_system_module_1 = require("./modules/dashboard-system/dashboard-system.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forRoot((0, database_config_1.getDatabaseConfig)()),
            schedule_1.ScheduleModule.forRoot(),
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            roles_module_1.RolesModule,
            nodes_module_1.NodesModule,
            products_module_1.ProductsModule,
            batches_module_1.BatchesModule,
            shipments_module_1.ShipmentsModule,
            incidents_module_1.IncidentsModule,
            audit_module_1.AuditModule,
            dashboard_system_module_1.DashboardSystemModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [
            app_service_1.AppService,
            {
                provide: core_1.APP_GUARD,
                useClass: jwt_auth_guard_1.JwtAuthGuard,
            },
            {
                provide: core_1.APP_GUARD,
                useClass: roles_guard_1.RolesGuard,
            },
            {
                provide: core_1.APP_INTERCEPTOR,
                useClass: audit_log_interceptor_1.AuditLogInterceptor,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map