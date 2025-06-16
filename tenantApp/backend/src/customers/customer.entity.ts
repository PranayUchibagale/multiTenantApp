import { ConflictException } from '@nestjs/common';
import { Entity, PrimaryGeneratedColumn, Column, Not, BeforeUpdate, BeforeInsert, Repository } from 'typeorm';

@Entity()
export class Customer {
  
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column()
  phone: string;

  @Column()
  createdByTenantId: number;

  @Column({ default: false })
  isSynced: boolean;
   @Column({ name: 'updated_at' })
  updatedAt: Date;
  @Column({ name: 'is_deleted', default: false })
  isDeleted: boolean;


    
}
