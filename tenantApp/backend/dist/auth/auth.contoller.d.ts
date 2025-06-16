import { AuthService } from "./auth.service";
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    emailLogin(body: {
        email: string;
    }): Promise<{
        success: boolean;
        user: {
            id: number;
            name: string;
            email: string;
        };
        message?: undefined;
    } | {
        success: boolean;
        message: any;
        user?: undefined;
    }>;
}
