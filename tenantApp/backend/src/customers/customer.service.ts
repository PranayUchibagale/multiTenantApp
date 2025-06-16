import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In, FindOptionsWhere, MoreThan } from 'typeorm';
import { Customer } from './customer.entity';

@Injectable()
export class CustomersService {
  private readonly logger = new Logger(CustomersService.name);

  constructor(
    @InjectRepository(Customer, 'sqlite')
    private readonly localRepository: Repository<Customer>,

    @InjectRepository(Customer, 'postgres')
    private readonly serverRepository: Repository<Customer>
  ) {}

  async create(
    customerData: Omit<Customer, 'id' | 'createdByTenantId' | 'isSynced' | 'updatedAt'>,
    tenantId: number
  ): Promise<Customer> {
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
      } catch (err) {
        this.logger.warn(`Could not sync during create: ${err.message}`);
      }
    }

    return saved;
  }


async update(
  id: number,
  tenantId: number,
  updateData: Partial<Omit<Customer, 'id' | 'createdByTenantId'>>
): Promise<Customer> {
  const isOnline = await this.isDatabaseOnline();
  const repo = isOnline ? this.serverRepository : this.localRepository;

  
  const { createdByTenantId, id: _id, ...safeUpdateData } = updateData as any;


  await repo.update(
    { id, createdByTenantId: tenantId },
    {
      ...safeUpdateData,
      updatedAt: new Date(),
      isSynced: !isOnline ? false : true,
    }
  );

  const updated = await repo.findOne({
    where: { id, createdByTenantId: tenantId }
  });

  if (!updated) {
    throw new NotFoundException('Customer not found after update');
  }

  return updated;
}



async remove(id: number, tenantId: number): Promise<void> {
  const isOnline = await this.isDatabaseOnline();
  const repo = isOnline ? this.serverRepository : this.localRepository;

  const whereCondition = isOnline
    ? { id, createdByTenantId: tenantId }
    : { id };

  const result = await repo.update(
    whereCondition,
    {
      isDeleted: true,
      updatedAt: new Date(),
      isSynced: !isOnline ? false : true,
    }
  );

  console.log('Delete result:', result);
}

async findAll(tenantId: number, isOnline: boolean): Promise<Customer[]> {
  const baseWhere = { createdByTenantId: tenantId, isDeleted: false }; 

  if (isOnline && await this.isDatabaseOnline()) {
   
    return this.serverRepository.find({ where: baseWhere });
  } else {

    return this.localRepository.find({ where: baseWhere });
  }
}
async findByEmail(email: string, tenantId?: number): Promise<Customer | null> {
  const normalizedEmail = email.toLowerCase().trim();
  const where: any = { email: normalizedEmail };

  if (tenantId) {
    where.createdByTenantId = tenantId;
  }

  try {
   
    const customer = await this.serverRepository.findOne({ where });

    if (customer && !customer.isDeleted) {
      return customer;
    }

    return null;
  } catch (err) {
    console.error('Error finding customer by email in DB', err);
    return null;
  }
}


async loginWithEmail(email: string, tenantId: number, useLocal = false): Promise<Customer> {
  const normalized = email.toLowerCase().trim();

  if (!useLocal) {
    const customer = await this.serverRepository.findOne({
      where: { email: normalized, createdByTenantId: tenantId, isDeleted: false },
      order: { updatedAt: 'DESC' }
    });

    if (customer) return customer;
  }

  const localCustomer = await this.localRepository.findOne({
    where: { email: normalized, createdByTenantId: tenantId, isDeleted: false },
    order: { updatedAt: 'DESC' }
  });

  if (!localCustomer) throw new NotFoundException('No customer with this email');

  return localCustomer;
}


  async countUnsynced(tenantId: number): Promise<number> {
    return this.localRepository.count({
      where: {
        createdByTenantId: tenantId,
        isSynced: false
      }
    });
  }

  async isDatabaseOnline(): Promise<boolean> {
    try {
      await this.serverRepository.query('SELECT 1');
      return true;
    } catch (err) {
      return false;
    }
  }

  async sync(tenantId: number): Promise<{ synced: number; failed: number }> {
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

    await this.localRepository.update(
      unsynced.map((record) => record.id),
      { isSynced: true }
    );

    return { synced: unsynced.length, failed: 0 };
  } catch (error) {
    this.logger.error('Sync failed:', error.message);
    return { synced: 0, failed: unsynced.length };
  }
}
}
