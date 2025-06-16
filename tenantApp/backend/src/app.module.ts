
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource, DataSourceOptions } from 'typeorm';

import { CustomersModule } from './customers/customers.module';
import { SyncModule } from './sync/sync.module';
import { Customer } from './customers/customer.entity';

@Module({
  imports: [
   
    TypeOrmModule.forRootAsync({
      name: 'postgres',
      useFactory: async () => ({
        type: 'postgres',
        host: 'localhost',
        port: 5432,
        username: 'app_user',
        password: 'Pranay@13500',
        database: 'tenant_db',
        entities: [Customer],
        synchronize: true,
      }),
      dataSourceFactory: async (options: DataSourceOptions) => {
        const dataSource = new DataSource(options);
        return dataSource.initialize();
      },
    }),

   
    TypeOrmModule.forRootAsync({
      name: 'sqlite',
      useFactory: async () => ({
        type: 'sqlite',
        database: 'local.sqlite',
        entities: [Customer],
        synchronize: true,
      }),
      dataSourceFactory: async (options: DataSourceOptions) => {
        const dataSource = new DataSource(options);
        return dataSource.initialize();
      },
    }),

    CustomersModule,
    SyncModule,
  ],
})
export class AppModule {}
