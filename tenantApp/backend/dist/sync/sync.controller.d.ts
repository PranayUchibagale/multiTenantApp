import { SyncService } from './sync.service';
import { Customer } from '../customers/customer.entity';
export declare class SyncController {
    private readonly syncService;
    constructor(syncService: SyncService);
    pushChanges(body: {
        changes: Customer[];
    }, req: {
        tenantId: number;
    }): Promise<{
        success: boolean;
    }>;
    pullChanges(lastSync: string, req: {
        tenantId: number;
    }): Promise<Customer[]>;
}
