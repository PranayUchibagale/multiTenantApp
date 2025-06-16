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
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const customers_module_1 = require("./customers/customers.module");
const sync_module_1 = require("./sync/sync.module");
const customer_entity_1 = require("./customers/customer.entity");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forRootAsync({
                name: 'postgres',
                useFactory: async () => ({
                    type: 'postgres',
                    host: 'localhost',
                    port: 5432,
                    username: 'app_user',
                    password: 'Pranay@13500',
                    database: 'tenant_db',
                    entities: [customer_entity_1.Customer],
                    synchronize: true,
                }),
                dataSourceFactory: async (options) => {
                    const dataSource = new typeorm_2.DataSource(options);
                    return dataSource.initialize();
                },
            }),
            typeorm_1.TypeOrmModule.forRootAsync({
                name: 'sqlite',
                useFactory: async () => ({
                    type: 'sqlite',
                    database: 'local.sqlite',
                    entities: [customer_entity_1.Customer],
                    synchronize: true,
                }),
                dataSourceFactory: async (options) => {
                    const dataSource = new typeorm_2.DataSource(options);
                    return dataSource.initialize();
                },
            }),
            customers_module_1.CustomersModule,
            sync_module_1.SyncModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map