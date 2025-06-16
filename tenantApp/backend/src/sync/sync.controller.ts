import {   Controller,   Post,   Get,   Body,   Req,   UseGuards,  Query } from '@nestjs/common';
import { SyncService } from './sync.service';
import { Customer } from '../customers/customer.entity';
import { TenantGuard } from 'src/auth/tenant.guard';
;

@Controller('sync')
@UseGuards(TenantGuard) // Validates tenant for sync operations
export class SyncController {
  constructor(private readonly syncService: SyncService) {}

  @Post('push')
  async pushChanges(
    @Body() body: { changes: Customer[] },
    @Req() req: { tenantId: number }
  ): Promise<{ success: boolean }> {
    await this.syncService.pushChanges(req.tenantId, body.changes);
    return { success: true };
  }

  @Get('pull')
  async pullChanges(
    @Query('lastSync') lastSync: string,
    @Req() req: { tenantId: number }
  ): Promise<Customer[]> {
    const lastSyncDate = lastSync ? new Date(lastSync) : undefined;
    return this.syncService.pullUpdates(req.tenantId, lastSyncDate);
  }
}