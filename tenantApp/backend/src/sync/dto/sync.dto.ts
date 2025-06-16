// src/sync/dto/sync-response.dto.ts
import { Customer } from '../../customers/customer.entity';

export class SyncResponseDto {
  updatedCustomers: Customer[];
  conflicts?: {
    customerId: number;
    serverVersion: Customer;
    localVersion: Customer;
  }[];
}