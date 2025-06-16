// src/sync/sync.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Customer } from '../customers/customer.entity';
import { SyncController } from './sync.controller';
import { SyncService } from './sync.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Customer], 'postgres'), 
  ],
  controllers: [SyncController],
  providers: [SyncService],
})
export class SyncModule {}
