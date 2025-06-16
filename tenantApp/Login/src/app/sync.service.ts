
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LocalDatabaseService } from './localdb.service';
import { firstValueFrom } from 'rxjs';
export interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  updatedAt: string;
  createdByTenantId: number;
  isSynced?: boolean; 
}
@Injectable({
  providedIn: 'root',
})
export class SyncService {
  private apiUrl = 'http://localhost:3000/sync';

  constructor(
    private http: HttpClient,
    private localDb: LocalDatabaseService
  ) {}

  async sync(tenantId: number, lastSync?: string): Promise<void> {
    // Step 1: Push unsynced changes to server
    const unsyncedCustomers = await this.localDb.getUnsyncedCustomers();

    if (unsyncedCustomers.length > 0) {
  await firstValueFrom(
    this.http.post(`${this.apiUrl}/push`, {
      changes: unsyncedCustomers,
      tenantId,
    })
  );

      await this.localDb.markAllAsSynced();
    }

   
    let params = new HttpParams();
    if (lastSync) {
      params = params.set('lastSync', lastSync);
    }

   const updatedCustomers = await firstValueFrom(
  this.http.get<Customer[]>(`${this.apiUrl}/pull`, { params })
) ?? [];

if (updatedCustomers.length > 0) {
  await this.localDb.saveServerCustomers(updatedCustomers);
}

    console.log('✅ Sync complete.');
  }

  syncCustomers() {
  return this.http.post<{ message: string; synced: number; failed: number }>(
    'http://localhost:3000/customers/sync',
    {}
  );
}
}
