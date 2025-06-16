import { Request } from 'express';
import { Customer } from './customer.entity';
import { CustomersService } from './customer.service';
export declare class CustomersController {
    private readonly customersService;
    constructor(customersService: CustomersService);
    create(customerData: Omit<Customer, 'id' | 'createdByTenantId' | 'isSynced' | 'updatedAt'>, req: Request & {
        tenantId: number;
    }): Promise<Customer>;
    findAll(req: Request & {
        tenantId: number;
    }, isOnline: string): Promise<Customer[]>;
    update(id: number, updateData: any, req: Request & {
        tenantId: number;
    }): Promise<Customer>;
    remove(id: number, req: Request & {
        tenantId: number;
    }): Promise<void>;
    sync(req: Request & {
        tenantId: number;
    }): Promise<{
        message: string;
        synced: number;
        failed: number;
    }>;
    login(email: string, req: Request & {
        tenantId: number;
    }): Promise<Customer>;
    checkDbStatus(): Promise<{
        dbOnline: boolean;
    }>;
    getSyncStatus(req: Request & {
        tenantId: number;
    }): Promise<{
        online: boolean;
        pendingSync: number;
    }>;
}
