// src/app/core/interceptors/tenant.interceptor.ts
import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';
// import { AuthService } from '../services/auth.service'; // Optional: Get tenant from service

@Injectable()
export class TenantInterceptor implements HttpInterceptor {

  // constructor(private auth: AuthService) {} // Optional dependency

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    // Get tenant ID (hardcoded or from service)
    const tenantId = '1'; // Or this.auth.getTenantId()
    
    // Clone request and add header
    const tenantReq = request.clone({
      headers: request.headers.set('x-tenant-id', tenantId)
    });

    return next.handle(tenantReq);
  }
}