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
var CustomersService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const customer_entity_1 = require("./customer.entity");
let CustomersService = CustomersService_1 = class CustomersService {
    localRepository;
    serverRepository;
    logger = new common_1.Logger(CustomersService_1.name);
    constructor(localRepository, serverRepository) {
        this.localRepository = localRepository;
        this.serverRepository = serverRepository;
    }
    async create(customerData, tenantId) {
        const entity = this.localRepository.create({
            ...customerData,
            createdByTenantId: tenantId,
            updatedAt: new Date(),
            isSynced: false
        });
        const saved = await this.localRepository.save(entity);
        const isOnline = await this.isDatabaseOnline();
        if (isOnline) {
            try {
                await this.serverRepository.save(saved);
                await this.localRepository.update(saved.id, { isSynced: true });
            }
            catch (err) {
                this.logger.warn(`Could not sync during create: ${err.message}`);
            }
        }
        return saved;
    }
    async update(id, tenantId, updateData) {
        const isOnline = await this.isDatabaseOnline();
        const repo = isOnline ? this.serverRepository : this.localRepository;
        const { createdByTenantId, id: _id, ...safeUpdateData } = updateData;
        await repo.update({ id, createdByTenantId: tenantId }, {
            ...safeUpdateData,
            updatedAt: new Date(),
            isSynced: !isOnline ? false : true,
        });
        const updated = await repo.findOne({
            where: { id, createdByTenantId: tenantId }
        });
        if (!updated) {
            throw new common_1.NotFoundException('Customer not found after update');
        }
        return updated;
    }
    async remove(id, tenantId) {
        const isOnline = await this.isDatabaseOnline();
        const repo = isOnline ? this.serverRepository : this.localRepository;
        const whereCondition = isOnline
            ? { id, createdByTenantId: tenantId }
            : { id };
        const result = await repo.update(whereCondition, {
            isDeleted: true,
            updatedAt: new Date(),
            isSynced: !isOnline ? false : true,
        });
        console.log('Delete result:', result);
    }
    async findAll(tenantId, isOnline) {
        const baseWhere = { createdByTenantId: tenantId, isDeleted: false };
        if (isOnline && await this.isDatabaseOnline()) {
            return this.serverRepository.find({ where: baseWhere });
        }
        else {
            return this.localRepository.find({ where: baseWhere });
        }
    }
    async findByEmail(email, tenantId) {
        const normalizedEmail = email.toLowerCase().trim();
        const where = { email: normalizedEmail };
        if (tenantId) {
            where.createdByTenantId = tenantId;
        }
        try {
            const customer = await this.serverRepository.findOne({ where });
            if (customer && !customer.isDeleted) {
                return customer;
            }
            return null;
        }
        catch (err) {
            console.error('Error finding customer by email in DB', err);
            return null;
        }
    }
    async loginWithEmail(email, tenantId, useLocal = false) {
        const normalized = email.toLowerCase().trim();
        if (!useLocal) {
            const customer = await this.serverRepository.findOne({
                where: { email: normalized, createdByTenantId: tenantId, isDeleted: false },
                order: { updatedAt: 'DESC' }
            });
            if (customer)
                return customer;
        }
        const localCustomer = await this.localRepository.findOne({
            where: { email: normalized, createdByTenantId: tenantId, isDeleted: false },
            order: { updatedAt: 'DESC' }
        });
        if (!localCustomer)
            throw new common_1.NotFoundException('No customer with this email');
        return localCustomer;
    }
    async countUnsynced(tenantId) {
        return this.localRepository.count({
            where: {
                createdByTenantId: tenantId,
                isSynced: false
            }
        });
    }
    async isDatabaseOnline() {
        try {
            await this.serverRepository.query('SELECT 1');
            return true;
        }
        catch (err) {
            return false;
        }
    }
    async sync(tenantId) {
        const unsynced = await this.localRepository.find({
            where: {
                createdByTenantId: tenantId,
                isSynced: false,
            },
        });
        const dbOnline = await this.isDatabaseOnline();
        if (!dbOnline) {
            return { synced: 0, failed: unsynced.length };
        }
        try {
            await this.serverRepository.save(unsynced);
            await this.localRepository.update(unsynced.map((record) => record.id), { isSynced: true });
            return { synced: unsynced.length, failed: 0 };
        }
        catch (error) {
            this.logger.error('Sync failed:', error.message);
            return { synced: 0, failed: unsynced.length };
        }
    }
};
exports.CustomersService = CustomersService;
exports.CustomersService = CustomersService = CustomersService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(customer_entity_1.Customer, 'sqlite')),
    __param(1, (0, typeorm_1.InjectRepository)(customer_entity_1.Customer, 'postgres')),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], CustomersService);
//# sourceMappingURL=customer.service.js.map