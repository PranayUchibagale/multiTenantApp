import { Repository } from 'typeorm';
import { Customer } from './customer.entity';
export declare class CustomersService {
    private readonly localRepository;
    private readonly serverRepository;
    private readonly logger;
    constructor(localRepository: Repository<Customer>, serverRepository: Repository<Customer>);
    create(customerData: Omit<Customer, 'id' | 'createdByTenantId' | 'isSynced' | 'updatedAt'>, tenantId: number): Promise<Customer>;
    update(id: number, tenantId: number, updateData: Partial<Omit<Customer, 'id' | 'createdByTenantId'>>): Promise<Customer>;
    remove(id: number, tenantId: number): Promise<void>;
    findAll(tenantId: number, isOnline: boolean): Promise<Customer[]>;
    findByEmail(email: string, tenantId?: number): Promise<Customer | null>;
    loginWithEmail(email: string, tenantId: number, useLocal?: boolean): Promise<Customer>;
    countUnsynced(tenantId: number): Promise<number>;
    isDatabaseOnline(): Promise<boolean>;
    sync(tenantId: number): Promise<{
        synced: number;
        failed: number;
    }>;
}
