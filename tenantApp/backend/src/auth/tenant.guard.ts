// src/auth/tenant.guard.ts
import { 
  CanActivate, 
  ExecutionContext, 
  Injectable, 
  UnauthorizedException 
} from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class TenantGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const tenantId = request.headers['x-tenant-id'];

    if (!tenantId) {
      throw new UnauthorizedException('Tenant ID header (x-tenant-id) is required');
    }

    // Attach tenantId to the request for controllers
    request['tenantId'] = Number(tenantId);
    return true;
  }
}