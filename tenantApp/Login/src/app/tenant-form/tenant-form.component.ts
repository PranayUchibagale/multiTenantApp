import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { APIService } from '../api.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-tenant-form',
  standalone: false,
  templateUrl: './tenant-form.component.html',
  styleUrl: './tenant-form.component.css'
})
export class TenantFormComponent {
  customerForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private customerService: APIService
  ) {
    this.createForm();
  }

  private phoneNumberValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;
      const isValid = /^[0-9]{10}$/.test(value);
      return isValid ? null : { invalidPhone: true };
    };
  }

  private nameValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;
      const isValid = /^[a-zA-Z\s]*$/.test(value);
      return isValid ? null : { invalidName: true };
    };
  }

  createForm() {
    this.customerForm = this.fb.group({
      name: ['', [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(50),
        this.nameValidator()
      ]],
      email: ['', [
        Validators.required,
        Validators.email,
        Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/)
      ]],
      phone: ['', [
        Validators.required,
        this.phoneNumberValidator()
      ]]
    });
  }

  get name() { return this.customerForm.get('name'); }
  get email() { return this.customerForm.get('email'); }
  get phone() { return this.customerForm.get('phone'); }

  getErrorMessage(controlName: string): string {
    const control = this.customerForm.get(controlName);
    if (control?.hasError('required')) return 'This field is required';
    if (control?.hasError('pattern')) {
      if (controlName === 'email') return 'Invalid email format';
    }
    if (control?.hasError('minlength')) {
      return `Minimum ${control.errors?.['minlength'].requiredLength} characters required`;
    }
    if (control?.hasError('maxlength')) {
      return `Maximum ${control.errors?.['maxlength'].requiredLength} characters allowed`;
    }
    if (control?.hasError('email')) return 'Please enter a valid email';
    if (control?.hasError('invalidPhone')) return 'Phone must be 10 digits';
    if (control?.hasError('invalidName')) return 'Name cannot contain special characters';
    return '';
  }

  async onSubmit() {
    // localStorage.removeItem('offline_customers')
    if(!this.customerForm.valid) return
    if(this.customerForm.get('name')?.value==""||this.customerForm.get('name')?.value==null){
alert("Please Enter the Name")
return
    }
    if(!this.customerForm.get('email')?.valid){
alert("Please Enter the Valid Email")
return
    }
   const phone = this.customerForm.get('phone')?.value;
    const tenantId = localStorage.getItem('tenantId');
    if (!tenantId) {
      alert('Tenant ID not found. Please login again.');
      return;
    }

    const formData = {
      ...this.customerForm.value,
      tenantId: Number(tenantId)
    };
const allCustomers = await firstValueFrom(this.customerService.getAllCustomers(1));
console.log(allCustomers);
const alreadyExists = allCustomers.some(c =>
    c.email === formData.email || c.phone === formData.phone
  );

  if (alreadyExists) {
    alert('A customer with the same email or phone already exists.');
    return;
  }
console.log(formData);
    try {
      const res = await firstValueFrom(this.customerService.checkDatabaseStatus());

      if (res.dbOnline) {
        this.customerService.createCustomer(formData).subscribe({
          next: () => {
            alert('Customer saved to server');
            this.customerForm.reset();
          },
          error: () => alert('Server error while saving')
        });
      } else {
        this.saveToLocal(formData);
        alert('Customer saved locally (DB offline)');
      }
    } catch (err) {
      this.saveToLocal(formData);
      alert('DB status check failed → Saved locally');
    }
  }

  private saveToLocal(customer: any) {
    const local = JSON.parse(localStorage.getItem('unsyncedCustomers') || '[]');
    local.push(customer);
    localStorage.setItem('unsyncedCustomers', JSON.stringify(local));
  }

  private markAllAsTouched() {
    Object.values(this.customerForm.controls).forEach(control => {
      control.markAsTouched();
    });
  }


  async syncLocalToServer() {
  const localData = JSON.parse(localStorage.getItem('unsyncedCustomers') || '[]');

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

    let successCount = 0;

    for (const customer of localData) {
      await firstValueFrom(this.customerService.createCustomer(customer));
      successCount++;
    }

    localStorage.removeItem('unsyncedCustomers');
    alert(`✅ Synced ${successCount} customers to server!`);
  } catch (err) {
    alert('❌ Sync failed. Server may still be offline.');
    console.error(err);
  }
}
}
