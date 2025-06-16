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
exports.CustomersController = void 0;
const common_1 = require("@nestjs/common");
const tenant_guard_1 = require("../auth/tenant.guard");
const customer_service_1 = require("./customer.service");
let CustomersController = class CustomersController {
    customersService;
    constructor(customersService) {
        this.customersService = customersService;
    }
    async create(customerData, req) {
        return this.customersService.create(customerData, req.tenantId);
    }
    async findAll(req, isOnline) {
        const online = isOnline !== 'false';
        return this.customersService.findAll(req.tenantId, online);
    }
    async update(id, updateData, req) {
        const tenantId = req.tenantId ?? 1;
        const { id: _id, createdByTenantId: _createdByTenantId, ...safeUpdateData } = updateData;
        return this.customersService.update(id, tenantId, safeUpdateData);
    }
    async remove(id, req) {
        await this.customersService.remove(id, req.tenantId);
    }
    async sync(req) {
        const { synced, failed } = await this.customersService.sync(req.tenantId);
        return {
            message: `Synced ${synced} records (${failed} failed)`,
            synced,
            failed
        };
    }
    async login(email, req) {
        const tenantId = req.tenantId;
        const dbStatus = await this.customersService.isDatabaseOnline();
        return this.customersService.loginWithEmail(email, tenantId, !dbStatus);
    }
    async checkDbStatus() {
        const dbOnline = await this.customersService.isDatabaseOnline();
        return { dbOnline };
    }
    async getSyncStatus(req) {
        const pendingSync = await this.customersService.countUnsynced(req.tenantId);
        return {
            online: await this.customersService.isDatabaseOnline(),
            pendingSync
        };
    }
};
exports.CustomersController = CustomersController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CustomersController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('isOnline')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CustomersController.prototype, "findAll", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Object]),
    __metadata("design:returntype", Promise)
], CustomersController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], CustomersController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)('sync'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CustomersController.prototype, "sync", null);
__decorate([
    (0, common_1.Post)('email-login'),
    __param(0, (0, common_1.Body)('email')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], CustomersController.prototype, "login", null);
__decorate([
    (0, common_1.Get)('db-status'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CustomersController.prototype, "checkDbStatus", null);
__decorate([
    (0, common_1.Get)('sync-status'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CustomersController.prototype, "getSyncStatus", null);
exports.CustomersController = CustomersController = __decorate([
    (0, common_1.Controller)('customers'),
    (0, common_1.UseGuards)(tenant_guard_1.TenantGuard),
    __metadata("design:paramtypes", [customer_service_1.CustomersService])
], CustomersController);
//# sourceMappingURL=customers.controller.js.map