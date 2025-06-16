// src/sync/dto/pull-updates.dto.ts
import { IsOptional, IsISO8601 } from 'class-validator';

export class PullUpdatesDto {
  @IsOptional()
  @IsISO8601()
  lastSync?: string; // ISO date string (e.g., "2025-06-14T12:00:00Z")
}