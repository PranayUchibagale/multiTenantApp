import { CustomersService } from "src/customers/customer.service";
export declare class AuthService {
    private customersService;
    constructor(customersService: CustomersService);
    loginWithEmail(email: string): Promise<{
        id: number;
        name: string;
        email: string;
    }>;
}
