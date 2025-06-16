import { Repository } from 'typeorm';
import { Customer } from '../customers/customer.entity';
export declare class SyncService {
    private customerRepository;
    constructor(customerRepository: Repository<Customer>);
    pushChanges(tenantId: number, changes: Customer[]): Promise<void>;
    pullUpdates(tenantId: number, lastSyncDate?: Date): Promise<Customer[]>;
}
