// src/customers/customers.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Customer } from './customer.entity';
import { CustomersService } from './customer.service';
import { CustomersController } from './customers.controller';


@Module({
  imports: [
    TypeOrmModule.forFeature([Customer], 'postgres'),
    TypeOrmModule.forFeature([Customer], 'sqlite'),
  ],
  providers: [CustomersService],
  controllers: [CustomersController],
})
export class CustomersModule {}
