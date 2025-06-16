// src/sync/dto/push-changes.dto.ts
import { IsArray, IsNumber, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { Customer } from '../../customers/customer.entity';

export class PushChangesDto {
  @IsNumber()
  tenantId: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => Customer)
  changes: Customer[];
}