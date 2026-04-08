import { Body, Controller, Post } from "@nestjs/common";
import { LoginDto } from "./dto/login.dto";
import { RefreshTokenDto } from "./dto/refresh-token.dto";
import { AuthService } from "./auth.service";
import { LogoutDto } from "./dto/logout.dto";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("login")
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post("refresh")
  async refresh(@Body() body: RefreshTokenDto) {
    return { accessToken: await this.authService.refresh(body.refreshToken) };
  }

  @Post("logout")
  async logout(@Body() body: LogoutDto) {
    await this.authService.logout(body.refreshToken);
    return { ok: true };
  }
}
