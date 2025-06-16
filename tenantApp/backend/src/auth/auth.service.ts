import { Injectable, NotFoundException } from "@nestjs/common";
import { CustomersService } from "src/customers/customer.service";

@Injectable()
export class AuthService {
  constructor(private customersService: CustomersService) {}

  async loginWithEmail(email: string) {
    const customer = await this.customersService.findByEmail(email);
    
    if (!customer) {
      throw new NotFoundException('No customer found with this email');
    }

    // In a real app, you would:
    // 1. Verify password/OTP here
    // 2. Generate JWT token
    
    return {
      id: customer.id,
      name: customer.name,
      email: customer.email
    };
  }
}