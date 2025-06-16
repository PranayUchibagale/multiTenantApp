import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { APIService } from '../api.service';
export interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  tenantId?: number;
  createdAt?: Date;
}
@Component({
  selector: 'app-dashboard',
  standalone: false,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
@Input() customers: Customer[] = [];
  @Output() onEdit = new EventEmitter<Customer>();
  @Output() onDelete = new EventEmitter<number>();

 
  online: boolean=false;
  allTenants: any;

  constructor(private customerService:APIService) {
  
    
  }
  async ngOnInit() {
    try{ const res = await firstValueFrom( this.customerService.checkDatabaseStatus())
    
         if (res.dbOnline) {
           
            this.online=true
      
          } else {
            
            this.online=false
          }
        } catch (err) {
         
       
          alert('DB status check failed → Saved locally');
        }
        this.getAllTenant()
        
  }
getAllTenant(){
   const tenantId = Number(localStorage.getItem('tenantId'))
   this.customerService.getAllCustomers( tenantId).subscribe(res=>{
          if(res.length<0){
            alert("No records found")
            return
          }
      this.allTenants=res
    })
}
  editCustomer(customer: Customer) {
    this.onEdit.emit(customer);
  }

 onDeleteCustomer(id: number): void {
  if (confirm('Are you sure you want to delete this customer?')) {
    this.customerService.deleteCustomer(id).subscribe({
      next: () => {
     
        this.customers = this.customers.filter(c => c.id !== id);
        this.getAllTenant()
      },
      error: (err) => {
        console.error('Delete failed', err);
        alert('Failed to delete the customer.');
      }
    });
  }
}
}
