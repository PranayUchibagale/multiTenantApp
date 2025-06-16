import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, forkJoin, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

interface Customer {
  id?: number;
  name: string;
  email: string;
  phone?: string;
  createdByTenantId?: number;
  isSynced?: boolean;
  localId?: number;
  isDeleted?: boolean;
  updatedAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class APIService {
  private baseUrl = 'http://localhost:3000/customers';
  private localStorageKey = 'offline_customers';

  constructor(private http: HttpClient) {}
getTenantId(): number {
  return Number(localStorage.getItem('tenantId') || '0');
}

  createCustomer(data: { name: string; email: string; phone?: string }): Observable<Customer> {
  const tenantId = this.getTenantId();

  if (!data.name || !data.email) {
    return throwError(() => new Error('Name and email are required'));
  }

  const localCustomer: Customer = {
    ...data,
    localId: Date.now(),
    createdByTenantId: tenantId,
    isSynced: false,
    updatedAt: new Date().toISOString()
  };

  this.saveToLocal(localCustomer);

  if (navigator.onLine) {
    
    return this.http.post<Customer>(this.baseUrl, {
      ...data,
      createdByTenantId: tenantId
    }).pipe(
      tap(serverCustomer => {
        this.markAsSynced(localCustomer.localId!, serverCustomer.id!);
      }),
      catchError(error => {
        console.error('Postgres create failed', error);
        return of(localCustomer);
      })
    );
  }

  return of(localCustomer);
}




  
   getAllCustomers(tenantId: number): Observable<Customer[]> {
  const localCustomers = this.getFromLocal(); 

  if (!navigator.onLine) {
   
    return of(localCustomers);
  }

 
  return this.http.get<Customer[]>(`${this.baseUrl}?tenantId=${tenantId}&isDeleted=false`).pipe(
    map(serverCustomers => {
      const localIds = new Set(localCustomers.map(c => c.id));
      
      const merged = [
        ...localCustomers,
        ...serverCustomers.filter(c => !localIds.has(c.id))
      ];
      return merged;
    }),
    catchError(err => {
      console.error('Fetching server customers failed', err);
      return of(localCustomers);
    })
  );
}
  
updateCustomer(id: number, data: Partial<Omit<Customer, 'id' | 'localId'>>): Observable<Customer> {
  const localCustomers = this.getFromLocal();
  const customer = localCustomers.find(c => c.id === id || c.localId === id);


  if (!customer || !customer.createdByTenantId) {
    if (navigator.onLine) {
      const tenantId = localStorage.getItem('tenantId');
      const dataWithTenant = {
        ...data,
        createdByTenantId: tenantId ? +tenantId : undefined,
      };

      return this.http.patch<Customer>(`${this.baseUrl}/${id}`, dataWithTenant);
    } else {
      return throwError(() => new Error('Customer not found locally and offline'));
    }
  }

  
  const updatedCustomer: Customer = {
    ...customer,
    ...data,
    isSynced: false,
    updatedAt: new Date().toISOString()
  };

  this.updateLocalStorage(localCustomers.map(c =>
    (c.id === id || c.localId === id) ? updatedCustomer : c
  ));

  if (navigator.onLine) {
    return this.http.patch<Customer>(`${this.baseUrl}/${id}`, data).pipe(
      tap(serverCustomer => {
        this.markAsSynced(updatedCustomer.localId!, serverCustomer.id!);
      }),
      catchError(error => {
        console.error('Postgres update failed', error);
        return of(updatedCustomer); 
      })
    );
  }

  return of(updatedCustomer); 
}

  deleteCustomer(id: number): Observable<void> {
  const localCustomers = this.getFromLocal();
  const customer = localCustomers.find(c => c.id === id || c.localId === id);

  if (!customer) {
    return throwError(() => new Error('Customer not found'));
  }

  const updatedCustomers = localCustomers.map(c => 
    (c.id === id || c.localId === id)
      ? { ...c, isDeleted: true, isSynced: false, updatedAt: new Date().toISOString() }
      : c
  );

  this.updateLocalStorage(updatedCustomers);


  if (navigator.onLine) {
    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(
      tap(() => {
  
        const filtered = updatedCustomers.filter(c => c.id !== id && c.localId !== id);
        this.updateLocalStorage(filtered);
      }),
      catchError(error => {
        console.error('Postgres delete failed', error);
        return of(undefined);
      })
    );
  }


  return of(undefined);
}


  
  loginWithEmail(email: string): Observable<Customer | null> {
    return this.http.post<Customer>(`${this.baseUrl}/email-login`, { email }).pipe(
      catchError(error => {
        console.error('Login failed', error);
        const localCustomers = this.getFromLocal();
        const customer = localCustomers.find(c => c.email === email && !c.isDeleted);
        return of(customer || null);
      })
    );
  }


  checkDatabaseStatus(): Observable<{ dbOnline: boolean }> {
    return this.http.get<{ dbOnline: boolean }>(`${this.baseUrl}/db-status`).pipe(
      catchError(() => of({ dbOnline: false }))
    );
  }

  
  private saveToLocal(customer: Customer): void {
    const current = this.getFromLocal();
    localStorage.setItem(this.localStorageKey, JSON.stringify([...current, customer]));
  }

  private getFromLocal(): Customer[] {
    const data = localStorage.getItem(this.localStorageKey);
    return data ? JSON.parse(data) : [];
  }

  private markAsSynced(localId: number, serverId: number): void {
    const customers = this.getFromLocal();
    const updated = customers.map(c => 
      c.localId === localId ? { ...c, id: serverId, isSynced: true } : c
    );
    localStorage.setItem(this.localStorageKey, JSON.stringify(updated));
  }

  private updateLocalStorage(customers: Customer[]): void {
    localStorage.setItem(this.localStorageKey, JSON.stringify(customers));
  }
}