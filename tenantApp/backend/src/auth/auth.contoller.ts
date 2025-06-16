import { Body, Controller, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('email-login')
  async emailLogin(@Body() body: { email: string }) {
    try {
      const user = await this.authService.loginWithEmail(body.email);
      return { success: true, user };
    } catch (error) {
      return { 
        success: false,
        message: error.message
      };
    }
  }
}