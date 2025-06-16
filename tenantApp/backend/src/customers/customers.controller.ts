import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  UseGuards, 
  Req,
  HttpCode,
  HttpStatus,
  Query,
  Res,
  Delete,
  Patch,
  ParseIntPipe
} from '@nestjs/common';
import { Request } from 'express';
import { Customer } from './customer.entity';

import { TenantGuard } from '../auth/tenant.guard';
import { CustomersService } from './customer.service';

@Controller('customers')
@UseGuards(TenantGuard)
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}


 @Post()
@HttpCode(HttpStatus.CREATED) // Sets status code declaratively
async create(
  @Body() customerData: Omit<Customer, 'id' | 'createdByTenantId' | 'isSynced' | 'updatedAt'>,
  @Req() req: Request & { tenantId: number }
) {
  return this.customersService.create(customerData, req.tenantId);
}


 @Get()
async findAll(
  @Req() req: Request & { tenantId: number },
  @Query('isOnline') isOnline: string
): Promise<Customer[]> {
  const online = isOnline !== 'false'; // Default to true
  return this.customersService.findAll(req.tenantId, online);
}


   
@Patch(':id')
async update(
  @Param('id', ParseIntPipe) id: number,
  @Body() updateData: any,   
  @Req() req: Request & { tenantId: number }
): Promise<Customer> {
  const tenantId = req.tenantId ?? 1;

   
  const { id: _id, createdByTenantId: _createdByTenantId, ...safeUpdateData } = updateData;

  return this.customersService.update(id, tenantId, safeUpdateData);
}
 
@Delete(':id')
async remove(
  @Param('id', ParseIntPipe) id: number,
  @Req() req: Request & { tenantId: number }
): Promise<void> {
  await this.customersService.remove(id, req.tenantId);
}
 @Post('sync')
async sync(
  @Req() req: Request & { tenantId: number }
): Promise<{
  message: string;
  synced: number;
  failed: number;
}> {
  const { synced, failed } = await this.customersService.sync(req.tenantId);
  return {
    message: `Synced ${synced} records (${failed} failed)`,
    synced,
    failed
  };
}
  @Post('email-login')
async login(@Body('email') email: string, @Req() req: Request & { tenantId: number }) {
  const tenantId = req.tenantId;

  
  const dbStatus = await this.customersService.isDatabaseOnline();
  

  return this.customersService.loginWithEmail(email, tenantId, !dbStatus);  
}

  @Get('db-status')
async checkDbStatus(): Promise<{ dbOnline: boolean }> {
  const dbOnline = await this.customersService.isDatabaseOnline();
  
  return { dbOnline };
}
@Get('sync-status')
async getSyncStatus(
  @Req() req: Request & { tenantId: number }
): Promise<{
  online: boolean;
  pendingSync: number;
}> {
  const pendingSync = await this.customersService.countUnsynced(req.tenantId);
  return {
    online: await this.customersService.isDatabaseOnline(),
    pendingSync
  };
}
}