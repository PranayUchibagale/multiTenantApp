import { Customer } from '../../customers/customer.entity';
export declare class SyncResponseDto {
    updatedCustomers: Customer[];
    conflicts?: {
        customerId: number;
        serverVersion: Customer;
        localVersion: Customer;
    }[];
}
