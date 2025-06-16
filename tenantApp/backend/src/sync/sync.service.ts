import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { Customer } from '../customers/customer.entity';

@Injectable()
export class SyncService {
  constructor(
   @InjectRepository(Customer, 'postgres')
    private customerRepository: Repository<Customer> 
  ) {}

  async pushChanges(tenantId: number, changes: Customer[]): Promise<void> {
    await this.customerRepository.manager.transaction(async (manager) => {
      for (const change of changes) {
        await manager.upsert(
          Customer,
          { ...change},
          ['id'],
        );
      }
    });
  }

  async pullUpdates(tenantId: number, lastSyncDate?: Date): Promise<Customer[]> {
    return this.customerRepository.find({
      where: {
      
        updatedAt: lastSyncDate ? MoreThan(lastSyncDate) : undefined,
      },
    });
  }
}