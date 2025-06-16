import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { APIService } from '../api.service';
import { firstValueFrom } from 'rxjs';
import { Customer, LocalDatabaseService } from '../localdb.service';
import { SyncService } from '../sync.service';

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {
  allTenants: any
  online: boolean=false;
  isOnline: boolean=false;
  
constructor(private router: Router,private customerService:APIService, private localDb: LocalDatabaseService,private syncService:SyncService) {}
  async ngOnInit() {
  const res = await firstValueFrom(this.customerService.checkDatabaseStatus());

  this.isOnline = res.dbOnline;
  }

  onLogin() {
    console.log('Login clicked');
    this.router.navigate(['/login']); 
  }

  onCreate() {
    console.log('Create clicked');
    this.router.navigate(["/create"])

  }
  async handleGetAllRecords(){
   try{ const res = await firstValueFrom( this.customerService.checkDatabaseStatus())
    
         if (res.dbOnline) {
           
            this.online=true
      
          } else {
            
            this.online=false
          }
        } catch (err) {
         
       
          alert('DB status check failed → Saved locally');
        }
         const tenantId = Number(localStorage.getItem('tenantId'))
         this.customerService.getAllCustomers(tenantId).subscribe(res=>{
      this.allTenants=res
    })
    this.router.navigate(["/dashboard"])
      }
      

async syncNow() {
  const localData: Customer[] = JSON.parse(localStorage.getItem('unsyncedCustomers') || '[]');

  if (localData.length === 0) {
    alert('No unsynced customers found.');
    return;
  }

  try {
    const res = await firstValueFrom(this.customerService.checkDatabaseStatus());
    if (!res.dbOnline) {
      alert('DB is still offline. Try again later.');
      return;
    }

    const tenantId = localStorage.getItem('tenantId');
    if (!tenantId) {
      alert('Tenant ID missing. Please login again.');
      return;
    }

    const synced: Customer[] = [];

    for (const customer of localData) {
      const payload = {
        ...customer,
        createdByTenantId: +tenantId,
      };

      try {
        await firstValueFrom(this.customerService.createCustomer(payload));
        synced.push(customer);
      } catch (err) {
        console.error('❌ Failed to sync:', customer, err);
      }
    }

    const remaining = localData.filter((c: Customer) => !synced.includes(c));
    localStorage.setItem('unsyncedCustomers', JSON.stringify(remaining));

    alert(`✅ Synced ${synced.length} customers to server!`);
  } catch (err) {
    alert('❌ Sync failed. Server may still be offline.');
    console.error(err);
  }
}


}
