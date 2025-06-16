import { Component } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { APIService } from '../api.service';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
email = ""
  isLoading = false;
  emailRes: any | null;
  showDetails: boolean=false;
  noUser: boolean=false;
  data: any[]=[];
  updateData: any;
   editUserId: number | null = null;
  editedUser: any = {};
  userData: any;

  constructor(private router: Router,private customerService:APIService) {}

  onSubmit(val:any) {
    console.log(val);
       if (this.email) {
      this.isLoading = true;
  
      if(!this.email)return
      this.customerService.loginWithEmail(this.email).subscribe(res=>{
        console.log(res);
     
        this.emailRes=res
        if(this.emailRes.createdByTenantId
==1){
        this.data=[this.emailRes]
          this.showDetails=true
          this.noUser=false
        }else{
          this.showDetails=false
          this.noUser=true
        }
      })
    
    }
  }
     onEdit(user: any) {
    user.isEditing = true;
  }

onUpdate(user: any) {
  
  if(user.name==""||user.name==null){
  alert("Please Enter the name")
  return
}
if(user.phone.length!=10) {
  alert ("please enter valid Phone Number")
  return
}

if(!user.email.valid){
  alert("Please Enter the Valid Email")
  return
}
  const tenantId = Number(localStorage.getItem('tenantId'));
  const { isEditing, id, createdByTenantId, ...safeData } = user;

  this.customerService.updateCustomer(user.id, safeData).subscribe(res => {
    Object.assign(user, res);
    user.isEditing = false;
  }, err => {
    console.error('Update failed', err);
  });
}

  onCancel(user: any) {
    user.isEditing = false;
 
  }
}
